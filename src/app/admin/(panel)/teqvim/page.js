import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { todayISO } from '@/lib/dates'
import BlockedSection from '@/components/admin/BlockedSection'
import { Card } from '@/components/admin/ui'

export const metadata = { title: 'Təqvim' }

export default async function CalendarPage() {
  const { supabase } = await requireAdmin()
  const [{ data: houses }, { data: blocked, error }] = await Promise.all([
    supabase.from('houses').select('id, name_az').order('sort_order'),
    supabase.from('blocked_dates').select('id, house_id, start_date, end_date, note, booking_id').gte('end_date', todayISO()).order('start_date'),
  ])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-pine-900">Təqvim: dolu günlər</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Bütün evlərin qarşıdakı dolu günləri bir yerdə.</p>
      {error && <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">Yükləmək alınmadı: {error.message}</p>}
      {houses?.length ? (
        <Card>
          <BlockedSection houses={houses} blocked={blocked || []} />
        </Card>
      ) : (
        <p className="rounded-card bg-white p-6 text-sm text-muted ring-1 ring-pine-100">
          Əvvəlcə <Link href="/admin/evler/yeni" className="font-semibold text-wood-600">ev əlavə edin</Link>.
        </p>
      )}
    </div>
  )
}
