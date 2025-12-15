"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Search } from "lucide-react"
import { useState, useEffect } from "react"

// Використовуємо об''єкти: value (для пошуку), label (для краси)
const RAM_OPTIONS = [
    { value: "2", label: "2 GB" },
    { value: "4", label: "4 GB" },
    { value: "6", label: "6 GB" },
    { value: "8", label: "8 GB" },
    { value: "12", label: "12 GB" },
    { value: "16", label: "16 GB" },
    { value: "24", label: "24 GB" },
    { value: "32", label: "32 GB" },
    { value: "64", label: "64 GB" }
]

const STORAGE_OPTIONS = [
    { value: "32", label: "32 GB" },
    { value: "64", label: "64 GB" },
    { value: "128", label: "128 GB" },
    { value: "256", label: "256 GB" },
    { value: "512", label: "512 GB" },
    { value: "1 TB", label: "1 TB" },
    { value: "2 TB", label: "2 TB" }
]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get("q") || "")
  const [cpu, setCpu] = useState(searchParams.get("cpu") || "")
  const [color, setColor] = useState(searchParams.get("color") || "")

  useEffect(() => {
      setQ(searchParams.get("q") || "")
      setCpu(searchParams.get("cpu") || "")
      setColor(searchParams.get("color") || "")
  }, [searchParams])

  const updateParam = (key: string, val: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (val && val !== "ALL") params.set(key, val)
      else params.delete(key)
      router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleTextSubmit = (key: string, val: string) => {
      updateParam(key, val)
  }

  const clearFilters = () => {
      setQ("")
      setCpu("")
      setColor("")
      router.push("?")
  }

  return (
    <div className="space-y-4 mb-6">
        
        {/* 1. ПОШУК */}
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"/>
            <Input 
                placeholder="Пошук по назві, моделі, серійнику..." 
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => handleTextSubmit("q", q)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit("q", q)}
                className="pl-12 h-12 rounded-2xl bg-white border-slate-200 shadow-sm text-lg font-medium"
            />
        </div>

        {/* 2. ПАНЕЛЬ */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs font-bold text-slate-400 uppercase mr-2 min-w-[60px]">Базові:</span>
                
                <Select value={searchParams.get("category") || "ALL"} onValueChange={(v) => updateParam("category", v)}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"><SelectValue placeholder="Категорія"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Всі категорії</SelectItem>
                        <SelectItem value="IPHONE">iPhone</SelectItem>
                        <SelectItem value="ANDROID">Android</SelectItem>
                        <SelectItem value="LAPTOP">Ноутбуки</SelectItem>
                        <SelectItem value="TABLET">Планшети</SelectItem>
                        <SelectItem value="WATCH">Годинники</SelectItem>
                        <SelectItem value="ACCESSORY">Аксесуари</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={searchParams.get("status") || "ALL"} onValueChange={(v) => updateParam("status", v)}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"><SelectValue placeholder="Статус"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Всі статуси</SelectItem>
                        <SelectItem value="AVAILABLE">В наявності</SelectItem>
                        <SelectItem value="SOLD">Продано</SelectItem>
                        <SelectItem value="ON_REQUEST">Під запит</SelectItem>
                        <SelectItem value="RESERVED">Резерв</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={searchParams.get("grade") || "ALL"} onValueChange={(v) => updateParam("grade", v)}>
                    <SelectTrigger className="w-[100px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"><SelectValue placeholder="Стан"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Всі</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="A_PLUS">A+</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={searchParams.get("storage") || "ALL"} onValueChange={(v) => updateParam("storage", v)}>
                    <SelectTrigger className="w-[120px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"><SelectValue placeholder="Пам`ять"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Всі</SelectItem>
                        {STORAGE_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap gap-3 items-center border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase mr-2 min-w-[60px]">Деталі:</span>
                
                <Input 
                    placeholder="CPU (i7...)" 
                    className="w-[120px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    onBlur={() => handleTextSubmit("cpu", cpu)}
                    onKeyDown={(e) => e.key === "Enter" && handleTextSubmit("cpu", cpu)}
                />

                <Select value={searchParams.get("ram") || "ALL"} onValueChange={(v) => updateParam("ram", v)}>
                    <SelectTrigger className="w-[120px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold">
                        <SelectValue placeholder="ОЗУ"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Всі</SelectItem>
                        {RAM_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Input 
                    placeholder="Колір..." 
                    className="w-[120px] h-9 rounded-xl bg-slate-50 border-slate-200 text-xs"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    onBlur={() => handleTextSubmit("color", color)}
                    onKeyDown={(e) => e.key === "Enter" && handleTextSubmit("color", color)}
                />

                <div className="ml-auto flex gap-2">
                    <Select value={searchParams.get("sort") || "newest"} onValueChange={(v) => updateParam("sort", v)}>
                        <SelectTrigger className="w-[130px] h-9 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm">
                            <SelectValue placeholder="Сортування"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Найновіші</SelectItem>
                            <SelectItem value="price_asc">Дешевші</SelectItem>
                            <SelectItem value="price_desc">Дорожчі</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchParams.toString().length > 0) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600" title="Скинути">
                            <X className="w-4 h-4"/>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}