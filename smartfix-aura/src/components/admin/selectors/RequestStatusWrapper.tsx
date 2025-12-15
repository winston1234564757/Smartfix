"use client"

import { UniversalStatusSelector } from "@/components/admin/UniversalStatusSelector"
import { updateRequestStatus } from "@/app/actions/request-admin-actions"

export function RequestStatusWrapper({ id, status }: { id: string, status: string }) {
    // Список статусів, доступних для Запитів
    const REQUEST_STATUSES = ["NEW", "SEARCHING", "FOUND", "COMPLETED", "CANCELED"]

    const handleUpdate = async (val: string) => {
        return await updateRequestStatus(id, val)
    }

    return <UniversalStatusSelector currentStatus={status} onUpdate={handleUpdate} options={REQUEST_STATUSES} />
}