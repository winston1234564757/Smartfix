'use server'

import db from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { Category } from '@prisma/client'

export async function createTradeInRequest(formData: FormData) {
  const { userId } = auth()

  const model = formData.get('model') as string
  const storage = formData.get('storage') as string
  const condition = formData.get('condition') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  const images = formData.getAll('images') as string[]
  
  if (!name || !phone) return { error: 'Контакти обовʼязкові' }

  try {
    await db.tradeInRequest.create({
      data: {
        model, storage, condition, name, phone, userId: userId || null, status: 'NEW', images
      }
    })
    
    revalidatePath('/dashboard/trade-in')
    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    return { error: 'Помилка створення заявки' }
  }
}

// НОВЕ: Отримання рекомендованих товарів
export async function getTradeInSuggestions(type: string) {
    let categories: Category[] = []

    // Мапимо тип з форми Trade-In на категорії магазину
    switch (type) {
        case 'PHONE':
            categories = ['IPHONE', 'ANDROID']
            break
        case 'LAPTOP':
            categories = ['LAPTOP']
            break
        case 'TABLET':
            categories = ['TABLET']
            break
        case 'WATCH':
            categories = ['WATCH']
            break
        default:
            categories = ['IPHONE', 'ANDROID']
    }

    try {
        const products = await db.product.findMany({
            where: {
                category: { in: categories },
                status: 'AVAILABLE'
            },
            take: 3, // Беремо топ-3
            orderBy: { createdAt: 'desc' } // Найсвіжіші
        })
        return { success: true, data: products }
    } catch (e) {
        return { success: false, data: [] }
    }
}