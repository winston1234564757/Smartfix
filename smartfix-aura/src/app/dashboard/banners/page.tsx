import db from '@/lib/db'
import { BannerForm } from '@/components/admin/BannerForm'
import { Button } from '@/components/ui/button'
import { Trash2, LayoutTemplate } from 'lucide-react'
import { deletePromoBanner } from '@/app/actions/promo'
import { Badge } from '@/components/ui/badge'

export default async function BannersPage() {
  const banners = await db.promoBanner.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className='max-w-7xl mx-auto space-y-8'>
       <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 bg-indigo-100 text-indigo-600 rounded-xl'>
              <LayoutTemplate className='w-6 h-6' />
          </div>
          <div>
              <h1 className='text-3xl font-bold tracking-tight'>Маркетинг</h1>
              <p className='text-slate-500'>Керування промо-банерами на головній</p>
          </div>
       </div>

       <div className='grid lg:grid-cols-3 gap-8'>
          {/* ФОРМА ДОДАВАННЯ */}
          <div>
             <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24'>
                <h3 className='font-bold text-lg mb-4'>Додати новий банер</h3>
                <BannerForm />
             </div>
          </div>

          {/* СПИСОК БАНЕРІВ */}
          <div className='lg:col-span-2 grid grid-cols-2 gap-4'>
             {banners.length === 0 && (
                <div className='col-span-2 py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                   Банерів немає. Додайте перший!
                </div>
             )}
             
             {banners.map((banner) => (
                <div key={banner.id} className='group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200'>
                   <img src={banner.image} className='w-full h-full object-cover' />
                   <div className='absolute inset-0 bg-black/40 p-4 flex flex-col justify-end'>
                      <Badge className='w-fit mb-2'>{banner.size}</Badge>
                      <p className='text-white font-bold text-lg'>{banner.title}</p>
                      <p className='text-white/80 text-xs'>{banner.subtitle}</p>
                   </div>
                   
                   {/* КНОПКА ВИДАЛЕННЯ */}
                   <form action={deletePromoBanner.bind(null, banner.id)}>
                      <Button size='icon' variant='destructive' className='absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'>
                         <Trash2 className='w-4 h-4' />
                      </Button>
                   </form>
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}