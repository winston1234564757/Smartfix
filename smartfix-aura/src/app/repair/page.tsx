import db from '@/lib/db'
import { RepairWizard } from '@/components/shop/RepairWizard'

export const dynamic = 'force-dynamic'

export default async function RepairPage() {
  // 1. Завантажуємо реальні дані з бази
  const devices = await db.serviceDevice.findMany({
    include: {
      services: true
    }
  })

  // 2. Передаємо їх у Клієнтський Компонент
  return <RepairWizard devices={devices} />
}