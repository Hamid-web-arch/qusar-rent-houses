import Image from 'next/image'
import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import { fill, plural } from '@/lib/text'
import AFrameArt from './AFrameArt'
import KeepWords from './KeepWords'
import { BedIcon, MountainIcon, UsersIcon } from './Icons'

// t = dict.house. query: seçilmiş tarixlər ev səhifəsinə ötürülsün deyə ("?giris=...").
// stay: { nights, total } tarix seçiləndə kartda cəmi qiyməti göstərmək üçün.
export default function HouseCard({ house, lang, t, query = '', stay = null, priority = false }) {
  const cover = house.images[0]
  const href = localePath(lang, `/evler/${house.slug}`) + query
  return (
    <article className="group flex flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-pine-100 transition-shadow hover:shadow-lg">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden="true">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <AFrameArt className="h-full w-full" variant={house.type === 'aframe' ? 'night' : 'day'} />
        )}
        <span className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-pine-900">{t.type[house.type]}</span>
          {house.panoramas?.length > 0 && (
            <span className="rounded-full bg-wood-500 px-2.5 py-1 text-xs font-bold text-white">360°</span>
          )}
          {house.videoId && <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">▶</span>}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-pine-900">
          <Link href={href} className="hover:text-wood-600"><KeepWords>{house.name}</KeepWords></Link>
        </h3>
        {house.short && <p className="mt-1.5 line-clamp-2 text-sm text-muted">{house.short}</p>}

        <ul className="mb-5 mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-pine-700">
          <li className="inline-flex items-center gap-1.5"><UsersIcon /> {house.capacity} {plural(house.capacity, t.guestsForms)}</li>
          <li className="inline-flex items-center gap-1.5"><BedIcon /> {house.bedrooms} {plural(house.bedrooms, t.bedroomsForms)}</li>
          {house.distanceShahdag != null && (
            <li className="inline-flex items-center gap-1.5"><MountainIcon /> {house.distanceShahdag} {t.toShahdag}</li>
          )}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-pine-100 pt-4">
          <div>
            <p>
              {t.from && <span className="text-sm text-muted">{t.from} </span>}
              <span className="text-2xl font-bold text-wood-600">{house.priceWeekday} ₼</span>
              <span className="text-sm text-muted"> / {t.perNight}</span>
            </p>
            {stay && (
              <p className="mt-0.5 text-sm font-semibold text-pine-700">
                {fill(t.totalFor, { n: stay.nights, nights: plural(stay.nights, t.nightsForms), total: stay.total })}
              </p>
            )}
          </div>
          <Link href={href} className="shrink-0 text-sm font-semibold text-pine-700 hover:text-wood-600">
            {t.details} →
          </Link>
        </div>
      </div>
    </article>
  )
}
