'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { addDays, formatShort, parseISODate, toISODate, todayISO, validRange, weekdayMon0 } from '@/lib/dates'
import { calcStay, isNightBlocked, isRangeAvailable } from '@/lib/pricing'
import { site, whatsappLink } from '@/lib/site'
import { fill, plural } from '@/lib/text'
import { PhoneIcon, WhatsAppIcon } from './Icons'
import RequestForm from './RequestForm'

function monthStart(iso) {
  return `${iso.slice(0, 7)}-01`
}
function shiftMonth(iso, n) {
  const d = parseISODate(iso)
  return toISODate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)))
}

export default function BookingWidget({ house, t, lang, canRequest = false }) {
  const params = useSearchParams()
  const today = todayISO()

  // Axtarışdan gələn tarixlər (yalnız boşdursa qəbul edirik)
  const qIn = params.get('giris')
  const qOut = params.get('cixis')
  const initialOk = validRange(qIn, qOut, today) && isRangeAvailable(qIn, qOut, house.blocked)
  const qGuests = Number(params.get('qonaq')) || 2

  const [checkIn, setCheckIn] = useState(initialOk ? qIn : null)
  const [checkOut, setCheckOut] = useState(initialOk ? qOut : null)
  const [guests, setGuests] = useState(Math.min(Math.max(qGuests, 1), house.capacity))
  const [month, setMonth] = useState(monthStart(initialOk ? qIn : today))
  const tooMany = qGuests > house.capacity

  const stay = checkIn && checkOut ? calcStay(house, checkIn, checkOut) : null
  const pickingOut = Boolean(checkIn && !checkOut)

  function canPick(iso) {
    if (iso < today) return false
    if (pickingOut && iso > checkIn && isRangeAvailable(checkIn, iso, house.blocked)) return true
    return !isNightBlocked(iso, house.blocked)
  }

  function pick(iso) {
    if (!canPick(iso)) return
    if (pickingOut && iso > checkIn && isRangeAvailable(checkIn, iso, house.blocked)) {
      setCheckOut(iso)
    } else {
      setCheckIn(iso)
      setCheckOut(null)
    }
  }

  // Ayın günləri (Bazar ertəsindən başlayan cədvəl)
  const first = month
  const lead = weekdayMon0(first)
  const daysInMonth = new Date(Date.UTC(+first.slice(0, 4), +first.slice(5, 7), 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i))]
  const canGoBack = month > monthStart(today)
  const monthIdx = +month.slice(5, 7) - 1

  const fmt = (iso) => formatShort(iso, t.calendar.monthsShort)
  const nightsWord = (n) => plural(n, t.house.nightsForms)
  const waText = stay
    ? fill(t.booking.waWithDates, { house: house.name, in: fmt(checkIn), out: fmt(checkOut), n: stay.nights, guests, total: stay.total })
    : fill(t.booking.waNoDates, { house: house.name })
  const waHref = whatsappLink(waText)
  const kindLabel = { weekday: t.booking.weekday, weekend: t.booking.weekend, season: t.booking.season }

  return (
    <>
      <div id="rezerv" className="scroll-mt-24 rounded-card bg-white p-5 shadow-lg shadow-pine-900/5 ring-1 ring-pine-100">
        <p>
          {t.house.from && <span className="text-sm text-muted">{t.house.from} </span>}
          <span className="text-3xl font-bold text-wood-600">{house.priceWeekday} ₼</span>
          <span className="text-muted"> / {t.house.perNight}</span>
        </p>

        {/* Təqvim */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={!canGoBack} aria-label={t.booking.prev} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-pine-700 hover:bg-pine-50 disabled:opacity-30">‹</button>
            <p className="font-semibold text-pine-900" aria-live="polite">{t.calendar.months[monthIdx]} {month.slice(0, 4)}</p>
            <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label={t.booking.next} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-pine-700 hover:bg-pine-50">›</button>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-xs font-semibold text-muted">
            {t.calendar.weekdays.map((w) => <span key={w} className="py-1">{w}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {cells.map((iso, i) => {
              if (!iso) return <span key={`e${i}`} />
              const blocked = isNightBlocked(iso, house.blocked)
              const enabled = canPick(iso)
              const isStart = iso === checkIn
              const isEnd = iso === checkOut
              const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut
              let cls = 'text-pine-900 hover:bg-pine-50'
              if (!enabled) cls = blocked && iso >= today ? 'text-red-300 line-through' : 'text-pine-200'
              if (inRange) cls = 'bg-pine-100 text-pine-900 rounded-none'
              if (isStart || isEnd) cls = 'bg-pine-700 text-white'
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!enabled}
                  onClick={() => pick(iso)}
                  aria-pressed={isStart || isEnd}
                  aria-label={`${+iso.slice(8)} ${t.calendar.months[monthIdx]}${blocked ? ` — ${t.booking.booked}` : ''}`}
                  className={`mx-auto flex h-10 w-full items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${cls}`}
                >
                  {+iso.slice(8)}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-pine-700" /> {t.booking.selected}</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-red-300 line-through">12</span> {t.booking.booked}</span>
          </div>
        </div>

        {/* Seçim və qiymət */}
        <div className="mt-5 rounded-xl bg-cream p-4">
          {!checkIn && <p className="text-sm font-medium text-pine-700">{t.booking.pickCheckIn}</p>}
          {pickingOut && (
            <p className="text-sm font-medium text-pine-700">
              {fmt(checkIn)} → … <span className="text-muted">· {t.booking.pickCheckOut}</span>
            </p>
          )}
          {stay && (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between font-semibold text-pine-900">
                <span>{fmt(checkIn)} – {fmt(checkOut)}</span>
                <button type="button" onClick={() => { setCheckIn(null); setCheckOut(null) }} className="text-xs font-semibold text-wood-600 hover:text-wood-500">
                  {t.booking.clear}
                </button>
              </div>
              {stay.lines.map((l) => (
                <div key={`${l.kind}${l.label}${l.price}`} className="flex justify-between text-muted">
                  <span>{l.price} ₼ × {l.count} {nightsWord(l.count)} <span className="text-xs">({l.label || kindLabel[l.kind]})</span></span>
                  <span>{l.price * l.count} ₼</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-pine-200 pt-2 text-base font-bold text-pine-900">
                <span>{t.booking.total} · {stay.nights} {nightsWord(stay.nights)}</span>
                <span>{stay.total} ₼</span>
              </div>
            </div>
          )}
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{t.booking.guests}</span>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-wood-500">
            {Array.from({ length: house.capacity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {plural(n, t.house.guestsForms)}</option>
            ))}
          </select>
        </label>
        {tooMany && <p className="mt-2 text-sm text-wood-600">{fill(t.booking.tooManyGuests, { n: house.capacity })}</p>}

        <div className="mt-5 grid gap-2.5">
          <a href={waHref} target="_blank" rel="noopener" className="btn-whatsapp py-3.5 text-base">
            <WhatsAppIcon width={20} height={20} /> {stay ? t.booking.book : t.booking.ask}
          </a>
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="btn border border-pine-200 bg-white py-3 text-pine-900">
            <PhoneIcon /> {t.booking.call}
          </a>
        </div>
        {canRequest && (
          <RequestForm
            houseId={house.id}
            lang={lang}
            checkIn={stay ? checkIn : null}
            checkOut={stay ? checkOut : null}
            guests={guests}
            t={t.booking.request}
          />
        )}
        <p className="mt-3 text-center text-xs text-muted">{t.booking.note}</p>
      </div>

      {/* Telefon: ekranın aşağısında sabit panel */}
      <div data-book-bar className="fixed inset-x-0 bottom-0 z-[56] border-t border-pine-100 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            {stay ? (
              <>
                <p className="text-lg font-bold text-pine-900">{stay.total} ₼</p>
                <p className="truncate text-xs text-muted">{fmt(checkIn)} – {fmt(checkOut)} · {stay.nights} {nightsWord(stay.nights)}</p>
              </>
            ) : (
              <p>
                <span className="text-lg font-bold text-wood-600">{house.priceWeekday} ₼</span>
                <span className="text-sm text-muted"> / {t.house.perNight}</span>
              </p>
            )}
          </div>
          {stay ? (
            <a href={waHref} target="_blank" rel="noopener" className="btn-whatsapp shrink-0 px-5">
              <WhatsAppIcon width={18} height={18} /> {t.booking.bookShort}
            </a>
          ) : (
            <a href="#rezerv" className="btn-primary shrink-0 px-5">{t.booking.selectDates}</a>
          )}
        </div>
      </div>
    </>
  )
}
