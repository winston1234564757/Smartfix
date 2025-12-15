'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrderStatus, updateTradeInStatus, updateRequestStatus } from '@/app/actions/admin-actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  id: string
  currentStatus: string
  type: 'ORDER' | 'TRADE_IN' | 'REQUEST'
}

export function StatusSelector({ id, currentStatus, type }: Props) {
  const [loading, setLoading] = useState(false)

  const handleValueChange = async (val: string) => {
    setLoading(true)
    let res;
    if (type === 'ORDER') res = await updateOrderStatus(id, val)
    else if (type === 'TRADE_IN') res = await updateTradeInStatus(id, val)
    else if (type === 'REQUEST') res = await updateRequestStatus(id, val)

    if (res?.error) toast.error(res.error)
    else toast.success(res?.message || 'Оновлено')
    setLoading(false)
  }

  const options = {
    'ORDER': ['PENDING', 'CONFIRMED', 'SENT', 'DONE', 'CANCELED'],
    'TRADE_IN': ['NEW', 'PROCESSED', 'COMPLETED', 'REJECTED'],
    'REQUEST': ['NEW', 'PROCESSING', 'FOUND', 'CANCELED']
  }[type]

  return (
    <Select defaultValue={currentStatus} onValueChange={handleValueChange} disabled={loading}>
      <SelectTrigger className="w-[140px] h-8 text-xs font-medium bg-white">
        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : null}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}