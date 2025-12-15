import db from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ShoppingBag, DollarSign, TrendingUp, Activity,
  CheckCircle2, Clock, RefreshCw, Search, LayoutTemplate, ChevronRight, Wrench, Hammer, Package
} from "lucide-react"
import { formatDistanceToNow, subDays } from "date-fns"
import { uk } from "date-fns/locale"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"

// --- COMPONENTS ---
function NavCard({ title, count, icon: Icon, href, color, desc }: any) {
    return (
        <Link href={href} className="group h-full">
            <Card className="h-full border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white group-hover:scale-110 transition-transform`}><Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} /></div>
                        {count > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">+{count}</span>}
                    </div>
                    <div><h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">{title}</h3><p className="text-sm text-slate-500 mt-1">{desc}</p></div>
                </CardContent>
            </Card>
        </Link>
    )
}

function FinancialCard({ title, total, breakdown, icon: Icon, color }: any) {
    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white`}><Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} /></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p><h3 className="text-3xl font-black text-slate-900">${total.toLocaleString()}</h3></div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                    {breakdown.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs font-medium"><span className="text-slate-500">{item.label}</span><span className="text-slate-900 font-bold">${item.value.toLocaleString()}</span></div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default async function DashboardPage({ searchParams }: { searchParams: { period?: string } }) {
  const period = searchParams.period || "30d"
  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "6m" ? 180 : period === "1y" ? 365 : 30
  const dateFrom = subDays(new Date(), days)

  // DATA FETCHING
  const orders = await db.order.findMany({ 
      where: { createdAt: { gte: dateFrom } }, 
      include: { items: { include: { product: true } } }, 
      orderBy: { createdAt: "desc" } 
  })
  const repairs = await db.repairOrder.findMany({ where: { createdAt: { gte: dateFrom } }, orderBy: { createdAt: "desc" } })
  const tradeIns = await db.tradeInRequest.findMany({ where: { createdAt: { gte: dateFrom } }, orderBy: { createdAt: "desc" } })
  const requests = await db.productRequest.findMany({ where: { createdAt: { gte: dateFrom } }, orderBy: { createdAt: "desc" } })
  const products = await db.product.findMany()

  // COUNTERS & FINANCE
  const activeOrders = orders.filter(o => !["DONE", "CANCELED"].includes(o.status)).length
  const activeRepairs = repairs.filter(r => !["DONE", "CANCELED"].includes(r.status)).length
  const newTradeIns = tradeIns.filter(t => t.status === "NEW").length
  const newRequests = requests.filter(r => r.status === "NEW").length

  let revenueGoods = 0, profitGoods = 0
  let revenueService = 0, profitService = 0

  orders.forEach(o => {
      if (["DONE", "SENT", "CONFIRMED"].includes(o.status)) {
          revenueGoods += Number(o.total)
          let cost = 0; 
          o.items.forEach(item => { if (item.product) cost += Number(item.product.purchaseCost) + Number(item.product.repairCost) })
          profitGoods += (Number(o.total) - cost)
      }
  })

  repairs.forEach(r => {
      if (["DONE", "READY"].includes(r.status)) {
          revenueService += Number(r.price)
          profitService += (Number(r.price) - Number(r.cost))
      }
  })

  // MIXED HISTORY
  const history = [
      ...orders.map(o => ({ type: "ORDER", id: o.id, date: o.createdAt, title: `Замовлення #${o.id.slice(-6)}`, sub: o.customerName, status: o.status, price: Number(o.total) })),
      ...repairs.map(r => ({ type: "REPAIR", id: r.id, date: r.createdAt, title: `Ремонт: ${r.deviceName}`, sub: r.serviceName, status: r.status, price: Number(r.price) })),
      ...tradeIns.map(t => ({ type: "TRADE", id: t.id, date: t.createdAt, title: `Trade-In: ${t.model}`, sub: t.condition, status: t.status, price: 0 })),
      ...requests.map(r => ({ type: "REQ", id: r.id, date: r.createdAt, title: `Пошук: ${r.targetProduct}`, sub: r.budget, status: r.status, price: 0 }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

  // LINKS
  const getLink = (type: string, id: string) => {
      if (type === "ORDER") return `/dashboard/orders/${id}`
      if (type === "REPAIR") return `/dashboard/repair/${id}`
      if (type === "TRADE") return `/dashboard/trade-in/${id}`
      if (type === "REQ") return `/dashboard/requests/${id}`
      return "#"
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
       {/* HEADER & KPI */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
          <div><h1 className="text-4xl font-black text-slate-900">Дашборд</h1><p className="text-slate-500">Статистика за останні {days} днів</p></div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
             {["1d", "7d", "30d", "6m", "1y"].map(p => (
                 <Link key={p} href={`/dashboard?period=${p}`}>
                    <Button variant={period === p ? "default" : "ghost"} size="sm" className="rounded-lg h-8 text-xs font-bold bg-slate-900">{p === "1d" ? "День" : p === "7d" ? "Тиждень" : p === "30d" ? "Місяць" : p === "6m" ? "6 міс" : "Рік"}</Button>
                 </Link>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FinancialCard title="Загальна Виручка" total={revenueGoods + revenueService} icon={DollarSign} color="bg-emerald-600" breakdown={[{label: "Продаж товарів", value: revenueGoods}, {label: "Сервіс та послуги", value: revenueService}]} />
          <FinancialCard title="Чистий Прибуток" total={profitGoods + profitService} icon={TrendingUp} color="bg-indigo-600" breakdown={[{label: "Маржа з товарів", value: profitGoods}, {label: "Маржа з ремонту", value: profitService}]} />
          <FinancialCard title="Активність" total={activeOrders + activeRepairs + newTradeIns + newRequests} icon={Activity} color="bg-orange-500" breakdown={[{label: "Замовлення в роботі", value: activeOrders}, {label: "Ремонти в роботі", value: activeRepairs}, {label: "Нові заявки", value: newTradeIns + newRequests}]} />
       </div>

       <div>
           <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-slate-400"/> Розділи</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               <NavCard title="Замовлення" count={activeOrders} icon={ShoppingBag} href="/dashboard/orders" color="bg-blue-600" desc="Магазин" />
               <NavCard title="Ремонти" count={activeRepairs} icon={Hammer} href="/dashboard/repair" color="bg-red-500" desc="Сервіс" />
               <NavCard title="Trade-In" count={newTradeIns} icon={RefreshCw} href="/dashboard/trade-in" color="bg-indigo-500" desc="Викуп" />
               <NavCard title="Пошук" count={newRequests} icon={Search} href="/dashboard/requests" color="bg-orange-500" desc="Підбір" />
               <NavCard title="Прайс" count={0} icon={Wrench} href="/dashboard/services" color="bg-teal-600" desc="Налаштування" />
               <NavCard title="Склад" count={products.length} icon={Package} href="/products" color="bg-slate-600" desc="Товари" />
           </div>
       </div>

       {/* RECENT ACTIVITY */}
       <Card className="border-slate-200 shadow-sm">
           <CardHeader><CardTitle>Останні події</CardTitle></CardHeader>
           <CardContent>
               <div className="space-y-3">
                   {history.map((item, i) => (
                       <Link href={getLink(item.type, item.id)} key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-slate-100 group cursor-pointer">
                           <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-full text-white ${item.type === "ORDER" ? "bg-blue-500" : item.type === "REPAIR" ? "bg-red-500" : item.type === "TRADE" ? "bg-emerald-500" : "bg-indigo-500"}`}>
                                   {item.type === "ORDER" ? <ShoppingBag className="w-4 h-4"/> : item.type === "REPAIR" ? <Wrench className="w-4 h-4"/> : item.type === "TRADE" ? <RefreshCw className="w-4 h-4"/> : <Search className="w-4 h-4"/>}
                               </div>
                               <div>
                                   <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                   <p className="text-xs text-slate-500">{formatDistanceToNow(item.date, {locale: uk, addSuffix: true})} • {item.sub}</p>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-6">
                               {item.price > 0 && <p className="font-black text-slate-900 text-lg">${item.price}</p>}
                               <ActivityStatusWrapper id={item.id} type={item.type as any} currentStatus={item.status} />
                               <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 text-slate-400 group-hover:text-indigo-600">
                                   <ChevronRight className="w-5 h-5"/>
                               </Button>
                           </div>
                       </Link>
                   ))}
                   {history.length === 0 && <p className="text-center text-slate-400 py-10">Подій немає</p>}
               </div>
           </CardContent>
       </Card>
    </div>
  )
}