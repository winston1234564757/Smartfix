import db from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Wrench, Hammer, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityStatusWrapper } from "@/components/admin/selectors/ActivityStatusWrapper"
import { StatusTabs } from "@/components/admin/StatusTabs"

export default async function RepairsAdminPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status
  const whereClause = statusFilter ? { status: statusFilter } : {}

  const repairs = await db.repairOrder.findMany({ 
      where: whereClause,
      orderBy: { createdAt: "desc" } 
  })

  const TABS = [
      { value: "NEW", label: "Нові" },
      { value: "DIAGNOSTIC", label: "Діагностика" },
      { value: "IN_WORK", label: "В роботі" },
      { value: "READY", label: "Готові" },
      { value: "DONE", label: "Видані" }
  ]

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Hammer className="w-6 h-6" /></div>
            <div><h1 className="text-3xl font-black text-slate-900">Ремонти</h1><p className="text-slate-500">Сервісний центр ({repairs.length})</p></div>
        </div>
      </div>

      <StatusTabs options={TABS} />

      <div className="grid grid-cols-1 gap-4">
        {repairs.map(repair => (
            <Link key={repair.id} href={`/dashboard/repair/${repair.id}`}>
                <Card className="border-slate-200 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-orange-300">
                    <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                        <div className="w-20 h-20 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-orange-100 overflow-hidden relative">
                            {repair.images && repair.images[0] ? (
                                <img src={repair.images[0]} className="w-full h-full object-cover"/>
                            ) : <Wrench className="w-8 h-8 text-orange-400"/>}
                        </div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{repair.deviceName}</h3>
                                <span className="text-sm font-black text-orange-600 bg-orange-50 px-2 rounded-lg border border-orange-100">${Number(repair.price)}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600">{repair.serviceName}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 mt-2">
                                <User className="w-3 h-3"/> {repair.customerName}
                                <span>•</span>
                                {formatDistanceToNow(new Date(repair.createdAt), {addSuffix: true, locale: uk})}
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <ActivityStatusWrapper id={repair.id} type="REPAIR" currentStatus={repair.status} />
                        </div>
                    </div>
                </Card>
            </Link>
        ))}
        {repairs.length === 0 && <p className="text-slate-400 text-center py-10">Ремонтів немає</p>}
      </div>
    </div>
  )
}