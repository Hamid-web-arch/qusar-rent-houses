'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeNames, localePath, locales, stripLocale } from '@/lib/i18n'

export default function LanguageSwitcher({ lang }) {
  const path = stripLocale(usePathname() || '/')
  return (
    <div className="flex rounded-full border border-pine-200 bg-white/70 p-0.5 text-xs font-semibold">
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l, path)}
          hrefLang={l}
          aria-current={l === lang ? 'true' : undefined}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            l === lang ? 'bg-pine-700 text-white' : 'text-pine-700 hover:bg-pine-50'
          }`}
        >
          {localeNames[l]}
        </Link>
      ))}
    </div>
  )
}
