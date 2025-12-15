import { PromoGrid } from "@/components/shop/PromoGrid"
import db from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, Sparkles, Star, ArrowUpRight, Clock, RefreshCcw, ShoppingCart, Laptop, Cpu, MemoryStick, HardDrive } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// --- КАРТКА ТОВАРУ ---
function ProductCard({ product }: { product: any }) {
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Number(product.price))
  const isPreOrder = product.status === "PRE_ORDER"
  const isSold = product.status === "SOLD"
  const isLaptop = product.category === "LAPTOP"

  return (
    <Link href={`/product/${product.slug}`} className={`group h-full ${isSold ? 'opacity-80 grayscale-[0.2] hover:grayscale-0 hover:opacity-100' : ''}`}>
      <div className="bg-white rounded-[2.5rem] p-4 pb-6 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
        
        {/* ФОТО */}
        <div className="aspect-[4/5] relative bg-slate-50 rounded-[2rem] overflow-hidden mb-6">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
          ) : (
             <div className="flex items-center justify-center h-full text-slate-300">
                {isLaptop ? <Laptop className="w-12 h-12"/> : <Smartphone className="w-12 h-12"/>}
             </div>
          )}
          
          <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
             <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase">
                {product.grade?.replace("_", "+") || "USED"}
             </div>
             {isPreOrder && <div className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"><Clock className="w-3 h-3"/> PRE</div>}
             {isSold && <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">SOLD</div>}
          </div>
        </div>

        {/* ІНФО */}
        <div className="flex-1 flex flex-col justify-between px-2">
           <div>
               {/* ХАРАКТЕРИСТИКИ (ВИПРАВЛЕНО) */}
               <div className="mb-3 min-h-[20px]">
                  {isLaptop ? (
                      <div className="flex flex-wrap gap-2">
                        {/* Перевіряємо чи є дані, якщо немає - пишемо прочерк */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200">
                            <Cpu className="w-3 h-3 text-indigo-500"/> {product.cpu || '-'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200">
                            <MemoryStick className="w-3 h-3 text-indigo-500"/> {product.ram || '-'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200">
                            <HardDrive className="w-3 h-3 text-indigo-500"/> {product.storage}
                        </span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-2 opacity-60">
                        <span className="text-[10px] font-black uppercase tracking-wider">{product.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider">{product.storage}</span>
                      </div>
                  )}
               </div>
               
               <h3 className="font-black text-slate-900 text-xl leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">
                  {product.title}
               </h3>
           </div>

           <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
             <span className="font-black text-3xl text-slate-900 tracking-tight">{formattedPrice}</span>
             
             <div className={`h-12 px-5 rounded-full flex items-center gap-2 transition-all duration-300 shadow-md group-hover:scale-105 ${
                isSold ? "bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-white" :
                isPreOrder ? "bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white" : 
                "bg-indigo-600 text-white shadow-indigo-200 group-hover:bg-indigo-700"
             }`}>
               {isSold ? <RefreshCcw className="w-4 h-4" /> : isPreOrder ? <Clock className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
               <span className="font-bold text-sm whitespace-nowrap">
                  {isSold ? "Хочу" : isPreOrder ? "Замовити" : "Купити"}
               </span>
             </div>
           </div>
        </div>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const latestProductsRaw = await db.product.findMany({
    where: { status: { in: ["AVAILABLE", "PRE_ORDER", "SOLD"] } },
    orderBy: { createdAt: "desc" },
    take: 8 
  })

  // Сортування + Явне перетворення полів
  const latestProducts = latestProductsRaw.sort((a, b) => {
      const statusOrder = { "AVAILABLE": 1, "PRE_ORDER": 2, "SOLD": 3 } as any
      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
  }).slice(0, 4).map(p => ({
      ...p,
      price: Number(p.price),
      // ЯВНО ПРОКИДАЄМО CPU та RAM
      cpu: p.cpu,
      ram: p.ram
  }))

  const heroBanner = await db.promoBanner.findFirst({
    where: { size: "HERO" },
    orderBy: { id: "desc" }
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
       {/* HERO SECTION (Без змін) */}
       <section className="pt-8 pb-12 md:pt-12 md:pb-12 px-4">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="relative w-full aspect-square lg:aspect-[4/5] lg:h-[700px] rounded-[3rem] overflow-hidden bg-slate-900 border-4 border-white shadow-2xl shadow-indigo-500/20 order-2 lg:order-1 group">
                  {heroBanner ? (
                    <Link href={heroBanner.link} className="block w-full h-full relative">
                        <img src={heroBanner.image} alt={heroBanner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 p-10 w-full text-white">
                            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 leading-none">{heroBanner.title}</h3>
                            <p className="text-white/80 text-lg max-w-sm">{heroBanner.subtitle}</p>
                        </div>
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-full p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"><ArrowUpRight className="w-6 h-6" /></div>
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                            <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 mb-6" />
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Top Sales</h3>
                        </div>
                    </div>
                  )}
              </div>
              <div className="flex flex-col items-start text-left space-y-8 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                      <span className="text-sm font-bold text-slate-600 tracking-wide uppercase">Premium Resale Store</span>
                  </div>
                  <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      ТЕХНОЛОГІЇ.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ВІДРОДЖЕННЯ.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-500 max-w-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                      SmartFix Aura — це місце, де техніка отримує друге життя. Найкращі гаджети за розумною ціною.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                      <Link href="/catalog">
                          <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all">Дивитись каталог</Button>
                      </Link>
                      <Link href="/trade-in">
                          <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg border-2 bg-transparent hover:bg-white hover:border-slate-300 transition-all">Trade-In Оцінка</Button>
                      </Link>
                  </div>
              </div>
          </div>
       </section>

       <div className="relative z-20 mt-8">
          <div className="max-w-[1400px] mx-auto px-4 mb-6"><h2 className="text-2xl font-bold text-slate-900">Актуальні пропозиції</h2></div>
          <PromoGrid />
       </div>

       <div className="max-w-7xl mx-auto px-4 mt-24">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Свіжі надходження</h2>
                <p className="text-slate-500 mt-2">Тільки що перевірені та додані на вітрину</p>
             </div>
             <Link href="/catalog" className="hidden md:block">
                <Button variant="ghost" className="gap-2 rounded-full hover:bg-white">Дивитись всі <ArrowRight className="w-4 h-4"/></Button>
             </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {latestProducts.map(p => (
                <ProductCard key={p.id} product={p} />
             ))}
          </div>
       </div>
    </div>
  )
}