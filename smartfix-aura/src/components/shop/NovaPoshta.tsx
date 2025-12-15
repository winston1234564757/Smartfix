'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandInput,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const API_KEY = '2ebbfbcec55332cdf05bb3a5a14d3b57' 

type NPItem = { Ref: string; Description: string }

interface NovaPoshtaProps {
  onCityChange: (city: string) => void
  onWarehouseChange: (warehouse: string) => void
}

export function NovaPoshtaWidget({ onCityChange, onWarehouseChange }: NovaPoshtaProps) {
  const [cities, setCities] = useState<NPItem[]>([])
  const [warehouses, setWarehouses] = useState<NPItem[]>([])
  
  const [selectedCity, setSelectedCity] = useState<NPItem | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<NPItem | null>(null)

  const [citySearch, setCitySearch] = useState('')
  const [loadingCity, setLoadingCity] = useState(false)
  const [loadingWarehouse, setLoadingWarehouse] = useState(false)

  const [openCity, setOpenCity] = useState(false)
  const [openWarehouse, setOpenWarehouse] = useState(false)

  useEffect(() => {
    if (!citySearch) return
    const fetchCities = async () => {
      setLoadingCity(true)
      try {
        const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
          method: 'POST',
          body: JSON.stringify({
            apiKey: API_KEY,
            modelName: 'Address',
            calledMethod: 'getCities',
            methodProperties: { FindByString: citySearch, Limit: 20 }
          })
        })
        const data = await res.json()
        if (data.success) setCities(data.data)
      } catch (e) { console.error(e) } finally { setLoadingCity(false) }
    }
    const timer = setTimeout(fetchCities, 400)
    return () => clearTimeout(timer)
  }, [citySearch])

  useEffect(() => {
    if (!selectedCity) return
    const fetchWarehouses = async () => {
      setLoadingWarehouse(true)
      try {
        const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
          method: 'POST',
          body: JSON.stringify({
            apiKey: API_KEY,
            modelName: 'Address',
            calledMethod: 'getWarehouses',
            methodProperties: { CityRef: selectedCity.Ref }
          })
        })
        const data = await res.json()
        if (data.success) setWarehouses(data.data)
      } catch (e) { console.error(e) } finally { setLoadingWarehouse(false) }
    }
    fetchWarehouses()
  }, [selectedCity])

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* МІСТО */}
      <div className='flex flex-col gap-2 w-full'>
        <label className='text-sm font-medium text-slate-700'>Місто доставки</label>
        <Popover open={openCity} onOpenChange={setOpenCity}>
          <PopoverTrigger asChild>
            <Button variant='outline' role='combobox' className='w-full justify-between h-12 text-left bg-white border-slate-200 rounded-xl px-4 hover:border-indigo-300 transition-colors'>
              <span className='truncate text-slate-700'>{selectedCity ? selectedCity.Description : 'Почніть вводити назву міста...'}</span>
              {loadingCity ? <Loader2 className='ml-2 h-4 w-4 animate-spin opacity-50'/> : <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className='w-[320px] p-0 rounded-xl shadow-xl border-slate-100' align='start'>
            <Command shouldFilter={false}>
              <CommandInput placeholder='Київ, Львів...' value={citySearch} onValueChange={setCitySearch} className='h-11 border-none focus:ring-0' />
            </Command>
            <div className='max-h-[250px] overflow-y-auto overflow-x-hidden p-1.5 space-y-0.5 bg-white'>
               {!loadingCity && cities.length === 0 && <div className='py-6 text-center text-sm text-slate-400'>Місто не знайдено</div>}
               {cities.map((city) => (
                  <div key={city.Ref} onClick={() => { setSelectedCity(city); onCityChange(city.Description); setSelectedWarehouse(null); setOpenCity(false); }}
                    className={cn('relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-slate-50 hover:text-indigo-700', selectedCity?.Ref === city.Ref ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700')}
                  >
                    <Check className={cn('mr-2 h-4 w-4', selectedCity?.Ref === city.Ref ? 'opacity-100' : 'opacity-0')} />
                    {city.Description}
                  </div>
               ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ВІДДІЛЕННЯ */}
      <div className='flex flex-col gap-2 w-full'>
        <label className={cn('text-sm font-medium text-slate-700', !selectedCity && 'opacity-50')}>Відділення / Поштомат</label>
        <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
          <PopoverTrigger asChild disabled={!selectedCity}>
            <Button variant='outline' role='combobox' className='w-full justify-between h-12 text-left bg-white border-slate-200 rounded-xl px-4 hover:border-indigo-300 transition-colors disabled:opacity-50'>
              <span className='truncate text-slate-700'>{selectedWarehouse ? selectedWarehouse.Description : 'Оберіть відділення...'}</span>
              {loadingWarehouse ? <Loader2 className='ml-2 h-4 w-4 animate-spin opacity-50'/> : <MapPin className='ml-2 h-4 w-4 shrink-0 opacity-50' />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[320px] p-0 rounded-xl shadow-xl border-slate-100' align='start'>
            <Command shouldFilter={false}><CommandInput placeholder='Номер відділення...' className='h-11 border-none'/></Command>
            <div className='max-h-[250px] overflow-y-auto overflow-x-hidden p-1.5 space-y-0.5 bg-white'>
               {warehouses.length === 0 && !loadingWarehouse && <div className='py-6 text-center text-sm text-slate-400'>Відділення не знайдено</div>}
               {warehouses.map((wh) => (
                  <div key={wh.Ref} onClick={() => { setSelectedWarehouse(wh); onWarehouseChange(wh.Description); setOpenWarehouse(false); }}
                    className={cn('relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-slate-50 hover:text-indigo-700', selectedWarehouse?.Ref === wh.Ref ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700')}
                  >
                    <Check className={cn('mr-2 h-4 w-4 shrink-0', selectedWarehouse?.Ref === wh.Ref ? 'opacity-100' : 'opacity-0')} />
                    <span className='truncate'>{wh.Description}</span>
                  </div>
               ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}