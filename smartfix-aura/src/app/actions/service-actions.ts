'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Category } from '@prisma/client'

export async function createServiceDevice(formData: FormData) {
  const name = formData.get('name') as string
  const brand = formData.get('brand') as string
  const type = formData.get('type') as Category
  const image = formData.get('image') as string

  try {
    await db.serviceDevice.create({ data: { name, brand, type, image } })
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (e) { return { error: 'Помилка створення пристрою' } }
}

export async function createServiceItem(formData: FormData) {
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  // Отримуємо собівартість
  const partCost = parseFloat(formData.get('partCost') as string) || 0
  const duration = formData.get('duration') as string
  const deviceId = formData.get('deviceId') as string

  try {
    await db.serviceItem.create({ 
        data: { 
            title, 
            price, 
            partCost, // Зберігаємо в базу
            duration, 
            deviceId 
        } 
    })
    revalidatePath(`/dashboard/services/${deviceId}`)
    return { success: true }
  } catch (e) { return { error: 'Помилка додавання послуги' } }
}

export async function deleteServiceItem(id: string, deviceId: string) {
    try {
        await db.serviceItem.delete({ where: { id } })
        revalidatePath(`/dashboard/services/${deviceId}`)
        return { success: true }
    } catch (e) { return { error: 'Помилка видалення' } }
}