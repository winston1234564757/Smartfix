import db from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  
  const product = await db.product.findUnique({ where: { id } })

  if (!product) return notFound()

  // Серіалізація Decimal для передачі в Client Component
  const serializedProduct = {
      ...product,
      price: Number(product.price),
      purchaseCost: Number(product.purchaseCost),
      repairCost: Number(product.repairCost),
      // JSON поля вже є об"єктами, якщо Prisma їх так повернула, або потребують парсингу, якщо це рядки.
      // У нашій схемі це Json?, тому Prisma повертає об"єкт.
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Редагування товару</h1>
        <ProductForm initialData={serializedProduct} />
    </div>
  )
}