import db from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Search as SearchIcon, X, Smartphone, Clock, RefreshCcw, Filter, ArrowUpRight, ShoppingCart, Laptop, Cpu, MemoryStick, HardDrive } from "lucide-react"
import { Search } from "@/components/shared/Search"
import { Category, Grade } from "@prisma/client"
import { getCategoryMetadata } from "@/app/actions/category-actions"
import { cn } from "@/lib/utils"
import { CatalogFilters } from "@/components/shop/CatalogFilters"

const WIDE_CATEGORIES = ["LAPTOP", "TABLET", "ACCESSORY", "OTHER"]; 
const TALL_CATEGORIES = ["IPHONE", "ANDROID", "WATCH"];

type SafeProduct = {
  id: string
  title: string
  slug: string
  price: number
  images: string[]
  grade: string
  storage: string
  color: string
  category: string
  status: string
  cpu?: string | null
  ram?: string | null
}

function ProductCard({ product }: { product: SafeProduct }) {
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(product.price)
  const isPreOrder = product.status === "PRE_ORDER"
  const isSold = product.status === "SOLD"
  const isLaptop = product.category === "LAPTOP"

  return (
    <Link href={`/product/${product.slug}`} className={`group block h-full ${isSold ? "opacity-90 grayscale-[0.2] hover:grayscale-0 hover:opacity-100" : ""}`}>
      <div className="bg-white rounded-[2.5rem] p-4 pb-6 h-full flex flex-col border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-100 relative overflow-hidden">
        
        <div className="aspect-[4/5] relative bg-slate-50 rounded-[2rem] overflow-hidden mb-6">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
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

        <div className="flex-1 flex flex-col justify-between px-2">
           <div>
               {/* TECH SPECS (ВИПРАВЛЕНО) */}
               <div className="mb-3 min-h-[20px]">
                  {isLaptop ? (
                      <div className="flex flex-wrap gap-2">
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

               <h3 className="font-black text-slate-900 text-xl leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
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

const HeroBanner = ({ meta, isActive, isAnySelected }: { meta: any, isActive: boolean, isAnySelected: boolean }) => {
    if (isAnySelected && !isActive) return null;
    const isTall = TALL_CATEGORIES.includes(meta.id);
    const gridClass = isActive 
        ? "col-span-1 md:col-span-4 h-[300px]" 
        : isTall 
            ? "col-span-1 md:col-span-1 md:row-span-2 h-[520px]" 
            : "col-span-1 md:col-span-2 h-[250px]"; 

    return (
        <Link
            href={isActive ? "/catalog" : `/catalog?category=${meta.id}`}
            className={cn(
                "group relative block overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-in-out hover:shadow-xl hover:shadow-indigo-500/10",
                gridClass
            )}
        >
            <div className="absolute inset-0">
                 {meta.imageUrl ? (
                    <img src={meta.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                 ) : (
                    <div className="w-full h-full bg-slate-900" />
                 )}
                 <div className={cn(
                     "absolute inset-0 transition-opacity duration-500",
                     isActive ? "bg-black/60" : "bg-black/20 group-hover:bg-black/40"
                 )} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                 <div className="transition-all duration-500 transform group-hover:-translate-y-2">
                     <div className="flex items-end justify-between gap-4">
                        <h2 className={cn(
                            "font-black text-white tracking-tighter uppercase leading-[0.9] break-words",
                            isActive ? "text-5xl" : isTall ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"
                        )}>{meta.id}</h2>
                        {!isActive && (<div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all mb-1 shrink-0"><ArrowUpRight className="w-5 h-5"/></div>)}
                     </div>
                     <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 translate-y-4 group-hover:translate-y-0">
                        {!isActive && <p className="text-white/90 font-medium line-clamp-2 mb-4 text-sm md:text-base">{meta.description}</p>}
                        {isActive && (<span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wide">Скинути фільтр <X className="w-3 h-3"/></span>)}
                     </div>
                 </div>
            </div>
        </Link>
    )
}

export default async function CatalogPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const q = searchParams?.query;
  const query = Array.isArray(q) ? q[0] : q || "";
  const c = searchParams?.category;
  const categoryParam = Array.isArray(c) ? c[0] : c || null;
  const storageParam = searchParams?.storage as string;
  const gradeParam = searchParams?.grade as string;
  const validCategories = Object.keys(Category);
  const category = categoryParam && validCategories.includes(categoryParam) ? (categoryParam as Category) : undefined;
  const isCategorySelected = !!category;

  const metadata = await getCategoryMetadata();
  let displayMetadata = [...metadata];
  if (!isCategorySelected) {
      displayMetadata = displayMetadata.sort(() => Math.random() - 0.5);
  }

  const productsRaw = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      status: { in: ["AVAILABLE", "PRE_ORDER", "SOLD"] },
      ...(category ? { category } : {}),
      ...(storageParam ? { storage: storageParam } : {}), 
      ...(gradeParam ? { grade: gradeParam as Grade } : {}),
      ...(query ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
        ]
      } : {})
    }
  })

  const sortedProducts = productsRaw.sort((a, b) => {
      const statusOrder = { "AVAILABLE": 1, "PRE_ORDER": 2, "SOLD": 3 } as any
      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
  })

  // ВАЖЛИВО: Явно прокидаємо поля CPU та RAM
  const products: SafeProduct[] = sortedProducts.map(p => ({
      ...p,
      price: Number(p.price),
      images: p.images,
      status: p.status,
      cpu: p.cpu, 
      ram: p.ram
  }))

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="p-4 max-w-[1600px] mx-auto">
          <div className={cn(
              "grid gap-4 transition-all duration-700",
              isCategorySelected ? "grid-cols-1" : "grid-cols-1 md:grid-cols-4 grid-flow-row-dense"
          )}>
             {displayMetadata.map(meta => (<HeroBanner key={meta.id} meta={meta} isActive={categoryParam === meta.id} isAnySelected={isCategorySelected} />))}
          </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto -mt-6 relative z-20 mb-12 flex flex-col gap-4">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-2 ring-1 ring-slate-200/50">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400"><Filter className="w-5 h-5"/></div>
            <div className="flex-1"><Search placeholder="Знайти iPhone, MacBook..." className="border-none shadow-none bg-transparent h-12 text-lg placeholder:text-slate-400" /></div>
            </div>
            <div className="flex justify-center"><CatalogFilters /></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex flex-col">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{category ? category : "Всі пропозиції"}</h2>
                {(storageParam || gradeParam) && (<p className="text-sm text-indigo-600 font-medium mt-1">Фільтри: {storageParam} {gradeParam}</p>)}
            </div>
            <span className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{products.length} пристроїв</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 text-slate-300"><SearchIcon className="w-8 h-8"/></div>
                <h3 className="text-xl font-bold text-slate-900">Нічого не знайдено</h3>
                <p className="text-slate-400 mt-2">Спробуйте змінити фільтри</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
      </div>
    </div>
  )
}