'use server'

import db from '@/lib/db'

export async function trackOrder(query: string) {
  if (!query || query.length < 3) return { error: 'Введіть мінімум 3 символи' }

  const search = {
      OR: [
          { id: { contains: query } }, // Частковий збіг ID
          { phone: { contains: query } } // Частковий збіг телефону
      ]
  }

  // Шукаємо всюди паралельно
  const [repairs, orders, tradeIns, requests] = await Promise.all([
      db.repairOrder.findMany({ where: search }),
      db.order.findMany({ where: search, include: { products: true } }),
      db.tradeInRequest.findMany({ where: search }),
      db.productRequest.findMany({ where: search })
  ])

  // Якщо знайшли щось одне - повертаємо. Якщо багато - повертаємо список (але для простоти поки повернемо найсвіжіше)
  
  const allResults = [
      ...repairs.map(r => ({ type: 'REPAIR', data: r, date: r.createdAt })),
      ...orders.map(o => ({ type: 'ORDER', data: o, date: o.createdAt })),
      ...tradeIns.map(t => ({ type: 'TRADE_IN', data: t, date: t.createdAt })),
      ...requests.map(r => ({ type: 'REQUEST', data: r, date: r.createdAt }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (allResults.length > 0) {
      // Повертаємо найсвіжішу подію. (В ідеалі треба показувати список, але для MVP покажемо останнє)
      return allResults[0] 
  }

  return { error: 'Нічого не знайдено' }
}