"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface Props {
    options: { value: string, label: string }[]
}

export function StatusTabs({ options }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get("status") || "ALL"

  const handleFilter = (status: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (status === "ALL") params.delete("status")
      else params.set("status", status)
      
      router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
        <Button 
            variant={currentFilter === "ALL" ? "default" : "outline"} 
            onClick={() => handleFilter("ALL")}
            className="rounded-xl h-9 text-xs font-bold"
        >
            Всі
        </Button>
        {options.map(opt => (
            <Button 
                key={opt.value}
                variant={currentFilter === opt.value ? "default" : "outline"} 
                onClick={() => handleFilter(opt.value)}
                className={`rounded-xl h-9 text-xs font-bold ${currentFilter === opt.value ? "bg-slate-900" : "text-slate-500 border-slate-200"}`}
            >
                {opt.label}
            </Button>
        ))}
    </div>
  )
}