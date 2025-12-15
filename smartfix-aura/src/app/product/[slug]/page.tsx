import db from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductGallery } from "@/components/shop/ProductGallery"
import { AddToCart } from "@/components/shop/AddToCart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, ShieldCheck, Truck, Database, Battery, RefreshCcw, Smartphone, Clock, Search, Info } from "lucide-react"

interface Props { params: { slug: string } }

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug } })

  if (!product) return notFound()

  // --- FIX: SERIALIZATION ---
  // Перетворюємо Decimal на Number перед передачею в Client Components
  const serializedProduct = {
      ...product,
      price: Number(product.price),
      purchaseCost: Number(product.purchaseCost),
      repairCost: Number(product.repairCost)
  }

  const isPreOrder = product.status === "PRE_ORDER"
  const isOnRequest = product.status === "ON_REQUEST"
  const isSold = product.status === "SOLD"

  const checklist = (product.checklist as any) || {}
  
  const batteryHealth = checklist.batteryHealth || checklist.battery || null
  
  const gradeLabel = {
      "NEW": "Новий",
      "A_PLUS": "Ідеал (A+)",
      "A": "Гарний (A)",
      "B": "Середній (B)",
      "C": "Уцінка (C)",
      "D": "На запчастини"
  }[product.grade] || product.grade

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* GALLERY */}
          <div>
             <div className="sticky top-24">
                 <ProductGallery images={product.images} />
             </div>
          </div>

          {/* INFO */}
          <div className="space-y-8">
             <div>
                <div className="flex flex-wrap gap-2 mb-4">
                   <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {gradeLabel}
                   </Badge>
                   {isPreOrder && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-3 py-1 rounded-full text-xs font-bold uppercase"><Clock className="w-3 h-3 mr-1"/> Передзамовлення</Badge>}
                   {isOnRequest && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-3 py-1 rounded-full text-xs font-bold uppercase"><Search className="w-3 h-3 mr-1"/> Під запит</Badge>}
                   {isSold && <Badge className="bg-slate-100 text-slate-500 border-0 px-3 py-1 rounded-full text-xs font-bold uppercase">Продано</Badge>}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                   {product.title}
                </h1>
                
                {isOnRequest && (
                    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-xl mt-4 flex items-start gap-2 border border-blue-100">
                        <Info className="w-5 h-5 shrink-0"/>
                        <p>Цей товар доступний під індивідуальне замовлення. Ми знайдемо найкращий екземпляр для вас протягом 3-7 днів.</p>
                    </div>
                )}
             </div>

             <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                 <div className="flex items-end justify-between">
                     <div>
                        <p className="text-sm font-bold text-slate-400 uppercase mb-1">Ціна</p>
                        <div className="text-5xl font-black text-slate-900 tracking-tight">${Number(product.price)}</div>
                     </div>
                     {!isSold && (
                         <div className="flex flex-col items-end text-xs font-bold text-green-600 uppercase tracking-wide">
                             <span className="flex items-center gap-1"><Truck className="w-4 h-4"/> Безкоштовна доставка</span>
                         </div>
                     )}
                 </div>

                 <Separator />
                 
                 {/* КНОПКА ДОДАВАННЯ (Використовуємо serializedProduct) */}
                 <AddToCart product={serializedProduct} />

                 <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Гарантія 3 міс</span>
                     <span className="flex items-center gap-1.5"><RefreshCcw className="w-4 h-4"/> 14 днів обмін</span>
                 </div>
             </div>
            
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Database className="w-5 h-5"/></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Пам'ять</p><p className="font-bold text-slate-900">{product.storage}</p></div>
                 </div>
                 {batteryHealth && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500"><Battery className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Батарея</p><p className="font-bold text-slate-900">{batteryHealth}%</p></div>
                     </div>
                 )}
                 {product.color && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Smartphone className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Колір</p><p className="font-bold text-slate-900">{product.color}</p></div>
                     </div>
                 )}
             </div>

             {checklist && Object.keys(checklist).length > 0 && (
                 <div className="border-t border-slate-100 pt-8">
                     <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Check className="w-5 h-5 text-green-500"/> Перевірено SmartFix</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(checklist).map(([key, val]) => {
                            if (key === 'batteryHealth' || key === 'battery') return null
                            if (val === true || (typeof val === 'string' && val.length < 20)) {
                                return (
                                    <div key={key} className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <Check className="w-3.5 h-3.5 text-green-500"/> 
                                        {key === 'faceId' ? 'Face ID' : key === 'trueTone' ? 'True Tone' : key}
                                    </div>
                                )
                            }
                            return null
                        })}
                     </div>
                 </div>
             )}
             
             {product.description && (
                <div className="border-t border-slate-100 pt-8">
                   <h3 className="font-black text-xl mb-4">Опис</h3>
                   <div className="prose prose-slate text-slate-500 leading-relaxed max-w-none">
                       {product.description}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}