'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { ShoppingCart, Clock, RefreshCcw } from 'lucide-react'

interface AddToCartProps {
  product: {
    id: string
    title: string
    price: number
    image: string
    slug: string
  }
  isPreOrder?: boolean
  isSold?: boolean
}

export function AddToCart({ product, isPreOrder, isSold }: AddToCartProps) {
  const { addItem } = useCart()

  return (
    <Button 
      size='lg' 
      className={`w-full h-14 rounded-2xl text-lg shadow-xl transition-all ${
          isSold
            ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20'
            : isPreOrder 
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
      }`}
      onClick={() => addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        slug: product.slug,
      })}
    >
      {isSold ? (
         <>
            <RefreshCcw className='mr-2 h-5 w-5' />
            Замовити схожий за ${product.price}
         </>
      ) : isPreOrder ? (
         <>
            <Clock className='mr-2 h-5 w-5' />
            Передзамовити за ${product.price}
         </>
      ) : (
         <>
            <ShoppingCart className='mr-2 h-5 w-5' />
            Купити за ${product.price}
         </>
      )}
    </Button>
  )
}