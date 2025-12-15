import db from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { 
  User, Phone, Smartphone, Image as ImageIcon, ArrowLeft, LayoutDashboard,
  Cpu, HardDrive, MemoryStick, Battery, Box, Plug, CheckCircle2, AlertCircle, Laptop, Watch, Tablet
} from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"

interface Props { params: { id: string } }

export default async function TradeInDetailsPage({ params }: Props) {
  const { id } = await params
  const request = await db.tradeInRequest.findUnique({ where: { id } })

  if (!request) return notFound()

  // --- ЛОГІКА ---
  const getDeviceIcon = () => {
      const m = request.model.toLowerCase()
      if (m.includes("macbook") || m.includes("laptop") || request.storage.includes("CPU")) return Laptop
      if (m.includes("ipad") || m.includes("tab")) return Tablet
      if (m.includes("watch")) return Watch
      return Smartphone
  }
  const DeviceIcon = getDeviceIcon()

  const specsRaw = request.storage.split(",").map(s => s.trim())
  const specs = specsRaw.map(spec => {
      if (spec.includes("CPU")) return { icon: Cpu, label: "Процесор", value: spec.replace("CPU:", "") }
      if (spec.includes("RAM")) return { icon: MemoryStick, label: "ОЗУ", value: spec.replace("RAM:", "") }
      if (spec.includes("GPU")) return { icon: CheckCircle2, label: "Відео", value: spec.replace("GPU:", "") }
      if (spec.includes("АКБ") || spec.includes("Battery")) return { icon: Battery, label: "Батарея", value: spec }
      if (spec.includes("GB") || spec.includes("TB")) return { icon: HardDrive, label: "Пам`ять", value: spec }
      return { icon: CheckCircle2, label: "Інше", value: spec }
  }).filter(s => s.value)

  const hasBox = request.model.includes("Коробка")
  const hasKit = request.model.includes("Зарядний") || request.model.includes("Зарядка")
  const cleanModelName = request.model.split("[")[0].split("(+")[0].trim()

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/trade-in">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <Link href="/dashboard">
                <Button variant="ghost" className="rounded-xl gap-2 text-slate-500 hover:text-slate-900"><LayoutDashboard className="w-4 h-4"/> Дашборд</Button>
             </Link>
          </div>

          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <ActivityStatusWrapper id={request.id} type="TRADE" currentStatus={request.status} />
          </div>
       </div>

       <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Заявка #{request.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
                Створено {format(new Date(request.createdAt), "d MMMM yyyy, HH:mm", { locale: uk })}
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <DeviceIcon className="w-5 h-5 text-indigo-600"/> {cleanModelName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   {specs.length > 0 && (
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                           {specs.map((spec, i) => (
                               <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                       <spec.icon className="w-5 h-5"/>
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase">{spec.label}</p>
                                       <p className="font-bold text-slate-900 text-sm leading-tight">{spec.value}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                   {(hasBox || hasKit) && (
                       <div>
                           <p className="text-xs font-bold text-slate-400 uppercase mb-3">Комплектація</p>
                           <div className="flex gap-3">
                               {hasBox && <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-sm"><Box className="w-4 h-4"/> Коробка</div>}
                               {hasKit && <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-sm"><Plug className="w-4 h-4"/> Зарядка</div>}
                           </div>
                       </div>
                   )}
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-2 mb-2">
                           <AlertCircle className="w-4 h-4 text-orange-500"/>
                           <p className="text-xs font-bold text-slate-500 uppercase">Стан (Зі слів клієнта)</p>
                       </div>
                       <div className="flex flex-wrap gap-2 items-center">
                           <Badge variant="outline" className="bg-white text-base py-1 px-3 border-orange-200 text-orange-800 shadow-sm">{request.condition}</Badge>
                       </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-slate-400"/> Фотозвіт клієнта</CardTitle></CardHeader>
                <CardContent>
                    {request.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {request.images.map((img, i) => (
                                <a key={i} href={img} target="_blank" className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in shadow-sm hover:shadow-md transition-all">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-20"/>
                            <p className="text-sm">Клієнт не додав фото</p>
                        </div>
                    )}
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-indigo-100">
                <CardHeader className="bg-indigo-50/30 border-b border-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-indigo-900"><User className="w-5 h-5"/> Контакти</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">{request.name[0]}</div>
                       <div><p className="text-xs text-slate-400 font-bold uppercase">Ім`я</p><p className="font-bold text-lg text-slate-900">{request.name}</p></div>
                   </div>
                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-2">Телефон</p>
                       <div className="flex items-center gap-3">
                           <p className="font-black text-2xl text-slate-900">{request.phone}</p>
                           <a href={`tel:${request.phone}`} className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"><Phone className="w-5 h-5"/></a>
                       </div>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  )
}