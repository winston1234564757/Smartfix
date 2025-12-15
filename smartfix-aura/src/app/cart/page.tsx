"use client"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, ShieldCheck, Truck, Clock, Package, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { createOrder } from "@/app/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function CartPage() {
  const cart = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const itemsTotal = cart.items.reduce((acc, item) => acc + Number(item.price), 0)
  const warrantyPrice = 45
  const total = itemsTotal + (cart.warranty ? warrantyPrice : 0)

  // --- ЛОГІКА СТАТУСІВ ---
  const getStatusBadge = (status?: string) => {
      switch (status) {
          case "PRE_ORDER":
              return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">Передзамовлення</Badge>
          case "ON_REQUEST":
              return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Під запит</Badge>
          case "RESERVED":
              return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">В черзі</Badge>
          default:
              return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">В наявності</Badge>
      }
  }

  const getStatusNote = (status?: string) => {
      switch (status) {
          case "PRE_ORDER":
              return <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium mt-1"><Clock className="w-3.5 h-3.5"/> Очікування: 14-20 днів</div>
          case "ON_REQUEST":
              return <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1"><Search className="w-3.5 h-3.5"/> Індивідуальна доставка</div>
          default:
              return <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1"><Truck className="w-3.5 h-3.5"/> Відправка сьогодні</div>
      }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setLoading(true)
      
      const formData = new FormData(e.currentTarget)
      formData.append("items", JSON.stringify(cart.items))
      formData.append("total", total.toString())
      if (cart.warranty) {
          formData.append("warranty", "EXTENDED")
          formData.append("warrantyPrice", warrantyPrice.toString())
      }

      const res = await createOrder(formData)

      if (res?.error) {
          toast.error(res.error)
      } else {
          toast.success("Замовлення успішне!")
          cart.removeAll()
          // FIX: Redirect to Client Orders instead of Admin Dashboard
          router.push("/orders") 
      }
      setLoading(false)
  }

  if (cart.items.length === 0) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Кошик порожній</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Ви ще нічого не додали. Перейдіть до каталогу, щоб знайти щось цікаве.</p>
              <Button onClick={() => router.push("/catalog")} size="lg" className="rounded-xl font-bold px-8">До каталогу</Button>
          </div>
      )
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Оформлення замовлення</h1>
      
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ЛІВА ЧАСТИНА: ТОВАРИ */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    {cart.items.map((item) => (
                        <div key={item.cartId} className="flex gap-4 group">
                            {/* ФОТО */}
                            <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0 relative">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                ) : (
                                    <div className="flex items-center justify-center h-full"><Package className="w-8 h-8 text-slate-300"/></div>
                                )}
                            </div>

                            {/* ІНФО */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h3>
                                        <button type="button" onClick={() => cart.removeItem(item.cartId)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {getStatusBadge(item.status)}
                                        {item.selectedOptions && item.selectedOptions.map((opt: any, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-xs text-slate-500 border-slate-200">
                                                {opt.label}
                                            </Badge>
                                        ))}
                                    </div>

                                    {getStatusNote(item.status)}
                                </div>

                                <div className="mt-2 font-black text-xl text-slate-900">${item.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* ГАРАНТІЯ - UPSELL */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={cart.toggleWarranty}>
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${cart.warranty ? "bg-indigo-600 border-indigo-600 scale-110" : "border-slate-300 bg-white"}`}>
                            {cart.warranty && <ShieldCheck className="w-3.5 h-3.5 text-white"/>}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Розширена гарантія (+1 Рік)</p>
                            <p className="text-xs text-slate-500">Безкоштовний ремонт або заміна протягом року.</p>
                        </div>
                    </div>
                    <span className="font-bold text-indigo-600 text-sm">+$45</span>
                </div>
            </div>
        </div>

        {/* ПРАВА ЧАСТИНА: ФОРМА */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-24 space-y-6">
            <h3 className="font-bold text-xl text-slate-900">Деталі доставки</h3>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Ваше Ім'я</Label>
                    <Input name="customerName" placeholder="Іван Петренко" required className="rounded-xl bg-slate-50 border-slate-200 h-11 focus:border-indigo-500 transition-colors"/>
                </div>
                <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input name="phone" placeholder="098..." required className="rounded-xl bg-slate-50 border-slate-200 h-11 focus:border-indigo-500 transition-colors"/>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase">Місто доставки</Label>
                    <Input name="city" placeholder="Київ" className="rounded-xl bg-slate-50 border-slate-200 h-11 focus:border-indigo-500 transition-colors"/>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase">Відділення / Поштомат</Label>
                    <Input name="warehouse" placeholder="Відділення №1" className="rounded-xl bg-slate-50 border-slate-200 h-11 focus:border-indigo-500 transition-colors"/>
                </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                <span>Товари ({cart.items.length})</span>
                <span>${itemsTotal}</span>
            </div>
            {cart.warranty && (
                <div className="flex justify-between items-center text-sm font-medium text-indigo-600 animate-in fade-in slide-in-from-right-2">
                    <span>Гарантія Premium</span>
                    <span>+${warrantyPrice}</span>
                </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
                <span className="font-black text-xl text-slate-900">До сплати</span>
                <span className="font-black text-2xl text-slate-900">${total}</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-slate-900 hover:bg-indigo-600 text-lg font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95">
                {loading ? "Обробка..." : "Підтвердити замовлення"}
            </Button>
        </div>

      </form>
    </div>
  )
}