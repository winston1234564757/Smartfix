'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ProductStatus, Category, Grade } from '@prisma/client'

export async function createProduct(formData: FormData) {
  try {
      const rawImages = formData.getAll('images') as string[]
      const images = rawImages.filter(Boolean)
      
      const status = formData.get('status') as ProductStatus
      const arrivalDateStr = formData.get('estimatedArrival') as string
      const estimatedArrival = (status === 'PRE_ORDER' && arrivalDateStr) ? new Date(arrivalDateStr) : null

      // JSON parsing
      const checklistRaw = formData.get('checklist') as string
      let checklist = []
      try { checklist = checklistRaw ? JSON.parse(checklistRaw) : [] } catch (e) { console.error("Checklist Parse Error", e) }

      const upgradesRaw = formData.get('upgrades') as string
      let upgrades = []
      try { upgrades = upgradesRaw ? JSON.parse(upgradesRaw) : [] } catch (e) { console.error("Upgrades Parse Error", e) }

      const data = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        purchaseCost: parseFloat(formData.get('purchaseCost') as string) || 0,
        repairCost: parseFloat(formData.get('repairCost') as string) || 0,
        storage: formData.get('storage') as string,
        color: formData.get('color') as string,
        cpu: formData.get('cpu') as string || null,
        ram: formData.get('ram') as string || null,
        status: status,
        estimatedArrival: estimatedArrival,
        checklist: checklist,
        upgrades: upgrades,
        category: formData.get('category') as Category,
        grade: formData.get('grade') as Grade,
        images: images,
      }

      console.log("Attempting to create product with data:", data) // LOG DATA

      await db.product.create({ data })
      
      revalidatePath('/products')
      revalidatePath('/catalog')
      return { success: true }

  } catch (error: any) {
    console.error("❌ CREATE PRODUCT ERROR:", error) // LOG ACTUAL ERROR
    if (error.code === 'P2002') return { error: 'Товар з таким Slug (URL) вже існує.' }
    return { error: `Помилка: ${error.message}` }
  }
}

export async function updateProduct(formData: FormData) {
  try {
      const id = formData.get('id') as string
      const rawImages = formData.getAll('images') as string[]
      const images = rawImages.filter(Boolean)

      const status = formData.get('status') as ProductStatus
      const arrivalDateStr = formData.get('estimatedArrival') as string
      const estimatedArrival = (status === 'PRE_ORDER' && arrivalDateStr) ? new Date(arrivalDateStr) : null

      const checklistRaw = formData.get('checklist') as string
      let checklist = []
      try { checklist = checklistRaw ? JSON.parse(checklistRaw) : [] } catch (e) {}

      const upgradesRaw = formData.get('upgrades') as string
      let upgrades = []
      try { upgrades = upgradesRaw ? JSON.parse(upgradesRaw) : [] } catch (e) {}

      const data = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        purchaseCost: parseFloat(formData.get('purchaseCost') as string) || 0,
        repairCost: parseFloat(formData.get('repairCost') as string) || 0,
        storage: formData.get('storage') as string,
        color: formData.get('color') as string,
        cpu: formData.get('cpu') as string || null,
        ram: formData.get('ram') as string || null,
        category: formData.get('category') as Category,
        status: status,
        estimatedArrival: estimatedArrival,
        checklist: checklist,
        upgrades: upgrades,
        grade: formData.get('grade') as Grade,
        images: images,
      }

      await db.product.update({ where: { id }, data })

      revalidatePath('/products')
      revalidatePath('/catalog')
      revalidatePath(`/product/${data.slug}`)
      revalidatePath('/')
      return { success: true }
      
  } catch (error: any) {
    console.error("❌ UPDATE PRODUCT ERROR:", error)
    return { error: `Помилка оновлення: ${error.message}` }
  }
}