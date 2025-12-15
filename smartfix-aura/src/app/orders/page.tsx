import db from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import { StatusSelector } from '@/components/admin/StatusSelector'

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { products: true }
  })

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Замовлення CRM</h1>
        <Badge variant='outline' className='text-sm py-1 px-3'>
          Всього: {orders.length}
        </Badge>
      </div>

      <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50'>
              <TableHead className='w-[100px]'>ID</TableHead>
              <TableHead>Клієнт</TableHead>
              <TableHead>Товари</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                        Замовлень поки немає
                    </TableCell>
                </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='font-mono text-xs text-slate-500'>
                  {order.id.slice(-6).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                     <span className='font-medium'>{order.customerName}</span>
                     <span className='text-xs text-slate-400'>{order.phone}</span>
                     <span className='text-[10px] text-slate-400 truncate max-w-[150px]'>{order.city}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {order.products.map((p) => (
                      <Badge key={p.id} variant='secondary' className='text-[10px]'>
                        {p.title}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='font-bold text-slate-700'>
                  {formatMoney(Number(order.total))}
                </TableCell>
                <TableCell>
                  <StatusSelector id={order.id} currentStatus={order.status} type="ORDER" />
                </TableCell>
                <TableCell className='text-xs text-muted-foreground'>
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: uk })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}