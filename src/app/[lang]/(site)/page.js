import Link from 'next/link'
import { alternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import { getHouses } from '@/lib/houses'
import { site, whatsappLink } from '@/lib/site'
import AFrameArt from '@/components/AFrameArt'
import HouseCard from '@/components/HouseCard'
import KeepWords from '@/components/KeepWords'
import SearchBar from '@/components/SearchBar'
import { WhatsAppIcon } from '@/components/Icons'

export async function generateMetadata({ params }) {
  const { lang } = await params
  return { alternates: alternates(lang, '/') }
}

export default async function HomePage({ params }) {
  const { lang } = await params
  const [dict, houses] = await Promise.all([getDictionary(lang), getHouses(lang)])

  // Google üçün strukturlaşdırılmış məlumat: axtarışda biznes kimi tanınmaq üçün
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: site.name,
    description: dict.meta.description,
    url: `${site.url}${localePath(lang, '/')}`,
    telephone: site.phone,
    priceRange: houses.length
      ? `${Math.min(...houses.map((h) => h.priceWeekday))}–${Math.max(...houses.map((h) => h.priceWeekend ?? h.priceWeekday))} AZN`
      : undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Qusar', addressCountry: 'AZ' },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    sameAs: [site.instagram],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden">
        <AFrameArt className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pine-900/90 via-pine-900/60 to-transparent" />
        <div className="container-page flex min-h-[78vh] flex-col justify-center py-16 text-white sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-wood-400">{dict.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <KeepWords>{dict.hero.title}</KeepWords>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pine-100">{dict.hero.subtitle}</p>
          <div className="mt-9 max-w-4xl">
            <SearchBar lang={lang} t={dict.search} />
          </div>
          <a
            href={whatsappLink(dict.whatsappMessage)}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-white/90 hover:text-white"
          >
            <WhatsAppIcon width={18} height={18} className="text-[#25D366]" />
            {dict.hero.ctaWhatsapp}
          </a>
        </div>
      </section>

      {/* ---------- Evlər ---------- */}
      <section id="evler" className="container-page pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{dict.featured.title}</h2>
            <p className="mt-2 text-muted">{dict.featured.subtitle}</p>
          </div>
          <Link href={localePath(lang, '/evler')} className="text-sm font-semibold text-wood-600 hover:text-wood-500">
            {dict.featured.all} →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {houses.slice(0, 6).map((house) => (
            <HouseCard key={house.id} house={house} lang={lang} t={dict.house} />
          ))}
        </div>
      </section>

      {/* ---------- Üstünlüklər ---------- */}
      <section className="container-page pt-24">
        <h2 className="section-title text-center">{dict.why.title}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.why.items.map((item, i) => (
            <div key={item.title} className="rounded-card bg-white p-6 ring-1 ring-pine-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-50 font-bold text-pine-700">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold text-pine-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Çağırış ---------- */}
      <section className="container-page pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-card bg-pine-700 px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{dict.cta.title}</h2>
            <p className="mt-2 text-pine-100">{dict.cta.text}</p>
          </div>
          <a href={whatsappLink(dict.whatsappMessage)} target="_blank" rel="noopener" className="btn-whatsapp shrink-0">
            <WhatsAppIcon width={18} height={18} /> {dict.cta.button}
          </a>
        </div>
      </section>
    </>
  )
}
