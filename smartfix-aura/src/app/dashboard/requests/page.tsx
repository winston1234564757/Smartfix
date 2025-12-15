import db from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Search, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"
import { StatusTabs } from "@/components/admin/StatusTabs"

export default async function RequestsPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status
  const whereClause = statusFilter ? { status: statusFilter } : {}

  const requests = await db.productRequest.findMany({ 
      where: whereClause,
      include: { offeredProduct: true }, 
      orderBy: { createdAt: "desc" } 
  })

  const TABS = [
      { value: "NEW", label: "Нові" },
      { value: "SEARCHING", label: "В пошуку" },
      { value: "FOUND", label: "Знайдено" },
      { value: "COMPLETED", label: "Виконано" }
  ]

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Search className="w-6 h-6" /></div>
            <div><h1 className="text-3xl font-black text-slate-900">Запити на пошук</h1><p className="text-slate-500">Підбір техніки ({requests.length})</p></div>
        </div>
      </div>

      <StatusTabs options={TABS} />

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => (
            <Link key={req.id} href={`/dashboard/requests/${req.id}`}>
                <Card className="border-slate-200 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-indigo-300">
                    <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden">
                            {req.offeredProduct && req.offeredProduct.images[0] ? (
                                <img src={req.offeredProduct.images[0]} className="w-full h-full object-cover" />
                            ) : <Search className="w-8 h-8 text-indigo-400"/>}
                        </div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.targetProduct}</h3>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1 text-sm text-slate-500">
                                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Бюджет: {req.budget}</span>
                                {req.desiredStorage && <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{req.desiredStorage}</span>}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 mt-2">
                                <User className="w-3 h-3"/> {req.customerName}
                                <span>•</span>
                                {formatDistanceToNow(new Date(req.createdAt), {addSuffix: true, locale: uk})}
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <ActivityStatusWrapper id={req.id} type="REQ" currentStatus={req.status} />
                        </div>
                    </div>
                </Card>
            </Link>
        ))}
        {requests.length === 0 && <p className="text-slate-400 text-center py-10">Запитів немає</p>}
      </div>
    </div>
  )
}