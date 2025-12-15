import db from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Smartphone, Wrench } from 'lucide-react'
import Link from 'next/link'
import { createServiceDevice } from '@/app/actions/service-actions'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function ServicesDashboard() {
  const devices = await db.serviceDevice.findMany({
      include: { services: true }
  })

  // Компонент форми створення (Server Action in Client Component wrapper is ideal, but inline for speed)
  async function addDevice(formData: FormData) {
    'use server'
    await createServiceDevice(formData)
  }

  return (
    <div className='max-w-6xl mx-auto p-8'>
       <div className='flex items-center justify-between mb-8'>
          <div>
             <h1 className='text-3xl font-black text-slate-900'>Сервісний Центр</h1>
             <p className='text-slate-500'>Налаштування прайсу ремонтів</p>
          </div>
       </div>

       <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          
          {/* ФОРМА ДОДАВАННЯ ПРИСТРОЮ */}
          <Card className='h-fit border-indigo-200 bg-indigo-50/50'>
             <CardHeader><CardTitle className='text-indigo-900'>Додати модель</CardTitle></CardHeader>
             <CardContent>
                <form action={addDevice} className='space-y-4'>
                   <Input name='name' placeholder='Назва (напр. iPhone 14)' required className='bg-white'/>
                   <Input name='brand' placeholder='Бренд (напр. Apple)' required className='bg-white'/>
                   <select name='type' className='w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm'>
                      <option value='IPHONE'>iPhone</option>
                      <option value='ANDROID'>Android</option>
                      <option value='TABLET'>Tablet</option>
                      <option value='LAPTOP'>Laptop</option>
                   </select>
                   <Button type='submit' className='w-full bg-indigo-600 hover:bg-indigo-700'>
                      <Plus className='w-4 h-4 mr-2'/> Створити
                   </Button>
                </form>
             </CardContent>
          </Card>

          {/* СПИСОК МОДЕЛЕЙ */}
          <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
             {devices.map(device => (
                <Link key={device.id} href={`/dashboard/services/${device.id}`}>
                   <Card className='hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group'>
                      <CardContent className='p-6 flex items-center justify-between'>
                         <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all'>
                               <Smartphone className='w-6 h-6'/>
                            </div>
                            <div>
                               <h3 className='font-bold text-slate-900'>{device.name}</h3>
                               <p className='text-xs text-slate-500'>{device.services.length} послуг</p>
                            </div>
                         </div>
                         <Wrench className='w-5 h-5 text-slate-300 group-hover:text-indigo-500'/>
                      </CardContent>
                   </Card>
                </Link>
             ))}
             {devices.length === 0 && <p className='text-slate-400 col-span-2 text-center py-10'>Список порожній. Додайте першу модель.</p>}
          </div>

       </div>
    </div>
  )
}