// Dillər. Azərbaycan dili əsas dildir və URL-də prefikssiz göstərilir:
//   az → /evler        ru → /ru/evler
export const locales = ['az', 'ru']
export const defaultLocale = 'az'

export const localeNames = { az: 'AZ', ru: 'RU' }
export const htmlLang = { az: 'az', ru: 'ru' }
export const ogLocale = { az: 'az_AZ', ru: 'ru_RU' }

export const hasLocale = (lang) => locales.includes(lang)

// Daxili yolu (məs. "/evler") verilmiş dil üçün ictimai URL-ə çevirir.
export function localePath(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === defaultLocale) return clean
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`
}

// İctimai URL-dən dil prefiksini çıxarır: "/ru/evler" → "/evler"
export function stripLocale(pathname) {
  for (const l of locales) {
    if (pathname === `/${l}`) return '/'
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname
}

// SEO üçün hreflang alternativləri
export function alternates(lang, path = '/') {
  const languages = Object.fromEntries(locales.map((l) => [l, localePath(l, path)]))
  languages['x-default'] = localePath(defaultLocale, path)
  return { canonical: localePath(lang, path), languages }
}
