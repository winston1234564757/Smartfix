import db from '@/lib/db'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'

export async function PromoGrid() {
  const banners = await db.promoBanner.findMany({
    where: { 
        // НЕ показувати HERO банер у цій сітці
        size: { not: 'HERO' } 
    },
    orderBy: { order: 'asc' } 
  })

  if (banners.length === 0) return null

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]'>
          {banners.map((banner) => {
             const sizeClasses = {
                STANDARD: 'col-span-1 row-span-1',
                WIDE: 'col-span-1 sm:col-span-2 row-span-1',
                TALL: 'col-span-1 row-span-1 sm:row-span-2',
                BIG: 'col-span-1 sm:col-span-2 row-span-1 sm:row-span-2',
             }[banner.size] || 'col-span-1 row-span-1'

             return (
                <Link 
                  key={banner.id} 
                  href={banner.link}
                  className={cn(
                    'group relative rounded-3xl overflow-hidden bg-slate-100 hover:shadow-xl transition-all duration-500',
                    sizeClasses
                  )}
                >
                   <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' 
                   />
                   <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity' />

                   <div className='absolute bottom-0 left-0 p-6 md:p-8 w-full'>
                      <div className='translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                         <h3 className={cn(
                            'font-black text-white leading-tight uppercase',
                            banner.size === 'BIG' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
                         )}>
                            {banner.title}
                         </h3>
                         {banner.subtitle && (
                            <p className='text-white/80 font-medium mt-2 text-sm md:text-base'>
                               {banner.subtitle}
                            </p>
                         )}
                      </div>
                   </div>

                   <div className='absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0'>
                      <ArrowUpRight className='w-5 h-5' />
                   </div>
                </Link>
             )
          })}
       </div>
    </div>
  )
}