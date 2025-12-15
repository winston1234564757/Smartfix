'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function StatusFilter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  function handleFilter(status: string) {
    const params = new URLSearchParams(searchParams)
    
    if (status && status !== 'ALL') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Select 
      defaultValue={searchParams.get('status')?.toString() || 'ALL'} 
      onValueChange={handleFilter}
    >
      <SelectTrigger className='w-[180px] bg-white'>
        <SelectValue placeholder='Статус' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='ALL'>Всі товари</SelectItem>
        <SelectItem value='AVAILABLE'>В наявності</SelectItem>
        <SelectItem value='SOLD'>Продані</SelectItem>
        <SelectItem value='RESERVED'>Резерв</SelectItem>
      </SelectContent>
    </Select>
  )
}