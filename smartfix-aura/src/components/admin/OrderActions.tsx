'use client'

import { useState } from 'react'
import { updateOrderStatus, deleteOrder } from '@/app/actions/order-management'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(val: string) {
    setLoading(true)
    const res = await updateOrderStatus(orderId, val)
    setLoading(false)
    
    if (res.error) toast.error(res.error)
    else toast.success(res.message)
  }

  // Колір залежно від статусу
  const getColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'CONFIRMED': return 'text-blue-600 border-blue-200 bg-blue-50'
      case 'SHIPPED': return 'text-purple-600 border-purple-200 bg-purple-50'
      case 'COMPLETED': return 'text-green-600 border-green-200 bg-green-50'
      case 'CANCELLED': return 'text-red-600 border-red-200 bg-red-50'
      default: return ''
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className={`w-[140px] h-8 text-xs font-semibold border ${getColor(currentStatus)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='PENDING'>Очікує</SelectItem>
        <SelectItem value='CONFIRMED'>Підтверджено</SelectItem>
        <SelectItem value='SHIPPED'>Відправлено</SelectItem>
        <SelectItem value='COMPLETED'>Виконано (Гроші отримані)</SelectItem>
        <SelectItem value='CANCELLED'>Скасовано</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Видалити замовлення? Товар повернеться на склад.')) return
    
    setLoading(true)
    const res = await deleteOrder(orderId)
    setLoading(false)

    if (res.error) toast.error(res.error)
    else toast.success(res.message)
  }

  return (
    <Button 
      variant='ghost' 
      size='icon' 
      onClick={handleDelete} 
      disabled={loading}
      className='text-slate-400 hover:text-red-600'
    >
      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
    </Button>
  )
}