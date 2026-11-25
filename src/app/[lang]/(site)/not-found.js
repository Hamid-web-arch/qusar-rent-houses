import Link from 'next/link'
import { lang as getLang } from 'next/root-params'
import { hasLocale, localePath } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'

export default async function NotFound() {
  const raw = await getLang()
  const lang = hasLocale(raw) ? raw : 'az'
  const dict = await getDictionary(lang)
  return (
    <section className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-extrabold text-wood-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-pine-900">{dict.notFound.title}</h1>
      <p className="mt-2 text-muted">{dict.notFound.text}</p>
      <Link href={localePath(lang, '/')} className="btn-primary mt-8">{dict.notFound.back}</Link>
    </section>
  )
}
