'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Store, RefreshCw, Settings, LogOut, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'

const menu = [
  { label: 'Огляд', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Замовлення', href: '/dashboard/orders', icon: ShoppingBag }, // Змінимо шлях на dashboard/orders
  { label: 'Заявки Trade-In', href: '/dashboard/trade-in', icon: RefreshCw },
  { label: 'Склад', href: '/products', icon: Store },
  { label: 'Банери', href: '/dashboard/categories', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-8 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl text-slate-900">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
             <Package className="w-5 h-5" />
           </div>
           SmartFix
        </Link>
        <p className="text-xs font-bold text-slate-400 mt-2 tracking-wider uppercase">Admin Panel</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menu.map((item) => {
           const Icon = item.icon
           const isActive = pathname === item.href
           
           return (
             <Link 
               key={item.href} 
               href={item.href}
               className={cn(
                 "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                 isActive 
                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                   : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
               )}
             >
               <Icon className="w-5 h-5" />
               {item.label}
             </Link>
           )
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
           <UserButton />
           <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Адміністратор</span>
              <span className="text-xs text-slate-400">Керування магазином</span>
           </div>
        </div>
      </div>
    </aside>
  )
}