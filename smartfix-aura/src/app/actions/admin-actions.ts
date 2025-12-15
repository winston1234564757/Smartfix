'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await db.order.update({ where: { id: orderId }, data: { status: newStatus } })
    revalidatePath('/dashboard/orders')
    return { success: true, message: 'Статус замовлення оновлено' }
  } catch (e) { return { error: 'Помилка' } }
}

export async function updateTradeInStatus(requestId: string, newStatus: string) {
  try {
    await db.tradeInRequest.update({ where: { id: requestId }, data: { status: newStatus } })
    revalidatePath('/dashboard/trade-in')
    return { success: true, message: 'Статус заявки оновлено' }
  } catch (e) { return { error: 'Помилка' } }
}

export async function updateRequestStatus(requestId: string, newStatus: string) {
  try {
    await db.productRequest.update({ where: { id: requestId }, data: { status: newStatus } })
    revalidatePath('/dashboard/requests')
    return { success: true, message: 'Статус запиту оновлено' }
  } catch (e) { return { error: 'Помилка' } }
}

// НОВЕ: Збереження нотаток
export async function saveOrderNotes(orderId: string, notes: string) {
  try {
    await db.order.update({
        where: { id: orderId },
        data: { internalNotes: notes }
    })
    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true, message: 'Нотатки збережено' }
  } catch (e) {
    return { error: 'Помилка збереження' }
  }
}