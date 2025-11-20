import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DataTableToolbarProps {
    searchKey?: string
    searchPlaceholder?: string
    filters?: React.ReactNode
    onSearch?: (value: string) => void
}

export function DataTableToolbar({
    searchKey,
    searchPlaceholder = "Search...",
    filters,
    onSearch,
}: DataTableToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {/* Search */}
            {searchKey && (
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Additional Filters */}
            {filters && (
                <div className="flex items-center gap-2">
                    {filters}
                </div>
            )}
        </div>
    )
}
