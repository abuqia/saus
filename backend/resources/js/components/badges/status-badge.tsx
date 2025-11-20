import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants = {
        active: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
        inactive: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
        suspended: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
        banned: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize",
                variants[status as keyof typeof variants] || variants.inactive,
                className
            )}
        >
            {status}
        </Badge>
    )
}
