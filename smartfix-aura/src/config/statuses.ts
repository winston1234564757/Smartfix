import { 
  CheckCircle2, Clock, Wrench, Package, Search, AlertCircle, 
  RefreshCw, Sparkles, HelpCircle, XCircle, Truck, Loader2, DollarSign
} from "lucide-react"

// Типи статусів для TypeScript (опціонально, але корисно)
export type StatusKey = string;

interface StatusConfig {
  label: string;
  color: string;
  icon: any;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
    // --- ЗАМОВЛЕННЯ (ORDERS) ---
    "PENDING": { label: "Обробка", color: "bg-blue-100 text-blue-700", icon: Clock },
    "CONFIRMED": { label: "Підтверджено", color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2 },
    "SENT": { label: "Відправлено", color: "bg-purple-100 text-purple-700", icon: Truck },
    "DONE": { label: "Виконано", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    "CANCELED": { label: "Скасовано", color: "bg-red-100 text-red-700", icon: XCircle },
    
    // --- РЕМОНТИ (REPAIRS) ---
    "NEW": { label: "Нова заявка", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    "DIAGNOSTIC": { label: "Діагностика", color: "bg-yellow-100 text-yellow-700", icon: Search },
    "IN_WORK": { label: "В роботі", color: "bg-orange-100 text-orange-700", icon: Wrench },
    "READY": { label: "Готово до видачі", color: "bg-teal-100 text-teal-700", icon: CheckCircle2 },
    
    // --- ЗАПИТИ НА ПОШУК (REQUESTS) ---
    "SEARCHING": { label: "В пошуку", color: "bg-orange-100 text-orange-700", icon: Search }, // Переклав SEARCHING
    "FOUND": { label: "Знайдено", color: "bg-emerald-100 text-emerald-700", icon: Sparkles },
    "COMPLETED": { label: "Успішно куплено", color: "bg-slate-900 text-white", icon: CheckCircle2 },
    
    // --- TRADE-IN ---
    "EVALUATING": { label: "Оцінка", color: "bg-yellow-100 text-yellow-700", icon: Search },
    
    // --- ЗАГАЛЬНІ (Fallbacks) ---
    "DEFAULT": { label: "Статус", color: "bg-slate-100 text-slate-700", icon: HelpCircle }
}

// Допоміжна функція для отримання конфігу безпечно
export const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG["DEFAULT"]
}