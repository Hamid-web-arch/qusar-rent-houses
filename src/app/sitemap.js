import { getHouses } from '@/lib/houses'
import { locales, localePath } from '@/lib/i18n'
import { site } from '@/lib/site'

// Hər səhifə bütün dillərdə, hreflang alternativləri ilə
function entry(path, priority) {
  const languages = Object.fromEntries(locales.map((l) => [l, `${site.url}${localePath(l, path)}`]))
  return locales.map((l) => ({
    url: `${site.url}${localePath(l, path)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
    alternates: { languages },
  }))
}

export default async function sitemap() {
  const houses = await getHouses('az')
  return [
    ...entry('/', 1),
    ...entry('/evler', 0.9),
    ...entry('/elaqe', 0.5),
    ...houses.flatMap((h) => entry(`/evler/${h.slug}`, 0.8)),
  ]
}
