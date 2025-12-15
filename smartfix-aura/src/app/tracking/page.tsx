'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, Loader2, CheckCircle2, Circle, Clock, Wrench, Package, ArrowRight } from 'lucide-react'
import { trackOrder } from '@/app/actions/tracking-actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// Статуси для візуалізації
const STEPS = [
    { id: 'NEW', label: 'Прийнято', icon: Clock },
    { id: 'DIAGNOSTIC', label: 'Діагностика', icon: Search },
    { id: 'IN_WORK', label: 'В роботі', icon: Wrench },
    { id: 'READY', label: 'Готово', icon: CheckCircle2 },
    { id: 'DONE', label: 'Видано', icon: Package },
]

export default function TrackingPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)
      setResult(null)
      
      const res = await trackOrder(query)
      
      if (res.error) {
          toast.error(res.error)
      } else {
          setResult(res)
      }
      setLoading(false)
  }

  // Визначаємо поточний крок
  const currentStatus = result?.data?.status || 'NEW'
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStatus)
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex

  return (
    <div className='min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50'>
        
        <div className='w-full max-w-lg text-center mb-8'>
            <h1 className='text-4xl font-black text-slate-900 mb-2 tracking-tight'>Де моє замовлення?</h1>
            <p className='text-slate-500'>Введіть номер замовлення або телефон</p>
        </div>

        <Card className='w-full max-w-lg p-2 rounded-[2rem] shadow-xl shadow-indigo-100 border-white'>
            <form onSubmit={handleSearch} className='flex gap-2 p-1'>
                <Input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder='Наприклад: 123456 або 096...' 
                    className='h-14 rounded-3xl bg-slate-50 border-transparent focus:bg-white text-lg px-6'
                />
                <Button type='submit' size='icon' className='h-14 w-14 rounded-3xl bg-slate-900 hover:bg-indigo-600 transition-colors' disabled={loading}>
                    {loading ? <Loader2 className='animate-spin'/> : <Search className='w-6 h-6'/>}
                </Button>
            </form>
        </Card>

        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='w-full max-w-2xl mt-8'
                >
                    <Card className='p-8 rounded-[2.5rem] border-slate-200 shadow-lg relative overflow-hidden'>
                        {/* HEADER */}
                        <div className='text-center mb-10 relative z-10'>
                            <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                                {result.type === 'REPAIR' ? 'Сервісне замовлення' : 'Покупка в магазині'}
                            </p>
                            <h2 className='text-2xl font-black text-slate-900'>
                                {result.type === 'REPAIR' ? result.data.deviceName : `Замовлення #${result.data.id.slice(-6).toUpperCase()}`}
                            </h2>
                            {result.type === 'REPAIR' && <p className='text-indigo-600 font-bold mt-1'>{result.data.serviceName}</p>}
                        </div>

                        {/* TIMELINE */}
                        <div className='relative z-10'>
                            <div className='flex justify-between items-start relative'>
                                {/* Лінія прогресу */}
                                <div className='absolute top-5 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full overflow-hidden'>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className='h-full bg-gradient-to-r from-indigo-500 to-purple-500'
                                    />
                                </div>

                                {STEPS.map((step, index) => {
                                    const isActive = index <= activeIndex
                                    const isCurrent = index === activeIndex
                                    const Icon = step.icon

                                    return (
                                        <div key={step.id} className='flex flex-col items-center gap-3 w-20'>
                                            <motion.div 
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: isActive ? 1 : 0.8 }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                                    isActive 
                                                        ? 'bg-white border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-200' 
                                                        : 'bg-white border-slate-200 text-slate-300'
                                                }`}
                                            >
                                                <Icon className='w-4 h-4' />
                                            </motion.div>
                                            <span className={`text-[10px] font-bold uppercase text-center transition-colors duration-300 ${
                                                isCurrent ? 'text-indigo-600' : isActive ? 'text-slate-700' : 'text-slate-300'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className='mt-10 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left'>
                            <div>
                                <p className='text-sm text-slate-500'>Клієнт</p>
                                <p className='font-bold text-slate-900'>{result.data.customerName}</p>
                            </div>
                            <div className='hidden sm:block w-px h-8 bg-slate-200'></div>
                            <div>
                                <p className='text-sm text-slate-500'>Сума до сплати</p>
                                <p className='font-black text-xl text-slate-900'>
                                    ${Number(result.data.price || result.data.total)}
                                </p>
                            </div>
                        </div>

                        {/* STATUS MESSAGE */}
                        {currentStatus === 'READY' && (
                            <div className='mt-4 bg-emerald-100 text-emerald-800 p-4 rounded-2xl text-center font-bold animate-pulse'>
                                Ваше замовлення готове до видачі! Чекаємо на вас.
                            </div>
                        )}
                        {currentStatus === 'DONE' && (
                            <div className='mt-4 bg-slate-100 text-slate-500 p-4 rounded-2xl text-center font-medium'>
                                Замовлення успішно завершено. Дякуємо!
                            </div>
                        )}

                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}