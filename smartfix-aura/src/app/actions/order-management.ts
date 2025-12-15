"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // 1. Оновлюємо статус самого замовлення
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    // 2. БІЗНЕС-ЛОГІКА: Синхронізація товарів
    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    })

    if (order && order.items.length > 0) {
        
        // Якщо замовлення активне (Підтверджено/Відправлено/Виконано) -> Товар ПРОДАНО
        if (["CONFIRMED", "SHIPPED", "COMPLETED"].includes(newStatus)) {
            for (const item of order.items) {
                await db.product.update({
                    where: { id: item.productId },
                    data: { status: "SOLD" } 
                })
            }
        }

        // Якщо замовлення скасовано -> Товар ПОВЕРТАЄТЬСЯ
        if (newStatus === "CANCELLED") {
            for (const item of order.items) {
                await db.product.update({
                    where: { id: item.productId },
                    data: { status: "AVAILABLE" }
                })
            }
        }
        
        // Якщо повернули в "Очікує" (наприклад, помилково клацнули) -> Товар в РЕЗЕРВ
        if (newStatus === "PENDING") {
            for (const item of order.items) {
                await db.product.update({
                    where: { id: item.productId },
                    data: { status: "RESERVED" }
                })
            }
        }
    }
    
    revalidatePath("/dashboard/orders")
    revalidatePath("/products")
    revalidatePath("/catalog")
    
    return { success: true, message: "Статус оновлено" }
  } catch (e) {
    console.error(e)
    return { error: "Помилка оновлення статусу" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) return { error: "Замовлення не знайдено" }

    await db.$transaction(async (tx) => {
      // Повертаємо товар на вітрину
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { status: "AVAILABLE" }
        })
      }
      await tx.order.delete({ where: { id: orderId } })
    })

    revalidatePath("/dashboard/orders")
    revalidatePath("/products")
    revalidatePath("/catalog")
    
    return { success: true, message: "Замовлення видалено, товар доступний" }
  } catch (e) {
    console.error(e)
    return { error: "Помилка видалення" }
  }
}