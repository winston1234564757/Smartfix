import db from "@/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Wrench, RefreshCw, Search, LogOut, Package, Clock, CheckCircle2, Truck, DollarSign, Image as ImageIcon, MapPin } from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

// --- STATUS CONFIGURATIONS ---

const REPAIR_STEPS = [
    { id: "NEW", label: "Прийнято" },
    { id: "DIAGNOSTIC", label: "Діагностика" },
    { id: "IN_WORK", label: "В роботі" },
    { id: "READY", label: "Готово" },
    { id: "DONE", label: "Видано" },
]

const ORDER_STEPS = [
    { id: "PENDING", label: "Обробка" },
    { id: "CONFIRMED", label: "Підтверджено" },
    { id: "SENT", label: "Відправлено" },
    { id: "DONE", label: "Виконано" },
]

const TRADE_STEPS = [
    { id: "NEW", label: "Заявка" },
    { id: "EVALUATING", label: "Оцінка" }, // Можна додати цей статус в ENUM пізніше
    { id: "CONFIRMED", label: "Узгоджено" },
    { id: "COMPLETED", label: "Викуплено" },
]

const REQUEST_STEPS = [
    { id: "NEW", label: "Заявка" },
    { id: "SEARCHING", label: "Пошук" },
    { id: "FOUND", label: "Знайдено" },
    { id: "COMPLETED", label: "Куплено" },
]

// --- HELPER COMPONENTS ---

