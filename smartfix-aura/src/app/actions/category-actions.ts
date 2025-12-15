'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Category } from '@prisma/client'

// Схема валідації
const categoryMetadataSchema = z.object({
  id: z.nativeEnum(Category),
  // Дозволяємо порожній рядок або null, якщо картинка не змінюється
  imageUrl: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  color: z.string().optional(),
  buttonText: z.string().optional(),
})

export async function updateCategoryMetadata(formData: FormData) {
  const rawData = {
    id: formData.get('id'),
    imageUrl: formData.get('imageUrl'),
    description: formData.get('description'),
    color: formData.get('color'),
    buttonText: formData.get('buttonText'),
  }

  // Валідація
  const result = categoryMetadataSchema.safeParse(rawData)

  if (!result.success) {
    console.error("Validation Error:", result.error.flatten())
    return { error: 'Помилка перевірки даних. Перевірте поля.' }
  }

  const data = result.data

  try {
    // Оновлюємо або створюємо запис
    await db.categoryMetadata.upsert({
      where: { id: data.id },
      update: {
        // Якщо URL порожній, не оновлюємо його (залишаємо старий), АБО треба логіку на клієнті
        // Тут ми просто записуємо те, що прийшло. 
        // ВАЖЛИВО: Якщо imageUrl === '', це може стерти картинку.
        // Але для простоти зараз пишемо як є.
        imageUrl: data.imageUrl || '', 
        description: data.description || '',
        color: data.color || '#4f46e5',
        buttonText: data.buttonText || 'Перейти',
      },
      create: {
        id: data.id,
        imageUrl: data.imageUrl || '',
        description: data.description || 'Преміальні гаджети',
        color: data.color || '#4f46e5',
        buttonText: data.buttonText || 'Перейти',
      }
    })
  } catch (e: any) {
    console.error("DB Error:", e)
    return { error: 'Помилка бази даних: ' + e.message }
  }

  revalidatePath('/catalog')
  revalidatePath('/dashboard/categories')
  
  return { success: true, message: `Категорію ${data.id} успішно оновлено!` }
}

export async function getCategoryMetadata() {
  // Переконуємось, що всі категорії існують в базі
  const allEnums = Object.values(Category) as Category[];
  
  const promises = allEnums.map(async (category) => {
    // Upsert без оновлення існуючих полів, тільки створення якщо немає
    return db.categoryMetadata.upsert({
      where: { id: category },
      update: {}, 
      create: {
        id: category,
        imageUrl: '',
        description: `Найкращі ${category} з гарантією.`,
        color: '#4f46e5',
        buttonText: 'Перейти',
      }
    })
  })

  await Promise.all(promises);

  return db.categoryMetadata.findMany({
    orderBy: { id: 'asc' }
  })
}