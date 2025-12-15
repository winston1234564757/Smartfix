import db from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { User, Phone, Wrench, ArrowLeft, LayoutDashboard, Image as ImageIcon, CheckCircle2, Plus } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"
import { AddRepairPhotoBtn } from "@/components/admin/RepairPhotos" // Placeholder interaction if needed

interface Props { params: { id: string } }

export default async function RepairDetailsPage({ params }: Props) {
  const { id } = await params
  const repair = await db.repairOrder.findUnique({ where: { id } })

  if (!repair) return notFound()

  // Парсимо JSON addons безпечно
  const addons = (repair.addons as any[]) || []

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/repair">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                    {repair.deviceName}
                </h1>
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    ID: {repair.id.slice(-6).toUpperCase()} • {format(new Date(repair.createdAt), "d MMMM, HH:mm", { locale: uk })}
                </span>
             </div>
          </div>
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
             <ActivityStatusWrapper id={repair.id} type="REPAIR" currentStatus={repair.status} />
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛІВА ЧАСТИНА: Технічні деталі */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* КАРТКА РОБІТ */}
             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900"><Wrench className="w-5 h-5 text-indigo-600"/> Перелік робіт</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-100">
                       {/* Основна послуга */}
                       <div className="p-5 flex justify-between items-center bg-white">
                           <div>
                               <Badge variant="outline" className="mb-2 border-indigo-200 text-indigo-700 bg-indigo-50">Основна послуга</Badge>
                               <p className="font-bold text-lg text-slate-900">{repair.serviceName}</p>
                           </div>
                           <div className="text-right">
                               <p className="font-black text-xl text-slate-900"></p>
                               {/* Ціна основної послуги вираховується як (Total - AddonsTotal), але ми спростимо відображення */}
                           </div>
                       </div>

                       {/* Додаткові послуги (Addons) */}
                       {addons.length > 0 && (
                           <div className="bg-slate-50/50 p-5 space-y-3">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                   <Plus className="w-3 h-3"/> Додаткові послуги
                               </p>
                               {addons.map((addon: any, idx: number) => (
                                   <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                       <div className="flex items-center gap-3">
                                           <CheckCircle2 className="w-5 h-5 text-green-500"/>
                                           <span className="font-medium text-slate-700">{addon.label}</span>
                                       </div>
                                       <span className="font-bold text-indigo-600">+${addon.price}</span>
                                   </div>
                               ))}
                           </div>
                       )}

                       {/* Підсумок */}
                       <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                           <span className="font-medium text-slate-400">Загальна вартість</span>
                           <span className="font-black text-3xl">${Number(repair.price)}</span>
                       </div>
                   </div>
                </CardContent>
             </Card>

             {/* НОТАТКИ МАЙСТРА */}
             <Card className="rounded-[2rem] border-slate-200 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-slate-400 font-bold">Внутрішні нотатки</CardTitle></CardHeader>
                <CardContent>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-900 font-medium min-h-[80px]">
                        {repair.internalNotes || "Нотаток немає. Додайте інформацію про стан пристрою..."}
                    </div>
                </CardContent>
             </Card>

             {/* ФОТОЗВІТ */}
             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-slate-400"/> Фото пристрою</CardTitle>
                    {/* Тут може бути кнопка завантаження */}
                </CardHeader>
                <CardContent className="p-6">
                    {repair.images && repair.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {repair.images.map((img, i) => (
                                <a key={i} href={img} target="_blank" className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in shadow-sm hover:shadow-md transition-all">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50"/>
                            <span className="text-sm font-medium">Фото не додано</span>
                        </div>
                    )}
                </CardContent>
             </Card>
          </div>

          {/* ПРАВА ЧАСТИНА: Клієнт */}
          <div className="space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-indigo-500/5 sticky top-6">
                <CardHeader className="bg-indigo-50/50 border-b border-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-indigo-900"><User className="w-5 h-5"/> Клієнт</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl">
                           {repair.customerName.charAt(0)}
                       </div>
                       <div>
                           <p className="text-xs text-slate-400 font-bold uppercase">Імʼя</p>
                           <p className="font-bold text-lg text-slate-900">{repair.customerName}</p>
                       </div>
                   </div>
                   
                   <Separator />

                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-2">Контакт</p>
                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <span className="font-bold text-slate-900">{repair.phone}</span>
                           <a href={`tel:${repair.phone}`} className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-md hover:scale-110">
                               <Phone className="w-4 h-4"/>
                           </a>
                       </div>
                   </div>

                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                       <p className="text-xs text-blue-600 font-bold uppercase mb-1">Статус оплати</p>
                       <p className="font-medium text-blue-900">Оплата при отриманні</p>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  )
}