import { whatsappLink } from '@/lib/site'
import { WhatsAppIcon } from './Icons'

// Mobil telefonda həmişə görünən WhatsApp düyməsi: ən çox müraciət buradan gəlir
export default function WhatsAppFloat({ message }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener"
      aria-label="WhatsApp"
      data-wa-float
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <WhatsAppIcon width={28} height={28} />
    </a>
  )
}
