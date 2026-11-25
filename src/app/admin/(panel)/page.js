import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { nightsBetween } from '@/lib/dates'
import BookingActions from '@/components/admin/BookingActions'
import { fmtDate } from '@/components/admin/ui'

export const metadata = { title: 'Sorğular' }

const TABS = [
  { key: 'new', label: 'Yeni' },
  { key: 'confirmed', label: 'Təsdiqlənmiş' },
  { key: 'cancelled', label: 'Ləğv edilmiş' },
  { key: 'all', label: 'Hamısı' },
]
const STATUS = {
  new: { label: 'Yeni', cls: 'bg-wood-100 text-wood-600' },
  confirmed: { label: 'Təsdiqlənib', cls: 'bg-pine-100 text-pine-700' },
  cancelled: { label: 'Ləğv edilib', cls: 'bg-gray-100 text-gray-500' },
}

export default async function BookingsPage({ searchParams }) {
  const { supabase } = await requireAdmin()
  const { status: raw } = await searchParams
  const status = TABS.some((t) => t.key === raw) ? raw : 'new'

  let q = supabase
    .from('bookings')
    .select('*, house:houses(name_az, slug)')
    .order(status === 'confirmed' ? 'check_in' : 'created_at', { ascending: status === 'confirmed' })
    .limit(200)
  if (status !== 'all') q = q.eq('status', status)
  const { data: bookings, error } = await q

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-pine-900">Rezervasiya sorğuları</h1>
      <p className="mt-1 text-sm text-muted">
        Saytdakı formadan gələn sorğular. Təsdiqlədiyiniz sorğunun günləri təqvimdə avtomatik dolu olur.
      </p>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-pine-100">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === 'new' ? '/admin' : `/admin?status=${t.key}`}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${status === t.key ? 'bg-pine-700 text-white' : 'text-pine-700 hover:bg-pine-50'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">Yükləmək alınmadı: {error.message}</p>}

      {bookings?.length === 0 && (
        <div className="mt-6 rounded-card bg-white px-6 py-14 text-center ring-1 ring-pine-100">
          <p className="text-4xl" aria-hidden="true">📭</p>
          <p className="mt-3 font-semibold text-pine-900">Burada hələ sorğu yoxdur</p>
          <p className="mt-1 text-sm text-muted">Müştəri saytda ev səhifəsindən sorğu göndərəndə burada görünəcək.</p>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {bookings?.map((b) => {
          const nights = nightsBetween(b.check_in, b.check_out)
          const phoneDigits = b.phone.replace(/[^\d]/g, '')
          return (
            <li key={b.id} className="rounded-card bg-white p-5 shadow-sm ring-1 ring-pine-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-pine-900">{b.name}</p>
                  <p className="text-sm text-muted">
                    {b.house?.name_az ?? 'Ev silinib'} · {b.lang === 'ru' ? '🇷🇺 rusca' : '🇦🇿 azərbaycanca'}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[b.status].cls}`}>{STATUS[b.status].label}</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-xs text-muted">Giriş</dt><dd className="font-semibold">{fmtDate(b.check_in)}</dd></div>
                <div><dt className="text-xs text-muted">Çıxış</dt><dd className="font-semibold">{fmtDate(b.check_out)}</dd></div>
                <div><dt className="text-xs text-muted">Gecə / qonaq</dt><dd className="font-semibold">{nights} gecə · {b.guests} nəfər</dd></div>
                <div><dt className="text-xs text-muted">Göndərilib</dt><dd className="font-semibold">{fmtDate(b.created_at)}</dd></div>
              </dl>

              {b.message && <p className="mt-4 rounded-lg bg-cream p-3 text-sm text-ink/85">“{b.message}”</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`tel:${b.phone}`} className="btn border border-pine-200 bg-white px-4 py-2 text-pine-900">📞 {b.phone}</a>
                {phoneDigits.length >= 9 && (
                  <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener" className="btn-whatsapp px-4 py-2">WhatsApp</a>
                )}
              </div>

              <BookingActions id={b.id} status={b.status} note={b.admin_note || ''} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
