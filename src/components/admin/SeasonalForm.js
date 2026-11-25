'use client'
import { useActionState } from 'react'
import { addSeasonalPrice } from '@/app/admin/actions'
import { Field, Notice, inputCls } from './ui'

export default function SeasonalForm({ houseId }) {
  const [state, action, pending] = useActionState(addSeasonalPrice, null)
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="house_id" value={houseId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.3fr_1fr_1fr_0.7fr_auto] sm:items-end">
        <Field label="Adı" className="col-span-2 sm:col-span-1">
          <input name="name" placeholder="Yeni il" required className={inputCls} />
        </Field>
        <Field label="Başlanğıc">
          <input name="start_date" type="date" required className={inputCls} />
        </Field>
        <Field label="Son gün (daxil)">
          <input name="end_date" type="date" required className={inputCls} />
        </Field>
        <Field label="Gecəlik, ₼">
          <input name="price" type="number" min="0" required className={inputCls} />
        </Field>
        <button type="submit" disabled={pending} className="btn bg-pine-700 px-4 py-2 text-white hover:bg-pine-900 disabled:opacity-50">
          + Əlavə et
        </button>
      </div>
      <Notice state={state} />
    </form>
  )
}
