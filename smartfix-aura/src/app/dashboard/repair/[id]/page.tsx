import db from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { User, Phone, Wrench, ArrowLeft, LayoutDashboard, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"

interface Props { params: { id: string } }

export default async function RepairDetailsPage({ params }: Props) {
  const { id } = await params
  const repair = await db.repairOrder.findUnique({ where: { id } })

  if (!repair) return notFound()

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/repair">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <Link href="/dashboard">
                <Button variant="ghost" className="rounded-xl gap-2 text-slate-500 hover:text-slate-900"><LayoutDashboard className="w-4 h-4"/> Дашборд</Button>
             </Link>
          </div>
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <ActivityStatusWrapper id={repair.id} type="REPAIR" currentStatus={repair.status} />
          </div>
       </div>

       <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{repair.deviceName}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
                Заявка від {format(new Date(repair.createdAt), "d MMMM yyyy, HH:mm", { locale: uk })}
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ЛІВА ЧАСТИНА */}
          <div className="lg:col-span-2 space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-orange-50/50 border-b border-orange-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-orange-900"><Wrench className="w-5 h-5"/> Деталі послуги</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                       <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Послуга</p><p className="font-bold text-lg text-slate-900">{repair.serviceName}</p></div>
                       <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Вартість</p><p className="font-black text-2xl text-orange-600">${Number(repair.price)}</p></div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-1">Собівартість / Деталі</p>
                       <p className="font-medium text-slate-700">${Number(repair.cost)}</p>
                   </div>
                </CardContent>
             </Card>

             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-slate-400"/> Фотозвіт</CardTitle></CardHeader>
                <CardContent>
                    {repair.images && repair.images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {repair.images.map((img, i) => (
                                <a key={i} href={img} target="_blank" className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                </a>
                            ))}
                        </div>
                    ) : <div className="h-32 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">Фото не додано</div>}
                </CardContent>
             </Card>
          </div>

          {/* ПРАВА ЧАСТИНА */}
          <div className="space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-orange-50">
                <CardHeader className="bg-orange-50/30 border-b border-orange-50"><CardTitle className="flex items-center gap-2 text-orange-900"><User className="w-5 h-5"/> Клієнт</CardTitle></CardHeader>
                <CardContent className="space-y-6 pt-6">
                   <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Імʼя</p><p className="font-bold text-lg text-slate-900">{repair.customerName}</p></div>
                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-2">Телефон</p>
                       <div className="flex items-center gap-3">
                           <p className="font-black text-2xl text-slate-900">{repair.phone}</p>
                           <a href={`tel:${repair.phone}`} className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"><Phone className="w-5 h-5"/></a>
                       </div>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  )
}