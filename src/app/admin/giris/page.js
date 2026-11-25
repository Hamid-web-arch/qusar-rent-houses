import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/admin/auth'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import LoginForm from '@/components/admin/LoginForm'
import SetupNotice from '@/components/admin/SetupNotice'

export const metadata = { title: 'Giriş' }

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin')
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-pine-900">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <path d="M16 3 3 29h26z" fill="#b5733a" />
            <path d="M16 15 11 25h10z" fill="#f8f4ee" />
          </svg>
          <span className="text-xl font-bold">A-frame Qusar · Admin</span>
        </div>
        {isSupabaseConfigured ? <LoginForm /> : <SetupNotice />}
      </div>
    </main>
  )
}
