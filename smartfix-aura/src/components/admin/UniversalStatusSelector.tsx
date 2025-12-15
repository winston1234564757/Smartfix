"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusConfig } from "@/config/statuses"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface Props {
    currentStatus: string
    onUpdate: (status: string) => Promise<{ success?: boolean; error?: string }>
    options: string[] // Список можливих статусів для цього типу (щоб не показувати "Діагностика" в "Trade-In")
}

export function UniversalStatusSelector({ currentStatus, onUpdate, options }: Props) {
  const [loading, setLoading] = useState(false)
  const config = getStatusConfig(currentStatus)
  const Icon = config.icon

  async function handleChange(val: string) {
      setLoading(true)
      const res = await onUpdate(val)
      setLoading(false)
      
      if (res?.error) toast.error(res.error)
      else toast.success("Статус змінено")
  }
  
  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className={`w-auto min-w-[160px] border-0 font-bold rounded-xl h-10 transition-all ${config.color} hover:opacity-90`}>
        <div className="flex items-center gap-2 pr-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Icon className="w-4 h-4"/>}
            <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[200px]">
        {options.map((key) => {
            const style = getStatusConfig(key)
            const ItemIcon = style.icon
            return (
                <SelectItem key={key} value={key} className="cursor-pointer font-medium focus:bg-slate-50 my-1">
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