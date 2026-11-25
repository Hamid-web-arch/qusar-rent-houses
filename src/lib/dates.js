// Tarixlər "YYYY-MM-DD" sətri kimi saxlanılır. Hesablamalar UTC-də aparılır ki,
// saat qurşağı fərqləri günü bir gün irəli-geri sürüşdürməsin.

export function parseISODate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCMonth() === m - 1 ? date : null
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso, n) {
  const d = parseISODate(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toISODate(d)
}

export function nightsBetween(checkIn, checkOut) {
  const a = parseISODate(checkIn)
  const b = parseISODate(checkOut)
  if (!a || !b) return 0
  return Math.round((b - a) / 86400000)
}

// Bu gün (istifadəçinin yerli vaxtı ilə)
export function todayISO() {
  const now = new Date()
  return toISODate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

// 0 = Bazar ertəsi ... 6 = Bazar
export function weekdayMon0(iso) {
  return (parseISODate(iso).getUTCDay() + 6) % 7
}

// "12 dek" kimi qısa yazılış (ay adları lüğətdən gəlir ki, server/brauzer fərqi olmasın)
export function formatShort(iso, monthsShort) {
  const d = parseISODate(iso)
  if (!d) return ''
  return `${d.getUTCDate()} ${monthsShort[d.getUTCMonth()]}`
}

// Tarix aralığı düzgündürmü: giriş bu gündən əvvəl deyil və çıxış girişdən sonradır
export function validRange(checkIn, checkOut, today = todayISO()) {
  return Boolean(parseISODate(checkIn) && parseISODate(checkOut) && checkIn >= today && checkOut > checkIn)
}
