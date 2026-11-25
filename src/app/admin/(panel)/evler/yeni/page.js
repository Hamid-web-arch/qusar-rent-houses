import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import HouseForm from '@/components/admin/HouseForm'

export const metadata = { title: 'Yeni ev' }

export default async function NewHousePage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/evler" className="text-sm font-medium text-muted hover:text-wood-600">← Evlər</Link>
      <h1 className="mt-2 text-2xl font-bold text-pine-900">Yeni ev</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Evi yaratdıqdan sonra şəkilləri, mövsüm qiymətlərini və dolu günləri əlavə edə biləcəksiniz.</p>
      <HouseForm house={null} />
    </div>
  )
}
