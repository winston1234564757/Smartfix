'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTradeInRequest } from '@/app/actions/trade-in'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { FileUpload } from '@/components/shared/FileUpload'

export function TradeInForm({ suggestedProducts }: { suggestedProducts: any[] }) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  async function handleSubmit(formData: FormData) {
    if (images.length < 3) {
        toast.error('Додайте мінімум 3 фото')
        return
    }

    setLoading(true)
    // Додаємо фото в форму
    images.forEach(img => formData.append('images', img))

    const res = await createTradeInRequest(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(res?.message || 'Заявку прийнято!')
      // Очистка (спрощена)
      setImages([])
    }
    setLoading(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form action={handleSubmit} className='space-y-6'>
       
       <div className='space-y-4'>
          <h3 className='font-bold text-lg'>Оцінити мій пристрій</h3>
          <p className='text-sm text-slate-500'>Заповніть форму для попереднього розрахунку</p>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
             <div className='space-y-2'>
                <Label>Модель</Label>
                <Input name='model' placeholder='iPhone 13 Pro...' required />
             </div>
             <div className='space-y-2'>
                <Label>Памʼять</Label>
                <Select name='storage'>
                   <SelectTrigger><SelectValue placeholder='Оберіть...' /></SelectTrigger>
                   <SelectContent>
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
             <Label>Стан пристрою</Label>
             <Textarea name='condition' placeholder='Опишіть дефекти, стан екрану та батареї...' />
          </div>

          {/* ФОТО ЗАВАНТАЖУВАЧ */}
          <div className='space-y-2'>
             <Label>Фото пристрою (мін. 3, макс. 9)</Label>
             <div className='p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50'>
                <div className='grid grid-cols-3 gap-2 mb-4'>
                    {images.map((img, i) => (
                        <div key={i} className='relative aspect-square rounded-lg overflow-hidden border border-slate-200 group'>
                            <img src={img} className='w-full h-full object-cover' />
                            <button type='button' onClick={() => removeImage(i)} className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100'>
                                <X className='w-3 h-3' />
                            </button>
                        </div>
                    ))}
                    {images.length < 9 && (
                        <div className='aspect-square flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200'>
                            <FileUpload 
                                endpoint='imageUploader'
                                onChange={(url) => { if(url) setImages(prev => [...prev, url]) }}
                            />
                            <span className='text-[10px] text-slate-400 mt-1'>+ Фото</span>
                        </div>
                    )}
                </div>
                <p className='text-xs text-slate-400 text-center'>Завантажте фото екрану, задньої кришки та граней.</p>
             </div>
          </div>
       </div>

       <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100'>
          <div className='space-y-2'>
             <Label>Ваше Імʼя</Label>
             <Input name='name' placeholder='Віктор' required />
          </div>
          <div className='space-y-2'>
             <Label>Телефон</Label>
             <Input name='phone' placeholder='096...' required />
          </div>
       </div>

       <Button type='submit' className='w-full h-12 bg-slate-900 text-white hover:bg-slate-800 text-lg rounded-xl' disabled={loading}>
          {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Дізнатись ціну
       </Button>
    </form>
  )
}