import db from "@/lib/db"
import { notFound } from "next/navigation"
import { RequestForm } from "@/components/shop/RequestForm"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Props { params: { slug: string } }

export default async function RequestPage({ params }: Props) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug } })

  if (!product) return notFound()

  // Serialize Decimal
  const safeProduct = {
      ...product,
      price: Number(product.price),
      // Ensure strings for specs
      cpu: product.cpu || "",
      ram: product.ram || "",
      storage: product.storage || "",
      color: product.color || ""
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="mb-10">
                <Link href={`/product/${slug}`} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2"/> Повернутись до товару
                </Link>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-4">
                    Персональний пошук <span className="text-indigo-600">SmartFix</span>
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                    Цей <strong>{product.title}</strong> вже знайшов власника, але ми знайдемо для вас такий самий (або кращий) за {2-5} днів.
                </p>
            </div>

            {/* FORM COMPONENT */}
            <RequestForm product={safeProduct} />

            {/* TRUST INDICATORS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center opacity-80">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-7 h-7"/>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Перевірка 360°</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Кожен пристрій проходить повний інженерний тест перед викупом.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-7 h-7"/>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Без передоплати</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Ми шукаємо, ви погоджуєте фото/відео, і тільки потім платите.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-7 h-7"/>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Гарантія 3 міс</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Повна гарантія на будь-яку техніку, яку ми підберемо.</p>
                </div>
            </div>

        </div>
    </div>
  )
}