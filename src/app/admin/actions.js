'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { slugify } from '@/lib/admin/slug'
import { AMENITIES } from '@/lib/amenities'
import { parseISODate } from '@/lib/dates'
import { youtubeId } from '@/lib/media'
import { createSessionClient, isSupabaseConfigured } from '@/lib/supabase/server'

// İctimai saytın bütün səhifələri (az və ru) yenilənsin
function refreshSite() {
  revalidatePath('/[lang]', 'layout')
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin', 'layout')
}

const str = (fd, k) => {
  const v = fd.get(k)
  return typeof v === 'string' ? v.trim() : ''
}
const optStr = (fd, k) => str(fd, k) || null
const num = (fd, k) => {
  const v = str(fd, k).replace(',', '.')
  if (v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

// ---------------- Giriş / çıxış ----------------

export async function signIn(_prev, fd) {
  if (!isSupabaseConfigured) return { error: 'Supabase hələ qoşulmayıb (.env.local).' }
  const email = str(fd, 'email')
  const password = String(fd.get('password') || '')
  if (!email || !password) return { error: 'Email və şifrəni yazın.' }

  const supabase = await createSessionClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email və ya şifrə yanlışdır.' }

  const { data: row } = await supabase.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle()
  if (!row) {
    await supabase.auth.signOut()
    return { error: 'Bu hesabın admin icazəsi yoxdur.' }
  }
  redirect('/admin')
}

export async function signOut() {
  const supabase = await createSessionClient()
  if (supabase) await supabase.auth.signOut()
  redirect('/admin/giris')
}

// ---------------- Evlər ----------------

export async function saveHouse(_prev, fd) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id') || null

  const row = {
    name_az: str(fd, 'name_az'),
    name_ru: optStr(fd, 'name_ru'),
    slug: slugify(str(fd, 'slug') || str(fd, 'name_az')),
    type: str(fd, 'type') === 'house' ? 'house' : 'aframe',
    short_az: optStr(fd, 'short_az'),
    short_ru: optStr(fd, 'short_ru'),
    description_az: optStr(fd, 'description_az'),
    description_ru: optStr(fd, 'description_ru'),
    capacity: num(fd, 'capacity'),
    bedrooms: num(fd, 'bedrooms') ?? 1,
    bathrooms: num(fd, 'bathrooms') ?? 1,
    price_weekday: num(fd, 'price_weekday'),
    price_weekend: num(fd, 'price_weekend'),
    distance_shahdag_km: num(fd, 'distance_shahdag_km'),
    lat: num(fd, 'lat'),
    lng: num(fd, 'lng'),
    amenities: fd.getAll('amenities').filter((a) => AMENITIES.includes(a)),
    is_published: fd.get('is_published') === 'on',
    sort_order: num(fd, 'sort_order') ?? 0,
    seo_title_az: optStr(fd, 'seo_title_az'),
    seo_title_ru: optStr(fd, 'seo_title_ru'),
    seo_description_az: optStr(fd, 'seo_description_az'),
    seo_description_ru: optStr(fd, 'seo_description_ru'),
    video_url: optStr(fd, 'video_url'),
  }

  const errors = []
  if (!row.name_az) errors.push('Evin adı (AZ) mütləqdir.')
  if (!row.slug) errors.push('Linki (slug) düzgün yazın: yalnız latın hərfləri, rəqəm və "-".')
  if (!(row.capacity >= 1)) errors.push('Qonaq sayı ən azı 1 olmalıdır.')
  if (!(row.price_weekday >= 0)) errors.push('Həftəiçi qiyməti yazın.')
  if (row.video_url && !youtubeId(row.video_url)) errors.push('Video linki YouTube linki olmalıdır (youtube.com/watch?v=... və ya youtu.be/...).')
  for (const k of ['bedrooms', 'bathrooms', 'price_weekend', 'distance_shahdag_km', 'lat', 'lng', 'sort_order']) {
    if (Number.isNaN(row[k])) errors.push(`"${k}" sahəsində rəqəm olmalıdır.`)
  }
  if (errors.length) return { error: errors.join(' ') }

  const query = id ? supabase.from('houses').update(row).eq('id', id) : supabase.from('houses').insert(row)
  const { data, error } = await query.select('id').single()
  if (error) {
    if (error.code === '23505') return { error: `"${row.slug}" linki artıq başqa evdə istifadə olunur.` }
    return { error: `Yadda saxlamaq alınmadı: ${error.message}` }
  }

  refreshSite()
  if (!id) redirect(`/admin/evler/${data.id}?yeni=1`)
  return { ok: 'Yadda saxlanıldı ✓' }
}

export async function setHousePublished(id, published) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('houses').update({ is_published: published }).eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

export async function deleteHouse(id) {
  const { supabase } = await requireAdmin()
  const [{ data: imgs }, { data: panos }] = await Promise.all([
    supabase.from('house_images').select('path').eq('house_id', id),
    supabase.from('house_panoramas').select('path').eq('house_id', id),
  ])
  const files = [...(imgs || []), ...(panos || [])].map((i) => i.path)
  if (files.length) await supabase.storage.from('house-images').remove(files)
  const { error } = await supabase.from('houses').delete().eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  redirect('/admin/evler')
}

// ---------------- Şəkillər ----------------
// Fayllar brauzerdən birbaşa Supabase Storage-a yüklənir (böyük fayllar serverdən keçməsin),
// sonra burada bazaya yazılır.

export async function addImages(houseId, paths) {
  const { supabase } = await requireAdmin()
  const valid = paths.filter((p) => typeof p === 'string' && p.startsWith(`${houseId}/`))
  if (!valid.length) return { error: 'Şəkil yoxdur.' }
  const { data: last } = await supabase
    .from('house_images')
    .select('sort_order')
    .eq('house_id', houseId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const start = (last?.sort_order ?? -1) + 1
  const { error } = await supabase
    .from('house_images')
    .insert(valid.map((path, i) => ({ house_id: houseId, path, sort_order: start + i })))
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

export async function deleteImage(imageId) {
  const { supabase } = await requireAdmin()
  const { data: img } = await supabase.from('house_images').select('path').eq('id', imageId).single()
  if (img) await supabase.storage.from('house-images').remove([img.path])
  const { error } = await supabase.from('house_images').delete().eq('id', imageId)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

// orderedIds: şəkillərin yeni sırası (birinci = örtük şəkli)
export async function reorderImages(houseId, orderedIds) {
  const { supabase } = await requireAdmin()
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from('house_images').update({ sort_order: i }).eq('id', id).eq('house_id', houseId)),
  )
  const failed = results.find((r) => r.error)
  if (failed) return { error: failed.error.message }
  refreshSite()
  return { ok: true }
}

// ---------------- Mövsüm qiymətləri ----------------

export async function addSeasonalPrice(_prev, fd) {
  const { supabase } = await requireAdmin()
  const row = {
    house_id: str(fd, 'house_id'),
    name: str(fd, 'name'),
    start_date: str(fd, 'start_date'),
    end_date: str(fd, 'end_date'),
    price: num(fd, 'price'),
  }
  if (!row.name) return { error: 'Adını yazın (məs. "Yeni il").' }
  if (!parseISODate(row.start_date) || !parseISODate(row.end_date)) return { error: 'Tarixləri seçin.' }
  if (row.end_date < row.start_date) return { error: 'Son tarix başlanğıcdan əvvəl ola bilməz.' }
  if (!(row.price >= 0)) return { error: 'Qiyməti yazın.' }
  const { error } = await supabase.from('seasonal_prices').insert(row)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: 'Əlavə olundu ✓' }
}

export async function deleteSeasonalPrice(id) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('seasonal_prices').delete().eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

// ---------------- Dolu günlər (təqvim) ----------------

async function findOverlap(supabase, houseId, start, end, ignoreBookingId = null) {
  let q = supabase
    .from('blocked_dates')
    .select('start_date, end_date')
    .eq('house_id', houseId)
    .lt('start_date', end)
    .gt('end_date', start)
    .limit(1)
  if (ignoreBookingId) q = q.or(`booking_id.is.null,booking_id.neq.${ignoreBookingId}`)
  const { data } = await q
  return data?.[0] || null
}

export async function addBlockedDates(_prev, fd) {
  const { supabase } = await requireAdmin()
  const row = {
    house_id: str(fd, 'house_id'),
    start_date: str(fd, 'start_date'),
    end_date: str(fd, 'end_date'),
    note: optStr(fd, 'note'),
  }
  if (!row.house_id) return { error: 'Evi seçin.' }
  if (!parseISODate(row.start_date) || !parseISODate(row.end_date)) return { error: 'Giriş və çıxış tarixlərini seçin.' }
  if (row.end_date <= row.start_date) return { error: 'Çıxış tarixi girişdən sonra olmalıdır.' }
  const overlap = await findOverlap(supabase, row.house_id, row.start_date, row.end_date)
  if (overlap) return { error: `Bu tarixlər artıq dolu olan ${overlap.start_date} – ${overlap.end_date} aralığı ilə üst-üstə düşür.` }
  const { error } = await supabase.from('blocked_dates').insert(row)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: 'Dolu kimi qeyd olundu ✓' }
}

