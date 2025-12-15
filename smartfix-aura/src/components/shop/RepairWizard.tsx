"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRepairOrder } from "@/app/actions/repair-actions"
import { toast } from "sonner"
import { Smartphone, Laptop, Tablet, ChevronRight, Clock, ArrowLeft, Loader2, CheckCircle2, Plus, Wrench } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Props { 
  devices: any[]
  addons: any[] 
}

export function RepairWizard({ devices, addons }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // State
  const [deviceType, setDeviceType] = useState("") 
  const [deviceName, setDeviceName] = useState("")
  const [service, setService] = useState<{name: string, price: number} | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]) // IDs
  
  const [contact, setContact] = useState({ name: "", phone: "" })

  // Helpers
  const filteredDevices = devices.filter(d => d.type === deviceType)
  const currentDevice = devices.find(d => d.name === deviceName)
  
  // Filter addons relevant to current category
  const relevantAddons = addons.filter(a => {
      // Mapping categories: IPHONE/ANDROID -> PHONE logic
      if ((deviceType === "IPHONE" || deviceType === "ANDROID") && (a.category === "IPHONE" || a.category === "ANDROID")) return true
      if (deviceType === "LAPTOP" && a.category === "LAPTOP") return true
      if (deviceType === "TABLET" && a.category === "TABLET") return true
      return false
  })

  // Calc Total
  const addonsTotal = selectedAddons.reduce((sum, id) => {
      const item = addons.find(a => a.id === id)
      return sum + Number(item?.price || 0)
  }, 0)
  
  const finalPrice = (service?.price || 0) + addonsTotal

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!service) return

      setLoading(true)
      const data = new FormData()
      data.append("deviceName", deviceName)
      data.append("serviceName", service.name)
      data.append("price", finalPrice.toString())
      data.append("customerName", contact.name)
      data.append("phone", contact.phone)
      data.append("upsells", JSON.stringify(selectedAddons))

      const res = await createRepairOrder(data)
      
      if (res?.error) {
          toast.error(res.error)
      } else {
          setStep(6)
          toast.success("Заявку створено!")
      }
      setLoading(false)
  }

  // BENTO GRID ITEM
  const BentoItem = ({ type, label, icon: Icon, color, size = "col-span-1" }: any) => (
      <div onClick={() => { setDeviceType(type); setStep(2) }} 
           className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group ${color} ${size} h-40 flex flex-col justify-between shadow-lg shadow-indigo-500/5`}>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity"><Icon className="w-24 h-24"/></div>
          <Icon className="w-8 h-8"/>
          <span className="font-bold text-xl">{label}</span>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-start">
        <div className="max-w-2xl w-full">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2">SmartFix Service</h1>
                <p className="text-slate-500">Майстерня твоїх гаджетів</p>
            </div>

            {/* STEP 1: CATEGORY */}
            {step === 1 && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BentoItem type="IPHONE" label="iPhone" icon={Smartphone} color="bg-slate-900 text-white" size="col-span-2" />
                    <BentoItem type="ANDROID" label="Android" icon={Smartphone} color="bg-indigo-600 text-white" />
                    <BentoItem type="LAPTOP" label="Ноутбук" icon={Laptop} color="bg-purple-600 text-white" />
                    <BentoItem type="TABLET" label="Планшет" icon={Tablet} color="bg-pink-500 text-white" size="col-span-2" />
                </div>
            )}

            {/* STEP 2: MODEL SELECT */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {filteredDevices.length > 0 ? filteredDevices.map((d, i) => (
                            <div key={d.id} onClick={() => { setDeviceName(d.name); setStep(3) }} 
                                 className={`p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors ${i !== filteredDevices.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                <span className="font-bold text-slate-700">{d.name}</span><ChevronRight className="w-5 h-5 text-slate-300"/>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-500">Немає пристроїв у цій категорії :(</div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3: SERVICE SELECT */}
            {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2"/> {deviceName}</Button>
                    <div className="grid grid-cols-1 gap-3">
                        {currentDevice?.services?.map((srv: any) => (
                            <div key={srv.id} onClick={() => { setService({name: srv.title, price: Number(srv.price)}); setStep(4) }} 
                                 className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex justify-between items-center transition-all group">
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{srv.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1"><Clock className="w-3 h-3"/> {srv.duration}</div>
                                </div>
                                <span className="font-black text-lg bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                                    ${Number(srv.price)}
                                </span>
                            </div>
                        ))}
                         {(!currentDevice?.services || currentDevice.services.length === 0) && (
                            <div className="text-center p-10 text-slate-500">Поки немає послуг для цього пристрою</div>
                         )}
                    </div>
                </div>
            )}

            {/* STEP 4: UPSELLS (DYNAMIC FROM DB) */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <Button variant="ghost" onClick={() => setStep(3)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <Card className="p-6 rounded-[2rem] border-slate-200 shadow-sm mb-6 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Рекомендуємо додати</h2>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">OPTIONAL</span>
                        </div>
                        
                        <div className="space-y-3">
                            {relevantAddons.map((u) => {
                                const isSelected = selectedAddons.includes(u.id)
                                return (
                                    <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                         onClick={() => {
                                             setSelectedAddons(prev => 
                                                prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id]
                                             )
                                         }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <CheckCircle2 className="w-4 h-4"/>}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 block">{u.label}</span>
                                                {u.isPopular && <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Популярне</span>}
                                            </div>
                                        </div>
                                        <span className="font-bold text-indigo-600">+${Number(u.price)}</span>
                                    </div>
                                )
                            })}
                            {relevantAddons.length === 0 && <div className="text-center py-4 text-slate-400 text-sm">Немає додаткових послуг для цієї категорії</div>}
                        </div>
                    </Card>
                    <Button onClick={() => setStep(5)} className="w-full h-14 rounded-xl text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] transition-all">
                        Продовжити (${finalPrice})
                    </Button>
                </div>
            )}

            {/* STEP 5: CONTACT & CONFIRM */}
            {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <Button variant="ghost" onClick={() => setStep(4)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
                    <Card className="p-8 rounded-[2rem] border-indigo-100 shadow-2xl shadow-indigo-500/10 bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Ваше замовлення</h2>
                            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Пристрій</div>
                                        <div className="font-bold text-slate-900">{deviceName}</div>
                                    </div>
                                    <Wrench className="w-5 h-5 text-slate-300"/>
                                </div>
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Послуга</div>
                                        <div className="font-bold text-slate-900">{service?.name}</div>
                                    </div>
                                    <div className="font-bold text-slate-900">${service?.price}</div>
                                </div>
                                {selectedAddons.length > 0 && (
                                    <>
                                        <div className="h-px bg-slate-200 w-full" />
                                        <div className="space-y-2">
                                            <div className="text-sm text-slate-500">Додатково:</div>
                                            {selectedAddons.map(id => {
                                                const item = addons.find(a => a.id === id)
                                                return (
                                                    <div key={id} className="flex justify-between text-sm">
                                                        <span className="text-slate-700">+ {item?.label}</span>
                                                        <span className="font-bold text-indigo-600">${Number(item?.price)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                                <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-lg">Всього до сплати</span>
                                    <span className="font-black text-3xl text-indigo-600">${finalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="ml-1">Ваше імʼя</Label>
                                <Input required placeholder="Ілон Маск" value={contact.name} onChange={e => setContact({...contact, name: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"/>
                            </div>
                            <div className="space-y-2">
                                <Label className="ml-1">Номер телефону</Label>
                                <Input required type="tel" placeholder="+380..." value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"/>
                            </div>
                            <Button type="submit" className="w-full h-16 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 mt-4 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin"/> : "Підтвердити запис"}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* STEP 6: SUCCESS */}
            {step === 6 && (
                <div className="text-center py-20 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                        <CheckCircle2 className="w-12 h-12"/>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Чекаємо вас!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
                        Дякуємо, <span className="font-bold text-slate-900">{contact.name}</span>.<br/>
                        Менеджер зв'яжеться з вами протягом 5 хвилин для підтвердження.
                    </p>
                    <div className="flex gap-4 justify-center">
                         <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">Новий запис</Button>
                         <Button onClick={() => window.location.href = '/'} className="rounded-full px-8 bg-slate-900 text-white">На головну</Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}