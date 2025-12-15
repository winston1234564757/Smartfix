import db from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })

  if (!product) return notFound()

  // SERIALIZATION
  const serializedProduct = {
      ...product,
      price: Number(product.price),
      purchaseCost: Number(product.purchaseCost),
      repairCost: Number(product.repairCost)
  }

  return (
    <div className="w-full p-6"> {/* Removed max-w constraints */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/products">
                <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5"/></Button>
            </Link>
            <div>
                <h1 className="text-3xl font-black text-slate-900">Редагування</h1>
                <p className="text-slate-500">{product.title}</p>
            </div>
        </div>
        
        <ProductForm initialData={serializedProduct} />
    </div>
  )
}