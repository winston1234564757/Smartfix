"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2, CheckCircle2, ClipboardCheck, Wand2, Cpu, HardDrive, Plus, X, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createProduct, updateProduct } from "@/app/actions/products"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageUpload } from "@/components/admin/ImageUpload"

const CATEGORY_FIELDS: Record<string, { showCpu: boolean; showGpu: boolean; showRam: boolean; showBattery: boolean; showScreen: boolean }> = {
    "IPHONE": { showCpu: false, showGpu: false, showRam: false, showBattery: true, showScreen: false },
    "ANDROID": { showCpu: false, showGpu: false, showRam: true, showBattery: true, showScreen: true },
    "LAPTOP": { showCpu: true, showGpu: true, showRam: true, showBattery: true, showScreen: true },
    "TABLET": { showCpu: true, showGpu: false, showRam: false, showBattery: true, showScreen: true },
    "WATCH": { showCpu: false, showGpu: false, showRam: false, showBattery: true, showScreen: true },
    "ACCESSORY": { showCpu: false, showGpu: false, showRam: false, showBattery: false, showScreen: false },
    "OTHER": { showCpu: false, showGpu: false, showRam: false, showBattery: false, showScreen: false }
}

const CHECKLIST_PRESETS: Record<string, readonly string[]> = {
    "IPHONE": ["Дисплей", "Корпус", "Face ID", "True Tone", "Акумулятор", "Камери", "Звук", "Зв''язок", "Кнопки", "Зарядка"],
    "ANDROID": ["Дисплей", "Корпус", "Сканер", "Камери", "Акумулятор", "Звук", "Зв''язок", "Google", "Кнопки", "Type-C"],
    "LAPTOP": ["Матриця", "Корпус", "Клавіатура", "Тачпад", "Петлі", "Батарея", "SSD", "Порти", "Зарядка", "iCloud/Bios"],
    "TABLET": ["Сенсор", "Дисплей", "Корпус", "Камери", "Батарея", "Кнопки", "Звук", "Зв''язок", "Touch ID", "Зарядка"],
    "WATCH": ["Скло", "Корпус", "Crown", "Кнопка", "Сенсори", "Батарея", "Вібрація", "Звук", "Ремінець", "iCloud"]
}

const LAPTOP_STORAGE_TYPES = ["SSD", "NVMe", "HDD", "eMMC", "Fusion"]
const LAPTOP_STORAGE_SIZES = ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB"]

