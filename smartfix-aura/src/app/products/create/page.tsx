import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function CreateProductPage() {
  return (
    <div className='max-w-3xl mx-auto p-8'>
      <div className='mb-8'>
        <Link href='/products'>
          <Button variant='ghost' className='pl-0 hover:bg-transparent text-slate-500 hover:text-indigo-600 gap-2'>
            <ChevronLeft className='h-4 w-4' />
            Назад до складу
          </Button>
        </Link>
        <h1 className='text-3xl font-bold tracking-tight mt-2 text-slate-900'>Додати новий товар</h1>
        <p className='text-slate-500'>Заповніть інформацію про пристрій, щоб додати його до бази.</p>
      </div>

      <div className='bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50'>
        <ProductForm />
      </div>
    </div>
  )
}