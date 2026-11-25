import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { signOut } from '@/app/admin/actions'
import AdminNav from '@/components/admin/AdminNav'

export default async function PanelLayout({ children }) {
  const { supabase, user } = await requireAdmin()
  const { count: newCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-pine-100 bg-white lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center justify-between gap-3 px-4 lg:h-16 lg:px-5">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-pine-900">
            <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
              <path d="M16 3 3 29h26z" fill="#b5733a" />
              <path d="M16 15 11 25h10z" fill="#f8f4ee" />
            </svg>
            Admin
          </Link>
          <a href="/" target="_blank" className="text-xs font-semibold text-wood-600 hover:text-wood-500">Sayta bax ↗</a>
        </div>
        <AdminNav newCount={newCount ?? 0} />
        <div className="hidden border-t border-pine-100 px-5 py-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate text-xs text-muted" title={user.email}>{user.email}</p>
          <form action={signOut}>
            <button type="submit" className="mt-2 text-sm font-semibold text-pine-700 hover:text-red-700">Çıxış</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  )
}