export async function deleteBlockedDates(id) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

// ---------------- Rezervasiya sorğuları ----------------

export async function setBookingStatus(id, status) {
  if (!['new', 'confirmed', 'cancelled'].includes(status)) return { error: 'Yanlış status.' }
  const { supabase } = await requireAdmin()
  const { data: b, error: readErr } = await supabase.from('bookings').select('*').eq('id', id).single()
  if (readErr) return { error: readErr.message }

  if (status === 'confirmed') {
    if (!b.house_id) return { error: 'Bu sorğunun evi silinib, təqvimə əlavə etmək olmur.' }
    const overlap = await findOverlap(supabase, b.house_id, b.check_in, b.check_out, b.id)
    if (overlap) return { error: `Bu ev ${overlap.start_date} – ${overlap.end_date} tarixlərində artıq doludur.` }
  }

  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) return { error: error.message }

  // Təsdiqlənən sorğunun günləri təqvimdə dolu olsun, ləğvdə yenidən boşalsın
  await supabase.from('blocked_dates').delete().eq('booking_id', id)
  if (status === 'confirmed') {
    const { error: blockErr } = await supabase.from('blocked_dates').insert({
      house_id: b.house_id,
      start_date: b.check_in,
      end_date: b.check_out,
      booking_id: b.id,
      note: b.name,
    })
    if (blockErr) return { error: `Status dəyişdi, amma təqvimə yazmaq alınmadı: ${blockErr.message}` }
  }
  refreshSite()
  return { ok: true }
}

