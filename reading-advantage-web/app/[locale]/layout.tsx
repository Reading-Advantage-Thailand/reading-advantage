import { ReactElement } from 'react'
import '@/styles/globals.css'
import { siteConfig } from '@/configs/site-config'
import { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
import localFont from 'next/font/local'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { TailwindIndicator } from '@/components/helpers/tailwind-indicator'

const cabinSketch = localFont({
  src: '../../assets/fonts/CabinSketch-Regular.ttf',
  variable: '--font-cabin-sketch',
  weight: '400',
})

const cabinSketchBold = localFont({
  src: '../../assets/fonts/CabinSketch-Bold.ttf',
  variable: '--font-cabin-sketch-bold',
  weight: '700',
})

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: '%s | ' + siteConfig.name,
  },
  description: siteConfig.description,
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
  manifest: `${siteConfig.url}/site.webmanifest`,
}
export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          cabinSketch.variable,
          fontSans.variable,
          cabinSketchBold.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}

