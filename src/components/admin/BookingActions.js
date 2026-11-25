'use client'
import { useState, useTransition } from 'react'
import { saveBookingNote, setBookingStatus } from '@/app/admin/actions'
import { inputCls } from './ui'

export default function BookingActions({ id, status, note }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState(note)
  const [noteSaved, setNoteSaved] = useState(false)

  const run = (fn) =>
    start(async () => {
      setError('')
      const res = await fn()
      if (res?.error) setError(res.error)
    })

  return (
    <div className="mt-4 border-t border-pine-100 pt-4">
      <div className="flex flex-wrap gap-2">
        {status !== 'confirmed' && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(id, 'confirmed'))} className="btn bg-pine-700 px-4 py-2 text-white hover:bg-pine-900 disabled:opacity-50">
            ✓ Təsdiqlə
          </button>
        )}
        {status !== 'cancelled' && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(id, 'cancelled'))} className="btn border border-pine-200 bg-white px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50">
            ✕ Ləğv et
          </button>
        )}
        {status !== 'new' && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(id, 'new'))} className="btn px-4 py-2 text-muted hover:text-pine-900 disabled:opacity-50">
            Yeniyə qaytar
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <details className="mt-3" open={Boolean(note)}>
        <summary className="cursor-pointer text-xs font-semibold text-muted">Qeyd (yalnız siz görürsünüz)</summary>
        <div className="mt-2 flex gap-2">
          <input
            value={noteText}
            onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false) }}
            placeholder="Məs.: beh alındı, 21:00-da gələcək"
            className={inputCls}
          />
          <button
            type="button"
            disabled={pending || noteText === note}
            onClick={() => run(async () => { const r = await saveBookingNote(id, noteText); if (!r?.error) setNoteSaved(true); return r })}
            className="btn shrink-0 border border-pine-200 bg-white px-4 py-2 text-pine-900 disabled:opacity-50"
          >
            {noteSaved ? '✓' : 'Saxla'}
          </button>
        </div>
      </details>
    </div>
  )
}
