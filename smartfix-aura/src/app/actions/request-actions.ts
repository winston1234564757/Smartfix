"use server"

import db from "@/lib/db"
import { z } from "zod"

const requestSchema = z.object({
  targetProduct: z.string(),
  budget: z.string(),
  name: z.string().min(2, "Введіть ім''я"),
  phone: z.string().min(10, "Некоректний номер"),
  
  storage: z.string().optional(),
  color: z.string().optional(),
  grade: z.string().optional(),
  notes: z.string().optional(), // NEW
  
  cpu: z.string().optional(),
  ram: z.string().optional(),
  gpu: z.string().optional(),
  screen: z.string().optional(),
})

export async function createProductRequest(formData: FormData) {
  try {
    const rawData = {
        targetProduct: formData.get("targetProduct"),
        budget: formData.get("budget"),
        name: formData.get("customerName"),
        phone: formData.get("phone"),
        storage: formData.get("desiredStorage"),
        color: formData.get("desiredColor"),
        grade: formData.get("desiredGrade"),
        notes: formData.get("clientNotes"), // NEW
        cpu: formData.get("desiredCpu"),
        ram: formData.get("desiredRam"),
        gpu: formData.get("desiredGpu"),
        screen: formData.get("desiredScreen"),
    }

    const result = requestSchema.safeParse(rawData)

    if (!result.success) {
        return { error: "Перевірте дані форми" }
    }

    const { data } = result

    await db.productRequest.create({
        data: {
            targetProduct: data.targetProduct,
            budget: data.budget,
            customerName: data.name,
            phone: data.phone,
            desiredStorage: data.storage,
            desiredColor: data.color,
            desiredGrade: data.grade,
            clientNotes: data.notes, // SAVE NOTES
            desiredCpu: data.cpu,
            desiredRam: data.ram,
            desiredGpu: data.gpu,
            desiredScreen: data.screen,
            status: "NEW"
        }
    })

    return { success: true, message: "Заявку прийнято!" }

  } catch (error) {
    console.error("Request Error:", error)
    return { error: "Помилка сервера" }
  }
}