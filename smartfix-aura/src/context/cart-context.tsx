'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

export type CartItem = {
  cartId: string // Унікальний ID для кошика (бо один товар може бути з різними опціями)
  id: string     // Real Product ID
  title: string
  price: number
  basePrice: number // Ціна без опцій
  image: string
  slug: string
  quantity: number
  selectedOptions: { label: string; price: number }[]
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: any, options?: any[]) => void
  removeItem: (cartId: string) => void
  clearCart: () => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('smartfix-cart-v2')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) localStorage.setItem('smartfix-cart-v2', JSON.stringify(items))
  }, [items, isLoaded])

  const addItem = (product: any, options: { label: string; price: number }[] = []) => {
    const optionsPrice = options.reduce((acc, opt) => acc + opt.price, 0)
    const finalPrice = product.price + optionsPrice
    
    // Генеруємо унікальний ID для товару в кошику (Product ID + Options)
    const cartId = `${product.id}-${options.map(o => o.label).sort().join('')}`

    setItems((current) => {
      // Якщо такий самий конфіг вже є - не додаємо дубль (для унікальних товарів)
      const existing = current.find((i) => i.cartId === cartId)
      if (existing) {
        toast.info('Цей товар вже в кошику')
        return current
      }
      
      toast.success('Додано в кошик!')
      return [...current, { 
          cartId,
          id: product.id,
          title: product.title,
          price: finalPrice,
          basePrice: product.price,
          image: product.image,
          slug: product.slug,
          quantity: 1,
          selectedOptions: options
      }]
    })
  }

  const removeItem = (cartId: string) => {
    setItems((current) => current.filter((i) => i.cartId !== cartId))
    toast.error('Товар видалено')
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('smartfix-cart-v2')
  }

  const totalPrice = items.reduce((acc, item) => acc + item.price, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}