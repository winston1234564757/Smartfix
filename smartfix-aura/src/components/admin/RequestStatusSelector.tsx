"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateRequestStatus } from "@/app/actions/request-admin-actions"
import { toast } from "sonner"
import { Search, Sparkles, CheckCircle2, AlertCircle, Clock } from "lucide-react"

// Визначаємо стилі для кожного статусу
const STATUS_STYLES: any = {
    "NEW": { label: "Нова заявка", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    "SEARCHING": { label: "В пошуку", color: "bg-orange-100 text-orange-700", icon: Search },
    "FOUND": { label: "Знайдено", color: "bg-emerald-100 text-emerald-700", icon: Sparkles },
    "COMPLETED": { label: "Виконано", color: "bg-slate-900 text-white", icon: CheckCircle2 },
    "CANCELED": { label: "Скасовано", color: "bg-red-100 text-red-700", icon: AlertCircle },
}

export function RequestStatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
  async function handleChange(val: string) {
      const res = await updateRequestStatus(id, val)
      if (res.error) toast.error(res.error)
      else toast.success("Статус оновлено")
  }
  
  const activeStyle = STATUS_STYLES[currentStatus] || STATUS_STYLES["NEW"]
  const Icon = activeStyle.icon

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className={`w-[180px] border-0 font-bold rounded-xl h-10 transition-colors ${activeStyle.color}`}>
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4"/>
            <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
        {Object.entries(STATUS_STYLES).map(([key, style]: any) => {
            const ItemIcon = style.icon
            return (
                <SelectItem key={key} value={key} className="cursor-pointer font-medium focus:bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${style.color.replace("text-", "bg-").split(" ")[0]}`}></div>
                        {style.label}
                    </div>
                </SelectItem>
            )
        })}
      </SelectContent>
    </Select>
  )
}