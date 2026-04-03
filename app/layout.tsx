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
  title: 'The Dude Network Tavern Tour | Ohio Taverns, Cold Drinks, Local Legends',
  description:
    'Ohio taverns, cold drinks, local legends, and the stories worth stopping for. Follow our growing map of tavern reviews across Ohio.',
  generator: 'v0.app',
  keywords: [
    'Ohio taverns',
    'Ohio bars',
    'tavern tour',
    'dive bars Ohio',
    'Ohio road trip',
    'small town bars',
  ],
  openGraph: {
    title: 'The Dude Network Tavern Tour',
    description: 'Ohio taverns, cold drinks, local legends, and the stories worth stopping for.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
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
