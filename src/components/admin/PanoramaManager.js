'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addPanorama, deletePanorama, reorderPanoramas, updatePanorama } from '@/app/admin/actions'
import { guessFullCircle } from '@/lib/media'
import PanoramaTour from '@/components/PanoramaTour'
import az from '@/dictionaries/az.json'
import ConfirmButton from './ConfirmButton'
import { inputCls } from './ui'

// Telefonların çoxu 4096 pikseldən böyük şəkli 3D-də göstərə bilmir
const MAX_SIDE = 4096

async function compress(file) {
  const bitmap = await createImageBitmap(file)
  const aspect = bitmap.width / bitmap.height
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
  if (!blob) throw new Error('çevirmək alınmadı')
  return { blob, aspect }
}

export default function PanoramaManager({ houseId, panoramas: initial }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [items, setItems] = useState(initial)
  const [progress, setProgress] = useState(null)
  const [errors, setErrors] = useState([])
  const [preview, setPreview] = useState(null)
  const [pending, start] = useTransition()
  const busy = Boolean(progress) || pending

  async function upload(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (!list.length) return
    const supabase = createClient()
    const errs = []
    setErrors([])
    setProgress({ done: 0, total: list.length })
    for (const file of list) {
      try {
        const { blob, aspect } = await compress(file)
        if (aspect < 1.3) throw new Error('bu, panorama deyil (şəkil çox dardır). Telefonda "Panorama" rejimi ilə çəkin.')
        const path = `${houseId}/pano/${crypto.randomUUID()}.webp`
        const { error } = await supabase.storage.from('house-images').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
        if (error) throw error
        const res = await addPanorama(houseId, {
          path,
          aspect: Math.round(aspect * 1000) / 1000,
          fullCircle: guessFullCircle(aspect),
          title: file.name.replace(/\.[^.]+$/, '').replace(/^(IMG|PANO|VID|DSC)[_-]?\d+.*$/i, ''),
        })
        if (res?.error) throw new Error(res.error)
      } catch (e) {
        errs.push(`${file.name}: ${e.message || 'yükləmək alınmadı'}`)
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }
    setErrors(errs)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  function save(id, fields) {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, ...fields } : p)))
    start(async () => {
      const res = await updatePanorama(id, fields)
      if (res?.error) setErrors([res.error])
    })
  }

  function move(index, dir) {
    const next = [...items]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setItems(next)
    start(async () => {
      const res = await reorderPanoramas(houseId, next.map((p) => p.id))
      if (res?.error) setErrors([res.error])
    })
  }

  return (
    <div className="space-y-4">
      <details className="rounded-lg bg-wood-100/40 p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-pine-900">📱 Telefonla necə çəkmək olar?</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-ink/85">
          <li>Kamerada <b>“Panorama”</b> (iPhone: <b>Pano</b>) rejimini seçin. Android-də <b>“Photo Sphere / 360°”</b> rejimi varsa, o daha yaxşıdır.</li>
          <li>Otağın <b>ortasında</b> dayanın, telefonu <b>dik</b> tutun, işıqları yandırın, pərdələri açın.</li>
          <li>Ayaqlarınızın yerini dəyişmədən, öz oxunuz ətrafında <b>yavaş-yavaş</b> tam bir dövrə fırlanın.</li>
          <li>Hər otaq üçün bir panorama. Sonra buraya yükləyib adını yazın: “Qonaq otağı”, “Yataq otağı”, “Terras”.</li>
        </ol>
      </details>

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-lg p-3 ring-1 ring-pine-100 sm:flex-row sm:items-center">
              <button type="button" onClick={() => setPreview(preview === p.id ? null : p.id)} className="relative h-16 w-full shrink-0 overflow-hidden rounded-md sm:w-48" title="Önizlə">
                <img src={p.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 text-xs text-white">{preview === p.id ? 'Bağla' : '👁 Önizlə'}</span>
              </button>
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input defaultValue={p.title_az || ''} placeholder="Otaq adı (AZ)" aria-label="Otaq adı (AZ)" className={inputCls} onBlur={(e) => e.target.value !== (p.title_az || '') && save(p.id, { title_az: e.target.value })} />
                <input defaultValue={p.title_ru || ''} placeholder="Otaq adı (RU)" aria-label="Otaq adı (RU)" className={inputCls} onBlur={(e) => e.target.value !== (p.title_ru || '') && save(p.id, { title_ru: e.target.value })} />
                <label className="col-span-2 flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" checked={p.full_circle} onChange={(e) => save(p.id, { full_circle: e.target.checked })} className="accent-pine-700" />
                  Tam dövrə çəkilib (360°). Panorama qırıq görünürsə, bunu dəyişin.
                </label>
              </div>
              <div className="flex items-center justify-between gap-2 sm:flex-col">
                <span className="flex gap-1">
                  <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Yuxarı" className="h-7 w-7 rounded-md text-pine-700 hover:bg-pine-50 disabled:opacity-30">↑</button>
                  <button type="button" disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} aria-label="Aşağı" className="h-7 w-7 rounded-md text-pine-700 hover:bg-pine-50 disabled:opacity-30">↓</button>
                </span>
                <ConfirmButton action={deletePanorama.bind(null, p.id)} label="Sil" confirmLabel="Sil" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {preview && (() => {
        const p = items.find((x) => x.id === preview)
        return p ? (
          <PanoramaTour
            key={`${p.id}${p.full_circle}`}
            panoramas={[{ src: p.url, title: p.title_az, aspect: Number(p.aspect), fullCircle: p.full_circle }]}
            t={az.tour}
          />
        ) : null
      })()}

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (!busy) upload(e.dataTransfer.files) }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-pine-200 px-4 py-6 text-center transition-colors hover:border-wood-500 hover:bg-wood-100/30 ${busy ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="text-2xl" aria-hidden="true">🔄</span>
        <span className="mt-1 text-sm font-semibold text-pine-900">
          {progress ? `Yüklənir… ${progress.done} / ${progress.total}` : 'Panorama şəkli seçin'}
        </span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
      </label>

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}
