import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@inertiajs/react"
import {
    MoreVertical,
    Edit,
    Trash,
    Eye,
    Users,
    Key,
} from "lucide-react"
import type { Role } from "@/types"

interface RoleActionsProps {
    role: Role
    onDelete: (roleId: number) => void
}

export function RoleActions({ role, onDelete }: RoleActionsProps) {
    const canDelete = role.users_count === 0 && role.name !== 'super_admin'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href={`/roles/${role.id}`} className="cursor-pointer flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={`/roles/${role.id}/edit`} className="cursor-pointer flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Role
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={`/roles/${role.id}/users`} className="cursor-pointer flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={`/roles/${role.id}/permissions`} className="cursor-pointer flex items-center">
                        <Key className="mr-2 h-4 w-4" />
                        Manage Permissions
                    </Link>
                </DropdownMenuItem>

                {/* Delete Action */}
                {canDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(role.id!)}
                            className="cursor-pointer flex items-center text-destructive"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Role
                        </DropdownMenuItem>
                    </>
                )}

                {/* Protected Roles Info */}
                {!canDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            {(role.users_count ?? 0) > 0
                                ? `${role.users_count} users assigned`
                                : 'System role protected'
                            }
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
