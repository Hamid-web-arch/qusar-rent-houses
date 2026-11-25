'use client'
import { useEffect, useRef, useState } from 'react'
import 'pannellum/build/pannellum.css'
import { panoramaView } from '@/lib/media'

// 360° / panorama turu. Kitabxana və şəkil yalnız "Turu başlat" basılanda yüklənir.
export default function PanoramaTour({ panoramas, t }) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [status, setStatus] = useState('idle') // idle | loading | ready | error

  useEffect(() => {
    if (!started) return
    let viewer
    let cancelled = false
    const pano = panoramas[current]
    const { haov, vaov } = panoramaView(pano)
    const partial = haov < 360

    ;(async () => {
      await import('pannellum/build/pannellum.js') // window.pannellum yaradır
      if (cancelled || !ref.current) return
      setStatus('loading')
      viewer = window.pannellum.viewer(ref.current, {
        type: 'equirectangular',
        panorama: pano.src,
        autoLoad: true,
        haov,
        vaov,
        ...(partial && { minYaw: -haov / 2, maxYaw: haov / 2, avoidShowingBackground: true }),
        minPitch: -vaov / 2,
        maxPitch: vaov / 2,
        hfov: partial ? Math.min(90, haov) : 100,
        autoRotate: partial ? 0 : -2,
        autoRotateInactivityDelay: 4000,
        mouseZoom: 'fullscreenonly',
        showZoomCtrl: false,
        compass: false,
        strings: { loadingLabel: t.loading },
      })
      viewer.on('load', () => !cancelled && setStatus('ready'))
      viewer.on('error', () => !cancelled && setStatus('error'))
    })()

    return () => {
      cancelled = true
      viewer?.destroy()
    }
  }, [started, current, panoramas, t.loading])

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-pine-900 sm:aspect-[16/9]">
        <div ref={ref} className="absolute inset-0" />
        {!started && (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,#3f6b4f,#16291f)] text-white"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 text-xl font-bold transition-transform group-hover:scale-110">
              360°
            </span>
            <span className="rounded-full bg-wood-500 px-6 py-3 text-sm font-semibold shadow-lg group-hover:bg-wood-600">{t.start}</span>
          </button>
        )}
        {status === 'error' && (
          <p className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/70 px-4 py-2 text-sm text-white">{t.error}</p>
        )}
      </div>

      {panoramas.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t.rooms}>
          {panoramas.map((p, i) => (
            <button
              key={p.src}
              type="button"
              role="tab"
              aria-selected={i === current}
              onClick={() => { setCurrent(i); setStarted(true) }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors ${
                i === current ? 'bg-pine-700 text-white ring-pine-700' : 'bg-white text-pine-700 ring-pine-100 hover:ring-pine-200'
              }`}
            >
              {p.title || `${i + 1}`}
            </button>
          ))}
        </div>
      )}
      {panoramas.length === 1 && panoramas[0].title && <p className="mt-2 text-sm text-muted">{panoramas[0].title}</p>}
    </div>
  )
}
