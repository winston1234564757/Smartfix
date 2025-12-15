'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    })
    
    revalidatePath('/orders')
    return { success: true, message: 'РЎС‚Р°С‚СѓСЃ РѕРЅРѕРІР»РµРЅРѕ' }
  } catch (e) {
    return { error: 'РџРѕРјРёР»РєР° РѕРЅРѕРІР»РµРЅРЅСЏ СЃС‚Р°С‚СѓСЃСѓ' }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    // РЎРїРѕС‡Р°С‚РєСѓ Р·РЅР°С…РѕРґРёРјРѕ Р·Р°РјРѕРІР»РµРЅРЅСЏ, С‰РѕР± РґС–Р·РЅР°С‚РёСЃСЊ ID С‚РѕРІР°СЂСѓ
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { products: true }
    })

    if (!order) return { error: 'Р—Р°РјРѕРІР»РµРЅРЅСЏ РЅРµ Р·РЅР°Р№РґРµРЅРѕ' }

    // РўСЂР°РЅР·Р°РєС†С–СЏ: Р’РёРґР°Р»СЏС”РјРѕ РѕСЂРґРµСЂ + РїРѕРІРµСЂС‚Р°С”РјРѕ С‚РѕРІР°СЂ Сѓ РїСЂРѕРґР°Р¶ (СЏРєС‰Рѕ С‚СЂРµР±Р°)
    await db.$transaction(async (tx) => {
      // 1. Р’РёРґР°Р»СЏС”РјРѕ Р·Р°РјРѕРІР»РµРЅРЅСЏ
      await tx.order.delete({ where: { id: orderId } })

      // 2. РЇРєС‰Рѕ Р·Р°РјРѕРІР»РµРЅРЅСЏ СЃРєР°СЃРѕРІР°РЅРѕ Р°Р±Рѕ РІРёРґР°Р»РµРЅРѕ, Р»РѕРіС–С‡РЅРѕ РїРѕРІРµСЂРЅСѓС‚Рё С‚РѕРІР°СЂРё РЅР° РІС–С‚СЂРёРЅСѓ?
      // РўСѓС‚ РјРё Р·СЂРѕР±РёРјРѕ РїСЂРѕСЃС‚Рѕ: РїРѕРІРµСЂС‚Р°С”РјРѕ СЃС‚Р°С‚СѓСЃ AVAILABLE РґР»СЏ РІСЃС–С… С‚РѕРІР°СЂС–РІ С†СЊРѕРіРѕ Р·Р°РјРѕРІР»РµРЅРЅСЏ
      for (const product of order.products) {
        await tx.product.update({
          where: { id: product.id },
          data: { status: 'AVAILABLE' }
        })
      }
    })

    revalidatePath('/orders')
    revalidatePath('/products') // Р‘Рѕ СЃС‚Р°С‚СѓСЃРё С‚РѕРІР°СЂС–РІ Р·РјС–РЅРёР»РёСЃСЊ
    return { success: true, message: 'Р—Р°РјРѕРІР»РµРЅРЅСЏ РІРёРґР°Р»РµРЅРѕ, С‚РѕРІР°СЂРё РїРѕРІРµСЂРЅСѓС‚Рѕ РЅР° СЃРєР»Р°Рґ' }
  } catch (e) {
    console.error(e)
    return { error: 'РџРѕРјРёР»РєР° РІРёРґР°Р»РµРЅРЅСЏ' }
  }
}