import { addDays, nightsBetween, weekdayMon0 } from './dates'

// Gecə dolu sayılır, əgər bir rezervasiya həmin gün girişdən sonra, çıxışdan əvvəl düşürsə.
// blocked: [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }] (end = çıxış günü, o gün artıq boşdur)
export function isNightBlocked(iso, blocked = []) {
  return blocked.some((b) => b.start <= iso && iso < b.end)
}

export function isRangeAvailable(checkIn, checkOut, blocked = []) {
  return !blocked.some((b) => b.start < checkOut && b.end > checkIn)
}

// Cümə və Şənbə gecələri həftəsonu qiyməti ilə
export function isWeekendNight(iso) {
  const wd = weekdayMon0(iso)
  return wd === 4 || wd === 5
}

export function nightPrice(house, iso) {
  const season = (house.seasonal || []).find((s) => s.start <= iso && iso <= s.end)
  if (season) return { price: season.price, kind: 'season', label: season.name }
  if (isWeekendNight(iso) && house.priceWeekend != null) return { price: house.priceWeekend, kind: 'weekend' }
  return { price: house.priceWeekday, kind: 'weekday' }
}

// Qalma müddətinin qiyməti: gecə növlərinə görə qruplaşdırılmış
export function calcStay(house, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0) return null
  const groups = new Map()
  let total = 0
  for (let i = 0; i < nights; i++) {
    const day = addDays(checkIn, i)
    const { price, kind, label } = nightPrice(house, day)
    total += price
    const key = `${kind}:${label || ''}:${price}`
    const g = groups.get(key) || { kind, label, price, count: 0 }
    g.count++
    groups.set(key, g)
  }
  return { nights, total, lines: [...groups.values()] }
}
