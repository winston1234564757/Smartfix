"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createProduct, updateProduct } from "@/app/actions/products"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageUpload } from "@/components/admin/ImageUpload"

// SCHEMA
const formSchema = z.object({
  title: z.string().min(2, "Назва мінімум 2 символи"),
  model: z.string().min(1, "Вкажіть модель"),
  description: z.string().optional(),
  price: z.string().min(1, "Вкажіть ціну"),
  purchaseCost: z.string().optional(),
  repairCost: z.string().optional(),
  category: z.string(),
  status: z.string(),
  grade: z.string(),
  color: z.string().optional(),
  storage: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  arrivalDate: z.date().optional(),
  images: z.array(z.string())
})

interface ProductFormProps {
  initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: initialData.price.toString(),
      purchaseCost: initialData.purchaseCost?.toString() || "",
      repairCost: initialData.repairCost?.toString() || "",
      arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate) : undefined,
      quantity: initialData.quantity || 1
    } : {
      title: "",
      model: "",
      description: "",
      price: "",
      purchaseCost: "",
      repairCost: "",
      category: "SMARTPHONE",
      status: "AVAILABLE",
      grade: "A",
      color: "",
      storage: "",
      cpu: "",
      ram: "",
      quantity: 1,
      images: []
    }
  })

  // Слідкуємо за статусом
  const status = form.watch("status")
  const isPreOrder = status === "PRE_ORDER"

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      if (initialData) {
        await updateProduct(initialData.id, values)
        toast.success("Товар оновлено")
      } else {
        await createProduct(values)
        toast.success("Товар створено")
      }
      router.refresh()
      router.push("/products")
    } catch (error) {
      console.error(error)
      toast.error("Щось пішло не так")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ЛІВА КОЛОНКА: Основне */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <FormField control={form.control} name="images" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Фотографії</FormLabel>
                                <FormControl><ImageUpload value={field.value} onChange={field.onChange} onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Назва товару</FormLabel>
                                    <FormControl><Input placeholder="iPhone 15 Pro Max" {...field} className="rounded-xl h-12" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Модель (для пошуку)</FormLabel>
                                    <FormControl><Input placeholder="A2849..." {...field} className="rounded-xl h-12" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Опис</FormLabel>
                                <FormControl><Textarea placeholder="Детальний опис стану..." {...field} className="rounded-xl min-h-[120px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* ХАРАКТЕРИСТИКИ */}
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Характеристики</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel>Колір</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="storage" render={({ field }) => (
                                <FormItem><FormLabel>Пам`ять</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="cpu" render={({ field }) => (
                                <FormItem><FormLabel>Процесор</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="ram" render={({ field }) => (
                                <FormItem><FormLabel>ОЗУ</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ПРАВА КОЛОНКА: Налаштування */}
            <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm bg-slate-50/50">
                    <CardContent className="p-6 space-y-4">
                        
                        {/* СТАТУС & GRADE */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Статус</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="rounded-xl h-11 bg-white"><SelectValue placeholder="Статус" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">В наявності</SelectItem>
                                            <SelectItem value="PRE_ORDER" className="text-purple-600 font-bold">Передзамовлення</SelectItem>
                                            <SelectItem value="ON_REQUEST" className="text-blue-600 font-bold">Під запит</SelectItem>
                                            <SelectItem value="SOLD">Продано</SelectItem>
                                            <SelectItem value="RESERVED">Резерв</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Стан (Grade)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="rounded-xl h-11 bg-white"><SelectValue placeholder="Grade" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="NEW">New (Новий)</SelectItem>
                                            <SelectItem value="A_PLUS">A+ (Ідеал)</SelectItem>
                                            <SelectItem value="A">A (Гарний)</SelectItem>
                                            <SelectItem value="B">B (Середній)</SelectItem>
                                            <SelectItem value="C">C (Уцінка)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* --- БЛОК ПЕРЕДЗАМОВЛЕННЯ --- */}
                        {isPreOrder && (
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <FormField control={form.control} name="arrivalDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-purple-900 font-bold">Очікувана дата прибуття</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal rounded-xl border-purple-200 bg-white hover:bg-white", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP", { locale: uk }) : <span>Оберіть дату</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        )}

                        {/* КІЛЬКІСТЬ (Тільки для наявних або передзамовлень) */}
                        {(status === "AVAILABLE" || status === "PRE_ORDER") && (
                             <FormField control={form.control} name="quantity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Кількість (шт)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="rounded-xl bg-white h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <div className="h-px bg-slate-200 my-2" />

                        {/* ЦІНИ */}
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ціна продажу ($)</FormLabel>
                                <FormControl><Input type="number" placeholder="0.00" {...field} className="rounded-xl h-12 text-lg font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Закупка ($)</FormLabel><FormControl><Input type="number" {...field} className="


$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Шукаємо правильний шлях до файлу
$possiblePaths = @(
    "$PWD/src/components/admin/ProductForm.tsx",              # Якщо ми в корені проекту
    "$PWD/smartfix-aura/src/components/admin/ProductForm.tsx" # Якщо ми на рівень вище
)

$targetPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $targetPath = $path
        break
    }
}

if (-not $targetPath) {
    Write-Host "❌ ПОМИЛКА: Файл ProductForm.tsx не знайдено. Перейди в папку проекту (cd smartfix-aura)." -ForegroundColor Red
    return
}

Write-Host "✅ Знайдено файл: $targetPath" -ForegroundColor Green

# 2. Новий код форми (з кількістю та датою)
$productFormLogic = @'
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createProduct, updateProduct } from "@/app/actions/products"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageUpload } from "@/components/admin/ImageUpload"

// SCHEMA
const formSchema = z.object({
  title: z.string().min(2, "Назва мінімум 2 символи"),
  model: z.string().min(1, "Вкажіть модель"),
  description: z.string().optional(),
  price: z.string().min(1, "Вкажіть ціну"),
  purchaseCost: z.string().optional(),
  repairCost: z.string().optional(),
  category: z.string(),
  status: z.string(),
  grade: z.string(),
  color: z.string().optional(),
  storage: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  arrivalDate: z.date().optional(),
  images: z.array(z.string())
})

interface ProductFormProps {
  initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: initialData.price.toString(),
      purchaseCost: initialData.purchaseCost?.toString() || "",
      repairCost: initialData.repairCost?.toString() || "",
      arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate) : undefined,
      quantity: initialData.quantity || 1
    } : {
      title: "",
      model: "",
      description: "",
      price: "",
      purchaseCost: "",
      repairCost: "",
      category: "SMARTPHONE",
      status: "AVAILABLE",
      grade: "A",
      color: "",
      storage: "",
      cpu: "",
      ram: "",
      quantity: 1,
      images: []
    }
  })

  // Слідкуємо за статусом
  const status = form.watch("status")
  const isPreOrder = status === "PRE_ORDER"

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      if (initialData) {
        await updateProduct(initialData.id, values)
        toast.success("Товар оновлено")
      } else {
        await createProduct(values)
        toast.success("Товар створено")
      }
      router.refresh()
      router.push("/products")
    } catch (error) {
      console.error(error)
      toast.error("Щось пішло не так")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ЛІВА КОЛОНКА: Основне */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <FormField control={form.control} name="images" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Фотографії</FormLabel>
                                <FormControl><ImageUpload value={field.value} onChange={field.onChange} onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Назва товару</FormLabel>
                                    <FormControl><Input placeholder="iPhone 15 Pro Max" {...field} className="rounded-xl h-12" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Модель (для пошуку)</FormLabel>
                                    <FormControl><Input placeholder="A2849..." {...field} className="rounded-xl h-12" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Опис</FormLabel>
                                <FormControl><Textarea placeholder="Детальний опис стану..." {...field} className="rounded-xl min-h-[120px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* ХАРАКТЕРИСТИКИ */}
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Характеристики</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel>Колір</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="storage" render={({ field }) => (
                                <FormItem><FormLabel>Пам`ять</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="cpu" render={({ field }) => (
                                <FormItem><FormLabel>Процесор</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="ram" render={({ field }) => (
                                <FormItem><FormLabel>ОЗУ</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ПРАВА КОЛОНКА: Налаштування */}
            <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm bg-slate-50/50">
                    <CardContent className="p-6 space-y-4">
                        
                        {/* СТАТУС & GRADE */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Статус</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="rounded-xl h-11 bg-white"><SelectValue placeholder="Статус" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">В наявності</SelectItem>
                                            <SelectItem value="PRE_ORDER" className="text-purple-600 font-bold">Передзамовлення</SelectItem>
                                            <SelectItem value="ON_REQUEST" className="text-blue-600 font-bold">Під запит</SelectItem>
                                            <SelectItem value="SOLD">Продано</SelectItem>
                                            <SelectItem value="RESERVED">Резерв</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Стан (Grade)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="rounded-xl h-11 bg-white"><SelectValue placeholder="Grade" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="NEW">New (Новий)</SelectItem>
                                            <SelectItem value="A_PLUS">A+ (Ідеал)</SelectItem>
                                            <SelectItem value="A">A (Гарний)</SelectItem>
                                            <SelectItem value="B">B (Середній)</SelectItem>
                                            <SelectItem value="C">C (Уцінка)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* --- БЛОК ПЕРЕДЗАМОВЛЕННЯ --- */}
                        {isPreOrder && (
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <FormField control={form.control} name="arrivalDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-purple-900 font-bold">Очікувана дата прибуття</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal rounded-xl border-purple-200 bg-white hover:bg-white", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP", { locale: uk }) : <span>Оберіть дату</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        )}

                        {/* КІЛЬКІСТЬ (Тільки для наявних або передзамовлень) */}
                        {(status === "AVAILABLE" || status === "PRE_ORDER") && (
                             <FormField control={form.control} name="quantity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Кількість (шт)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="rounded-xl bg-white h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <div className="h-px bg-slate-200 my-2" />

                        {/* ЦІНИ */}
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ціна продажу ($)</FormLabel>
                                <FormControl><Input type="number" placeholder="0.00" {...field} className="rounded-xl h-12 text-lg font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Закупка ($)</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl bg-white" /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="repairCost" render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Ремонт ($)</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl bg-white" /></FormControl></FormItem>
                            )} />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-md font-bold bg-slate-900 hover:bg-indigo-600 transition-all shadow-lg mt-4">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Зберегти зміни" : "Створити товар")}
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
  )
}