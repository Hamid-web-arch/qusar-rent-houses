import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import { site, whatsappLink } from '@/lib/site'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import { PhoneIcon, WhatsAppIcon } from './Icons'

export default function Header({ lang, dict }) {
  const nav = [
    { href: localePath(lang, '/'), label: dict.nav.home },
    { href: localePath(lang, '/evler'), label: dict.nav.houses },
    { href: localePath(lang, '/elaqe'), label: dict.nav.contact },
  ]
  const waHref = whatsappLink(dict.whatsappMessage)

  return (
    <header className="sticky top-0 z-40 border-b border-pine-100 bg-cream/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={localePath(lang, '/')} className="flex items-center gap-2 font-bold text-pine-900">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <path d="M16 3 3 29h26z" fill="#b5733a" />
            <path d="M16 15 11 25h10z" fill="#f8f4ee" />
          </svg>
          <span className="text-lg tracking-tight">{site.name}</span>
        </Link>

        {/* Kompüter: menyu linkləri */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-pine-700 md:flex">
          {nav.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-wood-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher lang={lang} />
          </div>
          <a href={waHref} target="_blank" rel="noopener" className="btn-primary hidden px-4 py-2 md:inline-flex">
            <WhatsAppIcon width={16} height={16} />
            {dict.nav.book}
          </a>

          {/* Telefon: bir toxunuşla zəng + ☰ menyu */}
          <a
            href={`tel:${site.phone.replace(/\s/g, '')}`}
            aria-label={dict.nav.call}
            className="flex h-10 w-10 items-center justify-center rounded-full text-pine-900 hover:bg-pine-50 md:hidden"
          >
            <PhoneIcon width={20} height={20} />
          </a>
          <MobileMenu
            lang={lang}
            nav={nav}
            phone={site.phone}
            whatsappHref={waHref}
            labels={{
              menu: dict.nav.menu,
              close: dict.nav.close,
              call: dict.nav.call,
              book: dict.nav.book,
              language: dict.nav.language,
            }}
          />
        </div>
      </div>
    </header>
  )
}
