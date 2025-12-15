"use client"

import { UniversalStatusSelector } from "@/components/admin/UniversalStatusSelector"
import { 
    updateOrderStatus, 
    updateRepairStatus, 
    updateTradeInStatus, 
    updateRequestStatus 
} from "@/app/actions/universal-status-actions"

interface Props {
    id: string
    type: "ORDER" | "REPAIR" | "TRADE" | "REQ"
    currentStatus: string
}

export function ActivityStatusWrapper({ id, type, currentStatus }: Props) {
    
    let action: (id: string, status: string) => Promise<any>
    let options: string[] = []

    switch (type) {
        case "ORDER":
            action = updateOrderStatus
            options = ["PENDING", "CONFIRMED", "SENT", "DONE", "CANCELED"]
            break
        case "REPAIR":
            action = updateRepairStatus
            options = ["NEW", "DIAGNOSTIC", "IN_WORK", "READY", "DONE"]
            break
        case "TRADE":
            action = updateTradeInStatus
            options = ["NEW", "EVALUATING", "CONFIRMED", "COMPLETED", "CANCELED"]
            break
        case "REQ":
            action = updateRequestStatus
            options = ["NEW", "SEARCHING", "FOUND", "COMPLETED", "CANCELED"]
            break
        default:
            return <span>{currentStatus}</span>
    }

    const handleUpdate = async (val: string) => {
        return await action(id, val)
    }

    return (
        <div 
            onClick={(e) => {
                // БЛОКУЄМО СРАЦЮВАННЯ БАТЬКІВСЬКОГО ПОСИЛАННЯ (Link)
                e.preventDefault()
                e.stopPropagation()
            }}
            className="relative z-20" // Піднімаємо над Link
        > 
            <UniversalStatusSelector 
                currentStatus={currentStatus} 
                onUpdate={handleUpdate} 
                options={options} 
            />
        </div>
    )
}