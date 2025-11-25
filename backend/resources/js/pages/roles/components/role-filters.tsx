/* eslint-disable react-hooks/set-state-in-effect */
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { router } from "@inertiajs/react"
import { useState, useEffect } from "react"

interface RoleFiltersProps {
    currentFilters: {
        guard_name?: string
        sort_by?: string
        sort_direction?: string
    }
}

export function RoleFilters({ currentFilters }: RoleFiltersProps) {
    const [filters, setFilters] = useState({
        guard_name: currentFilters.guard_name || '',
        sort_by: currentFilters.sort_by || 'name',
        sort_direction: currentFilters.sort_direction || 'asc',
    })

    // Update local state when currentFilters change
    useEffect(() => {
        setFilters({
            guard_name: currentFilters.guard_name || '',
            sort_by: currentFilters.sort_by || 'name',
            sort_direction: currentFilters.sort_direction || 'asc',
        })
    }, [currentFilters])

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)

        // Apply filter immediately
        router.get('/roles', newFilters, {
            preserveState: true,
            replace: true,
        })
    }

    const clearFilters = () => {
        const resetFilters = {
            guard_name: '',
            sort_by: 'name',
            sort_direction: 'asc',
        }
        setFilters(resetFilters)
        router.get('/roles', resetFilters, {
            preserveState: true,
            replace: true,
        })
    }

    const hasActiveFilters = filters.guard_name

    return (
        <div className="flex items-center gap-2">
            {/* Guard Filter */}
            <Select
                value={filters.guard_name}
                onValueChange={(value) => handleFilterChange('guard_name', value)}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Guards" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Guards</SelectItem>
                    <SelectItem value="web">Web Guard</SelectItem>
                    <SelectItem value="api">API Guard</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
                value={filters.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
            >
                <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="label">Display Name</SelectItem>
                    <SelectItem value="users_count">User Count</SelectItem>
                    <SelectItem value="permissions_count">Permission Count</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Select
                value={filters.sort_direction}
                onValueChange={(value) => handleFilterChange('sort_direction', value)}
            >
                <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}

            {/* Filter Icon */}
            {!hasActiveFilters && (
                <Filter className="h-4 w-4 text-muted-foreground" />
            )}
        </div>
    )
}
