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
import { useState, useEffect } from "react"

interface UserFiltersProps {
    currentFilters: {
        search?: string
        status?: string
        type?: string
        plan?: string
        sort_by?: string
        sort_direction?: string
    }
    onChange?: (filters: {
        status?: string
        type?: string
        plan?: string
        sort_by?: string
        sort_direction?: string
    }) => void
}

export function UserFilters({ currentFilters, onChange }: UserFiltersProps) {
    const [filters, setFilters] = useState({
        status: currentFilters.status || '',
        type: currentFilters.type || '',
        plan: currentFilters.plan || '',
        sort_by: currentFilters.sort_by || 'created_at',
        sort_direction: currentFilters.sort_direction || 'desc',
    })

    // Update local state when currentFilters change
    useEffect(() => {
        setFilters({
            status: currentFilters.status || '',
            type: currentFilters.type || '',
            plan: currentFilters.plan || '',
            sort_by: currentFilters.sort_by || 'created_at',
            sort_direction: currentFilters.sort_direction || 'desc',
        })
    }, [currentFilters])

    const handleFilterChange = (key: string, value: string) => {
        const normalized = value === 'all' ? '' : value
        const newFilters = { ...filters, [key]: normalized }
        setFilters(newFilters)
        onChange?.(newFilters)
    }

    const clearFilters = () => {
        const resetFilters = {
            status: '',
            type: '',
            plan: '',
            sort_by: 'created_at',
            sort_direction: 'desc',
        }
        setFilters(resetFilters)
        onChange?.(resetFilters)
    }

    const hasActiveFilters = filters.status || filters.type || filters.plan

    return (
        <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
            >
                <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
            >
                <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                </SelectContent>
            </Select>

            {/* Plan Filter */}
            <Select
                value={filters.plan}
                onValueChange={(value) => handleFilterChange('plan', value)}
            >
                <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
                value={filters.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="last_login_at">Last Login</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Select
                value={filters.sort_direction}
                onValueChange={(value) => handleFilterChange('sort_direction', value)}
            >
                <SelectTrigger className="w-[100px] h-9">
                    <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
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
