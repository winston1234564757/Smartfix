"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRepairOrder } from "@/app/actions/repair-actions"
import { toast } from "sonner"
import { Smartphone, Laptop, Tablet, ChevronRight, Clock, ArrowLeft, Loader2, CheckCircle2, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Props { devices: any[] }

// UPSELLS CONFIG
const UPSELLS = {
    "PHONE": [
        { id: "glass", label: "Поклейка захисного скла", price: 10 },
        { id: "clean", label: "Глибока чистка динаміків", price: 5 },
        { id: "case", label: "Силіконовий чохол", price: 15 },
    ],
    "LAPTOP": [
        { id: "thermal", label: "Чистка + Заміна термопасти", price: 25 },
        { id: "os", label: "Встановлення Windows/macOS + Драйвери", price: 20 },
        { id: "office", label: "Пакет програм (Office, etc.)", price: 10 },
    ],
    "TABLET": [
        { id: "glass", label: "Захисне скло", price: 15 },
        { id: "setup", label: "Налаштування планшету", price: 10 },
    ]
}

export function RepairWizard({ devices }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
     deviceType: "", deviceName: "", serviceName: "", price: 0, customerName: "", phone: "",
     upsells: [] as string[] // Selected extra services
  })

  // Рахуємо загальну суму
  const totalUpsellPrice = formData.upsells.reduce((acc, id) => {
      const category = formData.deviceType === "IPHONE" || formData.deviceType === "ANDROID" ? "PHONE" : formData.deviceType === "LAPTOP" ? "LAPTOP" : "TABLET"
      const item = UPSELLS[category as keyof typeof UPSELLS]?.find(u => u.id === id)
      return acc + (item?.price || 0)
  }, 0)
  const finalPrice = formData.price + totalUpsellPrice

  const filteredDevices = devices.filter(d => d.type === formData.deviceType)
  const selectedDevice = devices.find(d => d.name === formData.deviceName)

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)
      const data = new FormData()
      data.append("deviceName", formData.deviceName)
      
      // Формуємо повну назву послуги з допами
      const upsellNames = formData.upsells.map(id => {
          const category = formData.deviceType === "IPHONE" || formData.deviceType === "ANDROID" ? "PHONE" : formData.deviceType === "LAPTOP" ? "LAPTOP" : "TABLET"
          return UPSELLS[category as keyof typeof UPSELLS]?.find(u => u.id === id)?.label
      }).join(", ")
      
      const fullServiceName = formData.serviceName + (upsellNames ? ` (+ ${upsellNames})` : "")
      
      data.append("serviceName", fullServiceName)
      data.append("price", finalPrice.toString())
      data.append("customerName", formData.customerName)
      data.append("phone", formData.phone)

      const res = await createRepairOrder(data)
      if (res?.error) toast.error(res.error)
      else setStep(6)
      setLoading(false)
  }

  // BENTO GRID ITEM
  const BentoItem = ({ type, label, icon: Icon, color, size = "col-span-1" }: any) => (
      <div onClick={() => { setFormData({...formData, deviceType: type}); setStep(2) }} 
           className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] group ${color} ${size} h-40 flex flex-col justify-between`}>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity"><Icon className="w-24 h-24"/></div>
          <Icon className="w-8 h-8"/>
          <span className="font-bold text-xl">{label}</span>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-start">
        <div className="max-w-2xl w-full">
            <div className="text-center mb-10"><h1 className="text-4xl font-black text-slate-900 mb-2">SmartFix Service</h1><p className="text-slate-500">Майстерня твоїх гаджетів</p></div>

            {/* STEP 1: BENTO GRID */}
            {step === 1 && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <BentoItem type="IPHONE" label="iPhone" icon={Smartphone} color="bg-slate-900 text-white" size="col-span-2" />
                    <BentoItem type="ANDROID" label="Android" icon={Smartphone} color="bg-indigo-600 text-white" />
                    <BentoItem type="LAPTOP" label="Ноутбук" icon={Laptop} color="bg-purple-600 text-white" />
                    <BentoItem type="TABLET" label="Планшет" icon={Tablet} color="bg-pink-500 text-white" size="col-span-2" />
                </div>
            )}

            {/* STEP 2 & 3 (Model & Service Select) - Same as before but cleaner */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <div className="grid grid-cols-1 gap-3">
                        {filteredDevices.map(d => (
                            <div key={d.id} onClick={() => { setFormData({...formData, deviceName: d.name}); setStep(3) }} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-500 cursor-pointer flex justify-between items-center shadow-sm">
                                <span className="font-bold">{d.name}</span><ChevronRight className="w-5 h-5 text-slate-300"/>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <div className="grid grid-cols-1 gap-3">
                        {selectedDevice?.services.map((srv: any) => (
                            <div key={srv.id} onClick={() => { setFormData({...formData, serviceName: srv.title, price: Number(srv.price)}); setStep(4) }} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 cursor-pointer flex justify-between items-center shadow-sm group">
                                <div><h3 className="font-bold text-slate-900">{srv.title}</h3><div className="flex items-center gap-2 text-xs text-slate-500 mt-1"><Clock className="w-3 h-3"/> {srv.duration}</div></div>
                                <span className="font-black text-lg group-hover:text-indigo-600">${Number(srv.price)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 4: UPSELLS (NEW) */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Button variant="ghost" onClick={() => setStep(3)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <Card className="p-6 rounded-[2rem] border-slate-200 shadow-sm mb-6">
                        <h2 className="text-xl font-bold mb-4">Рекомендуємо додати</h2>
                        <div className="space-y-3">
                            {UPSELLS[formData.deviceType === "IPHONE" || formData.deviceType === "ANDROID" ? "PHONE" : formData.deviceType === "LAPTOP" ? "LAPTOP" : "TABLET"]?.map((u) => (
                                <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.upsells.includes(u.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}
                                     onClick={() => {
                                         const newUpsells = formData.upsells.includes(u.id) 
                                            ? formData.upsells.filter(i => i !== u.id)
                                            : [...formData.upsells, u.id]
                                         setFormData({...formData, upsells: newUpsells})
                                     }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${formData.upsells.includes(u.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                            {formData.upsells.includes(u.id) && <CheckCircle2 className="w-4 h-4"/>}
                                        </div>
                                        <span className="font-medium text-slate-900">{u.label}</span>
                                    </div>
                                    <span className="font-bold text-indigo-600">+${u.price}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Button onClick={() => setStep(5)} className="w-full h-14 rounded-xl text-lg font-bold bg-slate-900 text-white hover:bg-slate-800">
                        Продовжити (${finalPrice})
                    </Button>
                </div>
            )}

            {/* STEP 5: CONTACT */}
            {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Button variant="ghost" onClick={() => setStep(4)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <Card className="p-8 rounded-[2rem] border-indigo-100 shadow-xl shadow-indigo-500/10">
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Підсумок</h2>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between"><span>Послуга:</span> <span className="font-bold text-slate-900">{formData.serviceName}</span></div>
                                {formData.upsells.length > 0 && <div className="flex justify-between"><span>Додатково:</span> <span className="font-bold text-slate-900">{formData.upsells.length} послуг</span></div>}
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100"><span className="font-bold">Разом:</span> <span className="font-black text-2xl text-indigo-600">${finalPrice}</span></div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2"><Label>Імʼя</Label><Input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="h-12 rounded-xl bg-slate-50"/></div>
                            <div className="space-y-2"><Label>Телефон</Label><Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50"/></div>
                            <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 mt-4" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : "Записатися"}</Button>
                        </form>
                    </Card>
                </div>
            )}

            {step === 6 && (
                <div className="text-center py-20 animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12"/></div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Чекаємо вас!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">Дякуємо, {formData.customerName}. Ваша заявка створена.</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">На головну</Button>
                </div>
            )}
        </div>
    </div>
  )
}