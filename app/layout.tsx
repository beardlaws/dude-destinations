import type { Metadata } from 'next'
import { Barlow, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Dude Network Tavern Tour | Ohio Tavern Reviews',
  description:
    'Ohio taverns, cold drinks, local legends, and the stories worth stopping for. Follow our growing map of tavern reviews across Ohio.',
  keywords: [
    'Ohio taverns',
    'Ohio bars',
    'tavern tour',
    'dive bars Ohio',
    'Ohio road trip',
    'small town bars',
    'Ohio dive bars',
    'best bars Ohio',
  ],
  openGraph: {
    title: 'The Dude Network Tavern Tour',
    description: 'Ohio taverns, cold drinks, local legends, and the stories worth stopping for.',
    type: 'website',
    url: 'https://www.dudedestinations.com',
    siteName: 'The Dude Network Tavern Tour',
    images: [
      {
        url: 'https://www.dudedestinations.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Dude Network Tavern Tour — Ohio Taverns Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Dude Network Tavern Tour',
    description: 'Ohio taverns, cold drinks, local legends, and the stories worth stopping for.',
    images: ['https://www.dudedestinations.com/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: '-Bppxl1daU1TI1oJjz8XUE4cUCCfnNNcclfE9rbRhgA',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${barlow.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
