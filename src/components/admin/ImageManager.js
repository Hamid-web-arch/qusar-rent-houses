'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addImages, deleteImage, reorderImages } from '@/app/admin/actions'
import ConfirmButton from './ConfirmButton'

const MAX_SIDE = 2000
const QUALITY = 0.82

// Şəkli brauzerdə kiçildib WebP-yə çevirir (telefon şəkli 6 MB → ~400 KB)
async function compress(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
  if (!blob) throw new Error('çevirmək alınmadı')
  return blob
}

export default function ImageManager({ houseId, images: initial }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [images, setImages] = useState(initial)
  const [progress, setProgress] = useState(null) // { done, total }
  const [errors, setErrors] = useState([])
  const [pending, start] = useTransition()


  async function upload(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (!list.length) return
    const supabase = createClient()
    const paths = []
    const errs = []
    setErrors([])
    setProgress({ done: 0, total: list.length })
    for (const file of list) {
      try {
        const blob = await compress(file)
        const path = `${houseId}/${crypto.randomUUID()}.webp`
        const { error } = await supabase.storage.from('house-images').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
        if (error) throw error
        paths.push(path)
      } catch (e) {
        errs.push(`${file.name}: ${e.message || 'yükləmək alınmadı'}`)
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }
    if (paths.length) {
      const res = await addImages(houseId, paths)
      if (res?.error) errs.push(res.error)
    }
    setErrors(errs)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  function move(index, dir) {
    const next = [...images]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setImages(next)
    start(async () => {
      const res = await reorderImages(houseId, next.map((i) => i.id))
      if (res?.error) setErrors([res.error])
    })
  }

  const busy = Boolean(progress) || pending

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="group relative overflow-hidden rounded-lg ring-1 ring-pine-100">
              <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-wood-500 px-2 py-0.5 text-xs font-semibold text-white">Örtük</span>}
              <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5">
                <span className="flex gap-1">
                  <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Sola" className="h-7 w-7 rounded-md text-pine-700 hover:bg-pine-50 disabled:opacity-30">←</button>
                  <button type="button" disabled={busy || i === images.length - 1} onClick={() => move(i, 1)} aria-label="Sağa" className="h-7 w-7 rounded-md text-pine-700 hover:bg-pine-50 disabled:opacity-30">→</button>
                </span>
                <ConfirmButton action={deleteImage.bind(null, img.id)} label="Sil" confirmLabel="Sil" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (!busy) upload(e.dataTransfer.files) }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-pine-200 px-4 py-8 text-center transition-colors hover:border-wood-500 hover:bg-wood-100/30 ${busy ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="text-3xl" aria-hidden="true">📷</span>
        <span className="mt-2 text-sm font-semibold text-pine-900">
          {progress ? `Yüklənir… ${progress.done} / ${progress.total}` : 'Şəkil seçin və ya bura sürükləyin'}
        </span>
        <span className="mt-1 text-xs text-muted">Bir neçəsini birdən seçmək olar. Şəkillər avtomatik kiçildilir.</span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
      </label>

      {images.length > 1 && <p className="mt-2 text-xs text-muted">Birinci şəkil saytda örtük kimi görünür. Sıranı ← → ilə dəyişin.</p>}
      {errors.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}
