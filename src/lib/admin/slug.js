// "A-frame Ev №1 (cakuzili)" → "a-frame-ev-1-cakuzili"
const MAP = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ğ: 'g', ş: 'sh', ç: 'ch' }

export function slugify(text) {
  return String(text || '')
    .toLocaleLowerCase('az')
    .replace(/[əıöüğşç]/g, (c) => MAP[c])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
