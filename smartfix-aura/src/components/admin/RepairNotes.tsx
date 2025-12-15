'use client'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveRepairNotes } from '@/app/actions/repair-admin-actions'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

export function RepairNotes({ orderId, initialNotes }: { orderId: string, initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await saveRepairNotes(orderId, notes)
    toast.success('Коментар збережено')
    setLoading(false)
  }

  return (
    <div className='space-y-3'>
        <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder='Опишіть стан пристрою, приховані дефекти тощо...'
            className='min-h-[120px] bg-white border-blue-200 focus:border-blue-400'
        />
        <Button size='sm' onClick={handleSave} disabled={loading} className='bg-blue-600 hover:bg-blue-700'>
            {loading ? <Loader2 className='w-4 h-4 animate-spin'/> : <Save className='w-4 h-4 mr-2'/>}
            Зберегти запис
        </Button>
    </div>
  )
}