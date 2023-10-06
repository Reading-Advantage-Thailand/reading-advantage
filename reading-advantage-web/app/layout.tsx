import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css';
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'


const locales = ['en', 'th'];
const cabinSketch = localFont({
  src: '../assets/fonts/CabinSketch-Regular.ttf',
  variable: '--font-cabin-sketch',
  weight: '400',
})

const cabinSketchBold = localFont({
  src: '../assets/fonts/CabinSketch-Bold.ttf',
  variable: '--font-cabin-sketch-bold',
  weight: '700',
})

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Reading Advantage',
    template: '%s | ' + 'Reading Advantage',
  },
  description: 'Reading Advantage',
  keywords: [
    'reading advantage',
    'reading',
    'advantage',
    'reading advantage app',
    'reading advantage web',
  ],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  // openGraph: {
  //   type: "website",
  //   locale: "en_US",
  //   url: siteConfig.url,
  //   title: siteConfig.name,
  //   description: siteConfig.description,
  //   siteName: siteConfig.name,
  // },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `https://app.reading-advantage.com/site.webmanifest`,

}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode,
  params: { locale: string },
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          cabinSketch.variable,
          fontSans.variable,
          cabinSketchBold.variable,
        )}
      >
        {children}
      </body>
    </html>
  )
}
