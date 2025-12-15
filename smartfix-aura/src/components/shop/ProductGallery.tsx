'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: Props) {
  // Використовуємо індекс замість URL для відстеження активного фото
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const hasImages = images.length > 0
  const mainImage = hasImages ? images[currentIndex] : null

  // Функції перемикання
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!hasImages) {
      return (
        <div className='aspect-[4/5] w-full flex flex-col gap-2 items-center justify-center bg-slate-100 text-slate-400 rounded-[2.5rem] border border-slate-200'>
            <Smartphone className='w-12 h-12 opacity-50' />
            <span className='text-sm font-medium'>Фото відсутнє</span>
        </div>
      )
  }

  return (
    <div className='flex flex-col gap-4 sticky top-24 select-none'>
        
        {/* ГОЛОВНЕ ФОТО + СТРІЛКИ */}
        <div className='bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 aspect-[4/5] relative group'>
            <img 
                src={mainImage!} 
                alt={title} 
                className='w-full h-full object-cover transition-all duration-500' 
            />

            {/* Стрілки навігації (тільки якщо > 1 фото) */}
            {images.length > 1 && (
              <>
                {/* Ліва стрілка */}
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-slate-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10'
                >
                  <ChevronLeft className='w-6 h-6' />
                </Button>

                {/* Права стрілка */}
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-slate-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10'
                >
                  <ChevronRight className='w-6 h-6' />
                </Button>
              </>
            )}
        </div>

        {/* МІНІАТЮРИ (КАРУСЕЛЬ) */}
        {images.length > 1 && (
            <div className='flex gap-3 overflow-x-auto pb-2 px-1 snap-x scrollbar-hide'>
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                            'relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start',
                            currentIndex === i ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                        )}
                    >
                        <img src={img} className='w-full h-full object-cover' />
                    </button>
                ))}
            </div>
        )}
    </div>
  )
}