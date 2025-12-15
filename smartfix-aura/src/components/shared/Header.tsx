"use client"

import Link from "next/link"
import { ShoppingCart, ShieldCheck, Wrench, RefreshCw, Package, LayoutDashboard, Home, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export function Header() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/products")

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
      
      {/* HEADER BODY */}
      <header className="no-shift pointer-events-auto w-[95%] max-w-7xl h-20 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-xl shadow-slate-200/20 flex items-center justify-between px-6 transition-all duration-300">
        
        {/* ЛІВА ЧАСТИНА */}
        <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-slate-900 text-white p-2.5 rounded-2xl group-hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                <Home className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight hidden sm:block">SmartFix</span>
        </Link>

        {/* ЦЕНТР */}
        <nav className="hidden lg:flex items-center gap-2">
            <Link href="/catalog">
                <Button variant="ghost" className="rounded-full bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 font-bold gap-2 h-11 px-5 transition-all hover:scale-105">
                    <Package className="w-5 h-5"/> Каталог
                </Button>
            </Link>
            <Link href="/trade-in">
                <Button variant="ghost" className="rounded-full bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 font-bold gap-2 h-11 px-5 transition-all hover:scale-105">
                    <RefreshCw className="w-5 h-5"/> Trade-In
                </Button>
            </Link>
            <Link href="/repair">
                <Button variant="ghost" className="rounded-full bg-orange-50/80 text-orange-700 hover:bg-orange-100 font-bold gap-2 h-11 px-5 transition-all hover:scale-105">
                    <Wrench className="w-5 h-5"/> Сервіс
                </Button>
            </Link>
            <Link href="/status">
                <Button variant="ghost" className="rounded-full bg-blue-50/80 text-blue-700 hover:bg-blue-100 font-bold gap-2 h-11 px-5 transition-all hover:scale-105">
                    <ShieldCheck className="w-5 h-5"/> Статус
                </Button>
            </Link>
        </nav>

        {/* ПРАВА ЧАСТИНА */}
        <div className="flex items-center gap-3">
            <Link href="/dashboard">
                <Button className={cn(
                    "rounded-full font-bold shadow-lg transition-all h-11 px-6 text-sm",
                    isDashboard ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                )}>
                    <LayoutDashboard className="w-4 h-4 mr-2"/> ADMIN
                </Button>
            </Link>

            <Link href="/cart">
                <Button variant="ghost" className="rounded-full hover:bg-slate-100/80 font-bold text-slate-700 h-11 px-4 gap-2">
                    <ShoppingCart className="w-6 h-6"/> <span className="hidden sm:inline">Кошик</span>
                </Button>
            </Link>

            {/* ПРОФІЛЬ: Додано ml-2 для відступу від кошика */}
            <div className="flex items-center ml-2">
                <SignedIn>
                    <UserButton 
                        afterSignOutUrl="/" 
                        appearance={{
                            elements: {
                                avatarBox: " mr-6 h-11 w-11 ring-2 ring-slate-100 hover:ring-indigo-100 transition-all"
                            }
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100/80 h-11 w-11">
                            <LogIn className="w-6 h-6 text-slate-700"/>
                        </Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>

      </header>
    </div>
  )
}