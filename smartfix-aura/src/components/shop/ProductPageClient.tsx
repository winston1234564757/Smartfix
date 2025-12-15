"use client"

import { ProductGallery } from "@/components/shop/ProductGallery"
import { AddToCart } from "@/components/shop/AddToCart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Check, ShieldCheck, Truck, Database, Battery, RefreshCcw, Smartphone, Clock, Search, Info, Cpu, MemoryStick, HardDrive, Monitor, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProductPageClientProps {
  product: any
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter()
  
  // DEBUG LOGGING
  useEffect(() => {
      console.log("🔥 PRODUCT DEBUG:", product.title, "| STATUS:", product.status)
  }, [product])

  // --- ЛОГІКА СТАТУСІВ ---
  const status = product.status || "AVAILABLE"
  
  const isAvailable = status === "AVAILABLE"
  const isPreOrder = status === "PRE_ORDER"
  const isOnRequest = status === "ON_REQUEST"
  const isSold = status === "SOLD"
  const isReserved = status === "RESERVED"

  // Головна умова: Чи показувати кнопку заявки?
  // Якщо НЕ (в наявності АБО передзамовлення) -> Значить це ЗАЯВКА
  const showRequestButton = !isAvailable && !isPreOrder

  const checklist = product.checklist || {}
  const batteryHealth = checklist.batteryHealth || checklist.battery || product.batteryHealth || null
  const isLaptop = product.category === "LAPTOP"
  
  const gradeLabel = {
      "NEW": "Новий",
      "A_PLUS": "Ідеал (A+)",
      "A": "Гарний (A)",
      "B": "Середній (B)",
      "C": "Уцінка (C)",
      "D": "На запчастини"
  }[product.grade as string] || product.grade

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
                   {isReserved && <Badge className="bg-orange-100 text-orange-600 border-0 px-3 py-1 rounded-full text-xs font-bold uppercase"><Lock className="w-3 h-3 mr-1"/> В резерві</Badge>}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                   {product.title}
                </h1>
                
                {/* ПОВІДОМЛЕННЯ ДЛЯ КЛІЄНТА */}
                {showRequestButton && (
                    <div className="bg-slate-50 text-slate-600 text-sm p-5 rounded-2xl mt-4 flex items-start gap-4 border border-slate-200 shadow-sm">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                            <Info className="w-6 h-6 text-indigo-500"/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-base mb-1">
                                {isSold ? "Цей екземпляр вже продано" : isReserved ? "Товар зараз в резерві" : "Доступно під індивідуальне замовлення"}
                            </p>
                            <p className="leading-relaxed">
                                Ми знайдемо для вас такий самий (або кращий) за {2-5} днів. Натисніть кнопку нижче.
                            </p>
                        </div>
                    </div>
                )}
             </div>

             <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200/60 space-y-6">
                 <div className="flex items-end justify-between">
                     <div>
                        <p className="text-sm font-bold text-slate-400 uppercase mb-1">Ціна</p>
                        <div className="text-5xl font-black text-slate-900 tracking-tight">${Number(product.price)}</div>
                     </div>
                     {!showRequestButton && (
                         <div className="flex flex-col items-end text-xs font-bold text-green-600 uppercase tracking-wide">
                             <span className="flex items-center gap-1"><Truck className="w-4 h-4"/> Безкоштовна доставка</span>
                         </div>
                     )}
                 </div>

                 <Separator className="bg-slate-200"/>
                 
                 {/* --- ГОЛОВНА ЛОГІКА КНОПОК --- */}
                 {showRequestButton ? (
                     <Button 
                        size="lg" 
                        className={`w-full h-16 rounded-2xl text-xl font-bold shadow-xl text-white transition-all active:scale-95 ${
                            isReserved ? "bg-orange-600 hover:bg-orange-700" :
                            isOnRequest ? "bg-blue-600 hover:bg-blue-700" :
                            "bg-slate-900 hover:bg-indigo-600"
                        }`}
                        onClick={() => router.push(`/request/${product.slug}`)}
                     >
                        <RefreshCcw className="mr-3 h-6 w-6" />
                        {isReserved ? "Стати в чергу / Підібрати" : isOnRequest ? "Замовити пошук" : "Замовити схожий"}
                     </Button>
                 ) : (
                     <AddToCart product={product} />
                 )}

                 <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Гарантія 3 міс</span>
                     <span className="flex items-center gap-1.5"><RefreshCcw className="w-4 h-4"/> 14 днів обмін</span>
                 </div>
             </div>
            
             {/* SPECS GRID */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Database className="w-5 h-5"/></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Пам''ять</p><p className="font-bold text-slate-900 line-clamp-1">{product.storage}</p></div>
                 </div>
                 
                 {product.color && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Smartphone className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Колір</p><p className="font-bold text-slate-900">{product.color}</p></div>
                     </div>
                 )}

                 {product.cpu && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><Cpu className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Процесор</p><p className="font-bold text-slate-900 line-clamp-1">{product.cpu}</p></div>
                     </div>
                 )}
                 {product.ram && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><MemoryStick className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">ОЗУ</p><p className="font-bold text-slate-900">{product.ram}</p></div>
                     </div>
                 )}
                 {product.screenSize && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Monitor className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Дисплей</p><p className="font-bold text-slate-900">{product.screenSize}"</p></div>
                     </div>
                 )}

                 {batteryHealth && (
                     <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500"><Battery className="w-5 h-5"/></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Батарея</p><p className="font-bold text-slate-900">{batteryHealth.includes('%') ? batteryHealth : batteryHealth + '%'}</p></div>
                     </div>
                 )}
             </div>

             {/* CHECKLIST */}
             {checklist && Object.keys(checklist).length > 0 && (
                 <div className="border-t border-slate-100 pt-8">
                     <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Check className="w-5 h-5 text-green-500"/> Перевірено SmartFix</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(checklist).map(([key, val]) => {
                            if (key === 'batteryHealth' || key === 'battery') return null
                            if (val && val !== "false" && typeof val === 'string') {
                                return (
                                    <div key={key} className="flex flex-col bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{key}</span>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Check className="w-3.5 h-3.5 text-green-500"/> 
                                            {val === "true" || val === "OK" ? "ОК" : val}
                                        </div>
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