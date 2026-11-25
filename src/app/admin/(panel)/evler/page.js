import Image from 'next/image'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { imageUrl } from '@/lib/supabase/server'
import PublishToggle from '@/components/admin/PublishToggle'

export const metadata = { title: 'Evlər' }

export default async function AdminHousesPage() {
  const { supabase } = await requireAdmin()
  const { data: houses, error } = await supabase
    .from('houses')
    .select('id, slug, name_az, type, capacity, price_weekday, price_weekend, is_published, images:house_images(path, sort_order)')
    .order('sort_order')
    .order('created_at')

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pine-900">Evlər</h1>
          <p className="mt-1 text-sm text-muted">Gizli evlər saytda görünmür. Hazır olanda “Saytda” düyməsini yandırın.</p>
        </div>
        <Link href="/admin/evler/yeni" className="btn-primary">+ Yeni ev</Link>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">Yükləmək alınmadı: {error.message}</p>}

      {houses?.length === 0 && (
        <div className="mt-6 rounded-card bg-white px-6 py-14 text-center ring-1 ring-pine-100">
          <p className="text-4xl" aria-hidden="true">🏠</p>
          <p className="mt-3 font-semibold text-pine-900">Hələ ev əlavə edilməyib</p>
          <Link href="/admin/evler/yeni" className="btn-primary mt-5">İlk evi əlavə et</Link>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {houses?.map((h) => {
          const cover = [...h.images].sort((a, b) => a.sort_order - b.sort_order)[0]
          return (
            <li key={h.id} className="flex items-center gap-4 rounded-card bg-white p-3 shadow-sm ring-1 ring-pine-100 sm:p-4">
              <Link href={`/admin/evler/${h.id}`} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-pine-100 sm:h-20 sm:w-28">
                {cover ? (
                  <Image src={imageUrl(cover.path)} alt="" fill sizes="112px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-2xl" aria-hidden="true">🏠</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/evler/${h.id}`} className="block truncate font-bold text-pine-900 hover:text-wood-600">{h.name_az}</Link>
                <p className="text-sm text-muted">
                  {h.type === 'aframe' ? 'A-frame' : 'Ev'} · {h.capacity} nəfər · {Number(h.price_weekday)}
                  {h.price_weekend != null && ` / ${Number(h.price_weekend)}`} ₼ · {h.images.length} şəkil
                </p>
              </div>
              <PublishToggle id={h.id} published={h.is_published} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
