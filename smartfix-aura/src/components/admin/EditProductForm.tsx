'use client'

import { updateProduct } from '@/app/actions/update-product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'

// Тип даних, який приходить з бази
interface ProductData {
  id: string
  title: string
  description: string
  brand: string
  model: string
  color: string
  storage: string
  grade: string
  price: any // Decimal з бази приходить як об'єкт або рядок, тому any для простоти тут
  purchaseCost: any
  repairCost: any
  defects: string[]
  images: string[]
}

export function EditProductForm({ product }: { product: ProductData }) {
  const [loading, setLoading] = useState(false)

  // Обгортка для updateProduct, щоб передати ID
  const updateWithId = updateProduct.bind(null, product.id)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateWithId(formData)
    // Якщо result повертається, значить була помилка (бо успіх робить redirect)
    setLoading(false)

    if (result?.error) {
      toast.error('Перевірте поля')
    } else if (result?.message) {
      toast.error(result.message)
    }
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        <form action={handleSubmit} className='space-y-6'>
          
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Бренд</Label>
              <Input name='brand' defaultValue={product.brand} required />
            </div>
            <div className='space-y-2'>
              <Label>Модель</Label>
              <Input name='model' defaultValue={product.model} required />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Заголовок</Label>
            <Input name='title' defaultValue={product.title} required />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Колір</Label>
              <Input name='color' defaultValue={product.color} required />
            </div>
            
            <div className='space-y-2'>
              <Label>Пам'ять</Label>
              <Select name='storage' defaultValue={product.storage}>
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='64GB'>64GB</SelectItem>
                  <SelectItem value='128GB'>128GB</SelectItem>
                  <SelectItem value='256GB'>256GB</SelectItem>
                  <SelectItem value='512GB'>512GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
             <div className='space-y-2'>
              <Label>Грейд</Label>
              <Select name='grade' defaultValue={product.grade}>
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='NEW'>New</SelectItem>
                  <SelectItem value='A_PLUS'>A+</SelectItem>
                  <SelectItem value='A'>A</SelectItem>
                  <SelectItem value='B'>B</SelectItem>
                  <SelectItem value='C'>C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='p-4 bg-slate-50 rounded-lg border space-y-4'>
            <h3 className='font-semibold text-slate-900'>Margin Engine (Edit)</h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>Вхід ($)</Label>
                <Input type='number' name='purchaseCost' defaultValue={Number(product.purchaseCost)} step='0.01' required />
              </div>
              <div className='space-y-2'>
                <Label>Ремонт ($)</Label>
                <Input type='number' name='repairCost' defaultValue={Number(product.repairCost)} step='0.01' />
              </div>
              <div className='space-y-2'>
                <Label>Продаж ($)</Label>
                <Input type='number' name='price' defaultValue={Number(product.price)} step='0.01' required className='border-green-500' />
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Опис</Label>
            <Textarea name='description' defaultValue={product.description} required rows={5} />
          </div>

          <div className='space-y-2'>
             <Label>Дефекти (через кому)</Label>
             <Input name='defects' defaultValue={product.defects.join(', ')} />
          </div>

           <div className='space-y-2'>
             <Label>Фото URL</Label>
             <Input name='imageUrl' defaultValue={product.images[0] || ''} />
          </div>

          <Button type='submit' className='w-full text-lg py-6' disabled={loading}>
            {loading ? 'Збереження...' : 'Оновити товар'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}