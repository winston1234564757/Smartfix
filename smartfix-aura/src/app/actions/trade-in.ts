'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function createTradeInRequest(formData: FormData) {
  const { userId } = auth();

  const rawData = {
    model: formData.get('model') as string,
    storage: formData.get('storage') as string,
    condition: formData.get('condition') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
  }
  
  const rawImages = formData.getAll('images') as string[]
  const images = rawImages.filter(Boolean)

  if (!rawData.model || !rawData.phone || !rawData.name) {
    return { error: 'Заповніть обовʼязкові поля.' }
  }

  try {
    await db.tradeInRequest.create({
      data: {
        model: rawData.model,
        storage: rawData.storage || 'Не вказано',
        condition: rawData.condition || 'Не вказано',
        name: rawData.name,
        phone: rawData.phone,
        images: images,
        userId: userId || null,
      }
    })

    revalidatePath('/trade-in')
    revalidatePath('/profile')
    return { success: true, message: 'Заявку успішно відправлено!' }
    
  } catch (error: any) {
    return { error: 'Помилка збереження заявки.' }
  }
}