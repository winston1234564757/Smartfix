'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateRepairStatus } from '@/app/actions/repair-admin-actions'
import { toast } from 'sonner'

export function RepairStatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
  async function handleChange(val: string) {
      const res = await updateRepairStatus(id, val)
      if (res.error) toast.error(res.error)
      else toast.success('Статус оновлено')
  }
  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] bg-slate-900 text-white border-0 font-bold rounded-xl h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NEW">🔵 Нова заявка</SelectItem>
        <SelectItem value="DIAGNOSTIC">🟡 Діагностика</SelectItem>
        <SelectItem value="IN_WORK">🟠 В роботі</SelectItem>
        <SelectItem value="READY">🟢 Готово до видачі</SelectItem>
        <SelectItem value="DONE">✅ Видано (Архів)</SelectItem>
        <SelectItem value="CANCELED">🔴 Скасовано</SelectItem>
      </SelectContent>
    </Select>
  )
}