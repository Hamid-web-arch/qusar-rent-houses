'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, todayISO } from '@/lib/dates'
import { localePath } from '@/lib/i18n'

export const MAX_GUESTS = 12

// Ana səhifədəki axtarış paneli: tarix + qonaq → /evler?giris=..&cixis=..&qonaq=..
export default function SearchBar({ lang, t, initial = {} }) {
  const router = useRouter()
  const today = todayISO()
  const [checkIn, setCheckIn] = useState(initial.checkIn || '')
  const [checkOut, setCheckOut] = useState(initial.checkOut || '')
  const [guests, setGuests] = useState(initial.guests || 2)
  const [error, setError] = useState('')

  function onCheckIn(v) {
    setCheckIn(v)
    setError('')
    // Çıxış tarixi girişdən əvvəl qalıbsa, avtomatik növbəti günə keçirək
    if (v && (!checkOut || checkOut <= v)) setCheckOut(addDays(v, 1))
  }

  function submit(e) {
    e.preventDefault()
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError(t.errorDates)
      return
    }
    const q = new URLSearchParams()
    if (checkIn && checkOut) {
      q.set('giris', checkIn)
      q.set('cixis', checkOut)
    }
    if (guests) q.set('qonaq', String(guests))
    router.push(`${localePath(lang, '/evler')}?${q}`)
  }

  const field = 'w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-wood-500 focus:ring-2 focus:ring-wood-500/20'
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted'

  return (
    <form onSubmit={submit} className="w-full rounded-2xl bg-white/95 p-3 shadow-xl shadow-black/20 backdrop-blur sm:p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_0.8fr_auto] md:items-end">
        <label>
          <span className={label}>{t.checkIn}</span>
          <input type="date" className={field} min={today} value={checkIn} onChange={(e) => onCheckIn(e.target.value)} suppressHydrationWarning />
        </label>
        <label>
          <span className={label}>{t.checkOut}</span>
          <input
            type="date"
            className={field}
            min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
            value={checkOut}
            onChange={(e) => { setCheckOut(e.target.value); setError('') }}
            suppressHydrationWarning
          />
        </label>
        <label className="col-span-2 md:col-span-1">
          <span className={label}>{t.guests}</span>
          <select className={field} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary col-span-2 py-3 md:col-span-1">
          {t.button}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-700" role="alert">{error}</p>}
    </form>
  )
}
