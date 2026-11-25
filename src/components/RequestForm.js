'use client'
import { useState, useTransition } from 'react'
import { createBookingRequest } from '@/lib/booking-actions'

// Ev səhifəsində "Onlayn sorğu göndər": admin paneldə "Sorğular" bölməsinə düşür
export default function RequestForm({ houseId, lang, checkIn, checkOut, guests, t }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [result, setResult] = useState(null)

  if (result?.ok) {
    return <p role="status" className="mt-3 rounded-xl bg-pine-50 px-4 py-3 text-sm font-medium text-pine-700">✓ {t.success}</p>
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2.5 w-full text-center text-sm font-semibold text-pine-700 underline-offset-4 hover:underline">
        {t.open}
      </button>
    )
  }

  const field = 'w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-wood-500'
  const hasDates = Boolean(checkIn && checkOut)

  function submit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createBookingRequest({
        houseId,
        lang,
        checkIn,
        checkOut,
        guests,
        name: fd.get('name'),
        phone: fd.get('phone'),
        message: fd.get('message'),
        website: fd.get('website'),
      })
      setResult(res)
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl bg-cream p-4">
      <p className="font-semibold text-pine-900">{t.title}</p>
      {!hasDates && <p className="text-sm text-wood-600">{t.needDates}</p>}
      <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder={t.name} aria-label={t.name} className={field} />
      <input name="phone" required type="tel" autoComplete="tel" placeholder={t.phone} aria-label={t.phone} className={field} />
      <textarea name="message" rows={2} maxLength={1000} placeholder={t.messagePlaceholder} aria-label={t.message} className={field} />
      {/* Botlar üçün tələ: insanlar bu sahəni görmür */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {result?.error && <p role="alert" className="text-sm font-medium text-red-700">{t.errors[result.error] || t.errors.unavailable}</p>}
      <button type="submit" disabled={pending || !hasDates} className="btn-primary w-full disabled:opacity-50">
        {pending ? t.sending : t.submit}
      </button>
    </form>
  )
}
