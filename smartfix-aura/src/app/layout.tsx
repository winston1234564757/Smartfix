import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Header } from '@/components/shared/Header'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'SmartFix Store',
  description: 'Найкращий магазин вживаної техніки з гарантією.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang='uk'>
        <body className={inter.className}>
          <Providers>
             <Header />
             {/* ДОДАНО pt-28: Відступ, щоб контент не ховався під хедером */}
             <main className='pt-28'>
               {children}
             </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}