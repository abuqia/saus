import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PlanBadgeProps {
    plan: string
    className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
    const variants = {
        free: "bg-gray-100 text-gray-800 border-gray-200",
        starter: "bg-blue-100 text-blue-800 border-blue-200",
        pro: "bg-purple-100 text-purple-800 border-purple-200",
        enterprise: "bg-green-100 text-green-800 border-green-200",
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize",
                variants[plan as keyof typeof variants] || variants.free,
                className
            )}
        >
            {plan}
        </Badge>
    )
}
