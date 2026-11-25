'use client'
import { useActionState } from 'react'
import { addBlockedDates, deleteBlockedDates } from '@/app/admin/actions'
import { nightsBetween, todayISO } from '@/lib/dates'
import ConfirmButton from './ConfirmButton'
import { Field, Notice, fmtDate, inputCls } from './ui'

// Dolu günlərin siyahısı + əlavə etmə forması.
// houses: bir ev (ev səhifəsində) və ya hamısı (təqvim səhifəsində)
export default function BlockedSection({ houses, blocked }) {
  const [state, action, pending] = useActionState(addBlockedDates, null)
  const today = todayISO()
  const single = houses.length === 1
  const names = Object.fromEntries(houses.map((h) => [h.id, h.name_az]))
  const upcoming = blocked.filter((b) => b.end_date > today).sort((a, b) => a.start_date.localeCompare(b.start_date))

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Telefonla və ya başqa saytdan gələn rezervləri burada qeyd edin ki, saytda həmin günlər dolu görünsün.
        Saytdan gələn sorğunu təsdiqlədikdə günlər avtomatik əlavə olunur.
      </p>

      {upcoming.length > 0 ? (
        <ul className="divide-y divide-pine-100 rounded-lg ring-1 ring-pine-100">
          {upcoming.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>
                {!single && <b className="mr-2">{names[b.house_id]}</b>}
                {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                <span className="text-muted"> · {nightsBetween(b.start_date, b.end_date)} gecə</span>
                {b.note && <span className="text-muted"> · {b.note}</span>}
                {b.booking_id && <span className="ml-2 rounded bg-pine-50 px-1.5 py-0.5 text-xs text-pine-700">saytdan</span>}
              </span>
              {b.booking_id ? (
                <span className="text-xs text-muted">Sorğular bölməsindən ləğv edin</span>
              ) : (
                <ConfirmButton action={deleteBlockedDates.bind(null, b.id)} label="Sil" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-cream px-4 py-3 text-sm text-muted">Qarşıdakı günlərdə dolu tarix yoxdur.</p>
      )}

      <form action={action} className="space-y-3 rounded-lg bg-pine-50/60 p-4">
        <p className="text-sm font-semibold text-pine-900">Dolu tarix əlavə et</p>
        <div className={`grid grid-cols-2 gap-3 sm:items-end ${single ? 'sm:grid-cols-[1fr_1fr_1.3fr_auto]' : 'sm:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto]'}`}>
          {single ? (
            <input type="hidden" name="house_id" value={houses[0].id} />
          ) : (
            <Field label="Ev" className="col-span-2 sm:col-span-1">
              <select name="house_id" required className={inputCls}>
                {houses.map((h) => <option key={h.id} value={h.id}>{h.name_az}</option>)}
              </select>
            </Field>
          )}
          <Field label="Giriş">
            <input name="start_date" type="date" min={today} required className={inputCls} suppressHydrationWarning />
          </Field>
          <Field label="Çıxış">
            <input name="end_date" type="date" min={today} required className={inputCls} suppressHydrationWarning />
          </Field>
          <Field label="Qeyd" className="col-span-2 sm:col-span-1">
            <input name="note" placeholder="Məs.: Elnur, telefonla" className={inputCls} />
          </Field>
          <button type="submit" disabled={pending} className="btn col-span-2 bg-pine-700 px-4 py-2 text-white hover:bg-pine-900 disabled:opacity-50 sm:col-span-1">
            + Dolu et
          </button>
        </div>
        <Notice state={state} />
      </form>
    </div>
  )
}
