import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'

import { siteConfig } from '@/configs/site-config'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Analytics } from '@/components/analytics'
import { Toaster } from '@/components/ui/toaster'
import { TailwindIndicator } from '@/components/tailwind-indicator'

import { notFound } from 'next/navigation';
import { NextIntlProvider } from '@/components/providers/nextintl-provider'
import { NextAuthSessionProvider } from '@/components/providers/nextauth-session-provider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'

const locales = ['en', 'th'];
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

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode,
  params: { locale: string },
}) {
  /**
 * Next.js 13 internationalization library
 * @see https://next-intl-docs.vercel.app
 */
  let messages: any;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.log("❌ Internationalization", error);
  }

  /**
   * _For debug purposes_ use this to check the session object:
   * @example ```<pre>{JSON.stringify(session, null, 2)}</pre>```
   * @see https://next-auth.js.org/configuration/nextjs#in-app-router
   */
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();

  // const session = await getServerSession(authOptions);

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
        <NextIntlProvider locale={locale} messages={messages}>
          {/* <NextAuthSessionProvider session={session}> */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            {/* <Analytics /> */}
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
          {/* </NextAuthSessionProvider> */}
        </NextIntlProvider>
      </body>
    </html>
  )
}
