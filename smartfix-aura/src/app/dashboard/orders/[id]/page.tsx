import db from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { User, Phone, MapPin, ArrowLeft, LayoutDashboard, ShoppingBag, Box } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"

interface Props { params: { id: string } }

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params
  const order = await db.order.findUnique({ 
      where: { id },
      include: { items: { include: { product: true } } }
  })

  if (!order) return notFound()

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/orders">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <Link href="/dashboard">
                <Button variant="ghost" className="rounded-xl gap-2 text-slate-500 hover:text-slate-900"><LayoutDashboard className="w-4 h-4"/> Дашборд</Button>
             </Link>
          </div>
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <ActivityStatusWrapper id={order.id} type="ORDER" currentStatus={order.status} />
          </div>
       </div>

       <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Замовлення #{order.id.slice(-6).toUpperCase()}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
               Створено {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: uk })}
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ТОВАРИ */}
          <div className="lg:col-span-2 space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-800"><ShoppingBag className="w-5 h-5 text-blue-600"/> Товари ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   {order.items.map((item, i) => (
                       <div key={item.id} className={`flex gap-4 p-6 ${i !== order.items.length - 1 ? "border-b border-slate-100" : ""}`}>
                           <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0">
                               {item.product?.images[0] && <img src={item.product.images[0]} className="w-full h-full object-cover"/>}
                           </div>
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900">{item.product?.title || "Видалений товар"}</h3>
                               
                               {/* ОПЦІЇ АПГРЕЙДУ */}
                               {item.selectedOptions && item.selectedOptions.length > 0 && (
                                   <div className="flex flex-wrap gap-2 mt-2">
                                       {item.selectedOptions.map((opt: any, idx: number) => (
                                           <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg uppercase flex items-center gap-1">
                                               <Box className="w-3 h-3"/> {opt.label || opt}
                                           </span>
                                       ))}
                                   </div>
                               )}
                           </div>
                           <div className="text-right">
                               <p className="font-black text-xl text-slate-900">${Number(item.price)}</p>
                               <p className="text-xs text-slate-400">x{item.quantity}</p>
                           </div>
                       </div>
                   ))}
                   
                   {/* ПІДСУМОК */}
                   <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                       <span className="font-bold text-slate-500 uppercase text-sm">Всього до сплати</span>
                       <span className="font-black text-3xl text-slate-900">${Number(order.total)}</span>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* КЛІЄНТ */}
          <div className="space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-blue-50">
                <CardHeader className="bg-blue-50/30 border-b border-blue-50">
                    <CardTitle className="flex items-center gap-2 text-blue-900"><User className="w-5 h-5"/> Клієнт</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">Контакт</p>
                       <p className="font-bold text-lg text-slate-900">{order.customerName}</p>
                       <div className="flex items-center gap-2 mt-1">
                           <Phone className="w-4 h-4 text-slate-400"/>
                           <a href={`tel:${order.phone}`} className="text-sm font-bold text-blue-600 hover:underline">{order.phone}</a>
                       </div>
                   </div>
                   
                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-2">Доставка</p>
                       <div className="flex gap-3 items-start">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-slate-500"/></div>
                           <div>
                               <p className="font-medium text-slate-900 text-sm">{order.city || "Не вказано"}</p>
                               <p className="text-xs text-slate-500 mt-1">{order.warehouse}</p>
                           </div>
                       </div>
                   </div>
                </CardContent>
             </Card>
          </div>

       </div>
    </div>
  )
}