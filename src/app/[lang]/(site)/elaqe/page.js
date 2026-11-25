import { alternates } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import { site, whatsappLink } from '@/lib/site'
import { InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/Icons'

export async function generateMetadata({ params }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.contact.title,
    description: dict.contact.metaDescription,
    alternates: alternates(lang, '/elaqe'),
  }
}

export default async function ContactPage({ params }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const c = dict.contact

  const cards = [
    { icon: WhatsAppIcon, title: c.whatsapp, value: site.phone, action: c.write, href: whatsappLink(dict.whatsappMessage), external: true, accent: 'bg-[#25D366] text-white' },
    { icon: PhoneIcon, title: c.phone, value: site.phone, action: c.callNow, href: `tel:${site.phone.replace(/\s/g, '')}`, accent: 'bg-pine-700 text-white' },
    { icon: InstagramIcon, title: c.instagram, value: site.instagram.replace(/^https?:\/\/(www\.)?/, ''), action: c.follow, href: site.instagram, external: true, accent: 'bg-wood-500 text-white' },
  ]

  return (
    <section className="container-page pt-10 sm:pt-14">
      <h1 className="section-title">{c.title}</h1>
      <p className="mt-2 text-muted">{c.subtitle}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map(({ icon: Icon, title, value, action, href, external, accent }) => (
          <a
            key={title}
            href={href}
            {...(external && { target: '_blank', rel: 'noopener' })}
            className="group flex flex-col rounded-card bg-white p-6 ring-1 ring-pine-100 transition-shadow hover:shadow-lg"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${accent}`}>
              <Icon width={22} height={22} />
            </span>
            <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</span>
            <span className="mt-1 break-all text-lg font-bold text-pine-900">{value}</span>
            <span className="mt-4 text-sm font-semibold text-wood-600 group-hover:text-wood-500">{action} →</span>
          </a>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-xl font-bold text-pine-900">{c.howToGet}</h2>
          <p className="mt-3 leading-relaxed text-ink/85">{c.howToGetText}</p>
          <p className="mt-5 inline-flex items-center gap-2 font-medium text-pine-900">
            <PinIcon /> {site.address[lang]}
          </p>
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-card ring-1 ring-pine-100">
          <iframe
            title={c.map}
            src={`https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=11&hl=${lang}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