function StatusTimeline({ currentStatus, steps, colorClass }: any) {
    const currentIndex = steps.findIndex((s: any) => s.id === currentStatus)
    const activeIndex = currentIndex === -1 ? 0 : currentIndex

    return (
        <div className="relative flex justify-between items-center my-6 px-2">
            <div className="absolute top-3 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full">
                <div className={`h-full transition-all duration-500 rounded-full ${colorClass}`} style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
            </div>
            {steps.map((step: any, index: number) => {
                const isActive = index <= activeIndex
                return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`w-7 h-7 rounded-full border-4 flex items-center justify-center bg-white ${isActive ? `border-${colorClass.split("-")[1]}-500` : "border-slate-200"}`}>
                            {isActive && <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>}
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isActive ? "text-slate-800" : "text-slate-300"}`}>{step.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default async function ProfilePage() {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId) redirect("/")

  const orders = await db.order.findMany({ where: { userId }, include: { products: true }, orderBy: { createdAt: "desc" } })
  const repairs = await db.repairOrder.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  const requests = await db.productRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  const tradeIns = await db.tradeInRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 min-h-screen">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
                {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover"/> : user?.firstName?.[0]}
             </div>
             <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-slate-900">Привіт, {user?.firstName}!</h1>
                <p className="text-slate-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
             </div>
          </div>
          <SignOutButton>
             <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2"/> Вийти
             </Button>
          </SignOutButton>
       </div>

       {/* TABS */}
       <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full justify-start h-14 bg-white rounded-[1.5rem] p-1 border border-slate-100 shadow-sm mb-8 overflow-x-auto scrollbar-hide">
             <TabsTrigger value="orders" className="rounded-xl h-11 px-6 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white gap-2">
                <ShoppingBag className="w-4 h-4"/> <span className="hidden sm:inline">Замовлення</span>
             </TabsTrigger>
             <TabsTrigger value="repairs" className="rounded-xl h-11 px-6 font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2">
                <Wrench className="w-4 h-4"/> <span className="hidden sm:inline">Ремонти</span>
             </TabsTrigger>
             <TabsTrigger value="requests" className="rounded-xl h-11 px-6 font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white gap-2">
                <Search className="w-4 h-4"/> <span className="hidden sm:inline">Підбір</span>
             </TabsTrigger>
             <TabsTrigger value="tradein" className="rounded-xl h-11 px-6 font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white gap-2">
                <RefreshCw className="w-4 h-4"/> <span className="hidden sm:inline">Trade-In</span>
             </TabsTrigger>
          </TabsList>

          {/* 1. ЗАМОВЛЕННЯ (ORDERS) */}
          <TabsContent value="orders" className="space-y-4">
             {orders.length === 0 && <EmptyState icon={ShoppingBag} text="У вас ще немає замовлень" />}
             {orders.map(order => (
                <Dialog key={order.id}>
                    <DialogTrigger asChild>
                        <Card className="border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg cursor-pointer transition-all group">
                           <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                              <div className="flex gap-4 items-center">
                                 <span className="font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                                 <span className="text-sm text-slate-500 hidden sm:inline">{format(new Date(order.createdAt), "d MMMM yyyy", { locale: uk })}</span>
                              </div>
                              <Badge variant="outline" className="bg-white">{order.status}</Badge>
                           </div>
                           <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                        {order.products.slice(0,3).map(p => (
                                            <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                                {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover"/>}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 ml-2">
                                        {order.products.length} {order.products.length === 1 ? "товар" : "товари"}
                                    </span>
                                </div>
                                <span className="font-black text-xl text-slate-900">${Number(order.total)}</span>
                           </div>
                        </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-slate-900 p-6 text-white sticky top-0 z-10">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                    <ShoppingBag className="w-6 h-6 text-slate-400"/> Замовлення #{order.id.slice(-6).toUpperCase()}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Оформлено {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: uk })}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2"><Clock className="w-4 h-4"/> Статус</h4>
                                <StatusTimeline currentStatus={order.status} steps={ORDER_STEPS} colorClass="bg-blue-500" />
                            </div>
                            
                            <div className="space-y-3">
                                {order.products.map(p => (
                                    <div key={p.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                            {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover"/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{p.color} • {p.grade}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">${Number(p.price)}</p>
                                        </div>
                                    </div>
                                ))}
                                {(order as any).warrantyType === "EXTENDED" && (
                                    <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                                        <span className="text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Розширена гарантія (+1 Рік)</span>
                                        <span className="font-bold">+${Number((order as any).warrantyPrice)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Доставка</p>
                                    <div className="flex items-start gap-2 text-sm text-slate-700">
                                        <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"/>
                                        <span>{order.city}, {order.warehouse}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Всього до сплати</p>
                                    <p className="text-3xl font-black text-slate-900">${Number(order.total)}</p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
             ))}
          </TabsContent>

          {/* 2. РЕМОНТИ (REPAIRS) */}
          <TabsContent value="repairs" className="space-y-4">
             {repairs.length === 0 && <EmptyState icon={Wrench} text="Історія ремонтів порожня" />}
             {repairs.map(repair => (
                <Dialog key={repair.id}>
                    <DialogTrigger asChild>
                        <Card className="border-orange-200 bg-orange-50/20 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-orange-400 transition-all group">
                            <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">РЕМОНТ</Badge>
                                        <span className="text-sm text-slate-500">{format(new Date(repair.createdAt), "d MMM", { locale: uk })}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">{repair.deviceName}</h3>
                                    <p className="text-slate-600 font-medium text-sm">{repair.serviceName}</p>
                                </div>
                                <div className="text-right self-end md:self-auto">
                                    <Badge className="bg-slate-900 text-white mb-2">{repair.status}</Badge>
                                    <p className="font-black text-xl text-orange-600">${Number(repair.price)}</p>
                                </div>
                            </div>
                        </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden">
                        <div className="bg-orange-600 p-6 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                    <Wrench className="w-6 h-6 text-orange-200"/> {repair.deviceName}
                                </DialogTitle>
                                <DialogDescription className="text-orange-100">
                                    Сервісна заявка від {format(new Date(repair.createdAt), "d MMMM yyyy", { locale: uk })}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-2">Статус ремонту</h4>
                                <StatusTimeline currentStatus={repair.status} steps={REPAIR_STEPS} colorClass="bg-orange-500" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <span className="font-medium text-slate-700">{repair.serviceName}</span>
                                <span className="font-black text-xl text-slate-900">${Number(repair.price)}</span>
                            </div>
                            {repair.images && repair.images.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Фотозвіт</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {repair.images.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={img} className="w-full h-full object-cover"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
             ))}
          </TabsContent>

          {/* 3. ПОШУК (REQUESTS) */}
          <TabsContent value="requests" className="space-y-4">
             {requests.length === 0 && <EmptyState icon={Search} text="Ви ще нічого не шукали" />}
             {requests.map(req => (
                <Dialog key={req.id}>
                    <DialogTrigger asChild>
                        <Card className="border-indigo-200 bg-indigo-50/20 rounded-2xl cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all">
                           <div className="p-6 flex justify-between items-center">
                              <div>
                                 <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500"/> {req.targetProduct}</h3>
                                 <p className="text-slate-500 text-sm mt-1">Бюджет: {req.budget}</p>
                              </div>
                              <Badge className="bg-indigo-600">{req.status}</Badge>
                           </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-[2rem] p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-indigo-900">Запит на підбір</DialogTitle>
                        </DialogHeader>
                        <StatusTimeline currentStatus={req.status} steps={REQUEST_STEPS} colorClass="bg-indigo-500" />
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Ціль:</span> <span className="font-bold">{req.targetProduct}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Бюджет:</span> <span className="font-bold">{req.budget}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Памʼять:</span> <span className="font-bold">{req.desiredStorage || "-"}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Колір:</span> <span className="font-bold">{req.desiredColor || "-"}</span></div>
                        </div>
                    </DialogContent>
                </Dialog>
             ))}
          </TabsContent>

          {/* 4. TRADE-IN */}
          <TabsContent value="tradein" className="space-y-4">
             {tradeIns.length === 0 && <EmptyState icon={RefreshCw} text="Заявок на обмін немає" />}
             {tradeIns.map(item => (
                <Dialog key={item.id}>
                    <DialogTrigger asChild>
                        <Card className="border-emerald-200 bg-emerald-50/20 rounded-2xl cursor-pointer hover:shadow-lg hover:border-emerald-400 transition-all">
                           <div className="p-6 flex justify-between items-center">
                              <div>
                                 <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw className="w-4 h-4 text-emerald-600"/> {item.model}</h3>
                                 <p className="text-slate-500 text-sm mt-1">{item.storage} • {item.condition}</p>
                              </div>
                              <Badge className="bg-emerald-600">{item.status}</Badge>
                           </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-[2rem] p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-emerald-900">Заявка Trade-In</DialogTitle>
                        </DialogHeader>
                        <StatusTimeline currentStatus={item.status} steps={TRADE_STEPS} colorClass="bg-emerald-600" />
                        <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 flex gap-4">
                            {item.images[0] ? (
                                <img src={item.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-100"/>
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-300"><ImageIcon className="w-8 h-8"/></div>
                            )}
                            <div>
                                <h4 className="font-bold text-lg">{item.model}</h4>
                                <p className="text-sm text-slate-500">{item.storage}</p>
                                <Badge variant="outline" className="mt-2 border-emerald-200 text-emerald-700">{item.condition}</Badge>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
             ))}
          </TabsContent>

       </Tabs>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Icon className="w-10 h-10 mb-2 opacity-50"/>
            <p>{text}</p>
        </div>
    )
}