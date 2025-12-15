"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProductRequest } from "@/app/actions/request-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Calculator, Laptop, ArrowRight, Loader2, MessageSquare } from "lucide-react"

export function RequestForm({ product }: { product: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const basePrice = product.price
  const minBudget = Math.round(basePrice * 0.85)
  const maxBudget = Math.round(basePrice * 1.15)

  const isLaptop = product.category === "LAPTOP"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setLoading(true)
      const formData = new FormData(e.currentTarget)
      formData.append("targetProduct", product.title)
      formData.append("budget", `$${minBudget} - $${maxBudget}`)

      const res = await createProductRequest(formData)

      if (res?.error) {
          toast.error(res.error)
      } else {
          toast.success("Заявку відправлено!")
          router.push("/")
      }
      setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: CONFIGURATION */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-white">
                
                {/* BIG HEADER WITH PHOTO */}
                <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8">
                    {/* Big Image */}
                    <div className="w-48 h-48 bg-white rounded-3xl border border-slate-200 p-2 shadow-sm shrink-0 rotate-3 hover:rotate-0 transition-transform duration-500">
                        {product.images[0] ? (
                            <img src={product.images[0]} className="w-full h-full object-cover rounded-2xl"/>
                        ) : (
                            <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">No Img</div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                            Базова модель
                        </div>
                        <h3 className="font-black text-slate-900 text-3xl leading-tight mb-2">{product.title}</h3>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 font-medium">
                            <span>{product.storage}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{product.color}</span>
                        </div>

                        <div className="mt-4 inline-flex items-baseline gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-sm text-slate-400 font-bold uppercase">Ціна зразка:</span>
                            <span className="text-xl font-black text-slate-900">${basePrice}</span>
                        </div>
                    </div>
                </div>
                
                <CardContent className="p-8 space-y-8">
                    
                    {/* Common Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-900">Бажана Пам''ять</Label>
                            <Select name="desiredStorage" defaultValue={product.storage || "any"}>
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Не важливо</SelectItem>
                                    <SelectItem value={product.storage}>{product.storage} (Як у цього)</SelectItem>
                                    <SelectItem value="128GB">128GB</SelectItem>
                                    <SelectItem value="256GB">256GB</SelectItem>
                                    <SelectItem value="512GB">512GB</SelectItem>
                                    <SelectItem value="1TB">1TB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-900">Бажаний Колір</Label>
                            <Input name="desiredColor" placeholder="Наприклад: Space Gray" defaultValue={product.color} className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-bold text-slate-900">Допустимий стан (Grade)</Label>
                        <Select name="desiredGrade" defaultValue="any">
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Розгляну варіанти (A / A+)</SelectItem>
                                <SelectItem value="A_PLUS">Тільки ідеал (Grade A+)</SelectItem>
                                <SelectItem value="A">Гарний стан (Grade A)</SelectItem>
                                <SelectItem value="B">Можна з подряпинами (Grade B, дешевше)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Laptop Specs */}
                    {isLaptop && (
                        <div className="pt-4">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Laptop className="w-5 h-5"/></div>
                                <h4 className="font-bold text-slate-900 text-lg">Характеристики (Ноутбук)</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="font-bold">Процесор (CPU)</Label>
                                    <Input name="desiredCpu" placeholder="M1 / Intel..." defaultValue={product.cpu} className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base"/>
                                </div>
                                <div className="space-y-4">
                                    <Label className="font-bold">ОЗУ (RAM)</Label>
                                    <Select name="desiredRam" defaultValue={product.ram || "any"}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Не важливо</SelectItem>
                                            <SelectItem value="8GB">8GB</SelectItem>
                                            <SelectItem value="16GB">16GB</SelectItem>
                                            <SelectItem value="32GB">32GB+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTES FIELD */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-indigo-600"/>
                            <h4 className="font-bold text-slate-900 text-lg">Додаткові побажання</h4>
                        </div>
                        <Textarea 
                            name="clientNotes" 
                            placeholder="Наприклад: Хочу версію з двома сім-картами, або бажано наявність коробки..." 
                            className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base p-4 resize-none"
                        />
                    </div>

                </CardContent>
            </Card>
        </div>

        {/* RIGHT: BUDGET & CONTACT */}
        <div className="space-y-6">
            
            {/* BUDGET */}
            <Card className="rounded-[2.5rem] border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"/>
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <Calculator className="w-5 h-5"/>
                        </div>
                        <h3 className="font-bold text-indigo-950 text-lg">Орієнтовний бюджет</h3>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tight mb-2 relative z-10">
                        ${minBudget} — ${maxBudget}
                    </div>
                    <p className="text-sm text-slate-500 font-medium relative z-10">
                        Розраховано на основі ціни зразка (${basePrice}). Кінцева вартість залежить від стану.
                    </p>
                </CardContent>
            </Card>

            {/* CONTACT FORM */}
            <Card className="rounded-[2.5rem] border-slate-200 shadow-xl shadow-indigo-900/5 bg-white sticky top-6">
                <CardContent className="p-8 space-y-6">
                    <h3 className="font-black text-2xl text-slate-900">Ваші контакти</h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold ml-1">Ім''я</Label>
                            <Input name="customerName" required placeholder="Олександр" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base transition-all"/>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold ml-1">Телефон / Telegram</Label>
                            <Input name="phone" required placeholder="098..." className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base transition-all"/>
                        </div>
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full h-16 rounded-[1.2rem] text-lg font-bold bg-slate-900 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all">
                        {loading ? <Loader2 className="animate-spin"/> : <span className="flex items-center">Почати пошук <ArrowRight className="ml-2 w-5 h-5"/></span>}
                    </Button>
                    
                    <p className="text-center text-xs text-slate-400 leading-relaxed px-2">
                        Ми зв''яжемося з вами протягом 15 хвилин у робочий час.
                    </p>
                </CardContent>
            </Card>
        </div>

    </form>
  )
}