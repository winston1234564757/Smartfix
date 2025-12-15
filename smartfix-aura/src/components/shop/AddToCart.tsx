"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, Check, Clock, Search, Lock, XCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface AddToCartProps {
  product: any
  options?: any[] 
}

export function AddToCart({ product, options = [] }: AddToCartProps) {
  const cart = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const status = product.status || "AVAILABLE"
  
  // Дозволяємо додавати ТІЛЬКИ Available та Pre-Order
  const isBuyable = status === "AVAILABLE" || status === "PRE_ORDER"

  // Якщо товар не можна купити, ми навіть не показуємо логіку додавання
  if (!isBuyable) {
      return (
        <Button disabled className="w-full h-14 rounded-xl text-lg font-bold bg-slate-100 text-slate-400 cursor-not-allowed">
            <XCircle className="w-5 h-5 mr-2"/> Недоступно
        </Button>
      )
  }

  const handleAdd = () => {
    cart.addItem(product, options)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const isPreOrder = status === "PRE_ORDER"

  return (
    <Button 
        onClick={handleAdd}
        disabled={isAdded}
        className={cn(
            "w-full h-14 rounded-xl text-lg font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95",
            isAdded ? "bg-green-500 hover:bg-green-600 text-white" : 
            isPreOrder ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20" :
            "bg-slate-900 hover:bg-indigo-600 text-white shadow-indigo-500/20"
        )}
    >
        {isAdded ? (
            <><Check className="w-5 h-5 mr-2"/> Додано</>
        ) : isPreOrder ? (
            <><Clock className="w-5 h-5 mr-2"/> Передзамовлення</>
        ) : (
            <><ShoppingCart className="w-5 h-5 mr-2"/> Купити</>
        )}
    </Button>
  )
}