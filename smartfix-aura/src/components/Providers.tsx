'use client'

import { CartProvider } from '@/context/cart-context'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position='top-center' richColors />
    </CartProvider>
  )
}