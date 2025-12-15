'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateRepairStatus(id: string, status: string) {
  try {
    await db.repairOrder.update({
        where: { id },
        data: { status }
    })
    revalidatePath(`/dashboard/repair/${id}`)
    revalidatePath('/dashboard/repair')
    return { success: true }
  } catch (e) { return { error: 'Помилка оновлення статусу' } }
}

export async function saveRepairNotes(id: string, notes: string) {
  try {
    await db.repairOrder.update({
        where: { id },
        data: { internalNotes: notes }
    })
    revalidatePath(`/dashboard/repair/${id}`)
    return { success: true }
  } catch (e) { return { error: 'Помилка збереження нотаток' } }
}

export async function addRepairImage(id: string, imageUrl: string) {
  try {
    const order = await db.repairOrder.findUnique({ where: { id } })
    if (!order) return { error: 'Заявку не знайдено' }

    const newImages = [...order.images, imageUrl]
    
    await db.repairOrder.update({
        where: { id },
        data: { images: newImages }
    })
    revalidatePath(`/dashboard/repair/${id}`)
    return { success: true }
  } catch (e) { return { error: 'Помилка завантаження фото' } }
}