import db from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { User, Phone, Search, ArrowLeft, CheckCircle2, Package, X, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { attachProductToRequest, detachProductFromRequest, completeRequest } from "@/app/actions/request-admin-actions"
import { ProductSelector } from "@/components/admin/ProductSelector"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"

interface Props { params: { id: string } }

export default async function RequestDetailsPage({ params }: Props) {
  const { id } = await params
  
  const req = await db.productRequest.findUnique({ 
      where: { id },
      include: { offeredProduct: true }
  })

  if (!req) return notFound()

  const availableProducts = await db.product.findMany({
      where: { status: "AVAILABLE" },
      select: { id: true, title: true, price: true, images: true, grade: true }
  })

  async function onAttach(productId: string) {
      "use server"
      await attachProductToRequest(req!.id, productId)
  }
  
  async function onDetach() {
      "use server"
      await detachProductFromRequest(req!.id)
  }

  async function onComplete() {
      "use server"
      await completeRequest(req!.id)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
       
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/requests">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <Link href="/dashboard">
                <Button variant="ghost" className="rounded-xl gap-2 text-slate-500 hover:text-slate-900"><LayoutDashboard className="w-4 h-4"/> Дашборд</Button>
             </Link>
          </div>
          
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <ActivityStatusWrapper id={req.id} type="REQ" currentStatus={req.status} />
          </div>
       </div>

       <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Запит #{req.id.slice(-6).toUpperCase()}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
                {format(new Date(req.createdAt), "d MMMM yyyy, HH:mm", { locale: uk })}
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[2rem] border-slate-200 h-fit">
             <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-indigo-900"><Search className="w-5 h-5"/> Що шукаємо?</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Цільовий пристрій</p><p className="text-2xl font-black text-slate-900">{req.targetProduct}</p></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase">Бюджет</p><p className="font-bold text-slate-900">{req.budget}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase">Пам`ять</p><p className="font-bold text-slate-900">{req.desiredStorage || "-"}</p></div>
                </div>
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">{req.customerName[0]}</div>
                        <div><p className="font-bold text-slate-900">{req.customerName}</p><p className="text-sm text-slate-500">{req.phone}</p></div>
                        <a href={`tel:${req.phone}`} className="ml-auto"><Button size="sm" variant="outline" className="rounded-full"><Phone className="w-4 h-4"/></Button></a>
                    </div>
                </div>
             </CardContent>
          </Card>

          <Card className={`rounded-[2rem] border-2 h-fit transition-all ${req.offeredProduct ? "border-emerald-400 bg-emerald-50/10" : "border-dashed border-slate-300"}`}>
             <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-slate-900"><Package className="w-5 h-5"/> Пропозиція магазину</CardTitle></CardHeader>
             <CardContent className="p-6 pt-0">
                {req.offeredProduct ? (
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                {req.offeredProduct.images[0] && <img src={req.offeredProduct.images[0]} className="w-full h-full object-cover"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{req.offeredProduct.title}</h3>
                                <p className="mt-2 font-black text-xl text-emerald-600">${Number(req.offeredProduct.price)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <form action={onComplete} className="flex-1"><Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 rounded-xl"><CheckCircle2 className="w-5 h-5 mr-2"/> Клієнт купив</Button></form>
                            <form action={onDetach}><Button variant="destructive" className="w-12 h-12 rounded-xl p-0"><X className="w-5 h-5"/></Button></form>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400"><Search className="w-8 h-8"/></div>
                        <div><p className="font-bold text-slate-900">Товар ще не запропоновано</p><p className="text-sm text-slate-500">Оберіть товар зі складу</p></div>
                        <ProductSelector products={availableProducts} onSelect={onAttach} />
                    </div>
                )}
             </CardContent>
          </Card>
       </div>
    </div>
  )
}