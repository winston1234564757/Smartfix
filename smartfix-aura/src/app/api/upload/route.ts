import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Генеруємо унікальне ім'я, щоб не перезатерти старі файли
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const originalName = file.name.replace(/\s/g, '-') // Прибираємо пробіли
    const filename = `${uniqueSuffix}-${originalName}`

    // Шлях до папки public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // Переконаємось, що папка існує
    await mkdir(uploadDir, { recursive: true })

    const path = join(uploadDir, filename)

    // Записуємо файл на диск
    await writeFile(path, buffer)
    console.log(`Saved file to ${path}`)

    // Повертаємо публічне посилання
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}