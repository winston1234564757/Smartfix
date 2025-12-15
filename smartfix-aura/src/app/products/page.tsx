import db from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Smartphone, Laptop, Tablet, Watch, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductFilters } from "@/components/admin/ProductFilters"
import { Prisma } from "@prisma/client"

const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case "LAPTOP": return Laptop
        case "TABLET": return Tablet
        case "WATCH": return Watch
        default: return Smartphone
    }
}

interface Props {
    searchParams: { 
        q?: string, 
        category?: string, 
        status?: string, 
        grade?: string,
        sort?: string,
        storage?: string,
        cpu?: string,
        ram?: string,
        color?: string
    }
}

export default async function ProductsPage({ searchParams }: Props) {
  // 1. Формуємо пошуковий запит
  const where: Prisma.ProductWhereInput = {}

  // Глобальний пошук (q)
  if (searchParams.q) {
      where.OR = [
          { title: { contains: searchParams.q, mode: "insensitive" } },
          { model: { contains: searchParams.q, mode: "insensitive" } },
          { slug: { contains: searchParams.q, mode: "insensitive" } }
      ]
  }

  // Точні фільтри (Selects)
  if (searchParams.category && searchParams.category !== "ALL") where.category = searchParams.category as any
  if (searchParams.status && searchParams.status !== "ALL") where.status = searchParams.status as any
  if (searchParams.grade && searchParams.grade !== "ALL") where.grade = searchParams.grade as any
  
  // Часткові збіги (Inputs)
  if (searchParams.storage && searchParams.storage !== "ALL") where.storage = { contains: searchParams.storage, mode: "insensitive" }
  if (searchParams.color) where.color = { contains: searchParams.color, mode: "insensitive" }
  if (searchParams.cpu) where.cpu = { contains: searchParams.cpu, mode: "insensitive" }
  if (searchParams.ram) where.ram = { contains: searchParams.ram, mode: "insensitive" }

  // Сортування
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" }
  if (searchParams.sort === "price_asc") orderBy = { price: "asc" }
  if (searchParams.sort === "price_desc") orderBy = { price: "desc" }

  const products = await db.product.findMany({ where, orderBy })

  return (
    <div className="max-w-[1600px] mx-auto p-6 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
             <Link href="/dashboard">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
             </Link>
             <div>
                <h1 className="text-3xl font-black text-slate-900">Склад</h1>
                <p className="text-slate-500">Управління товарами ({products.length})</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <Link href="/products/new">
                  <Button className="rounded-xl bg-slate-900 hover:bg-indigo-600 font-bold h-12 shadow-lg shadow-slate-900/20">
                      <Plus className="w-5 h-5 mr-2"/> Додати товар
                  </Button>
              </Link>
          </div>
      </div>

      {/* FILTERS COMPONENT (Тепер тут живе і пошук, і фільтри) */}
      <ProductFilters />

      {/* LIST */}
      <div className="space-y-3">
        {products.map(p => {
            const Icon = getCategoryIcon(p.category)
            return (
                <Link key={p.id} href={`/products/${p.id}/edit`}>
                    <Card className="flex flex-col md:flex-row items-center p-3 gap-4 border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group">
                        
                        {/* PHOTO */}
                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                            {p.images[0] ? (
                                <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300"><Icon className="w-8 h-8"/></div>
                            )}
                            <div className="absolute top-1 left-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow-sm">
                                {p.grade}
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">{p.category}</Badge>
                                {p.status === "SOLD" && <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200">Продано</Badge>}
                                {p.status === "ON_REQUEST" && <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-200">Під запит</Badge>}
                                {p.status === "AVAILABLE" && <Badge className="bg-green-100 text-green-600 hover:bg-green-200">В наявності</Badge>}
                                {p.status === "RESERVED" && <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200">Резерв</Badge>}
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                            
                            <div className="text-sm text-slate-500 mt-1 flex flex-wrap justify-center md:justify-start gap-3 items-center">
                                {p.storage && <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-xs font-medium">{p.storage}</span>}
                                {p.color && <span>{p.color}</span>}
                                {p.cpu && <span className="text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">CPU: {p.cpu}</span>}
                                {p.ram && <span className="text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">RAM: {p.ram}</span>}
                            </div>
                        </div>

                        {/* FINANCIALS */}
                        <div className="flex flex-col items-center md:items-end gap-1 min-w-[120px] bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <span className="text-xl font-black text-slate-900">${Number(p.price)}</span>
                            {Number(p.purchaseCost) > 0 && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Вхід: ${Number(p.purchaseCost)}
                                </span>
                            )}
                        </div>

                    </Card>
                </Link>
            )
        })}
        {products.length === 0 && <div className="text-center py-20 text-slate-400"><Package className="w-12 h-12 mx-auto mb-2 opacity-50"/><p>Товарів не знайдено</p></div>}
      </div>
    </div>
  )
}