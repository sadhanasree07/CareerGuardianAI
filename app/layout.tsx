import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LanguageProvider } from "@/src/context/LanguageContext";
import WelcomeLoader from "@/components/WelcomeLoader";
import PWARegister from "@/components/PWARegister";
import MobileBottomNav from "@/components/MobileBottomNav";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CareerGuardian AI — Protect Your Career. Build Your Future.',
  description:
    'An intelligent career platform that protects students and professionals from recruitment scams while generating a personalized Career DNA, AI Roadmap, and real-time career opportunities.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased bg-background">
        <LanguageProvider>
          <WelcomeLoader />
          <PWARegister />
          <SiteHeader />

          <main>
            {children}
          </main>

          <SiteFooter />
          <MobileBottomNav />

          {process.env.NODE_ENV === "production" && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
