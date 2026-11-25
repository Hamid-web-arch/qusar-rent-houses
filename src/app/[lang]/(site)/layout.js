import { getDictionary } from '@/lib/dictionaries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

// Saytın ictimai hissəsi: başlıq, alt hissə və WhatsApp düyməsi.
// 404 sərhədi (not-found.js) bu səviyyədədir ki, kök layout-dan aşağıda olsun.
export default async function SiteLayout({ children, params }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dict={dict} />
      <WhatsAppFloat message={dict.whatsappMessage} />
    </>
  )
}
