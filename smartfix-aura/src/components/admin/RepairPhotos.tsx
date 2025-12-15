'use client'
import { useState } from 'react'
import { FileUpload } from '@/components/shared/FileUpload'
import { addRepairImage } from '@/app/actions/repair-admin-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function RepairPhotos({ orderId, images }: { orderId: string, images: string[] }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (url?: string) => {
      if (!url) return
      setIsUploading(true)
      await addRepairImage(orderId, url)
      toast.success('Фото додано')
      setIsUploading(false)
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {images.map((img, i) => (
            <div key={i} className='aspect-square rounded-xl overflow-hidden border border-slate-200 relative group'>
                <img src={img} className='w-full h-full object-cover' />
                <a href={img} target='_blank' className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all cursor-zoom-in'/>
            </div>
        ))}
        
        <div className='aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all'>
            {isUploading ? (
                <Loader2 className='w-6 h-6 animate-spin text-indigo-600'/>
            ) : (
                <>
                    <FileUpload endpoint='imageUploader' onChange={handleUpload} />
                    <span className='text-xs text-slate-400 font-medium mt-2'>Додати фото</span>
                </>
            )}
        </div>
    </div>
  )
}