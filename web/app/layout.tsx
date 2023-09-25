import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth'
import PageProvider from '../components/helpers/page-provider';
import { EmotionCache } from "@emotion/react";
import ThemeSwitcher from '@components/theme/theme-switcher'
import { NextAuthProvider } from '@components/helpers/auth-provider';

export const metadata: Metadata = {
  title: 'Reading Advantage',
  description: 'Extensive reading app incorporating AI.',
  keywords: ['extensive reading', 'language learning', 'ai', 'artificial intelligence', 'reading', 'reading advantage', 'readingadvantage', 'readingadvantage.com'],
  authors: [
    {
      name: 'Reading Advantage',
      url: 'https://app.reading-advantage.com',
    },
  ],
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png?v=4'],
    shortcut: ['/apple-touch-icon.png'],
  },
  manifest: '/site.webmanifest',
}

interface RootLayoutProps {
  children: React.ReactNode
  emotionCache?: EmotionCache
}

export default async function RootLayout({ children, emotionCache }: RootLayoutProps) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAuthProvider session={session}>
          {/* <PageProvider emotionCache={emotionCache}> */}
          {/* <ThemeSwitcher /> */}
          {children}
          {/* </PageProvider> */}
        </NextAuthProvider>
      </body>
    </html>
  )
}
