import type { Metadata } from 'next'
import { NextAuthProvider } from './provider'
import { bg } from '@constants/colors';

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

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const session = await getServerSession(authOptions)

//   return (
//     <html lang="en">
//       <body
//         style={{
//           // backgroundColor: '#f5f5f5',
//           margin: 0,
//           padding: 0,
//         }}
//         className={inter.className}>
//         <Provider session={session} >
//           {children}
//         </Provider>
//       </body>
//     </html>
//   )
// }

// export default function RootLayout({
//   children
// }: {
//   children: React.ReactNode
// }): React.ReactNode {
//   const Session = getServerSession(authOptions)

//   return (
//     <html lang="en">
//       <body >
//         {/* <Provider S={S}>
//           <Header /> */}
//         {/* <SessionProvider session={Session} basePath="api/auth">
//           {children}
//         </SessionProvider> */}
//         {/* </Provider> */}
//       </body>
//     </html>
//   )
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}