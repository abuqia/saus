/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash, Users, Download, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

interface RoleBulkActionsProps {
    selectedRows: any[]
    onBulkDelete: (ids: number[]) => void
}

export function RoleBulkActions({ selectedRows, onBulkDelete }: RoleBulkActionsProps) {
    const toRole = (row: any) => (row?.original ? row.original : row)
    const roles = selectedRows.map(toRole)
    const selectedIds = roles.map((r: any) => r.id)
    const canDelete = roles.every((r: any) => (r.users_count ?? 0) === 0 && r.name !== 'super_admin')

    const handleBulkDelete = () => {
        if (!canDelete) {
            toast.error('Some selected roles cannot be deleted (have users or are system protected)')
            return
        }

        if (confirm(`Are you sure you want to delete ${selectedIds.length} roles?`)) {
            onBulkDelete(selectedIds)
        }
    }

    if (selectedRows.length === 0) {
        return null
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Selected
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        Export Users
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Roles
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
