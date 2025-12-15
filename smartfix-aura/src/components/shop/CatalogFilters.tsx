"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStorage = searchParams.get("storage")
  const currentGrade = searchParams.get("grade")

  // Функція оновлення URL без перезавантаження
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/catalog?${params.toString()}`)
  }

  // Якщо немає активних фільтрів - не показуємо кнопку очищення
  const hasFilters = !!currentStorage || !!currentGrade

  return (
    <div className="flex flex-wrap items-center gap-3">
      
      {/* ФІЛЬТР ПАМ'ЯТІ */}
      <Select 
        value={currentStorage || "all"} 
        onValueChange={(val) => updateFilter("storage", val)}
      >
        <SelectTrigger className="w-[140px] h-10 rounded-xl bg-white border-slate-200 text-slate-700 font-medium shadow-sm hover:border-indigo-300 transition-colors">
          <SelectValue placeholder="Пам'ять" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Вся пам'ять</SelectItem>
          <SelectItem value="64GB">64GB</SelectItem>
          <SelectItem value="128GB">128GB</SelectItem>
          <SelectItem value="256GB">256GB</SelectItem>
          <SelectItem value="512GB">512GB</SelectItem>
          <SelectItem value="1TB">1TB</SelectItem>
        </SelectContent>
      </Select>

      {/* ФІЛЬТР СТАНУ */}
      <Select 
        value={currentGrade || "all"} 
        onValueChange={(val) => updateFilter("grade", val)}
      >
        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white border-slate-200 text-slate-700 font-medium shadow-sm hover:border-indigo-300 transition-colors">
          <SelectValue placeholder="Стан" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі стани</SelectItem>
          <SelectItem value="NEW">New (Новий)</SelectItem>
          <SelectItem value="A_PLUS">Grade A+ (Ідеал)</SelectItem>
          <SelectItem value="A">Grade A (Відмінний)</SelectItem>
          <SelectItem value="B">Grade B (Гарний)</SelectItem>
        </SelectContent>
      </Select>

      {/* КНОПКА СКИНУТИ */}
      {hasFilters && (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/catalog")}
            className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Скинути фільтри"
        >
            <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}