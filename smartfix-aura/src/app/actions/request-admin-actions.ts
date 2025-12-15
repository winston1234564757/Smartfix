'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateRequestStatus(id: string, status: string) {
    try {
        await db.productRequest.update({
            where: { id },
            data: { status }
        })
        revalidatePath(`/dashboard/requests/${id}`)
        revalidatePath('/dashboard/requests')
        return { success: true }
    } catch (e) { return { error: 'Помилка оновлення статусу' } }
}

export async function attachProductToRequest(requestId: string, productId: string) {
    try {
        await db.productRequest.update({
            where: { id: requestId },
            data: {
                offeredProductId: productId,
                status: 'FOUND'
            }
        })
        revalidatePath(`/dashboard/requests/${requestId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Помилка прикріплення товару' }
    }
}

export async function detachProductFromRequest(requestId: string) {
    try {
        await db.productRequest.update({
            where: { id: requestId },
            data: {
                offeredProductId: null,
                status: 'SEARCHING'
            }
        })
        revalidatePath(`/dashboard/requests/${requestId}`)
        return { success: true }
    } catch (e) {
        return { error: 'Помилка відкріплення' }
    }
}

export async function completeRequest(requestId: string) {
    try {
        await db.productRequest.update({
            where: { id: requestId },
            data: { status: 'COMPLETED' }
        })
        revalidatePath(`/dashboard/requests/${requestId}`)
        return { success: true }
    } catch (e) { return { error: 'Помилка' } }
}