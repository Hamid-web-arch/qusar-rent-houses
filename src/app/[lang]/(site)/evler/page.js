import { Suspense } from 'react'
import { alternates } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import { getHouses } from '@/lib/houses'
import { whatsappLink } from '@/lib/site'
import HouseCard from '@/components/HouseCard'
import HousesExplorer from '@/components/HousesExplorer'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.housesPage.metaTitle,
    description: dict.housesPage.metaDescription,
    alternates: alternates(lang, '/evler'),
  }
}

export default async function HousesPage({ params }) {
  const { lang } = await params
  const [dict, houses] = await Promise.all([getDictionary(lang), getHouses(lang)])
  const t = {
    house: dict.house,
    search: dict.search,
    filters: dict.filters,
    amenities: dict.amenities,
    calendar: dict.calendar,
  }

  return (
    <section className="container-page pt-10 sm:pt-14">
      <h1 className="section-title">{dict.housesPage.title}</h1>
      <p className="mt-2 text-muted">{dict.housesPage.subtitle}</p>

      {/* Filtrlər brauzerdə işləyir; Google və JS yüklənənə qədər bütün evlərin siyahısı görünür */}
      <Suspense
        fallback={
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house, i) => (
              <HouseCard key={house.id} house={house} lang={lang} t={dict.house} priority={i < 3} />
            ))}
          </div>
        }
      >
        <HousesExplorer houses={houses} lang={lang} t={t} waHref={whatsappLink(dict.whatsappMessage)} />
      </Suspense>
    </section>
  )
}
