'use client'
import { useState, useTransition } from 'react'

// İki addımlı silmə düyməsi: "Sil" → "Əminsiniz? Bəli / Xeyr"
export default function ConfirmButton({ action, label, confirmLabel = 'Bəli, sil', danger = false }) {
  const [asking, setAsking] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState('')

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={danger ? 'btn border border-red-200 bg-white px-4 py-2 text-red-700 hover:bg-red-50' : 'text-xs font-semibold text-red-700 hover:underline'}
      >
        {label}
      </button>
    )
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs">
      <span className="font-semibold text-pine-900">Əminsiniz?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await action(); if (r?.error) setError(r.error); else setAsking(false) })}
        className="rounded-md bg-red-700 px-2.5 py-1 font-semibold text-white disabled:opacity-50"
      >
        {pending ? '…' : confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="font-semibold text-muted">Xeyr</button>
      {error && <span role="alert" className="text-red-700">{error}</span>}
    </span>
  )
}
