import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    actions?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn(className)}>
            <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    </div>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <Separator />
        </div>
    )
}

// Stats Card Component
interface StatsCardProps {
    title: string
    value: string | number
    description?: string
    icon?: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white dark:text-white">{title}</p>
                    <p className="text-2xl font-bold text-foreground dark:text-foreground">{value}</p>
                    {description && (
                        <p className="text-xs text-white dark:text-white">{description}</p>
                    )}
                </div>
                {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                        <Icon className="h-6 w-6 text-primary dark:text-primary" />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center gap-1">
                    <span
                        className={cn(
                            "text-xs font-medium",
                            trend.isPositive ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {trend.isPositive ? "+" : ""}
                        {trend.value}%
                    </span>
                    <span className="text-xs text-muted-foreground">from last month</span>
                </div>
            )}
        </div>
    )
}

// Empty State Component
interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
                className
            )}
        >
            {Icon && (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
            )}
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}
