'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function createOrder(formData: FormData) {
  const { userId } = auth()
  
  const itemsJson = formData.get('items') as string
  const items = JSON.parse(itemsJson)
  
  const total = parseFloat(formData.get('total') as string)
  const name = formData.get('customerName') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string
  const warehouse = formData.get('warehouse') as string
  const warranty = formData.get('warranty') as string || 'BASIC'
  const warrantyPrice = parseFloat(formData.get('warrantyPrice') as string) || 0

  if (!items || items.length === 0) return { error: 'Кошик порожній' }

  try {
    // 1. ПЕРЕВІРКА ДОСТУПНОСТІ ТОВАРІВ (VALIDATION)
    // Ми маємо переконатися, що товари ще ніхто не купив.
    // Але ми ДОЗВОЛЯЄМО купувати: AVAILABLE, PRE_ORDER, ON_REQUEST
    
    const productIds = items.map((i: any) => i.id)
    const dbProducts = await db.product.findMany({
        where: { id: { in: productIds } }
    })

    for (const dbProd of dbProducts) {
        // Список статусів, які МОЖНА купувати
        const buyableStatuses = ['AVAILABLE', 'PRE_ORDER', 'ON_REQUEST']
        
        if (!buyableStatuses.includes(dbProd.status)) {
            return { error: `Товар "${dbProd.title}" вже недоступний (Статус: ${dbProd.status})` }
        }
    }

    // 2. ПІДГОТОВКА OrderItem
    const orderItemsData = items.map((item: any) => {
        const optionsFormatted = item.selectedOptions 
            ? item.selectedOptions.map((opt: any) => `${opt.label} (+${opt.price} грн)`)
            : []

        return {
            productId: item.id,
            quantity: 1, // У нас унікальні товари, тому завжди 1
            price: item.price, 
            selectedOptions: optionsFormatted
        }
    })

    // 3. СТВОРЕННЯ ЗАМОВЛЕННЯ (TRANSACTION)
    // Ми створюємо замовлення І оновлюємо статус товарів одним махом (або послідовно)
    
    const order = await db.order.create({
      data: {
        total,
        customerName: name,
        phone,
        city,
        warehouse,
        userId: userId || null,
        warrantyType: warranty,
        warrantyPrice: warrantyPrice,
        status: 'PENDING',
        items: {
            create: orderItemsData
        }
      }
    })

    // 4. БРОНЮВАННЯ ТОВАРІВ
    // Після створення замовлення, ми переводимо ці товари в статус RESERVED,
    // щоб ніхто інший не зміг їх купити.
    await db.product.updateMany({
        where: { id: { in: productIds } },
        data: { status: 'RESERVED' } 
    })
    
    revalidatePath('/dashboard/orders')
    revalidatePath('/products')
    revalidatePath('/cart')
    
    return { success: true, orderId: order.id }
    
  } catch (e: any) {
    console.error("Order Creation Error:", e)
    return { error: `Помилка: ${e.message}` }
  }
}