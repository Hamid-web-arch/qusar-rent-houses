'use client'
import { startTransition, useActionState, useState } from 'react'
import { saveHouse } from '@/app/admin/actions'
import { AMENITIES } from '@/lib/amenities'
import { slugify } from '@/lib/admin/slug'
import az from '@/dictionaries/az.json'
import { Card, Field, Notice, inputCls } from './ui'

// Evi yaratmaq və redaktə etmək üçün forma. house = null → yeni ev
export default function HouseForm({ house }) {
  const [state, action, pending] = useActionState(saveHouse, null)
  const [name, setName] = useState(house?.name_az || '')
  const [slug, setSlug] = useState(house?.slug || '')
  const [slugTouched, setSlugTouched] = useState(Boolean(house))
  const shownSlug = slugTouched ? slug : slugify(name)
  const v = (k) => house?.[k] ?? ''

  return (
    <form
      // action={...} əvəzinə: React forma göndəriləndən sonra sahələri sıfırlamasın (xəta olsa yazılanlar itməsin)
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
      className="space-y-6"
    >
      {house && <input type="hidden" name="id" value={house.id} />}

      <Card title="Əsas məlumat">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Adı (AZ) *">
            <input name="name_az" required value={name} onChange={(e) => setName(e.target.value)} placeholder="A-frame Ev №1" className={inputCls} />
          </Field>
          <Field label="Adı (RU)">
            <input name="name_ru" defaultValue={v('name_ru')} placeholder="A-frame дом №1" className={inputCls} />
          </Field>
          <Field label="Növ">
            <select name="type" defaultValue={v('type') || 'aframe'} className={inputCls}>
              <option value="aframe">A-frame ev</option>
              <option value="house">Ev</option>
            </select>
          </Field>
          <Field label="Saytdakı linki" hint={`Ünvan: /evler/${shownSlug || '...'}`}>
            <input
              name="slug"
              value={shownSlug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
              onBlur={(e) => setSlug(slugify(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      <Card title="Təsvir">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qısa təsvir (AZ)" hint="Kartda görünür, 1 cümlə">
            <input name="short_az" defaultValue={v('short_az')} maxLength={160} className={inputCls} />
          </Field>
          <Field label="Qısa təsvir (RU)">
            <input name="short_ru" defaultValue={v('short_ru')} maxLength={160} className={inputCls} />
          </Field>
          <Field label="Ətraflı təsvir (AZ)" hint="Abzasları boş sətirlə ayırın">
            <textarea name="description_az" defaultValue={v('description_az')} rows={6} className={inputCls} />
          </Field>
          <Field label="Ətraflı təsvir (RU)">
            <textarea name="description_ru" defaultValue={v('description_ru')} rows={6} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Tutum və qiymət">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Qonaq sayı (maks.) *">
            <input name="capacity" type="number" min="1" required defaultValue={v('capacity') || 2} className={inputCls} />
          </Field>
          <Field label="Yataq otağı">
            <input name="bedrooms" type="number" min="0" defaultValue={v('bedrooms') || 1} className={inputCls} />
          </Field>
          <Field label="Hamam otağı">
            <input name="bathrooms" type="number" min="0" defaultValue={v('bathrooms') || 1} className={inputCls} />
          </Field>
          <Field label="Həftəiçi qiymət, ₼ *" hint="B.e – C.a gecələri">
            <input name="price_weekday" type="number" min="0" step="1" required defaultValue={v('price_weekday')} className={inputCls} />
          </Field>
          <Field label="Həftəsonu qiymət, ₼" hint="Cümə və Şənbə gecələri">
            <input name="price_weekend" type="number" min="0" step="1" defaultValue={v('price_weekend')} className={inputCls} />
          </Field>
          <Field label="Şahdağa məsafə, km">
            <input name="distance_shahdag_km" type="number" min="0" step="0.1" defaultValue={v('distance_shahdag_km')} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="İmkanlar">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-pine-100 has-[:checked]:bg-pine-50 has-[:checked]:ring-pine-500">
              <input type="checkbox" name="amenities" value={a} defaultChecked={house?.amenities?.includes(a)} className="accent-pine-700" />
              {az.amenities[a]}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Video tur">
        <Field
          label="YouTube linki"
          hint="Telefonla evi gəzərək video çəkin, YouTube-a yükləyin (“Siyahıda olmayan / Unlisted” da olar), linkini bura yapışdırın."
        >
          <input name="video_url" type="url" defaultValue={v('video_url')} placeholder="https://youtu.be/..." className={inputCls} />
        </Field>
      </Card>

      <Card title="Xəritə">
        <p className="mb-4 text-sm text-muted">
          Google Maps-də evin yerinə sağ klik edin, çıxan rəqəmlərə (məs. <code>41.4275, 48.4302</code>) klik edib kopyalayın, aşağıya yapışdırın.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Enlik (latitude)">
            <input
              name="lat"
              inputMode="decimal"
              defaultValue={v('lat')}
              onPaste={(e) => {
                // "41.4275, 48.4302" yapışdırılanda ikisini də doldur
                const m = e.clipboardData.getData('text').match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/)
                if (m) {
                  e.preventDefault()
                  e.currentTarget.value = m[1]
                  e.currentTarget.form.elements.lng.value = m[2]
                }
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Uzunluq (longitude)">
            <input name="lng" inputMode="decimal" defaultValue={v('lng')} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Google üçün (SEO)">
        <p className="mb-4 text-sm text-muted">Boş qalsa, avtomatik yaradılır. Doldursanız, Google-da axtarış nəticəsində bu mətn görünəcək.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Başlıq (AZ)" hint="50–60 simvol">
            <input name="seo_title_az" defaultValue={v('seo_title_az')} maxLength={70} placeholder="Qusarda kaminli A-frame ev, günlük kirayə" className={inputCls} />
          </Field>
          <Field label="Başlıq (RU)">
            <input name="seo_title_ru" defaultValue={v('seo_title_ru')} maxLength={70} className={inputCls} />
          </Field>
          <Field label="Təsvir (AZ)" hint="120–160 simvol">
            <textarea name="seo_description_az" defaultValue={v('seo_description_az')} maxLength={170} rows={3} className={inputCls} />
          </Field>
          <Field label="Təsvir (RU)">
            <textarea name="seo_description_ru" defaultValue={v('seo_description_ru')} maxLength={170} rows={3} className={inputCls} />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-pine-100 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-pine-900">
          <input type="checkbox" name="is_published" defaultChecked={house?.is_published} className="h-4 w-4 accent-pine-700" />
          Saytda göstər
        </label>
        <Field label="Sıra" className="w-20">
          <input name="sort_order" type="number" defaultValue={v('sort_order') || 0} className={`${inputCls} py-1`} />
        </Field>
        <div className="ml-auto flex items-center gap-3">
          <Notice state={state} />
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? 'Saxlanılır…' : house ? 'Yadda saxla' : 'Evi yarat'}
          </button>
        </div>
      </div>
    </form>
  )
}
