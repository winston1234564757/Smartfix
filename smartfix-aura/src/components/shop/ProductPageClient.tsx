'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { Check, ShieldCheck, Truck, Cpu, HardDrive, MemoryStick, Plus, Settings, CheckCircle2, Zap } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'

// СЕРВІСНІ ПОСЛУГИ
const SERVICES = [
    { id: 'av', label: 'Встановлення Антивірусу', price: 15 },
    { id: 'os', label: 'Налаштування ОС + Драйвери', price: 20 },
    { id: 'office', label: 'Пакет Office (Word, Excel)', price: 10 },
    { id: 'clean', label: 'Проф. чистка через рік', price: 25 },
    { id: 'data', label: 'Перенесення даних', price: 15 },
]

export default function ProductPageClient({ product }: { product: any }) {
  const { addItem } = useCart()
  
  const upgrades = (product.upgrades as { label: string, price: number | string }[]) || []
  const checklist = (product.checklist as { label: string, value: string }[]) || []
  const isLaptop = product.category === 'LAPTOP'
  
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const basePrice = Number(product.price)
  
  const upgradesCost = upgrades
    .filter(u => selectedUpgrades.includes(u.label))
    .reduce((acc, u) => acc + Number(u.price), 0)
    
  const servicesCost = SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + Number(s.price), 0)

  const finalPrice = basePrice + upgradesCost + servicesCost

  const handleAddToCart = () => {
    const optionsList = [
        ...upgrades.filter(u => selectedUpgrades.includes(u.label)).map(u => ({ label: u.label, price: Number(u.price) })),
        ...SERVICES.filter(s => selectedServices.includes(s.id)).map(s => ({ label: s.label, price: Number(s.price) }))
    ]

    addItem({
        id: product.id,
        title: product.title,
        price: product.price, 
        image: product.images[0] || '',
        slug: product.slug
    }, optionsList)
  }

  return (
    <div className='min-h-screen bg-slate-50 py-12 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-12 items-start'>
          
          <ProductGallery images={product.images} title={product.title} />

          <div className='space-y-8'>
             {/* HEADER */}
             <div>
                <Badge variant='outline' className='text-indigo-600 border-indigo-200 bg-indigo-50 mb-4'>{product.category}</Badge>
                <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4'>{product.title}</h1>
                <div className='flex flex-wrap gap-4 text-slate-500 font-medium text-lg items-center'>
                   {isLaptop && <span>{product.cpu} • {product.ram}</span>}
                   {!isLaptop && <span>{product.storage}</span>}
                   <span>{product.color}</span>
                   <span className='uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-sm font-bold'>Grade {product.grade.replace('_', '+')}</span>
                </div>
             </div>

             {/* PRICE BOX */}
             <div className='bg-white p-8 rounded-3xl shadow-sm border border-slate-100'>
                <div className='flex justify-between items-end mb-8'>
                   <div>
                      <p className='text-slate-400 text-sm font-medium mb-1'>Ціна пристрою</p>
                      <div className='text-4xl font-black text-slate-900'>${finalPrice.toLocaleString()}</div>
                      {(upgradesCost > 0 || servicesCost > 0) && (
                          <div className='text-xs text-indigo-600 font-bold mt-1 bg-indigo-50 px-2 py-1 rounded inline-block'>
                             База ${basePrice} + Опції ${upgradesCost + servicesCost}
                          </div>
                      )}
                   </div>
                </div>

                <Button size='lg' className='w-full h-14 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20' onClick={handleAddToCart}>
                    Купити за ${finalPrice.toLocaleString()}
                </Button>

                <div className='mt-6 flex justify-between text-sm text-slate-500'>
                   <div className='flex items-center gap-2'><ShieldCheck className='w-5 h-5 text-indigo-600' /><span>Гарантія 30 днів</span></div>
                   <div className='flex items-center gap-2'><Truck className='w-5 h-5 text-indigo-600' /><span>Відправка сьогодні</span></div>
                </div>
             </div>

             {/* 1. БЛОК ХАРАКТЕРИСТИК (З ІКОНКАМИ) */}
             {isLaptop && product.cpu && (
                 <div className='bg-slate-100/50 p-6 rounded-3xl border border-slate-200'>
                     <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'><Zap className='w-5 h-5 text-slate-500'/> Специфікації</h3>
                     <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center'>
                            <div className='flex items-center gap-2 text-slate-400 mb-1'>
                                <Cpu className='w-4 h-4 text-indigo-500'/> 
                                <span className='text-xs font-bold uppercase'>Процесор</span>
                            </div>
                            <p className='font-bold text-slate-900 text-sm leading-tight'>{product.cpu}</p>
                        </div>
                        <div className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center'>
                            <div className='flex items-center gap-2 text-slate-400 mb-1'>
                                <MemoryStick className='w-4 h-4 text-purple-500'/> 
                                <span className='text-xs font-bold uppercase'>ОЗУ</span>
                            </div>
                            <p className='font-bold text-slate-900 text-sm leading-tight'>{product.ram}</p>
                        </div>
                        <div className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center'>
                            <div className='flex items-center gap-2 text-slate-400 mb-1'>
                                <HardDrive className='w-4 h-4 text-emerald-500'/> 
                                <span className='text-xs font-bold uppercase'>Диск</span>
                            </div>
                            <p className='font-bold text-slate-900 text-sm leading-tight'>{product.storage}</p>
                        </div>
                     </div>
                 </div>
             )}

             {/* 2. ЧЕК-ЛИСТ */}
             {checklist.length > 0 && (
                <div className='bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100'>
                    <h3 className='text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2'><ShieldCheck className='w-5 h-5'/> Перевірено SmartFix</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {checklist.map((item, i) => (
                            <div key={i} className='bg-white p-3 rounded-xl border border-emerald-100/50 flex items-start gap-3 shadow-sm'>
                                <CheckCircle2 className='w-5 h-5 text-emerald-500 mt-0.5 shrink-0' />
                                <div><p className='text-xs font-bold text-slate-400 uppercase tracking-wide'>{item.label}</p><p className='text-sm font-medium text-slate-800'>{item.value}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* 3. КОНСТРУКТОР АПГРЕЙДІВ */}
             {isLaptop && upgrades.length > 0 && (
                 <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200'>
                     <h3 className='font-bold text-slate-900 mb-4 flex items-center gap-2'><Settings className='w-5 h-5 text-indigo-600'/> Апгрейд заліза</h3>
                     <div className='space-y-3'>
                        {upgrades.map((u, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedUpgrades.includes(u.label) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                 onClick={() => {
                                     const newVal = selectedUpgrades.includes(u.label) 
                                        ? selectedUpgrades.filter(l => l !== u.label)
                                        : [...selectedUpgrades, u.label]
                                     setSelectedUpgrades(newVal)
                                 }}
                            >
                                <div className='flex items-center gap-3'>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedUpgrades.includes(u.label) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-400'}`}>
                                        {selectedUpgrades.includes(u.label) && <Check className='w-3.5 h-3.5' strokeWidth={3}/>}
                                    </div>
                                    <span className='font-medium text-slate-900'>{u.label}</span>
                                </div>
                                <span className='font-bold text-indigo-600'>+${Number(u.price)}</span>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             {/* 4. СЕРВІСНІ ПОСЛУГИ */}
             <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200'>
                 <h3 className='font-bold text-slate-900 mb-4 flex items-center gap-2'><Plus className='w-5 h-5 text-indigo-600'/> Додаткові послуги</h3>
                 <div className='space-y-3'>
                    {SERVICES.map((s) => (
                        <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedServices.includes(s.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                onClick={() => {
                                     const newVal = selectedServices.includes(s.id) 
                                        ? selectedServices.filter(id => id !== s.id)
                                        : [...selectedServices, s.id]
                                     setSelectedServices(newVal)
                                }}
                        >
                            <div className='flex items-center gap-3'>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedServices.includes(s.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-400'}`}>
                                    {selectedServices.includes(s.id) && <Check className='w-3.5 h-3.5' strokeWidth={3}/>}
                                </div>
                                <span className='font-medium text-slate-900'>{s.label}</span>
                            </div>
                            <span className='font-bold text-indigo-600'>+${s.price}</span>
                        </div>
                    ))}
                 </div>
             </div>

             <div className='prose prose-slate max-w-none'>
                <h3 className='text-xl font-bold mb-2'>Опис</h3>
                <p className='text-slate-600 leading-relaxed whitespace-pre-wrap'>{product.description || 'Опис відсутній.'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}