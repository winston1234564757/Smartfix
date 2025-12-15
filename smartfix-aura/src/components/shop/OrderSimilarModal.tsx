'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCcw, Loader2, Calculator } from 'lucide-react'
import { createProductRequest } from '@/app/actions/request-actions'
import { toast } from 'sonner'

interface Props {
  productTitle: string
  productPrice: number
}

export function OrderSimilarModal({ productTitle, productPrice }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // РОЗРАХУНОК ДІАПАЗОНУ +/- 15%
  const minPrice = Math.round(productPrice * 0.85)
  const maxPrice = Math.round(productPrice * 1.15)
  const budgetRange = `$${minPrice} - $${maxPrice}`

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append('targetProduct', productTitle)
    formData.append('budget', budgetRange)
    
    const res = await createProductRequest(formData)
    
    if (res.error) {
        toast.error(res.error)
    } else {
        toast.success(res.message)
        setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            size='lg' 
            className='w-full h-14 rounded-2xl text-lg shadow-xl bg-slate-800 hover:bg-slate-900 shadow-slate-900/20 transition-all'
        >
            <RefreshCcw className='mr-2 h-5 w-5' />
            Замовити схожий
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Підбір пристрою</DialogTitle>
          <DialogDescription className='pt-2'>
            Ми знайдемо для вас <strong>{productTitle}</strong> або аналог.
          </DialogDescription>
        </DialogHeader>
        
        {/* БЛОК З ЦІНОЮ (БЕЗ ЗАЙВОГО ТЕКСТУ) */}
        <div className='bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3'>
            <div className='bg-indigo-100 p-2.5 rounded-full text-indigo-600'>
                <Calculator className='w-6 h-6' />
            </div>
            <div>
                <p className='text-xs text-indigo-600 font-bold uppercase tracking-wider mb-0.5'>Орієнтовний бюджет</p>
                <p className='text-2xl font-black text-slate-900'>{minPrice} $ — {maxPrice} $</p>
            </div>
        </div>

        <form action={handleSubmit} className='grid gap-4 py-4'>
           <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                 <Label>Бажаний колір</Label>
                 <Input name='desiredColor' placeholder='Не важливо' />
              </div>
              <div className='space-y-2'>
                 <Label>Памʼять</Label>
                 <Select name='desiredStorage'>
                    <SelectTrigger><SelectValue placeholder='Не важливо'/></SelectTrigger>
                    <SelectContent>
                       <SelectItem value='any'>Не важливо</SelectItem>
                       <SelectItem value='64GB'>64GB</SelectItem>
                       <SelectItem value='128GB'>128GB</SelectItem>
                       <SelectItem value='256GB'>256GB</SelectItem>
                       <SelectItem value='512GB'>512GB</SelectItem>
                       <SelectItem value='1TB'>1TB</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>

           <div className='space-y-2'>
              <Label>Стан</Label>
              <Select name='desiredGrade'>
                 <SelectTrigger><SelectValue placeholder='Не важливо'/></SelectTrigger>
                 <SelectContent>
                    <SelectItem value='any'>Не важливо</SelectItem>
                    <SelectItem value='A_PLUS'>A+ (Ідеал)</SelectItem>
                    <SelectItem value='A'>A (Відмінний)</SelectItem>
                    <SelectItem value='B'>B (Гарний)</SelectItem>
                 </SelectContent>
              </Select>
           </div>

           <div className='grid grid-cols-2 gap-4 pt-2 border-t border-slate-100'>
              <div className='space-y-2'>
                 <Label>Ваше імʼя</Label>
                 <Input name='customerName' required />
              </div>
              <div className='space-y-2'>
                 <Label>Телефон</Label>
                 <Input name='phone' placeholder='096...' required />
              </div>
           </div>

           <Button type='submit' className='w-full mt-2 bg-indigo-600 hover:bg-indigo-700 h-12 text-lg rounded-xl font-bold' disabled={loading}>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Відправити запит
           </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}