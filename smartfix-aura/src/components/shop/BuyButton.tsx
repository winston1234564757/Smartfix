'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { placeOrder } from '@/app/actions/orders'
import { CheckCircle2 } from 'lucide-react'

interface BuyButtonProps {
  productId: string
  productTitle: string
  price: number
}

export function BuyButton({ productId, productTitle, price }: BuyButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    // Викликаємо Server Action
    const result = await placeOrder(formData)
    
    setLoading(false)

    // ОБРОБКА ПОМИЛОК
    if (result?.error) {
      // Перетворюємо об'єкт помилок у читабельний рядок
      // Наприклад: { phone: ["Too short"] } -> "Phone: Too short"
      const errorMessages = Object.entries(result.error)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join(' | ')
      
      toast.error(`Помилка валідації: ${errorMessages}`)
      return
    }

    if (result?.message) {
      toast.error(result.message)
      return
    }

    // Успіх
    setSuccess(true)
    toast.success('Замовлення прийнято! Менеджер зв`яжеться з вами.')
    
    // Закриваємо модалку через 2 секунди
    setTimeout(() => setOpen(false), 2000)
  }

  if (success) {
    return (
      <Button size='lg' className='w-full text-lg h-14 bg-green-600 hover:bg-green-700' disabled>
        <CheckCircle2 className='mr-2 h-5 w-5' /> Замовлено
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='lg' className='w-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 animate-pulse hover:animate-none'>
          Купити зараз
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Оформлення замовлення</DialogTitle>
          <DialogDescription>
            Ви замовляєте: <span className='font-bold text-slate-900'>{productTitle}</span>
            <br />
            До сплати: <span className='font-bold text-green-600'>${price}</span> (Оплата при отриманні)
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className='space-y-4 mt-2'>
          {/* Приховане поле ID товару - найважливіше! */}
          <input type='hidden' name='productId' value={productId} />
          
          <div className='space-y-2'>
            <Label htmlFor='name'>Ваше Ім'я</Label>
            <Input id='name' name='name' placeholder='Іван' required />
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='phone'>Телефон</Label>
            <Input id='phone' name='phone' placeholder='0991234567' required type='tel' />
            <p className='text-[10px] text-muted-foreground'>Мінімум 10 цифр</p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
             <div className='space-y-2'>
              <Label htmlFor='city'>Місто</Label>
              <Input id='city' name='city' placeholder='Київ' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='branch'>Відділення НП</Label>
              <Input id='branch' name='branch' placeholder='15' required />
            </div>
          </div>

          <Button type='submit' className='w-full text-lg h-12 mt-4' disabled={loading}>
            {loading ? 'Обробка...' : 'Підтвердити замовлення'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}