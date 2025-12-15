"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string[]) => void
  onRemove: (value: string) => void
  value: string[]
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files || files.length === 0) return

      setIsLoading(true)
      const formData = new FormData()
      formData.append("file", files[0])

      // Використовуємо локальний API для завантаження
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      // Припускаємо, що API повертає { url: "..." } або { filePath: "..." }
      const newUrl = data.url || data.filePath || data[0] // Fallbacks
      
      if (newUrl) {
          onChange([...value, newUrl])
          toast.success("Зображення завантажено")
      } else {
          toast.error("Не вдалося отримати URL зображення")
      }

    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Помилка завантаження. Спробуйте ще раз.")
    } finally {
      setIsLoading(false)
      // Очищуємо інпут, щоб можна було завантажити той самий файл ще раз
      e.target.value = ""
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-xl overflow-hidden border border-slate-200 group">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          type="button"
          disabled={disabled || isLoading}
          variant="secondary"
          className="relative overflow-hidden bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          {isLoading ? (
             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
             <ImagePlus className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Завантаження..." : "Завантажити фото"}
          
          <input 
             id="file-upload"
             type="file" 
             accept="image/*"
             className="hidden"
             onChange={onUpload}
             disabled={disabled || isLoading}
          />
        </Button>
        
        {isLoading && <span className="text-xs text-slate-400 animate-pulse">Це може зайняти кілька секунд...</span>}
      </div>
    </div>
  )
}