"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Схема валідації
const RepairOrderSchema = z.object({
  deviceName: z.string().min(1, "Оберіть пристрій"),
  serviceName: z.string().min(1, "Оберіть послугу"),
  price: z.coerce.number(),
  customerName: z.string().min(2, "Введіть ім'я"),
  phone: z.string().min(10, "Введіть коректний номер"),
  upsells: z.array(z.string()).optional() // IDs of ServiceAddon
})

// --- DATA FETCHING ---
export async function getRepairPageData() {
  try {
    const devices = await db.serviceDevice.findMany({
      include: { 
        services: {
          orderBy: { price: 'asc' }
        } 
      }
    })

    const addons = await db.serviceAddon.findMany({
      orderBy: { price: 'asc' }
    })

    return { devices, addons }
  } catch (error) {
    console.error("Error fetching repair data:", error)
    return { devices: [], addons: [] }
  }
}

// --- MUTATIONS ---
export async function createRepairOrder(formData: FormData) {
  const rawData = {
    deviceName: formData.get("deviceName"),
    serviceName: formData.get("serviceName"), // Base service name
    price: formData.get("price"),
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    // Upsells IDs passed as JSON string or multiple fields? Let's assume passed as JSON string for simplicity
    upsells: JSON.parse(formData.get("upsells") as string || "[]") 
  }

  const validated = RepairOrderSchema.safeParse(rawData)

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { deviceName, serviceName, price, customerName, phone, upsells } = validated.data

  try {
    // Fetch addon details to snapshot them in the order
    const selectedAddons = await db.serviceAddon.findMany({
      where: { id: { in: upsells } }
    })

    await db.repairOrder.create({
      data: {
        deviceName,
        serviceName,
        price,
        customerName,
        phone,
        status: "NEW",
        addons: selectedAddons // Saving snapshot of what was selected
      }
    })

    revalidatePath("/dashboard/repair")
    return { success: true }
  } catch (error) {
    console.error("Repair Order Error:", error)
    return { error: "Помилка створення заявки. Спробуйте пізніше." }
  }
}