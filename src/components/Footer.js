import { site, whatsappLink } from '@/lib/site'
import { InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from './Icons'

export default function Footer({ lang, dict }) {
  return (
    <footer id="elaqe" className="mt-24 bg-pine-900 text-pine-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2">
        <div>
          <p className="text-lg font-bold text-white">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-pine-200">{dict.footer.about}</p>
        </div>
        <div>
          <p className="font-semibold text-white">{dict.footer.contact}</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-white">
                <PhoneIcon /> {site.phone}
              </a>
            </li>
            <li>
              <a href={whatsappLink(dict.whatsappMessage)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white">
                <WhatsAppIcon width={18} height={18} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white">
                <InstagramIcon /> Instagram
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <PinIcon /> {site.address[lang]}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-pine-200">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
      </div>
    </footer>
  )
}
