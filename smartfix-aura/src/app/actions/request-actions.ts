'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function createProductRequest(formData: FormData) {
  const { userId } = auth()

  const data = {
    targetProduct: formData.get('targetProduct') as string,
    budget: formData.get('budget') as string,
    desiredStorage: formData.get('desiredStorage') as string,
    desiredColor: formData.get('desiredColor') as string,
    desiredGrade: formData.get('desiredGrade') as string,
    customerName: formData.get('customerName') as string,
    phone: formData.get('phone') as string,
    userId: userId || null
  }

  if (!data.customerName || !data.phone) {
      return { error: 'Вкажіть імʼя та телефон' }
  }

  try {
    await db.productRequest.create({ data })
    revalidatePath('/profile')
    return { success: true, message: 'Заявку на пошук прийнято!' }
  } catch (e) {
    return { error: 'Помилка створення заявки' }
  }
}