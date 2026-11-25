import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient as createPlainClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = Boolean(url && anonKey)

// İctimai səhifələr üçün: cookie oxumur, ona görə səhifələr statik/keşlənə bilir.
export function createPublicClient() {
  if (!isSupabaseConfigured) return null
  return createPlainClient(url, anonKey, { auth: { persistSession: false } })
}

// Admin panel üçün: istifadəçinin sessiyasını cookie-dən oxuyur.
export async function createSessionClient() {
  if (!isSupabaseConfigured) return null
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component-dən çağırılanda cookie yazmaq olmur; sessiya proxy-də yenilənəcək.
        }
      },
    },
  })
}

export function imageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path
  return `${url}/storage/v1/object/public/house-images/${path}`
}
