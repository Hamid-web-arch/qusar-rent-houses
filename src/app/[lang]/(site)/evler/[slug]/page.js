import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { alternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import { getHouseBySlug, getHouses } from '@/lib/houses'
import { site, whatsappLink } from '@/lib/site'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { fill, plural } from '@/lib/text'
import BookingWidget from '@/components/BookingWidget'
import Gallery from '@/components/Gallery'
import PanoramaTour from '@/components/PanoramaTour'
import VideoTour from '@/components/VideoTour'
import KeepWords from '@/components/KeepWords'
import { BedIcon, MountainIcon, PinIcon, UsersIcon } from '@/components/Icons'

// Supabase-də dəyişiklik (qiymət, dolu günlər) 5 dəqiqə ərzində sayta düşsün
export const revalidate = 300

export async function generateStaticParams({ params }) {
  const houses = await getHouses(params.lang)
  return houses.map((h) => ({ slug: h.slug }))
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const [dict, house] = await Promise.all([getDictionary(lang), getHouseBySlug(slug, lang)])
  if (!house) return {}
  const title = house.seoTitle || `${house.name}: ${dict.house.type[house.type]}, ${dict.hero.eyebrow}`
  const description = house.seoDescription || house.short || dict.meta.description
  return {
    title,
    description,
    alternates: alternates(lang, `/evler/${slug}`),
    openGraph: { title, description, images: house.images.slice(0, 1).map((i) => i.src) },
  }
}

export default async function HousePage({ params }) {
  const { lang, slug } = await params
  const [dict, house] = await Promise.all([getDictionary(lang), getHouseBySlug(slug, lang)])
  if (!house) notFound()

  const t = { house: dict.house, booking: dict.booking, calendar: dict.calendar }
  const hasMap = house.lat != null && house.lng != null
  const hasTour = house.panoramas.length > 0
  const url = `${site.url}${localePath(lang, `/evler/${slug}`)}`

  // Google üçün: ev haqqında strukturlaşdırılmış məlumat + "çörək qırıntıları"
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': house.type === 'aframe' ? 'Accommodation' : 'House',
      name: house.name,
      description: house.short || house.description,
      url,
      image: house.images.map((i) => i.src),
      numberOfBedrooms: house.bedrooms,
      numberOfBathroomsTotal: house.bathrooms,
      occupancy: { '@type': 'QuantitativeValue', maxValue: house.capacity },
      amenityFeature: house.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: dict.amenities[a], value: true })),
      address: { '@type': 'PostalAddress', addressLocality: 'Qusar', addressCountry: 'AZ' },
      ...(hasMap && { geo: { '@type': 'GeoCoordinates', latitude: house.lat, longitude: house.lng } }),
      containedInPlace: { '@type': 'LodgingBusiness', name: site.name, url: site.url, telephone: site.phone },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${site.url}${localePath(lang, '/')}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.houses, item: `${site.url}${localePath(lang, '/evler')}` },
        { '@type': 'ListItem', position: 3, name: house.name, item: url },
      ],
    },
  ]

  const facts = [
    { icon: UsersIcon, text: `${house.capacity} ${plural(house.capacity, dict.house.guestsForms)}` },
    { icon: BedIcon, text: `${house.bedrooms} ${plural(house.bedrooms, dict.house.bedroomsForms)}` },
    house.bathrooms != null && { icon: null, text: `${house.bathrooms} ${plural(house.bathrooms, dict.house.bathroomsForms)}` },
    house.distanceShahdag != null && { icon: MountainIcon, text: `${house.distanceShahdag} ${dict.house.toShahdag}` },
  ].filter(Boolean)

  return (
    <div className="container-page pb-28 pt-6 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <nav aria-label="breadcrumb" className="text-sm text-muted">
        <Link href={localePath(lang, '/evler')} className="font-medium hover:text-wood-600">← {dict.houseDetail.back}</Link>
      </nav>

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-wood-600">{dict.house.type[house.type]} · {dict.hero.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-pine-900 sm:text-4xl">
          <KeepWords>{house.name}</KeepWords>
        </h1>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-pine-700">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-1.5">{Icon && <Icon />} {text}</li>
          ))}
        </ul>
      </header>

      <div className="relative mt-6">
        <Gallery
          images={house.images}
          variant={house.type === 'aframe' ? 'night' : 'day'}
          labels={{ noPhotos: dict.houseDetail.noPhotos, close: dict.nav.close, prev: dict.booking.prev, next: dict.booking.next }}
        />
        {(hasTour || house.videoId) && (
          <div className="absolute right-3 top-3 flex gap-2">
            {hasTour && (
              <a href="#tur" className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-pine-900 shadow-md hover:bg-white">
                🔄 {dict.tour.open}
              </a>
            )}
            {house.videoId && (
              <a href="#video" className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-pine-900 shadow-md hover:bg-white">
                ▶ {dict.tour.video}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          {hasTour && (
            <section id="tur" className="scroll-mt-24">
              <h2 className="text-xl font-bold text-pine-900">{dict.tour.title}</h2>
              <p className="mb-4 mt-1 text-sm text-muted">{dict.tour.subtitle}</p>
              <PanoramaTour panoramas={house.panoramas} t={dict.tour} />
            </section>
          )}

          {house.videoId && (
            <section id="video" className="scroll-mt-24">
              <h2 className="mb-4 text-xl font-bold text-pine-900">{dict.tour.video}</h2>
              <VideoTour videoId={house.videoId} title={`${house.name}: ${dict.tour.video}`} playLabel={dict.tour.playVideo} />
            </section>
          )}

          {house.description && (
            <section>
              <h2 className="text-xl font-bold text-pine-900">{dict.houseDetail.about}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85">
                {house.description.split(/\n\s*\n/).map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              </div>
            </section>
          )}

          {house.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-pine-900">{dict.houseDetail.amenities}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {house.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-pine-900 ring-1 ring-pine-100">
                    <span className="text-pine-500" aria-hidden="true">✓</span> {dict.amenities[a] || a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold text-pine-900">{dict.houseDetail.prices}</h2>
            <dl className="mt-4 divide-y divide-pine-100 overflow-hidden rounded-xl bg-white ring-1 ring-pine-100">
              <div className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-muted">{dict.houseDetail.weekday}</dt>
                <dd className="font-bold text-pine-900">{house.priceWeekday} ₼</dd>
              </div>
              {house.priceWeekend != null && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-muted">{dict.houseDetail.weekend}</dt>
                  <dd className="font-bold text-pine-900">{house.priceWeekend} ₼</dd>
                </div>
              )}
              {house.seasonal.map((s) => (
                <div key={`${s.start}${s.name}`} className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-muted">{s.name}</dt>
                  <dd className="font-bold text-pine-900">{s.price} ₼</dd>
                </div>
              ))}
            </dl>
          </section>

          {hasMap && (
            <section>
              <h2 className="text-xl font-bold text-pine-900">{dict.houseDetail.location}</h2>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted"><PinIcon /> {site.address[lang]}</p>
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-card ring-1 ring-pine-100">
                <iframe
                  title={dict.houseDetail.location}
                  src={`https://maps.google.com/maps?q=${house.lat},${house.lng}&z=12&hl=${lang}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-block text-sm font-semibold text-wood-600 hover:text-wood-500"
              >
                {dict.houseDetail.directions} →
              </a>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<BookingFallback house={house} dict={dict} />}>
            <BookingWidget house={house} t={t} lang={lang} canRequest={isSupabaseConfigured} />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}

// JavaScript yüklənənə qədər (və Google üçün) göstərilən sadə qiymət bloku
function BookingFallback({ house, dict }) {
  return (
    <div className="rounded-card bg-white p-5 ring-1 ring-pine-100">
      <p>
        <span className="text-3xl font-bold text-wood-600">{house.priceWeekday} ₼</span>
        <span className="text-muted"> / {dict.house.perNight}</span>
      </p>
      <a
        href={whatsappLink(fill(dict.booking.waNoDates, { house: house.name }))}
        target="_blank"
        rel="noopener"
        className="btn-whatsapp mt-5 w-full py-3.5"
      >
        {dict.booking.ask}
      </a>
    </div>
  )
}
