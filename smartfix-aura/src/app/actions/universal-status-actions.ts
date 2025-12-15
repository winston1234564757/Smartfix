'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- ORDERS ---
export async function updateOrderStatus(id: string, status: string) {
    try {
        await db.order.update({ where: { id }, data: { status } })
        revalidatePath('/')
        return { success: true }
    } catch (e) { return { error: 'Помилка оновлення замовлення' } }
}

// --- REPAIRS ---
export async function updateRepairStatus(id: string, status: string) {
    try {
        await db.repairOrder.update({ where: { id }, data: { status } })
        revalidatePath('/')
        return { success: true }
    } catch (e) { return { error: 'Помилка оновлення ремонту' } }
}

// --- TRADE-IN ---
export async function updateTradeInStatus(id: string, status: string) {
    try {
        await db.tradeInRequest.update({ where: { id }, data: { status } })
        revalidatePath('/')
        return { success: true }
    } catch (e) { return { error: 'Помилка оновлення Trade-In' } }
}

// --- REQUESTS ---
export async function updateRequestStatus(id: string, status: string) {
    try {
        await db.productRequest.update({ where: { id }, data: { status } })
        revalidatePath('/')
        return { success: true }
    } catch (e) { return { error: 'Помилка оновлення запиту' } }
}