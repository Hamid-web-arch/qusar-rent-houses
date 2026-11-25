'use client'
import { useActionState } from 'react'
import { signIn } from '@/app/admin/actions'
import { Field, inputCls } from './ui'

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)
  return (
    <form action={action} className="space-y-4 rounded-card bg-white p-6 shadow-sm ring-1 ring-pine-100">
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputCls} />
      </Field>
      <Field label="Şifrə">
        <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </Field>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? 'Yoxlanılır…' : 'Daxil ol'}
      </button>
    </form>
  )
}
