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
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { StatusSelector } from '@/components/admin/StatusSelector'
import { Clock, Eye, User, Phone, CalendarClock } from 'lucide-react'
import Link from 'next/link'

export default async function PreOrdersPage() {
  // Шукаємо замовлення, які містять товари зі статусом PRE_ORDER
  const orders = await db.order.findMany({
    where: {
        products: {
            some: { status: 'PRE_ORDER' }
        }
    },
    orderBy: { createdAt: 'desc' },
    include: { products: true }
  })

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
            <div className='p-3 bg-purple-100 text-purple-600 rounded-xl'>
                <Clock className='w-6 h-6' />
            </div>
            <div>
                <h1 className='text-3xl font-bold tracking-tight'>Передзамовлення</h1>
                <p className='text-slate-500'>Контроль термінів доставки</p>
            </div>
        </div>
        <Badge variant='outline' className='text-sm py-1 px-3 border-purple-200 text-purple-700 bg-purple-50'>
          В очікуванні: {orders.length}
        </Badge>
      </div>

      <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50'>
              <TableHead>Дата замовлення</TableHead>
              <TableHead>Очікується (Дата)</TableHead>
              <TableHead>Товар</TableHead>
              <TableHead>Клієнт</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className='text-right'>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className='h-32 text-center text-muted-foreground'>
                        Активних передзамовлень немає
                    </TableCell>
                </TableRow>
            )}
            {orders.map((order) => {
              // Знаходимо саме товар з передзамовленням, щоб взяти дату
              const preOrderProduct = order.products.find(p => p.status === 'PRE_ORDER')
              const arrivalDate = preOrderProduct?.estimatedArrival

              return (
                <TableRow key={order.id} className='group hover:bg-purple-50/30 transition-colors'>
                    <TableCell className='text-xs text-muted-foreground'>
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: uk })}
                    </TableCell>
                    
                    {/* ДАТА ПРИБУТТЯ (ГОЛОВНЕ) */}
                    <TableCell>
                        {arrivalDate ? (
                            <div className='flex items-center gap-2 text-purple-700 font-bold bg-purple-50 w-fit px-2 py-1 rounded-md border border-purple-100'>
                                <CalendarClock className='w-4 h-4'/>
                                {format(new Date(arrivalDate), 'd MMM', { locale: uk })}
                            </div>
                        ) : (
                            <span className='text-xs text-slate-400'>Дата не вказана</span>
                        )}
                    </TableCell>
                    
                    <TableCell>
                        <div className='flex flex-col gap-1'>
                            {order.products.map((p) => (
                                <span key={p.id} className='font-medium text-sm'>{p.title}</span>
                            ))}
                        </div>
                    </TableCell>
                    
                    <TableCell>
                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                                <User className='w-3 h-3 text-slate-400'/> {order.customerName}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-slate-500'>
                                <Phone className='w-3 h-3 text-slate-400'/> {order.phone}
                            </div>
                        </div>
                    </TableCell>
                    
                    <TableCell>
                        <StatusSelector id={order.id} currentStatus={order.status} type="ORDER" />
                    </TableCell>

                    <TableCell className='text-right'>
                        <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant='ghost' size='icon' className='h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50'>
                                <Eye className='w-4 h-4' />
                            </Button>
                        </Link>
                    </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}