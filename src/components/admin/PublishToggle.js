'use client'
import { useOptimistic, useTransition } from 'react'
import { setHousePublished } from '@/app/admin/actions'

export default function PublishToggle({ id, published }) {
  const [pending, start] = useTransition()
  const [on, setOn] = useOptimistic(published)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={() => start(async () => { setOn(!on); await setHousePublished(id, !on) })}
      className="flex shrink-0 flex-col items-center gap-1 text-xs font-semibold text-muted"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-pine-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {on ? 'Saytda' : 'Gizli'}
    </button>
  )
}
