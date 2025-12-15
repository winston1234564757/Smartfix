'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveOrderNotes } from '@/app/actions/admin-actions'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

export function NotesEditor({ orderId, initialNotes }: { orderId: string, initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    const res = await saveOrderNotes(orderId, notes)
    if (res.error) toast.error(res.error)
    else toast.success('Збережено!')
    setLoading(false)
  }

  return (
    <div className='space-y-3'>
        <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder='Напишіть коментар...'
            className='min-h-[120px] bg-yellow-50/50 border-yellow-200 focus:border-yellow-400 text-slate-700'
        />
        <Button size='sm' onClick={handleSave} disabled={loading} className='w-full bg-indigo-600 hover:bg-indigo-700'>
            {loading ? <Loader2 className='w-4 h-4 animate-spin'/> : <Save className='w-4 h-4 mr-2'/>}
            Зберегти нотатку
        </Button>
    </div>
  )
}