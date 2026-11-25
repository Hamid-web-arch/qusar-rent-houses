'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { PhoneIcon, WhatsAppIcon } from './Icons'

// Telefonda (md-dən kiçik ekranlarda) görünən ☰ menyu
export default function MobileMenu({ lang, nav, labels, phone, whatsappHref }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Səhifə dəyişəndə menyu bağlansın
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    // Menyu açıq olanda arxadakı səhifə sürüşməsin
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.menu}
        className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-full text-pine-900 hover:bg-pine-50 md:hidden"
      >
        <span className="relative block h-4 w-5" aria-hidden="true">
          <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? 'top-[7px] rotate-45' : 'top-0'}`} />
          <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? 'top-[7px] -rotate-45' : 'top-[14px]'}`} />
        </span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 top-16 z-[55] md:hidden">
            <button
              type="button"
              aria-label={labels.close}
              tabIndex={-1}
              onClick={close}
              className="animate-fade-in absolute inset-0 bg-pine-900/40"
            />
            <nav
              id="mobile-menu"
              className="animate-slide-down relative flex max-h-full flex-col overflow-y-auto border-t border-pine-100 bg-cream px-5 pb-8 pt-2 shadow-xl"
            >
              <ul className="divide-y divide-pine-100">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex items-center justify-between py-4 text-lg font-semibold text-pine-900 active:text-wood-600"
                    >
                      {item.label}
                      <span className="text-pine-200" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-pine-100">
                <span className="text-sm font-medium text-muted">{labels.language}</span>
                <LanguageSwitcher lang={lang} />
              </div>

              <div className="mt-6 grid gap-3">
                <a href={whatsappHref} target="_blank" rel="noopener" onClick={close} className="btn-whatsapp py-3.5 text-base">
                  <WhatsAppIcon width={20} height={20} /> {labels.book}
                </a>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn border border-pine-200 bg-white py-3.5 text-base text-pine-900">
                  <PhoneIcon /> {labels.call}: {phone}
                </a>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </>
  )
}
