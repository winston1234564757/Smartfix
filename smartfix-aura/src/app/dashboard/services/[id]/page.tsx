import db from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Trash2, Plus, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { createServiceItem, deleteServiceItem } from '@/app/actions/service-actions'

interface Props {
  params: { id: string }
}

export default async function ServiceDevicePage({ params }: Props) {
  const { id } = await params
  const device = await db.serviceDevice.findUnique({
      where: { id },
      include: { services: true }
  })

  if (!device) return <div>Not found</div>

  async function addService(formData: FormData) {
    'use server'
    formData.append('deviceId', device!.id)
    await createServiceItem(formData)
  }

  async function removeService(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteServiceItem(id, device!.id)
  }

  return (
    <div className='max-w-5xl mx-auto p-8'>
       <div className='flex items-center gap-4 mb-8'>
          <Link href='/dashboard/services'>
             <Button variant='ghost' size='icon'><ArrowLeft className='w-5 h-5'/></Button>
          </Link>
          <div>
             <h1 className='text-3xl font-black text-slate-900'>{device.name}</h1>
             <p className='text-slate-500'>Керування прайсом</p>
          </div>
       </div>

       {/* ФОРМА ДОДАВАННЯ */}
       <Card className='mb-8 border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50'>
          <CardContent className='pt-6'>
             <h3 className='text-sm font-bold text-slate-900 mb-4'>Додати нову послугу</h3>
             <form action={addService} className='grid grid-cols-1 md:grid-cols-5 gap-4 items-end'>
                <div className='md:col-span-2 space-y-1'>
                    <label className='text-xs font-bold text-slate-500 ml-1'>Назва послуги</label>
                    <Input name='title' placeholder='Заміна дисплею (Оригінал)' required className='bg-white' />
                </div>
                <div className='space-y-1'>
                    <label className='text-xs font-bold text-slate-500 ml-1'>Ціна для клієнта ($)</label>
                    <Input name='price' type='number' placeholder='100' required className='bg-white font-bold text-slate-900' />
                </div>
                <div className='space-y-1'>
                    <label className='text-xs font-bold text-slate-500 ml-1'>Собівартість ($)</label>
                    <Input name='partCost' type='number' placeholder='40' className='bg-white border-red-100 text-red-600' />
                </div>
                <div className='space-y-1'>
                    <label className='text-xs font-bold text-slate-500 ml-1'>Час виконання</label>
                    <Input name='duration' placeholder='1 година' required className='bg-white' />
                </div>
                <Button type='submit' className='bg-emerald-600 hover:bg-emerald-700 w-full'>
                    <Plus className='w-4 h-4'/>
                </Button>
             </form>
          </CardContent>
       </Card>

       <div className='space-y-3'>
          <div className='flex px-4 text-xs font-bold text-slate-400 uppercase'>
             <span className='flex-1'>Послуга</span>
             <span className='w-32 text-right'>Клієнт платить</span>
             <span className='w-32 text-right'>Собівартість</span>
             <span className='w-32 text-right'>Прибуток</span>
             <span className='w-16'></span>
          </div>
          
          {device.services.map(service => {
             const profit = Number(service.price) - Number(service.partCost)
             return (
             <div key={service.id} className='bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all'>
                <div className='flex-1'>
                   <h3 className='font-bold text-slate-900'>{service.title}</h3>
                   <div className='flex items-center gap-4 mt-1 text-xs text-slate-500'>
                      <span className='flex items-center gap-1'><Clock className='w-3 h-3'/> {service.duration}</span>
                   </div>
                </div>
                
                <div className='w-32 text-right font-black text-xl text-slate-900'>
                   ${Number(service.price)}
                </div>
                
                <div className='w-32 text-right font-medium text-sm text-slate-400'>
                   -${Number(service.partCost)}
                </div>

                <div className='w-32 text-right font-bold text-emerald-600'>
                   +${profit}
                </div>

                <div className='w-16 flex justify-end'>
                   <form action={removeService}>
                      <input type='hidden' name='id' value={service.id} />
                      <Button variant='ghost' size='icon' className='text-slate-300 hover:text-red-500 hover:bg-red-50'>
                         <Trash2 className='w-4 h-4'/>
                      </Button>
                   </form>
                </div>
             </div>
          )})}
          {device.services.length === 0 && <p className='text-center text-slate-400 py-10'>Послуг ще не додано</p>}
       </div>
    </div>
  )
}