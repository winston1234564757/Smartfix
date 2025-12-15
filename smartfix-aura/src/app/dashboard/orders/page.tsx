import db from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { ShoppingBag, MapPin, ArrowLeft, Box, User, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"
import { StatusTabs } from "@/components/admin/StatusTabs"

export default async function OrdersAdminPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status
  const whereClause = statusFilter ? { status: statusFilter } : {}

  const orders = await db.order.findMany({ 
      where: whereClause,
      include: { items: { include: { product: true } } }, 
      orderBy: { createdAt: "desc" } 
  })

  const TABS = [
      { value: "PENDING", label: "Обробка" },
      { value: "CONFIRMED", label: "Підтверджено" },
      { value: "SENT", label: "Відправлено" },
      { value: "DONE", label: "Виконано" },
      { value: "CANCELED", label: "Скасовано" }
  ]

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
            <div><h1 className="text-3xl font-black text-slate-900">Замовлення</h1><p className="text-slate-500">Магазин та продажі ({orders.length})</p></div>
        </div>
      </div>

      <StatusTabs options={TABS} />

      <div className="grid grid-cols-1 gap-6">
        {orders.map(order => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <Card className="border-slate-200 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-blue-300">
                    
                    {/* TOP ROW: Основна інформація */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-50/50 border-b border-slate-100 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm font-black text-lg text-slate-900">
                                #{order.id.slice(-6).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <User className="w-4 h-4 text-slate-400"/> {order.customerName}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <Calendar className="w-3 h-3"/> {formatDistanceToNow(new Date(order.createdAt), {addSuffix: true, locale: uk})}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Сума</p>
                                <p className="text-xl font-black text-emerald-600">${Number(order.total)}</p>
                            </div>
                            <ActivityStatusWrapper id={order.id} type="ORDER" currentStatus={order.status} />
                        </div>
                    </div>

                    {/* BOTTOM ROW: Список товарів */}
                    <div className="p-5 space-y-3">
                        {order.items.map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-start">
                                {/* Фото товару */}
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                    {item.product?.images[0] ? (
                                        <img src={item.product.images[0]} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300"><ShoppingBag className="w-5 h-5"/></div>
                                    )}
                                </div>

                                {/* Інфо про товар */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{item.product?.title || "Видалений товар"}</h4>
                                        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                            {item.quantity} x ${Number(item.price)}
                                        </span>
                                    </div>
                                    
                                    {/* Апгрейди та опції */}
                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.selectedOptions.map((opt: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 text-[10px] px-1.5 py-0 h-5 font-bold rounded-md">
                                                    <Box className="w-3 h-3 mr-1 opacity-50"/> {opt.replace(/\(\+\d+.*\)/, "")} {/* Прибираємо ціну з назви опції для компактності */}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER: Контакт та доставка */}
                    <div className="px-5 pb-4 pt-0 flex gap-4 text-xs text-slate-400 font-medium border-t border-slate-50 mt-2 pt-3">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {order.phone}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {order.city || "Самовивіз"} • {order.warehouse}</span>
                    </div>

                </Card>
            </Link>
        ))}
        {orders.length === 0 && <p className="text-slate-400 text-center py-20">Замовлень не знайдено</p>}
      </div>
    </div>
  )
}