export async function saveBookingNote(id, note) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('bookings').update({ admin_note: String(note).slice(0, 1000) || null }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

// ---------------- Panoramalar (360° tur) ----------------

export async function addPanorama(houseId, { path, aspect, fullCircle, title }) {
  const { supabase } = await requireAdmin()
  if (typeof path !== 'string' || !path.startsWith(`${houseId}/pano/`)) return { error: 'Yanlış fayl.' }
  if (!(aspect > 0.5 && aspect < 20)) return { error: 'Şəklin ölçüsü panorama üçün uyğun deyil.' }
  const { data: last } = await supabase
    .from('house_panoramas')
    .select('sort_order')
    .eq('house_id', houseId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const { error } = await supabase.from('house_panoramas').insert({
    house_id: houseId,
    path,
    aspect,
    full_circle: Boolean(fullCircle),
    title_az: String(title || '').slice(0, 60) || null,
    sort_order: (last?.sort_order ?? -1) + 1,
  })
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

export async function updatePanorama(id, fields) {
  const { supabase } = await requireAdmin()
  const row = {}
  if ('title_az' in fields) row.title_az = String(fields.title_az || '').trim().slice(0, 60) || null
  if ('title_ru' in fields) row.title_ru = String(fields.title_ru || '').trim().slice(0, 60) || null
  if ('full_circle' in fields) row.full_circle = Boolean(fields.full_circle)
  const { error } = await supabase.from('house_panoramas').update(row).eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

export async function deletePanorama(id) {
  const { supabase } = await requireAdmin()
  const { data: p } = await supabase.from('house_panoramas').select('path').eq('id', id).single()
  if (p) await supabase.storage.from('house-images').remove([p.path])
  const { error } = await supabase.from('house_panoramas').delete().eq('id', id)
  if (error) return { error: error.message }
  refreshSite()
  return { ok: true }
}

export async function reorderPanoramas(houseId, orderedIds) {
  const { supabase } = await requireAdmin()
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from('house_panoramas').update({ sort_order: i }).eq('id', id).eq('house_id', houseId)),
  )
  const failed = results.find((r) => r.error)
  if (failed) return { error: failed.error.message }
  refreshSite()
  return { ok: true }
}
