import 'server-only'
import { createPublicClient, imageUrl } from '@/lib/supabase/server'
import { addDays, todayISO } from '@/lib/dates'
import { site } from '@/lib/site'
import { youtubeId } from '@/lib/media'

// Supabase qoşulmayana qədər saytın görünüşünü yoxlamaq üçün nümunə evlər.
// Bazaya qoşulduqdan sonra bunlar istifadə olunmur.
function demoHouses() {
  const t = todayISO()
  return [
    {
      id: 'demo-1',
      slug: 'aframe-ev-1',
      type: 'aframe',
      name_az: 'A-frame Ev №1',
      name_ru: 'A-frame дом №1',
      short_az: 'Kaminli, panoram pəncərəli, dağ mənzərəli A-frame ev.',
      short_ru: 'A-frame дом с камином, панорамными окнами и видом на горы.',
      description_az:
        'Meşənin kənarında yerləşən bu A-frame evdə panoram pəncərələrdən birbaşa dağlara baxırsınız. Axşamlar kaminin yanında, səhərlər terrasda qəhvə ilə.\n\nEvdə tam təchiz olunmuş mətbəx, isti döşəmə və sürətli Wi-Fi var. Həyətdə manqal və oturacaq yeri hazırdır.',
      description_ru:
        'Из панорамных окон этого A-frame дома на краю леса открывается вид прямо на горы. Вечера у камина, утренний кофе на террасе.\n\nВ доме полностью оборудованная кухня, тёплый пол и быстрый Wi-Fi. Во дворе мангал и зона отдыха.',
      capacity: 4,
      bedrooms: 1,
      bathrooms: 1,
      price_weekday: 150,
      price_weekend: 180,
      amenities: ['fireplace', 'wifi', 'bbq', 'mountainView', 'kitchen', 'parking', 'heating'],
      distance_shahdag_km: 12,
      lat: site.geo.lat,
      lng: site.geo.lng,
      images: [],
      panoramas: [
        { path: '/demo/panorama-demo.png', title_az: 'Qonaq otağı (nümunə)', title_ru: 'Гостиная (пример)', aspect: 2, full_circle: true, sort_order: 0 },
      ],
      seasonal: [],
      blocked: [{ start: addDays(t, 3), end: addDays(t, 5) }, { start: addDays(t, 10), end: addDays(t, 13) }],
    },
    {
      id: 'demo-2',
      slug: 'aframe-ev-2',
      type: 'aframe',
      name_az: 'A-frame Ev №2 (cakuzili)',
      name_ru: 'A-frame дом №2 (с джакузи)',
      short_az: 'Cütlüklər üçün açıq hava cakuzisi olan romantik A-frame.',
      short_ru: 'Романтичный A-frame с джакузи под открытым небом для пар.',
      description_az:
        'Cütlüklər üçün nəzərdə tutulmuş romantik A-frame. Terrasdakı isti cakuzidə ulduzlara baxa, kaminin yanında dincələ bilərsiniz.',
      description_ru:
        'Романтичный A-frame для пар. Можно смотреть на звёзды из тёплого джакузи на террасе и отдыхать у камина.',
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      price_weekday: 180,
      price_weekend: 220,
      amenities: ['jacuzzi', 'fireplace', 'wifi', 'terrace', 'mountainView', 'heating'],
      distance_shahdag_km: 12,
      lat: site.geo.lat,
      lng: site.geo.lng,
      images: [],
      seasonal: [],
      blocked: [{ start: addDays(t, 1), end: addDays(t, 3) }],
    },
    {
      id: 'demo-3',
      slug: 'aile-evi',
      type: 'house',
      name_az: 'Ailə evi',
      name_ru: 'Семейный дом',
      short_az: 'Böyük ailə və dost qrupları üçün geniş həyətli ev.',
      short_ru: 'Просторный дом с двором для больших семей и компаний.',
      description_az:
        'Üç yataq otağı, geniş qonaq otağı və böyük həyəti olan ev. Böyük ailələr və dost qrupları üçün idealdır. Uşaqlar üçün həyətdə oyun sahəsi var.',
      description_ru:
        'Дом с тремя спальнями, просторной гостиной и большим двором. Идеален для больших семей и компаний. Во дворе есть детская площадка.',
      capacity: 8,
      bedrooms: 3,
      bathrooms: 2,
      price_weekday: 200,
      price_weekend: 250,
      amenities: ['kitchen', 'bbq', 'parking', 'wifi', 'heating', 'tv', 'terrace'],
      distance_shahdag_km: 15,
      lat: site.geo.lat,
      lng: site.geo.lng,
      images: [],
      seasonal: [],
      blocked: [],
    },
  ]
}

// Bazadakı sətri dilə uyğun sadə obyektə çevirir
function localize(house, lang) {
  const pick = (field) => house[`${field}_${lang}`] || house[`${field}_az`] || ''
  const images = [...(house.images || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ src: imageUrl(img.path), alt: img[`alt_${lang}`] || img.alt_az || pick('name') }))
  return {
    id: house.id,
    slug: house.slug,
    type: house.type,
    name: pick('name'),
    short: pick('short'),
    description: pick('description'),
    capacity: house.capacity,
    bedrooms: house.bedrooms,
    bathrooms: house.bathrooms,
    priceWeekday: Number(house.price_weekday),
    priceWeekend: house.price_weekend == null ? null : Number(house.price_weekend),
    amenities: house.amenities || [],
    distanceShahdag: house.distance_shahdag_km == null ? null : Number(house.distance_shahdag_km),
    lat: house.lat ?? null,
    lng: house.lng ?? null,
    seoTitle: house[`seo_title_${lang}`] || null,
    seoDescription: house[`seo_description_${lang}`] || null,
    images,
    panoramas: [...(house.panoramas || [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({
        src: imageUrl(p.path),
        title: p[`title_${lang}`] || p.title_az || '',
        aspect: Number(p.aspect),
        fullCircle: p.full_circle,
      })),
    videoId: youtubeId(house.video_url),
    seasonal: (house.seasonal || []).map((s) => ({
      name: s.name,
      start: s.start ?? s.start_date,
      end: s.end ?? s.end_date,
      price: Number(s.price),
    })),
    blocked: (house.blocked || []).map((b) => ({ start: b.start ?? b.start_date, end: b.end ?? b.end_date })),
  }
}

const SELECT = `*,
  images:house_images(path, alt_az, alt_ru, sort_order),
  panoramas:house_panoramas(path, title_az, title_ru, aspect, full_circle, sort_order),
  seasonal:seasonal_prices(name, start_date, end_date, price),
  blocked:blocked_dates(start_date, end_date)`

export async function getHouses(lang) {
  const supabase = createPublicClient()
  if (!supabase) return demoHouses().map((h) => localize(h, lang))

  const { data, error } = await supabase
    .from('houses')
    .select(SELECT)
    .eq('is_published', true)
    .gte('blocked.end_date', todayISO())
    .order('sort_order')
  if (error) throw new Error(`Evləri yükləmək alınmadı: ${error.message}`)
  return data.map((h) => localize(h, lang))
}

export async function getHouseBySlug(slug, lang) {
  const supabase = createPublicClient()
  if (!supabase) {
    const demo = demoHouses().find((h) => h.slug === slug)
    return demo ? localize(demo, lang) : null
  }

  const { data, error } = await supabase
    .from('houses')
    .select(SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .gte('blocked.end_date', todayISO())
    .maybeSingle()
  if (error) throw new Error(`Evi yükləmək alınmadı: ${error.message}`)
  return data ? localize(data, lang) : null
}
