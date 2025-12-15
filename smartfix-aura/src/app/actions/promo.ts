'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPromoBanner(formData: FormData) {
  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  const link = formData.get('link') as string
  const size = formData.get('size') as string
  const image = formData.get('image') as string

  if (!title || !image || !link) {
    return { error: 'Заповніть обовʼязкові поля' }
  }

  try {
    await db.promoBanner.create({
      data: {
        title,
        subtitle: subtitle || '',
        link,
        size,
        image
      }
    })
    revalidatePath('/catalog')
    revalidatePath('/dashboard/banners')
    return { success: true }
  } catch (e) {
    return { error: 'Помилка створення банера' }
  }
}

export async function deletePromoBanner(id: string) {
  try {
    await db.promoBanner.delete({ where: { id } })
    revalidatePath('/catalog')
    revalidatePath('/dashboard/banners')
    return { success: true }
  } catch (e) {
    return { error: 'Помилка видалення' }
  }
}