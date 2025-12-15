// src/app/dashboard/categories/page.tsx
import { getCategoryMetadata } from '@/app/actions/category-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Image, Loader2, ArrowRight } from 'lucide-react'
import { CategoryEditor } from '@/components/admin/CategoryEditor'
import { CategoryMetadata } from '@prisma/client'
import { Badge } from '@/components/ui/badge' // <<-- ДОДАНО

// Міні-компонент, який показує прев'ю банера
const PreviewCard = ({ meta }: { meta: CategoryMetadata }) => (
    <div className='rounded-2xl p-6 h-full transition-shadow relative overflow-hidden' 
        style={{ backgroundColor: meta.color || '#4f46e5', color: '#fff' }}>
        
        {/* Банерна картинка */}
        <div className='absolute inset-0 opacity-40 mix-blend-multiply'>
            {meta.imageUrl ? (
                <img src={meta.imageUrl} alt={meta.id} className='w-full h-full object-cover' />
            ) : (
                <div className='w-full h-full bg-slate-800 flex items-center justify-center'>
                    <Image className='w-12 h-12 text-slate-400' />
                </div>
            )}
        </div>
        
        <div className='relative z-10'>
            <Badge variant='outline' className='bg-white/20 text-white border-white/50 mb-3'>{meta.id}</Badge>
            <h3 className='text-3xl font-extrabold mb-2 leading-snug'>{meta.id.charAt(0).toUpperCase() + meta.id.slice(1).toLowerCase()}</h3>
            <p className='text-sm text-white/80 max-w-[80%] mb-4'>{meta.description}</p>
            <Button className='rounded-full bg-white text-slate-800 hover:bg-slate-100 gap-2'>
                {meta.buttonText} <ArrowRight className='w-4 h-4' />
            </Button>
        </div>
    </div>
)

export default async function CategoriesDashboard() {
  const metadata = await getCategoryMetadata()

  return (
    <div className='p-8 max-w-7xl mx-auto space-y-10'>
      
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Керування банерами</h1>
          <p className='text-muted-foreground'>Налаштування візуальних категорій на сайті.</p>
        </div>
        <Button variant='outline' className='gap-2'>
            <Settings className='h-4 w-4' /> Загальні налаштування
        </Button>
      </div>

      <div className='space-y-8'>
        {metadata.map((meta) => (
          <div key={meta.id} className='grid lg:grid-cols-3 gap-8 border-b pb-8 border-slate-100'>
            
            {/* 1. Прев'ю */}
            <div className='lg:col-span-1 h-full'>
              <Card className='h-full border-none shadow-lg overflow-hidden'>
                <CardHeader>
                  <CardTitle className='text-xl'>Прев'ю "{meta.id}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <PreviewCard meta={meta} />
                </CardContent>
              </Card>
            </div>
            
            {/* 2. Редактор */}
            <div className='lg:col-span-2'>
                <CategoryEditor initialData={meta} />
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}