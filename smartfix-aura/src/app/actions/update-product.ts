'use server'

import db from '@\/lib\/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  brand: z.string().min(2),
  model: z.string().min(2),
  color: z.string().min(2),
  storage: z.string().min(1),
  grade: z.enum(['NEW', 'A_PLUS', 'A', 'B', 'C', 'D']),
  category: z.enum(['IPHONE', 'ANDROID', 'TABLET', 'LAPTOP', 'WATCH', 'ACCESSORY', 'OTHER']),
  price: z.coerce.number().min(0.01),
  purchaseCost: z.coerce.number().min(0.01),
  repairCost: z.coerce.number().default(0),
  defects: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
})

export async function updateProduct(id: string, formData: FormData) {
  const rawData = {
    title: formData.get('title')?.toString() || '',
    description: formData.get('description')?.toString() || '',
    brand: formData.get('brand')?.toString() || '',
    model: formData.get('model')?.toString() || '',
    color: formData.get('color')?.toString() || '',
    storage: formData.get('storage')?.toString() || '',
    grade: formData.get('grade')?.toString() || undefined,
    category: formData.get('category')?.toString() || undefined,
    price: formData.get('price'),
    purchaseCost: formData.get('purchaseCost'),
    repairCost: formData.get('repairCost'),
    defects: formData.get('defects')?.toString() || '',
    imageUrl: formData.get('imageUrl')?.toString() || '',
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const data = result.data

  try {
    await db.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        brand: data.brand,
        model: data.model,
        color: data.color,
        storage: data.storage,
        grade: data.grade,
        category: data.category,
        price: data.price,
        purchaseCost: data.purchaseCost,
        repairCost: data.repairCost,
        defects: data.defects ? data.defects.split(',').map(d => d.trim()) : [],
        images: data.imageUrl ? [data.imageUrl] : [],
      }
    })
  } catch (e) {
    console.error(e)
    return { message: 'РџРѕРјРёР»РєР° РїСЂРё РѕРЅРѕРІР»РµРЅРЅС–' }
  }

  revalidatePath('/products')
  revalidatePath('/product/[slug]')
  
  redirect('/products')
}