import { ProductForm } from "@/components/admin/ProductForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateProductPage() {
  return (
    <div className="w-full p-6"> {/* Removed max-w constraints */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/products">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
            </Link>
            <div>
                <h1 className="text-3xl font-black text-slate-900">Новий товар</h1>
                <p className="text-slate-500">Додавання пристрою на склад</p>
            </div>
        </div>
        
        <ProductForm />
    </div>
  )
}