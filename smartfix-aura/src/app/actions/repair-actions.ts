'use server'

import db from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function createRepairOrder(formData: FormData) {
  const { userId } = auth()

  const deviceName = formData.get('deviceName') as string
  const serviceName = formData.get('serviceName') as string
  const price = parseFloat(formData.get('price') as string)
  const name = formData.get('customerName') as string
  const phone = formData.get('phone') as string

  if (!name || !phone) return { error: 'Вкажіть імʼя та телефон' }

  try {
    // 1. Спробуємо знайти цей сервіс в базі, щоб дізнатися його собівартість (partCost)
    // Ми шукаємо по назві пристрою та назві послуги
    // Це "м'який" пошук, бо дані можуть бути захардкоджені на фронті, але ми спробуємо знайти точний матч
    
    let cost = 0;
    
    const device = await db.serviceDevice.findFirst({
        where: { name: deviceName },
        include: { services: true }
    })

    if (device) {
        const service = device.services.find(s => s.title === serviceName)
        if (service) {
            cost = Number(service.partCost)
        }
    }

    // 2. Створюємо замовлення з заповненим полем cost
    await db.repairOrder.create({
      data: {
        deviceName,
        serviceName,
        price,
        cost, // <--- Записуємо собівартість
        customerName: name,
        phone,
        userId: userId || null,
        status: 'NEW'
      }
    })

    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Помилка створення заявки' }
  }
}