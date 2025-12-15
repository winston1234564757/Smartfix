'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ProductStatus, Category, Grade } from '@prisma/client'

// Проста функція для генерації URL (slug)
function generateSlug(title: string, model: string) {
  const base = `${title}-${model}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')     // Замінюємо спецсимволи на дефіс
    .replace(/^-+|-+$/g, '')         // Прибираємо дефіси по краях
  
  // Додаємо рандом, щоб уникнути дублікатів (slug має бути унікальним)
  return `${base}-${Math.random().toString(36).substring(2, 7)}`
}

// --- CREATE ---
export async function createProduct(data: any) {
  try {
      console.log("Creating product payload:", data)

      // Генеруємо slug автоматично, якщо його немає
      const slug = data.slug || generateSlug(data.title, data.model)

      await db.product.create({ 
        data: {
          title: data.title,
          slug: slug,
          brand: data.brand || "Apple", // Default brand fallback
          model: data.model,
          description: data.description,
          price: data.price,
          purchaseCost: data.purchaseCost || 0,
          repairCost: data.repairCost || 0,
          storage: data.storage || "",
          color: data.color || "",
          cpu: data.cpu, // Prisma прийме null, якщо поле опціональне
          ram: data.ram,
          status: data.status as ProductStatus,
          arrivalDate: data.arrivalDate, // Для PRE_ORDER
          quantity: data.quantity,
          category: data.category as Category,
          grade: data.grade as Grade,
          images: data.images,
          checklist: data.checklist || {}, // JSON
          upgrades: data.upgrades || {},   // JSON
        }
      })
      
      revalidatePath('/products')
      revalidatePath('/catalog')
      return { success: true }

  } catch (error: any) {
    console.error("❌ CREATE PRODUCT ERROR:", error)
    if (error.code === 'P2002') return { error: 'Товар з таким Slug (URL) вже існує.' }
    return { error: `Помилка створення: ${error.message}` }
  }
}

// --- UPDATE ---
// Тепер приймає ID окремо, а дані об'єктом
export async function updateProduct(id: string, data: any) {
  try {
      console.log("Updating product:", id, data)

      await db.product.update({ 
        where: { id }, 
        data: {
          title: data.title,
          model: data.model,
          description: data.description,
          price: data.price,
          purchaseCost: data.purchaseCost,
          repairCost: data.repairCost,
          storage: data.storage,
          color: data.color,
          cpu: data.cpu,
          ram: data.ram,
          status: data.status as ProductStatus,
          arrivalDate: data.arrivalDate,
          quantity: data.quantity,
          category: data.category as Category,
          grade: data.grade as Grade,
          images: data.images,
          checklist: data.checklist,
          upgrades: data.upgrades,
        }
      })

      revalidatePath('/products')
      revalidatePath('/catalog')
      revalidatePath(`/products/${id}/edit`)
      return { success: true }
      
  } catch (error: any) {
    console.error("❌ UPDATE PRODUCT ERROR:", error)
    return { error: `Помилка оновлення: ${error.message}` }
  }
}