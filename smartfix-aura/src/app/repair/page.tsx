import { RepairWizard } from "@/components/shop/RepairWizard"
import { getRepairPageData } from "@/app/actions/repair-actions"

export const metadata = {
  title: "Ремонт | SmartFix Aura",
  description: "Запис на ремонт техніки Apple, Android, ноутбуків та планшетів."
}

// Щоб дані були свіжі (якщо ціни зміняться в адмінці)
export const dynamic = "force-dynamic"

export default async function RepairPage() {
  const { devices, addons } = await getRepairPageData()

  return (
    <RepairWizard devices={devices} addons={addons} />
  )
}