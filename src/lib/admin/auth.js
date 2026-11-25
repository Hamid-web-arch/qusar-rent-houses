import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createSessionClient, isSupabaseConfigured } from '@/lib/supabase/server'

// Daxil olmuş istifadəçi admindirsə { supabase, user } qaytarır, əks halda null.
// cache(): bir sorğu ərzində təkrar-təkrar Supabase-ə getməsin.
export const getAdmin = cache(async () => {
  await connection() // admin səhifələri heç vaxt statik qurulmasın, hər sorğuda yoxlansın
  if (!isSupabaseConfigured) return null
  const supabase = await createSessionClient()
  // getClaims: tokeni lokal yoxlayır (Supabase-ə əlavə sorğu getmir), getUser-dən xeyli sürətlidir
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null
  const { data: row } = await supabase.from('admins').select('user_id').eq('user_id', claims.sub).maybeSingle()
  return row ? { supabase, user: { id: claims.sub, email: claims.email } } : null
})

// Hər admin səhifəsində və hər əməliyyatda çağırılır
export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/giris')
  return admin
}
