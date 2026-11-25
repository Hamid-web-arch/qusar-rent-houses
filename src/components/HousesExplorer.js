'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { formatShort, validRange } from '@/lib/dates'
import { calcStay, isRangeAvailable } from '@/lib/pricing'
import { fill } from '@/lib/text'
import HouseCard from './HouseCard'
import SearchBar, { MAX_GUESTS } from './SearchBar'
import { WhatsAppIcon } from './Icons'

const FEATURE_FILTERS = ['jacuzzi', 'fireplace', 'bbq', 'terrace', 'mountainView']
const TYPES = ['all', 'aframe', 'house']

// URL parametrləri: giris, cixis, qonaq, nov (aframe|house), imkan (vergüllə)
export default function HousesExplorer({ houses, lang, t, waHref }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const checkIn = params.get('giris') || ''
  const checkOut = params.get('cixis') || ''
  const hasDates = validRange(checkIn, checkOut)
  const guests = Math.min(Math.max(Number(params.get('qonaq')) || 0, 0), MAX_GUESTS)
  const type = TYPES.includes(params.get('nov')) ? params.get('nov') : 'all'
  const features = (params.get('imkan') || '').split(',').filter((f) => FEATURE_FILTERS.includes(f))

  function update(changes) {
    const q = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '' || v === 'all') q.delete(k)
      else q.set(k, v)
    }
    const s = q.toString()
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }

  function toggleFeature(f) {
    const next = features.includes(f) ? features.filter((x) => x !== f) : [...features, f]
    update({ imkan: next.join(',') })
  }

  const results = houses.filter(
    (h) =>
      (type === 'all' || h.type === type) &&
      (!guests || h.capacity >= guests) &&
      features.every((f) => h.amenities.includes(f)) &&
      (!hasDates || isRangeAvailable(checkIn, checkOut, h.blocked)),
  )

  // Ev səhifəsinə tarixlər və qonaq sayı ilə keçək ki, orada yenidən seçmək lazım olmasın
  const carry = new URLSearchParams()
  if (hasDates) {
    carry.set('giris', checkIn)
    carry.set('cixis', checkOut)
  }
  if (guests) carry.set('qonaq', String(guests))
  const query = carry.size ? `?${carry}` : ''

  const filtersActive = type !== 'all' || features.length > 0 || guests > 0 || hasDates
  const chip = (active) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ring-1 ${
      active ? 'bg-pine-700 text-white ring-pine-700' : 'bg-white text-pine-700 ring-pine-100 hover:ring-pine-200'
    }`

  return (
    <>
      <div className="mt-8">
        <SearchBar
          key={`${checkIn}|${checkOut}|${guests}`}
          lang={lang}
          t={t.search}
          initial={{ checkIn: hasDates ? checkIn : '', checkOut: hasDates ? checkOut : '', guests: guests || 2 }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={t.filters.type}>
        {TYPES.map((ty) => (
          <button key={ty} type="button" aria-pressed={type === ty} onClick={() => update({ nov: ty })} className={chip(type === ty)}>
            {t.filters[ty]}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-pine-200 sm:block" aria-hidden="true" />
        {FEATURE_FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={features.includes(f)} onClick={() => toggleFeature(f)} className={chip(features.includes(f))}>
            {t.amenities[f]}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-pine-700" aria-live="polite">
          {hasDates
            ? fill(t.filters.availableFor, { in: formatShort(checkIn, t.calendar.monthsShort), out: formatShort(checkOut, t.calendar.monthsShort) }) +
              ' · ' +
              fill(t.filters.found, { n: results.length })
            : fill(t.filters.found, { n: results.length })}
        </p>
        {filtersActive && (
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-sm font-semibold text-wood-600 hover:text-wood-500">
            {t.filters.reset}
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((house, i) => (
            <HouseCard
              key={house.id}
              house={house}
              lang={lang}
              t={t.house}
              query={query}
              stay={hasDates ? calcStay(house, checkIn, checkOut) : null}
              priority={i < 3}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-card bg-white px-6 py-12 text-center ring-1 ring-pine-100">
          <p className="text-lg font-bold text-pine-900">{t.filters.empty}</p>
          <p className="mt-2 text-muted">{t.filters.emptyHint}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="btn border border-pine-200 bg-white text-pine-900">
              {t.filters.reset}
            </button>
            <a href={waHref} target="_blank" rel="noopener" className="btn-whatsapp">
              <WhatsAppIcon width={18} height={18} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  )
}
