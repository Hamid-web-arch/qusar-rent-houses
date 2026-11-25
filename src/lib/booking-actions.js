'use server'
import { revalidatePath } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import { validRange } from '@/lib/dates'
import { isRangeAvailable } from '@/lib/pricing'

// Saytdakı "Sorğu göndər" forması. Xəta kodları qaytarır, mətnlər lüğətdən göstərilir.
export async function createBookingRequest(input) {
  const supabase = createPublicClient()
  if (!supabase) return { error: 'unavailable' }

  // Botlar üçün tələ: insan bu gizli sahəni görmür və doldurmur
  if (input.website) return { ok: true }

  const name = String(input.name || '').trim().slice(0, 100)
  const phone = String(input.phone || '').trim().slice(0, 30)
  const message = String(input.message || '').trim().slice(0, 1000) || null
  const guests = Number(input.guests)
  const lang = input.lang === 'ru' ? 'ru' : 'az'
  const { houseId, checkIn, checkOut } = input

  if (name.length < 2) return { error: 'name' }
  if (phone.replace(/\D/g, '').length < 7) return { error: 'phone' }
  if (!validRange(checkIn, checkOut)) return { error: 'dates' }

  const { data: house } = await supabase
    .from('houses')
    .select('id, capacity, blocked:blocked_dates(start_date, end_date)')
    .eq('id', houseId)
    .eq('is_published', true)
    .maybeSingle()
  if (!house) return { error: 'unavailable' }
  if (!(guests >= 1 && guests <= house.capacity)) return { error: 'guests' }
  const blocked = house.blocked.map((b) => ({ start: b.start_date, end: b.end_date }))
  if (!isRangeAvailable(checkIn, checkOut, blocked)) return { error: 'taken' }

  const { error } = await supabase.from('bookings').insert({
    house_id: house.id,
    name,
    phone,
    check_in: checkIn,
    check_out: checkOut,
    guests,
    message,
    lang,
  })
  if (error) return { error: 'unavailable' }

  revalidatePath('/admin', 'layout')
  return { ok: true }
}
