'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function getUpsellProducts() {
  const accessories = await db.product.findMany({
    where: { 
      status: 'AVAILABLE',
      category: { in: ['ACCESSORY', 'WATCH'] }
    },
    take: 4,
    orderBy: { price: 'asc' }
  })
  
  return accessories.map(p => ({
    ...p,
    price: Number(p.price),
    purchaseCost: Number(p.purchaseCost),
    repairCost: Number(p.repairCost),
  }))
}

export async function createOrder(data: {
  customerName: string
  phone: string
  city: string
  warehouse: string
  items: { id: string }[]
  total: number
}) {
  try {
    const { userId } = auth(); // Отримуємо ID авторизованого юзера

    const order = await db.order.create({
      data: {
        total: data.total,
        status: 'PENDING',
        customerName: data.customerName,
        phone: data.phone,
        city: data.city,
        warehouse: data.warehouse,
        userId: userId || null, // Зберігаємо ID
        products: {
          connect: data.items.map(item => ({ id: item.id }))
        }
      }
    })

    await db.product.updateMany({
      where: { id: { in: data.items.map(i => i.id) } },
      data: { status: 'SOLD' }
    })
    
    revalidatePath('/orders')
    revalidatePath('/dashboard')
    revalidatePath('/profile') // Оновлюємо профіль
    
    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("Create Order Error:", error)
    return { error: 'Помилка створення замовлення' }
  }
}