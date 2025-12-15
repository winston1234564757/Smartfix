"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

export type CartItem = {
  cartId: string
  id: string
  title: string
  price: number
  basePrice: number
  image: string
  slug: string
  quantity: number
  selectedOptions: { label: string; price: number }[]
  status?: string // Додаємо статус для відображення бейджів
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: any, options?: any[]) => void
  removeItem: (cartId: string) => void
  clearCart: () => void
  removeAll: () => void // Аліас для сумісності з page.tsx
  totalPrice: number
  
  // Logic for Warranty Upsell
  warranty: boolean
  toggleWarranty: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [warranty, setWarranty] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from LocalStorage
  useEffect(() => {
    const savedItems = localStorage.getItem("smartfix-cart-v2")
    const savedWarranty = localStorage.getItem("smartfix-cart-warranty")
    
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)) } catch (e) {}
    }
    if (savedWarranty) {
      setWarranty(savedWarranty === "true")
    }
    setIsLoaded(true)
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("smartfix-cart-v2", JSON.stringify(items))
      localStorage.setItem("smartfix-cart-warranty", String(warranty))
    }
  }, [items, warranty, isLoaded])

  const addItem = (product: any, options: { label: string; price: number }[] = []) => {
    const optionsPrice = options.reduce((acc, opt) => acc + opt.price, 0)
    const finalPrice = Number(product.price) + optionsPrice
    
    const cartId = `${product.id}-${options.map(o => o.label).sort().join("")}`

    setItems((current) => {
      const existing = current.find((i) => i.cartId === cartId)
      if (existing) {
        toast.info("Цей товар вже в кошику")
        return current
      }
      
      toast.success("Додано в кошик!")
      return [...current, { 
          cartId,
          id: product.id,
          title: product.title,
          price: finalPrice,
          basePrice: Number(product.price),
          image: product.images?.[0] || product.image || "", // Handle varying image fields
          slug: product.slug,
          quantity: 1,
          selectedOptions: options,
          status: product.status // Pass status
      }]
    })
  }

  const removeItem = (cartId: string) => {
    setItems((current) => current.filter((i) => i.cartId !== cartId))
    toast.error("Товар видалено")
  }

  const clearCart = () => {
    setItems([])
    setWarranty(false)
    localStorage.removeItem("smartfix-cart-v2")
    localStorage.removeItem("smartfix-cart-warranty")
  }

  const toggleWarranty = () => {
    setWarranty((prev) => !prev)
  }

  const totalPrice = items.reduce((acc, item) => acc + item.price, 0) + (warranty ? 45 : 0)

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      clearCart, 
      removeAll: clearCart, // Alias implementation
      totalPrice,
      warranty,
      toggleWarranty
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}