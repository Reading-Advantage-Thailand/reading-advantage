import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#f5f5f5',
        }}
        className={inter.className}>{children}
      </body>
    </html>
  )
}
