import db from '@/lib/db'
import { notFound } from 'next/navigation'
import ProductPageClient from '@/components/shop/ProductPageClient'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug: slug } })
  if (!product) return { title: 'Товар не знайдено' }
  return { title: `${product.title} | SmartFix` }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug: slug } })

  if (!product) return notFound()

  // Serializing Decimal & JSON
  const serializedProduct = {
      ...product,
      price: Number(product.price),
      purchaseCost: Number(product.purchaseCost),
      repairCost: Number(product.repairCost),
      checklist: product.checklist ? JSON.parse(JSON.stringify(product.checklist)) : [],
      upgrades: product.upgrades ? JSON.parse(JSON.stringify(product.upgrades)) : []
  }

  return <ProductPageClient product={serializedProduct} />
}