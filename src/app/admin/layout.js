import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: { default: 'Admin panel', template: '%s · Admin · A-frame Qusar' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }) {
  return (
    <html lang="az" className={inter.variable}>
      <body className="min-h-screen bg-pine-50/60">{children}</body>
    </html>
  )
}
