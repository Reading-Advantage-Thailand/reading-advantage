import type { Metadata } from 'next'
import { NextAuthProvider } from './provider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth'
import { bg } from '@constants/colors'

export const metadata: Metadata = {
  title: 'Reading Advantage',
  description: 'Extensive reading app incorporating AI.',
  icons: {
    icon: [
      '/favicon.ico?v=4',
    ],
    apple: [
      '/apple-touch-icon.png?v=4'
    ],
    shortcut: [
      '/apple-touch-icon.png',
    ],
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body
        style={{
          // backgroundColor: '#f5f5f5',
          margin: 0,
          padding: 0,
          backgroundColor: bg,
        }}
      >
        <NextAuthProvider session={session}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}