'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPromoBanner } from '@/app/actions/promo'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { FileUpload } from '@/components/shared/FileUpload'

export function BannerForm() {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState('')

  async function handleSubmit(formData: FormData) {
    if (!image) {
        toast.error('Завантажте фото')
        return
    }
    setLoading(true)
    formData.append('image', image)
    
    const res = await createPromoBanner(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Банер додано!')
      setImage('') 
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className='space-y-4'>
       <div className='space-y-2'>
          <Label>Заголовок</Label>
          <Input name='title' placeholder='Знижки на Apple' required />
       </div>

       <div className='space-y-2'>
          <Label>Підзаголовок</Label>
          <Input name='subtitle' placeholder='Текст на банері...' />
       </div>

       <div className='space-y-2'>
          <Label>Посилання</Label>
          <Input name='link' placeholder='/catalog' required />
       </div>

       <div className='space-y-2'>
          <Label>Розмір / Тип</Label>
          <Select name='size' defaultValue='STANDARD'>
             <SelectTrigger><SelectValue /></SelectTrigger>
             <SelectContent>
                <SelectItem value='HERO'>⭐ HERO (Головний зліва)</SelectItem>
                <SelectItem value='STANDARD'>Standard (Квадрат 1x1)</SelectItem>
                <SelectItem value='WIDE'>Wide (Широкий 2x1)</SelectItem>
                <SelectItem value='TALL'>Tall (Високий 1x2)</SelectItem>
                <SelectItem value='BIG'>Big (Великий 2x2)</SelectItem>
             </SelectContent>
          </Select>
          <p className='text-[10px] text-slate-500'>HERO - це великий банер зліва на головній. Він має бути тільки один.</p>
       </div>

       <div className='space-y-2'>
          <Label>Зображення</Label>
          <div className='border-2 border-dashed border-slate-200 rounded-xl p-2 bg-slate-50'>
             {image ? (
                <div className='relative aspect-video rounded-lg overflow-hidden'>
                   <img src={image} className='w-full h-full object-cover' />
                   <Button type='button' variant='destructive' size='sm' className='absolute top-2 right-2' onClick={() => setImage('')}>Видалити</Button>
                </div>
             ) : (
                <div className='py-4'>
                   <FileUpload endpoint='imageUploader' onChange={(url) => url && setImage(url)} />
                </div>
             )}
          </div>
       </div>

       <Button type='submit' className='w-full bg-slate-900' disabled={loading}>
          {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Зберегти банер
       </Button>
    </form>
  )
}