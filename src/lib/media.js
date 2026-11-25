// YouTube linkindən video id-sini çıxarır:
//   youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
export function youtubeId(url) {
  if (!url) return null
  const m = String(url).match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return m ? m[1] : null
}

// Telefon panoramasının baxış bucaqları (dərəcə).
// Telefon kamerası dik tutulanda şaquli bucaq təxminən 65° olur.
const PHONE_VAOV = 65

export function panoramaView({ aspect, fullCircle }) {
  // 2:1 nisbət: tam sferik 360° şəkil (360° kamera və ya "Photo Sphere")
  if (aspect >= 1.9 && aspect <= 2.1) return { haov: 360, vaov: 180 }
  if (fullCircle) return { haov: 360, vaov: Math.min(180, 360 / aspect) }
  return { haov: Math.min(360, aspect * PHONE_VAOV), vaov: PHONE_VAOV }
}

// Yükləmə zamanı: telefonla tam dövrə çəkilibmi (təxmini)
export function guessFullCircle(aspect) {
  return aspect * PHONE_VAOV >= 300
}
