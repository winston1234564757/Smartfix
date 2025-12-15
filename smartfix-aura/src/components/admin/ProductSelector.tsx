'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus } from 'lucide-react'

export function ProductSelector({ products, onSelect }: { products: any[], onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (id: string) => {
      onSelect(id)
      setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl'>
                <Plus className='w-4 h-4 mr-2'/> Обрати зі складу
            </Button>
        </DialogTrigger>
        <DialogContent className='max-w-lg rounded-[2rem] p-0 overflow-hidden max-h-[80vh] flex flex-col'>
            <div className='p-4 border-b border-slate-100 bg-white'>
                <DialogTitle className='mb-4 text-center'>Оберіть товар</DialogTitle>
                <div className='relative'>
                    <Search className='absolute left-3 top-3 w-5 h-5 text-slate-400'/>
                    <Input 
                        placeholder='Пошук по назві...' 
                        className='pl-10 h-12 rounded-xl bg-slate-50 border-0'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className='overflow-y-auto p-4 space-y-2 bg-slate-50 flex-1'>
                {filtered.map(product => (
                    <div key={product.id} onClick={() => handleSelect(product.id)} className='flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-500 cursor-pointer transition-all group'>
                        <div className='w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0'>
                            {product.images[0] && <img src={product.images[0]} className='w-full h-full object-cover'/>}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-bold text-slate-900 truncate text-sm group-hover:text-indigo-600'>{product.title}</p>
                            <p className='text-xs text-slate-500'>{product.grade}</p>
                        </div>
                        <span className='font-black text-slate-900'>${Number(product.price)}</span>
                    </div>
                ))}
                {filtered.length === 0 && <p className='text-center text-slate-400 py-4'>Нічого не знайдено</p>}
            </div>
        </DialogContent>
    </Dialog>
  )
}