import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, htmlLang, locales, ogLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import { site } from '@/lib/site'
import '../globals.css'

// latin-ext: "ə, ğ, ı, ö, ş, ü, ç" hərfləri üçün; cyrillic: rus dili üçün
const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const dict = await getDictionary(lang)
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: dict.meta.titleTemplate },
    description: dict.meta.description,
    // canonical/hreflang hər səhifənin özündə verilir ki, miras qalıb səhv səhifəyə yazılmasın
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: ogLocale[lang],
      title: dict.meta.title,
      description: dict.meta.description,
    },
  }
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return (
    <html lang={htmlLang[lang]} className={inter.variable}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  )
}
