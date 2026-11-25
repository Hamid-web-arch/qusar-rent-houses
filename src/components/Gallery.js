'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import AFrameArt from './AFrameArt'

export default function Gallery({ images, variant, labels }) {
  const [open, setOpen] = useState(null) // açıq şəklin indeksi
  const [current, setCurrent] = useState(0) // telefonda karuseldəki şəkil

  useEffect(() => {
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + images.length) % images.length)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, images.length])

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-card sm:aspect-[21/9]">
        <AFrameArt className="h-full w-full" variant={variant} />
        <p className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">{labels.noPhotos}</p>
      </div>
    )
  }

  const side = images.slice(1, 5)

  return (
    <>
      {/* Telefon: sürüşdürülən karusel */}
      <div className="relative -mx-5 sm:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((img, i) => (
            <button key={img.src} type="button" onClick={() => setOpen(i)} className="relative aspect-[4/3] w-full shrink-0 snap-center">
              <Image src={img.src} alt={img.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Kompüter: böyük şəkil + 4 kiçik */}
      <div className={`hidden gap-2 overflow-hidden rounded-card sm:grid ${side.length ? 'grid-cols-4 grid-rows-2' : ''} sm:aspect-[21/9]`}>
        <button type="button" onClick={() => setOpen(0)} className={`relative ${side.length ? 'col-span-2 row-span-2' : ''}`}>
          <Image src={images[0].src} alt={images[0].alt} fill priority sizes="(min-width: 1152px) 576px, 50vw" className="object-cover transition-opacity hover:opacity-90" />
        </button>
        {side.map((img, i) => (
          <button key={img.src} type="button" onClick={() => setOpen(i + 1)} className={`relative ${side.length < 3 ? 'row-span-2' : ''}`}>
            <Image src={img.src} alt={img.alt} fill sizes="25vw" className="object-cover transition-opacity hover:opacity-90" />
            {i === side.length - 1 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                +{images.length - 5}
              </span>
            )}
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/95" role="dialog" aria-modal="true">
            <button type="button" onClick={() => setOpen(null)} aria-label={labels.close} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
              ×
            </button>
            <div className="relative h-[80vh] w-full max-w-5xl">
              <Image src={images[open].src} alt={images[open].alt} fill sizes="100vw" className="object-contain" />
            </div>
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setOpen((open - 1 + images.length) % images.length)} aria-label={labels.prev} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
                  ‹
                </button>
                <button type="button" onClick={() => setOpen((open + 1) % images.length)} aria-label={labels.next} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
                  ›
                </button>
              </>
            )}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {open + 1} / {images.length}
            </span>
          </div>,
          document.body,
        )}
    </>
  )
}
