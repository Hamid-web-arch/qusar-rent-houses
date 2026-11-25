import 'server-only'

const dictionaries = {
  az: () => import('@/dictionaries/az.json').then((m) => m.default),
  ru: () => import('@/dictionaries/ru.json').then((m) => m.default),
}

export const getDictionary = async (lang) => dictionaries[lang]()