const baseSchema = z.object({
  title: z.string().min(2, "Введіть назву"),
  model: z.string().min(1, "Введіть модель"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Вкажіть ціну"),
  purchaseCost: z.coerce.number().optional(),
  repairCost: z.coerce.number().optional(),
  category: z.string(),
  status: z.string(),
  grade: z.string(),
  color: z.string().optional(),
  storage: z.string().optional(), 
  cpu: z.string().optional(),
  ram: z.string().optional(),
  gpu: z.string().optional(),
  screenSize: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  arrivalDate: z.date().optional(),
  images: z.array(z.string()),
  checklist: z.record(z.string(), z.any().optional()).optional(),
  batteryHealth: z.string().optional(),
})

type ProductFormValues = z.infer<typeof baseSchema>

interface ProductFormProps {
  initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [laptopDrives, setLaptopDrives] = useState<{type: string, size: string}[]>([])
  const [currentDriveType, setCurrentDriveType] = useState<string>("")
  const [currentDriveSize, setCurrentDriveSize] = useState<string>("")

  useEffect(() => {
      if (initialData?.category === "LAPTOP" && initialData?.storage) {
          const parts = initialData.storage.split(" + ")
          const drives = parts.map((p: string) => {
              const [type, ...sizeParts] = p.split(" ")
              return { type, size: sizeParts.join(" ") }
          })
          setLaptopDrives(drives)
      }
  }, [initialData])

  // --- CRITICAL FIX: Ensure no undefined values to prevent React uncontrolled error ---
  const defaultValues: any = initialData ? {
      ...initialData,
      title: initialData.title || "",
      model: initialData.model || "",
      description: initialData.description || "",
      price: Number(initialData.price) || 0,
      purchaseCost: Number(initialData.purchaseCost) || 0,
      repairCost: Number(initialData.repairCost) || 0,
      arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate) : undefined,
      quantity: initialData.quantity || 1,
      checklist: initialData.checklist || {},
      batteryHealth: (initialData.checklist?.batteryHealth || initialData.checklist?.battery || "").toString(),
      color: initialData.color || "",
      storage: initialData.storage || "",
      cpu: initialData.cpu || "",
      ram: initialData.ram || "",
      gpu: initialData.gpu || "",
      screenSize: initialData.screenSize || "",
  } : {
      title: "", model: "", description: "",
      price: 0, purchaseCost: 0, repairCost: 0,
      category: "IPHONE", status: "AVAILABLE", grade: "A",
      color: "", storage: "", cpu: "", ram: "", gpu: "", screenSize: "",
      quantity: 1, images: [], checklist: {}, batteryHealth: "",
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(baseSchema) as any, // FIX: Force TS to accept schema
    defaultValues
  })

  const category = form.watch("category")
  const isPreOrder = form.watch("status") === "PRE_ORDER"
  
  useEffect(() => {
      if (category === "LAPTOP") {
          const storageString = laptopDrives.map(d => `${d.type} ${d.size}`).join(" + ")
          form.setValue("storage", storageString)
      }
  }, [laptopDrives, category, form])

  const addDrive = () => {
      if (!currentDriveType || !currentDriveSize) return
      const newDrives = [...laptopDrives, { type: currentDriveType, size: currentDriveSize }]
      setLaptopDrives(newDrives)
      setCurrentDriveType("")
      setCurrentDriveSize("")
  }

  const removeDrive = (index: number) => {
      setLaptopDrives(laptopDrives.filter((_, i) => i !== index))
  }

  const fieldsConfig = CATEGORY_FIELDS[category] || CATEGORY_FIELDS["OTHER"]
  const checklistItems = CHECKLIST_PRESETS[category] || []

  const fillPerfectDefaults = () => {
      const currentChecklist = form.getValues("checklist") || {}
      const newChecklist: Record<string, any> = { ...currentChecklist }
      checklistItems.forEach(item => {
          if (!newChecklist[item]) newChecklist[item] = "ОК"
      })
      form.setValue("checklist", newChecklist)
      toast.success("Заповнено")
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      setLoading(true)
      
      let finalStorage = values.storage
      if (values.category === "LAPTOP" && laptopDrives.length === 0) {
          if (currentDriveType && currentDriveSize) {
              finalStorage = `${currentDriveType} ${currentDriveSize}`
              toast.info("Автоматично додано вибраний диск")
          } else {
              toast.error("Додайте накопичувач")
              setLoading(false)
              return
          }
      }
      
      const cleanedChecklist = Object.fromEntries(
          Object.entries(values.checklist || {}).filter(([_, v]) => v !== undefined && v !== "")
      )

      const finalChecklist = { ...cleanedChecklist, batteryHealth: values.batteryHealth }
      
      const payload = { 
          ...values, 
          storage: finalStorage,
          checklist: finalChecklist,
          cpu: fieldsConfig.showCpu ? values.cpu : null,
          ram: fieldsConfig.showRam ? values.ram : null,
          gpu: fieldsConfig.showGpu ? values.gpu : null,
          screenSize: fieldsConfig.showScreen ? values.screenSize : null
      }

      let res;
      if (initialData) {
        res = await updateProduct(initialData.id, payload)
      } else {
        res = await createProduct(payload)
      }

      if (res?.error) {
          toast.error(res.error)
      } else {
          toast.success(initialData ? "Збережено" : "Створено")
          router.refresh()
          router.push("/products")
      }
    } catch (error) {
      console.error(error)
      toast.error("Помилка")
    } finally { setLoading(false) }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24 w-full">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
            <div className="xl:col-span-8 space-y-6">
                <Card className="rounded-[1.5rem] border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-4"><CardTitle>Основна інформація</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="images" render={({ field }) => (
                            <FormItem><FormControl><ImageUpload value={field.value} onChange={field.onChange} onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Назва</FormLabel><FormControl><Input placeholder="Назва..." {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem><FormLabel>Модель</FormLabel><FormControl><Input placeholder="Модель..." {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Категорія</FormLabel><Select onValueChange={field.onChange} value={field.value || "IPHONE"}><FormControl><SelectTrigger className="rounded-xl h-12 bg-slate-50"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="IPHONE">iPhone</SelectItem><SelectItem value="ANDROID">Android</SelectItem><SelectItem value="TABLET">Tablet</SelectItem><SelectItem value="LAPTOP">Laptop</SelectItem><SelectItem value="WATCH">Watch</SelectItem><SelectItem value="ACCESSORY">Accessory</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Опис</FormLabel><FormControl><Textarea placeholder="Деталі..." {...field} className="rounded-xl h-12 min-h-[48px] resize-none pt-3" /></FormControl></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-4 flex flex-row items-center gap-2"><CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5"/> Характеристики</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {category === "LAPTOP" ? (
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <FormLabel>Накопичувачі</FormLabel>
                                <div className="flex gap-2">
                                    <Select value={currentDriveType} onValueChange={setCurrentDriveType}><SelectTrigger className="bg-white rounded-lg h-10 w-[140px]"><SelectValue placeholder="Тип" /></SelectTrigger><SelectContent>{LAPTOP_STORAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                    <Select value={currentDriveSize} onValueChange={setCurrentDriveSize}><SelectTrigger className="bg-white rounded-lg h-10 w-[140px]"><SelectValue placeholder="Об''єм" /></SelectTrigger><SelectContent>{LAPTOP_STORAGE_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                                    <Button type="button" onClick={addDrive} size="icon" className="rounded-lg h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"><Plus className="w-5 h-5"/></Button>
                                </div>
                                {laptopDrives.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{laptopDrives.map((drive, idx) => (<div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium"><HardDrive className="w-4 h-4 text-slate-400"/> {drive.type} {drive.size}<button type="button" onClick={() => removeDrive(idx)} className="text-red-400 hover:text-red-600 ml-1"><X className="w-4 h-4"/></button></div>))}</div>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="storage" render={({ field }) => (<FormItem><FormLabel>Пам''ять</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Колір</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />
                                {fieldsConfig.showBattery && <FormField control={form.control} name="batteryHealth" render={({ field }) => (<FormItem><FormLabel>Батарея %</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                            </div>
                        )}
                        {(fieldsConfig.showCpu || fieldsConfig.showScreen) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                {fieldsConfig.showScreen && <FormField control={form.control} name="screenSize" render={({ field }) => (<FormItem><FormLabel>Дисплей</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                                {fieldsConfig.showCpu && <FormField control={form.control} name="cpu" render={({ field }) => (<FormItem><FormLabel>Процесор</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                                {fieldsConfig.showRam && <FormField control={form.control} name="ram" render={({ field }) => (<FormItem><FormLabel>RAM</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                                {fieldsConfig.showGpu && <FormField control={form.control} name="gpu" render={({ field }) => (<FormItem><FormLabel>Відеокарта</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                                {category === "LAPTOP" && <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Колір</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                                {category === "LAPTOP" && <FormField control={form.control} name="batteryHealth" render={({ field }) => (<FormItem><FormLabel>Цикли / %</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl></FormItem>)} />}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {checklistItems.length > 0 && (
                    <Card className="rounded-[1.5rem] border-slate-200 shadow-sm border-l-4 border-l-indigo-500 bg-white">
                        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-indigo-700 text-lg"><ClipboardCheck className="w-5 h-5"/> Паспорт перевірки</CardTitle><Button type="button" variant="outline" size="sm" onClick={fillPerfectDefaults} className="h-9 gap-2 text-indigo-600"><Wand2 className="w-4 h-4"/> Авто</Button></CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {checklistItems.map((item) => (
                                    <FormField key={item} control={form.control} name={`checklist.${item}` as any} render={({ field }) => (
                                        <FormItem className="grid grid-cols-12 items-center gap-4 space-y-0"><FormLabel className="col-span-5 font-semibold text-slate-700 text-sm truncate" title={item}>{item}</FormLabel><FormControl className="col-span-7"><Input {...field} value={field.value || ""} placeholder="ОК" className="h-10 rounded-lg bg-slate-50 focus:bg-white" /></FormControl></FormItem>
                                    )} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="xl:col-span-4 space-y-6">
                <Card className="rounded-[1.5rem] border-slate-200 shadow-xl shadow-indigo-500/10 bg-white xl:sticky xl:top-6">
                    <CardHeader className="bg-slate-900 text-white rounded-t-[1.5rem] py-4"><CardTitle>Фінанси та Статус</CardTitle></CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Статус</FormLabel><Select onValueChange={field.onChange} value={field.value || "AVAILABLE"}><FormControl><SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="AVAILABLE">В наявності</SelectItem><SelectItem value="PRE_ORDER">Передзамовлення</SelectItem><SelectItem value="ON_REQUEST">Під запит</SelectItem><SelectItem value="SOLD">Продано</SelectItem><SelectItem value="RESERVED">Резерв</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem><FormLabel>Грейд</FormLabel><Select onValueChange={field.onChange} value={field.value || "A"}><FormControl><SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="NEW">New</SelectItem><SelectItem value="A_PLUS">A+</SelectItem><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem></SelectContent></Select></FormItem>
                            )} />
                        </div>
                        {isPreOrder && (
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in">
                                <FormField control={form.control} name="arrivalDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="text-purple-900 font-bold">Очікується</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal rounded-xl border-purple-200 bg-white", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: uk }) : <span>Дата</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover></FormItem>)} />
                            </div>
                        )}
                        <div className="h-px bg-slate-100" />
                        <div className="space-y-4">
                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel className="font-bold">Ціна ($)</FormLabel><FormControl><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span><Input type="number" placeholder="0" {...field} className="pl-8 rounded-xl h-14 text-3xl font-black bg-slate-50 border-slate-200 focus:bg-white" /></div></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="purchaseCost" render={({ field }) => (<FormItem><FormLabel className="text-xs font-bold uppercase text-slate-500">Закупка</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl h-10" /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="repairCost" render={({ field }) => (<FormItem><FormLabel className="text-xs font-bold uppercase text-slate-500">Ремонт</FormLabel><FormControl><Input type="number" {...field} className="rounded-xl h-10" /></FormControl></FormItem>)} />
                            </div>
                            {(Number(form.watch("price")) > 0) && (<div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center"><span className="text-xs text-green-700 font-bold uppercase">Маржа</span><div className="font-black text-green-700 text-2xl">${Number(form.watch("price")) - Number(form.watch("purchaseCost")) - Number(form.watch("repairCost"))}</div></div>)}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all mt-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (initialData ? "Зберегти" : "Створити")}</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
  )
}