'use client'
import { useState } from 'react'

// YouTube videosu: əvvəlcə yalnız örtük şəkli göstərilir, YouTube pleyeri basanda yüklənir
// (saytı ağırlaşdırmasın və YouTube kukiləri lazımsız yerə yazılmasın).
export default function VideoTour({ videoId, title, playLabel }) {
  const [play, setPlay] = useState(false)
  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-black">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={playLabel} className="group absolute inset-0">
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#b5733a" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  )
}
