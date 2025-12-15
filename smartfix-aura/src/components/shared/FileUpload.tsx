'use client'

import { useState } from 'react'
import { X, UploadCloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onChange: (url?: string) => void
  value: string
  endpoint?: string // Більше не використовується, але залишимо для сумісності типів
}

export const FileUpload = ({ onChange, value }: FileUploadProps) => {
  const [loading, setLoading] = useState(false);

  // Функція завантаження
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валідація розміру (наприклад, 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Файл занадто великий (макс 4MB)");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onChange(data.url);
      toast.success("Фото завантажено!");
    } catch (error) {
      console.error(error);
      toast.error("Помилка завантаження");
    } finally {
      setLoading(false);
    }
  };

  // 1. Стан: Картинка вже є
  if (value) {
    return (
      <div className='relative h-48 w-48 mx-auto group'>
        <img
          src={value}
          alt='Preview'
          className='object-cover h-full w-full rounded-xl border-2 border-indigo-100 shadow-sm'
        />
        <Button
          onClick={() => onChange('')}
          className='bg-red-500 hover:bg-red-600 text-white p-1 rounded-full absolute -top-2 -right-2 h-7 w-7 shadow-md z-10 transition-transform hover:scale-110'
          type='button'
          size='icon'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  // 2. Стан: Завантаження або вибір файлу
  return (
    <div className='flex items-center justify-center w-full'>
      <label className='flex flex-col items-center justify-center w-full h-40 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-colors'>
        
        {loading ? (
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='w-8 h-8 text-indigo-600 animate-spin' />
            <p className='text-sm text-indigo-600 font-medium'>Зберігаємо...</p>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
            <UploadCloud className='w-10 h-10 mb-3 text-indigo-500' />
            <p className='mb-2 text-sm text-slate-500'><span className='font-semibold text-indigo-600'>Натисніть</span> щоб завантажити</p>
            <p className='text-xs text-slate-400'>PNG, JPG (MAX. 4MB)</p>
          </div>
        )}
        
        <input 
          type='file' 
          className='hidden' 
          onChange={handleFileChange}
          accept='image/*'
          disabled={loading}
        />
      </label>
    </div>
  )
}