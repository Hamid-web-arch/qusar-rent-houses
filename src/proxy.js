import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { defaultLocale, locales } from '@/lib/i18n'

export async function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return refreshAdminSession(request)

  // Azərbaycan dili prefikssiz işləyir:
  //   /evler      → daxildə /az/evler-ə rewrite olunur
  //   /az/evler   → /evler-ə 301 redirect (təkrar kontent olmasın deyə)
  //   /ru/evler   → olduğu kimi qalır
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/'
    return NextResponse.redirect(url, 301)
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) return

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

// Supabase giriş sessiyasının vaxtı keçməsin deyə hər admin sorğusunda yenilənir.
// Əsl icazə yoxlaması burada deyil, hər səhifədə və əməliyyatda (requireAdmin) aparılır.
async function refreshAdminSession(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  let response = NextResponse.next({ request })
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  await supabase.auth.getClaims()
  return response
}

export const config = {
  // api, Next.js daxili faylları və nöqtəli fayllar (şəkil, robots.txt, sitemap.xml) xaric
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
