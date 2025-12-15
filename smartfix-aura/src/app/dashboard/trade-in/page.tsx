import db from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { RefreshCw, Laptop, Smartphone, Tablet, Watch, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"
import { StatusTabs } from "@/components/admin/StatusTabs"

const getIcon = (type: string) => {
    if (type.includes("macbook") || type.includes("laptop")) return Laptop
    if (type.includes("ipad")) return Tablet
    if (type.includes("watch")) return Watch
    return Smartphone
}

export default async function TradeInAdminPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status
  const whereClause = statusFilter ? { status: statusFilter } : {}

  const requests = await db.tradeInRequest.findMany({ 
      where: whereClause,
      orderBy: { createdAt: "desc" } 
  })

  const TABS = [
      { value: "NEW", label: "Нові" },
      { value: "EVALUATING", label: "Оцінка" },
      { value: "CONFIRMED", label: "Підтверджено" },
      { value: "COMPLETED", label: "Куплено" }
  ]

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><RefreshCw className="w-6 h-6" /></div>
            <div><h1 className="text-3xl font-black text-slate-900">Trade-In</h1><p className="text-slate-500">Викуп техніки ({requests.length})</p></div>
        </div>
      </div>

      <StatusTabs options={TABS} />

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => {
            const Icon = getIcon(req.model.toLowerCase())
            return (
            <Link key={req.id} href={`/dashboard/trade-in/${req.id}`}>
                <Card className="border-slate-200 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-emerald-300">
                    <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 overflow-hidden">
                            {req.images && req.images.length > 0 ? (
                                <img src={req.images[0]} className="w-full h-full object-cover" />
                            ) : <Icon className="w-8 h-8 text-emerald-400"/>}
                        </div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{req.model}</h3>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1 text-sm text-slate-500">
                                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{req.storage}</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-medium">{req.condition}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 mt-2">
                                <User className="w-3 h-3"/> {req.name}
                                <span>•</span>
                                {formatDistanceToNow(new Date(req.createdAt), {addSuffix: true, locale: uk})}
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <ActivityStatusWrapper id={req.id} type="TRADE" currentStatus={req.status} />
                        </div>
                    </div>
                </Card>
            </Link>
        )})}
        {requests.length === 0 && <p className="text-slate-400 text-center py-10">Заявок немає</p>}
      </div>
    </div>
  )
}