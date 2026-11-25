'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/admin/actions'

const ITEMS = [
  { href: '/admin', label: 'Sorğular', icon: '📩', exact: true },
  { href: '/admin/evler', label: 'Evlər', icon: '🏠' },
  { href: '/admin/teqvim', label: 'Təqvim', icon: '📅' },
]

export default function AdminNav({ newCount }) {
  const pathname = usePathname()
  const active = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-col lg:px-3 lg:pb-0 lg:pt-2">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item) ? 'page' : undefined}
          className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            active(item) ? 'bg-pine-700 text-white' : 'text-pine-700 hover:bg-pine-50'
          }`}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
          {item.href === '/admin' && newCount > 0 && (
            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${active(item) ? 'bg-white text-pine-700' : 'bg-wood-500 text-white'}`}>
              {newCount}
            </span>
          )}
        </Link>
      ))}
      <form action={signOut} className="shrink-0 lg:hidden">
        <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-red-700">Çıxış</button>
      </form>
    </nav>
  )
}
