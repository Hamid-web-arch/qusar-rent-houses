import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { todayISO } from '@/lib/dates'
import { imageUrl } from '@/lib/supabase/server'
import { deleteHouse, deleteSeasonalPrice } from '@/app/admin/actions'
import HouseForm from '@/components/admin/HouseForm'
import ImageManager from '@/components/admin/ImageManager'
import PanoramaManager from '@/components/admin/PanoramaManager'
import SeasonalForm from '@/components/admin/SeasonalForm'
import BlockedSection from '@/components/admin/BlockedSection'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Card, fmtDate } from '@/components/admin/ui'

export const metadata = { title: 'Evi redaktə et' }

export default async function EditHousePage({ params, searchParams }) {
  const { id } = await params
  const { yeni } = await searchParams
  const { supabase } = await requireAdmin()

  const { data: house } = await supabase
    .from('houses')
    .select(`*,
      images:house_images(id, path, sort_order),
      panoramas:house_panoramas(id, path, title_az, title_ru, aspect, full_circle, sort_order),
      seasonal:seasonal_prices(id, name, start_date, end_date, price),
      blocked:blocked_dates(id, start_date, end_date, note, booking_id)`)
    .eq('id', id)
    .maybeSingle()
  if (!house) notFound()

  const images = [...house.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ id: i.id, url: imageUrl(i.path) }))
  const panoramas = [...house.panoramas].sort((a, b) => a.sort_order - b.sort_order).map((p) => ({ ...p, url: imageUrl(p.path) }))
  const seasonal = [...house.seasonal].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const today = todayISO()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/evler" className="text-sm font-medium text-muted hover:text-wood-600">← Evlər</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-pine-900">{house.name_az}</h1>
          {house.is_published && (
            <a href={`/evler/${house.slug}`} target="_blank" className="text-sm font-semibold text-wood-600 hover:text-wood-500">Saytda bax ↗</a>
          )}
        </div>
        {yeni && (
          <p className="mt-3 rounded-lg bg-pine-50 px-4 py-3 text-sm text-pine-700">
            ✓ Ev yaradıldı. İndi şəkilləri yükləyin, sonra “Saytda göstər” işarəsini qoyub yadda saxlayın.
          </p>
        )}
      </div>

      <Card title={`Şəkillər (${images.length})`}>
        {/* key: server yeni siyahı göndərəndə (yükləmə/silmədən sonra) komponent təzələnsin */}
        <ImageManager key={images.map((i) => i.id).sort().join()} houseId={house.id} images={images} />
      </Card>

      <Card title={`360° / panorama tur (${panoramas.length})`}>
        <PanoramaManager key={panoramas.map((p) => p.id).sort().join()} houseId={house.id} panoramas={panoramas} />
      </Card>

      <HouseForm house={house} />

      <Card title="Mövsüm qiymətləri">
        <p className="mb-4 text-sm text-muted">
          Bu tarixlərdə əsas qiymət əvəzinə burada yazılan qiymət hesablanır (məs. Yeni il, Novruz).
        </p>
        {seasonal.length > 0 && (
          <ul className="mb-4 divide-y divide-pine-100 rounded-lg ring-1 ring-pine-100">
            {seasonal.map((s) => (
              <li key={s.id} className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${s.end_date < today ? 'opacity-50' : ''}`}>
                <span><b>{s.name}</b> · {fmtDate(s.start_date)} – {fmtDate(s.end_date)}</span>
                <span className="flex items-center gap-4">
                  <b>{Number(s.price)} ₼</b>
                  <ConfirmButton action={deleteSeasonalPrice.bind(null, s.id)} label="Sil" />
                </span>
              </li>
            ))}
          </ul>
        )}
        <SeasonalForm houseId={house.id} />
      </Card>

      <Card title="Dolu günlər">
        <BlockedSection houses={[{ id: house.id, name_az: house.name_az }]} blocked={house.blocked.map((b) => ({ ...b, house_id: house.id }))} />
      </Card>

      <Card title="Təhlükəli zona" className="ring-red-100">
        <p className="mb-4 text-sm text-muted">Evi silsəniz, şəkilləri, qiymətləri və dolu günləri də silinəcək. Bunu geri qaytarmaq olmur.</p>
        <ConfirmButton action={deleteHouse.bind(null, house.id)} label="Evi sil" confirmLabel="Bəli, birdəfəlik sil" danger />
      </Card>
    </div>
  )
}
