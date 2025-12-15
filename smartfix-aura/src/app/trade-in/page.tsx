"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTradeInRequest, getTradeInSuggestions } from "@/app/actions/trade-in-actions" // Додали імпорт
import { toast } from "sonner"
import { Smartphone, UploadCloud, Loader2, Sparkles, Laptop, Watch, Tablet, X, Box, Plug, Check, ArrowRight } from "lucide-react"
import { FileUpload } from "@/components/shared/FileUpload"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ... (Конфігурації залишаються без змін) ...
const DEVICE_TYPES = [
    { id: "PHONE", label: "Смартфон", icon: Smartphone },
    { id: "TABLET", label: "Планшет", icon: Tablet },
    { id: "LAPTOP", label: "Ноутбук", icon: Laptop },
    { id: "WATCH", label: "Smart Watch", icon: Watch },
]

const BRANDS_MAP: Record<string, string[]> = {
    "PHONE": ["Apple", "Samsung", "Google Pixel", "Xiaomi", "Motorola", "Інше"],
    "TABLET": ["Apple iPad", "Samsung Tab", "Lenovo", "Xiaomi", "Microsoft", "Інше"],
    "LAPTOP": ["Apple MacBook", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Інше"],
    "WATCH": ["Apple Watch", "Samsung Galaxy", "Garmin", "Xiaomi", "Amazfit", "Інше"],
}

const PLACEHOLDERS_MAP: Record<string, string> = {
    "PHONE": "iPhone 14 Pro Max",
    "TABLET": "iPad Air 5 (M1)",
    "LAPTOP": "MacBook Pro 14 M1 Pro",
    "WATCH": "Series 8 45mm Aluminum",
}

const CONDITIONS = [
    { id: "PERFECT", label: "Ідеал", desc: "Як новий, жодної подряпини", color: "bg-emerald-50 border-emerald-500 text-emerald-700" },
    { id: "GOOD", label: "Гарний", desc: "Мікропотертості, екран цілий", color: "bg-blue-50 border-blue-500 text-blue-700" },
    { id: "NORMAL", label: "Середній", desc: "Помітні сліди, подряпини", color: "bg-yellow-50 border-yellow-500 text-yellow-700" },
    { id: "BAD", label: "Поганий", desc: "Тріщини, сколи, несправності", color: "bg-red-50 border-red-500 text-red-700" }
]

export default function TradeInPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([]) // Стейт для товарів
  
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
     type: "PHONE",
     brand: "",
     model: "",
     storage: "", 
     cpu: "",     
     ram: "",     
     gpu: "",     
     battery: "", 
     condition: "",
     hasBox: false,
     hasKit: false,
     notes: "",
     name: "",
     phone: ""
  })

  const handleChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }))
  }

  const validateForm = () => {
      const newErrors: Record<string, boolean> = {}
      let isValid = true

      if (!formData.brand) newErrors.brand = true
      if (!formData.model) newErrors.model = true
      if (!formData.condition) newErrors.condition = true
      if (!formData.name) newErrors.name = true
      if (!formData.phone) newErrors.phone = true

      if (formData.type !== "WATCH" && !formData.storage && formData.type !== "LAPTOP") newErrors.storage = true
      if (formData.type === "LAPTOP" && !formData.cpu) newErrors.cpu = true
      if (formData.type === "LAPTOP" && !formData.ram) newErrors.ram = true

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          toast.error("Будь ласка, заповніть виділені поля", {
              style: { background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5" }
          })
          isValid = false
      }
      return isValid
  }

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!validateForm()) return
      
      setLoading(true)
      
      // 1. Формуємо дані
      const data = new FormData()
      const brandModel = `${formData.brand} ${formData.model}`
      let specs = ""
      if (formData.type === "LAPTOP") {
          specs = `CPU: ${formData.cpu}, RAM: ${formData.ram}`
          if (formData.gpu) specs += `, GPU: ${formData.gpu}`
      } else {
          if (formData.type !== "WATCH") specs += `${formData.storage}`
          if (formData.battery && formData.type === "PHONE") specs += `, АКБ ${formData.battery}%`
      }
      const kitInfo = []
      if (formData.hasBox) kitInfo.push("Коробка")
      if (formData.hasKit) kitInfo.push("Зарядний пристрій")
      const kitString = kitInfo.length > 0 ? ` (+ ${kitInfo.join(", ")})` : ""

      data.append("model", `${brandModel} [${specs}]${kitString}`)
      data.append("storage", specs) 
      data.append("condition", formData.condition)
      data.append("name", formData.name)
      data.append("phone", formData.phone)
      images.forEach(img => data.append("images", img))

      // 2. Створюємо заявку
      const res = await createTradeInRequest(data)
      
      // 3. Паралельно отримуємо пропозиції (Upsells)
      const suggestionsRes = await getTradeInSuggestions(formData.type)
      if (suggestionsRes.success) {
          setSuggestions(suggestionsRes.data)
      }

      if (res?.error) toast.error(res.error)
      else setSuccess(true)
      
      setLoading(false)
  }

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (success) return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="text-center mb-8">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                  <Sparkles className="w-10 h-10 text-white"/>
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Заявку прийнято!</h1>
              <p className="text-slate-500 max-w-md mx-auto text-lg">
                  Менеджер вже оцінює ваш {formData.brand}. <br/>
                  Зв'яжемося з вами протягом 15 хвилин.
              </p>
          </div>

          {/* UPSELL BLOCK */}
          {suggestions.length > 0 && (
              <div className="w-full max-w-4xl mt-8">
                  <div className="flex items-center justify-between mb-6 px-4">
                      <h2 className="text-xl font-bold text-slate-900">Оновись на новіше 👇</h2>
                      <Link href="/catalog" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                          Весь каталог <ArrowRight className="w-4 h-4"/>
                      </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {suggestions.map((p) => (
                          <Link key={p.id} href={`/product/${p.slug}`}>
                              <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 hover:border-indigo-300 hover:shadow-lg transition-all group">
                                  <div className="aspect-[4/5] bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                                      {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>}
                                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
                                          {p.grade}
                                      </div>
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-900 truncate">{p.title}</h3>
                                      <p className="text-xs text-slate-500 mb-2">{p.storage} • {p.color}</p>
                                      <div className="flex justify-between items-center">
                                          <span className="font-black text-lg text-slate-900">{Number(p.price).toLocaleString()} грн</span>
                                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                              <ArrowRight className="w-4 h-4"/>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </Link>
                      ))}
                  </div>
              </div>
          )}

          <Button onClick={() => window.location.reload()} variant="outline" className="mt-12 rounded-full px-8">Оцінити ще один</Button>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
        <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trade-In Оцінка</h1>
                <p className="text-slate-500 mt-2 text-lg">Отримайте максимальну ціну за свій старий гаджет</p>
            </div>

            <Card className="p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-white bg-white">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* 1. ТИП ПРИСТРОЮ */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4">
                        {DEVICE_TYPES.map(type => {
                            const Icon = type.icon
                            const isSelected = formData.type === type.id
                            return (
                                <div key={type.id} 
                                     onClick={() => { handleChange("type", type.id); handleChange("brand", ""); }}
                                     className={cn(
                                         "cursor-pointer flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200",
                                         isSelected ? "border-slate-900 bg-slate-50 scale-105 shadow-sm" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                     )}
                                >
                                    <Icon className={cn("w-6 h-6 mb-2 transition-colors", isSelected ? "text-slate-900" : "text-slate-400")}/>
                                    <span className={cn("text-[10px] sm:text-xs font-bold transition-colors", isSelected ? "text-slate-900" : "text-slate-400")}>{type.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* 2. ДЕТАЛІ ПРИСТРОЮ */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Label className="text-lg font-bold flex items-center gap-2 text-slate-900">
                            Характеристики
                        </Label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* БРЕНД */}
                            <div className="space-y-2">
                                <Label className={errors.brand ? "text-red-500" : ""}>Бренд</Label>
                                <Select value={formData.brand} onValueChange={(val) => handleChange("brand", val)}>
                                    <SelectTrigger className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.brand && "ring-2 ring-red-500 bg-red-50")}>
                                        <SelectValue placeholder="Оберіть бренд" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BRANDS_MAP[formData.type]?.map(brand => (
                                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* МОДЕЛЬ */}
                            <div className="space-y-2">
                                <Label className={errors.model ? "text-red-500" : ""}>Модель</Label>
                                <Input 
                                    placeholder={PLACEHOLDERS_MAP[formData.type]} 
                                    className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.model && "ring-2 ring-red-500 bg-red-50")}
                                    value={formData.model} 
                                    onChange={e => handleChange("model", e.target.value)}
                                />
                            </div>
                            
                            {/* --- УМОВНІ ПОЛЯ --- */}

                            {/* НОУТБУКИ */}
                            {formData.type === "LAPTOP" && (
                                <>
                                    <div className="space-y-2">
                                        <Label className={errors.cpu ? "text-red-500" : ""}>Процесор (CPU)</Label>
                                        <Input placeholder="Intel Core i5 / Apple M1" className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.cpu && "ring-2 ring-red-500 bg-red-50")} value={formData.cpu} onChange={e => handleChange("cpu", e.target.value)}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={errors.ram ? "text-red-500" : ""}>ОЗУ (RAM)</Label>
                                        <Input placeholder="8 GB / 16 GB" className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.ram && "ring-2 ring-red-500 bg-red-50")} value={formData.ram} onChange={e => handleChange("ram", e.target.value)}/>
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label>Відеокарта (GPU) <span className="text-slate-400 font-normal text-xs ml-1">(Не обов`язково)</span></Label>
                                        <Input placeholder="NVIDIA RTX 3060 / Integrated" className="h-12 bg-slate-50 border-0 rounded-xl" value={formData.gpu} onChange={e => handleChange("gpu", e.target.value)}/>
                                    </div>
                                </>
                            )}

                            {/* ТЕЛЕФОНИ / ПЛАНШЕТИ (Storage) */}
                            {(formData.type === "PHONE" || formData.type === "TABLET") && (
                                <div className="space-y-2">
                                    <Label className={errors.storage ? "text-red-500" : ""}>Пам`ять</Label>
                                    <Select value={formData.storage} onValueChange={(val) => handleChange("storage", val)}>
                                        <SelectTrigger className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.storage && "ring-2 ring-red-500 bg-red-50")}>
                                            <SelectValue placeholder="Оберіть об`єм" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* ТЕЛЕФОНИ (Battery) */}
                            {formData.type === "PHONE" && (
                                <div className="space-y-2">
                                    <Label>Стан акумулятора % <span className="text-slate-400 font-normal text-xs ml-1">(Опційно)</span></Label>
                                    <Input type="number" placeholder="88" className="h-12 bg-slate-50 border-0 rounded-xl" value={formData.battery} onChange={e => handleChange("battery", e.target.value)}/>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. КОМПЛЕКТАЦІЯ (ВІЗУАЛЬНІ ЧЕКБОКСИ) */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold text-slate-900">Комплектація</Label>
                        <div className="flex gap-4">
                            {/* КОРОБКА */}
                            <div 
                                className={cn("flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1", formData.hasBox ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-300")}
                                onClick={() => handleChange("hasBox", !formData.hasBox)}
                            >
                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", formData.hasBox ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-400")}>
                                    {formData.hasBox && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                </div>
                                <div className="flex items-center gap-2 font-bold text-slate-700"><Box className="w-4 h-4"/> Рідна коробка</div>
                            </div>
                            
                            {/* ЗАРЯДКА */}
                            <div 
                                className={cn("flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1", formData.hasKit ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-300")}
                                onClick={() => handleChange("hasKit", !formData.hasKit)}
                            >
                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", formData.hasKit ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-400")}>
                                    {formData.hasKit && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                </div>
                                <div className="flex items-center gap-2 font-bold text-slate-700"><Plug className="w-4 h-4"/> Зарядний пристрій</div>
                            </div>
                        </div>
                    </div>

                    {/* 4. СТАН */}
                    <div className="space-y-4">
                        <Label className={cn("text-lg font-bold text-slate-900", errors.condition && "text-red-500")}>
                            Косметичний стан {errors.condition && "*"}
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CONDITIONS.map(c => (
                                <div key={c.id} 
                                    onClick={() => handleChange("condition", c.label)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1",
                                        formData.condition === c.label ? c.color : "border-slate-100 hover:border-slate-300 bg-white"
                                    )}
                                >
                                    <p className="font-bold text-sm">{c.label}</p>
                                    <p className="text-xs opacity-70">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. ФОТО */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold text-slate-900">Фотографії</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-slate-200 shadow-sm">
                                    <img src={img} className="w-full h-full object-cover"/>
                                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md">
                                        <X className="w-3 h-3"/>
                                    </button>
                                </div>
                            ))}
                            {images.length < 9 && (
                                <div className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group">
                                    <FileUpload 
                                        endpoint="imageUploader" 
                                        value="" 
                                        onChange={(url) => url && setImages([...images, url])} 
                                    />
                                    <span className="text-[10px] text-slate-400 mt-2 font-bold group-hover:text-indigo-500">ДОДАТИ</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Textarea placeholder="Додаткові нюанси (FaceID не працює, мінявся екран)..." className="bg-slate-50 border-0 rounded-xl resize-none min-h-[100px]" value={formData.notes} onChange={e => handleChange("notes", e.target.value)}/>

                    {/* 6. КОНТАКТИ */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900">Ваші контакти</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={errors.name ? "text-red-500" : ""}>Ім`я</Label>
                                <Input 
                                    className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.name && "ring-2 ring-red-500 bg-red-50")}
                                    placeholder="Олександр"
                                    value={formData.name} onChange={e => handleChange("name", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className={errors.phone ? "text-red-500" : ""}>Телефон</Label>
                                <Input 
                                    className={cn("h-12 bg-slate-50 border-0 rounded-xl", errors.phone && "ring-2 ring-red-500 bg-red-50")}
                                    type="tel" placeholder="096 123 45 67"
                                    value={formData.phone} onChange={e => handleChange("phone", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-indigo-600 shadow-xl shadow-slate-900/20 transition-all" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin"/> : "Відправити на оцінку"}
                    </Button>

                </form>
            </Card>
        </div>
    </div>
  )
}