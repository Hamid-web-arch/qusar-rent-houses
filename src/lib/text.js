// "{n} ev tapıldı" kimi şablonlarda dəyişənləri yerinə qoyur
export function fill(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

// Rus dilində rəqəmdən sonra sözün forması: 1 гость, 2 гостя, 5 гостей.
// forms = [tək, 2-4, 5+]. Azərbaycan dilində üçü də eynidir.
export function plural(n, forms) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1]
  return forms[2]
}
