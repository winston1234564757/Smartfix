'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const categories = [
  { label: 'Всі', value: 'ALL' },
  { label: 'iPhone', value: 'IPHONE' },
  { label: 'Android', value: 'ANDROID' },
  { label: 'iPad', value: 'TABLET' },
  { label: 'MacBook', value: 'LAPTOP' },
  { label: 'Watch', value: 'WATCH' },
  { label: 'Аксесуари', value: 'ACCESSORY' },
]

export function CategoryTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('category') || 'ALL'

  const handleClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'ALL') {
      params.delete('category')
    } else {
      params.set('category', value)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <div className='flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar'>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleClick(cat.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            currentCategory === cat.value || (cat.value === 'ALL' && !currentCategory)
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}