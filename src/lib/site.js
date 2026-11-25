// Saytın ümumi ayarları. 3-cü mərhələdə bunlar admin paneldəki
// "Ayarlar" bölməsindən (settings cədvəli) idarə olunacaq.
export const site = {
  name: 'A-frame Qusar',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://aframequsar.az').replace(/\/$/, ''),
  // TODO: real nömrələrlə əvəz edin
  phone: '+994 50 000 00 00',
  whatsapp: '994500000000', // yalnız rəqəmlər, + olmadan
  instagram: 'https://instagram.com/',
  address: { az: 'Qusar rayonu, Azərbaycan', ru: 'Кусарский район, Азербайджан' },
  geo: { lat: 41.4275, lng: 48.4302 },
}

export function whatsappLink(text) {
  const base = `https://wa.me/${site.whatsapp}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
