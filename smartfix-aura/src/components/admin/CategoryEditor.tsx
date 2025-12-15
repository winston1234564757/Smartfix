'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/shared/FileUpload'
import { updateCategoryMetadata } from '@/app/actions/category-actions'
import { toast } from 'sonner'
import { Save, Loader2, Link as LinkIcon, Edit } from 'lucide-react'
import { CategoryMetadata } from '@prisma/client'

interface Props {
    initialData: CategoryMetadata;
}

export function CategoryEditor({ initialData }: Props) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
    const [color, setColor] = useState(initialData.color);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        formData.set('id', initialData.id);
        formData.set('imageUrl', imageUrl);
        formData.set('color', color); 

        const res = await updateCategoryMetadata(formData);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(res.message);
        }
    };

    return (
        <Card className='h-full shadow-lg border-none'>
            <CardHeader>
                <CardTitle className='text-xl flex items-center gap-2'>
                    <Edit className='h-5 w-5 text-indigo-600' /> Редагувати {initialData.id}
                </CardTitle>
                <CardDescription className='flex items-center gap-2'>
                    <LinkIcon className='h-4 w-4' />
                    <span>Поточний URL: {imageUrl ? imageUrl.substring(0, 40) + '...' : 'Фото відсутнє'}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className='space-y-6'>
                    
                    {/* 1. ЗАВАНТАЖЕННЯ ФОТО */}
                    <div className='space-y-2'>
                        <Label>Зображення банера</Label>
                        <div className='flex justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50'>
                           <FileUpload 
                            endpoint='imageUploader' // Якщо ти вирішиш повернутись до UploadThing, тут треба буде замінити URL на наш локальний API
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url || '')}
                           />
                        </div>
                    </div>

                    {/* 2. ТЕКСТ та КОЛІР */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Текст кнопки</Label>
                            <Input name='buttonText' defaultValue={initialData.buttonText} placeholder='Перейти' />
                        </div>
                         <div className='space-y-2'>
                            <Label>Колір фону</Label>
                            <div className='flex items-center gap-2'>
                                <Input 
                                    name='color' 
                                    defaultValue={initialData.color} 
                                    placeholder='#4f46e5' 
                                    onChange={(e) => setColor(e.target.value)}
                                    className='w-full'
                                />
                                <div className='w-10 h-10 rounded-lg border border-slate-200' style={{ backgroundColor: color }}></div>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label>Опис банера</Label>
                        <Textarea name='description' defaultValue={initialData.description} rows={2} />
                    </div>

                    <Button type='submit' className='w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30' disabled={loading}>
                        {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                        Зберегти зміни
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}