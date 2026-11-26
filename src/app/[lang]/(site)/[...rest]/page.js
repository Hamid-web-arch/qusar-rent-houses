import { notFound } from 'next/navigation'

// Mövcud olmayan bütün yollar 404 qaytarsın.
// dynamicParams = false: Next.js səhifəni render etmədən 404 statusu verir
// (əks halda Vercel-də cavab axını 200 ilə başlayır və Google "soft 404" görür).
export const dynamicParams = false

export function generateStaticParams() {
  return []
}

export default function CatchAll() {
  notFound()
}
