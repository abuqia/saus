import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, router, usePage } from "@inertiajs/react"
import {
    MoreVertical,
    Edit,
    Trash,
    Ban,
    CheckCircle,
    Eye,
    Mail,
    Key,
    User as UserIcon,
    LogOut,
} from "lucide-react"
import { useState } from "react"
import type { User as UserType, PageProps } from "@/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface UserActionsProps {
    user: UserType
    onStatusChange: (userId: number, status: string) => void
}

export function UserActions({ user, onStatusChange }: UserActionsProps) {
    const { props } = usePage<PageProps>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const currentUser = props.auth.user
    const isCurrentUser = user.id === currentUser.id
    const isSuperAdmin = user.type === 'super_admin'
    const canDelete = !isSuperAdmin && !isCurrentUser
    const canImpersonate = !isCurrentUser && user.status === 'active' && !isSuperAdmin
    const isImpersonating = props.impersonating || false

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await router.delete(`/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("User deleted successfully")
                    setDeleteDialogOpen(false)
                },
                onError: (errors) => {
                    const errorMessage = errors?.message || "Failed to delete user"
                    toast.error(errorMessage)
                },
            })
        } catch {
            toast.error("An error occurred while deleting the user")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (status: string) => {
        try {
            await onStatusChange(user.id, status)
        } catch {
            toast.error("Failed to update user status")
        }
    }

    const handleSendEmail = () => {
        router.visit(`/users/${user.id}/email`)
    }

    const handleResetPassword = () => {
        router.visit(`/users/${user.id}/reset-password`)
    }

    const handleImpersonate = () => {
        // Gunakan window.location untuk redirect yang lebih reliable
        window.location.href = `/users/${user.id}/impersonate`
    }

    const stopImpersonating = () => {
        window.location.href = '/users/stop-impersonate'
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}`} className="cursor-pointer flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}/edit`} className="cursor-pointer flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSendEmail} className="cursor-pointer flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleResetPassword} className="cursor-pointer flex items-center">
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Impersonate Action */}
                    {canImpersonate && (
                        <DropdownMenuItem
                            onClick={() => setImpersonateDialogOpen(true)}
                            className="cursor-pointer flex items-center text-blue-600"
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Impersonate User
                        </DropdownMenuItem>
                    )}

                    {/* Stop Impersonating */}
                    {isImpersonating && (
                        <DropdownMenuItem
                            onClick={stopImpersonating}
                            className="cursor-pointer flex items-center text-orange-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Stop Impersonating
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Status Actions */}
                    {user.status === 'active' && !isCurrentUser && (
                        <DropdownMenuItem
                            onClick={() => handleStatusUpdate('suspended')}
                            className="cursor-pointer flex items-center text-orange-600"
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                        </DropdownMenuItem>
                    )}

                    {(user.status === 'suspended' || user.status === 'inactive') && !isCurrentUser && (
                        <DropdownMenuItem
                            onClick={() => handleStatusUpdate('active')}
                            className="cursor-pointer flex items-center text-green-600"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate User
                        </DropdownMenuItem>
                    )}

                    {/* Delete Action */}
                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen(true)}
                                className="cursor-pointer flex items-center text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete User
                            </DropdownMenuItem>
                        </>
                    )}

                    {/* Information Messages */}
                    {isCurrentUser && (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                Some actions disabled for current user
                            </div>
                        </>
                    )}

                    {isSuperAdmin && !isCurrentUser && (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                Super admin users cannot be impersonated or deleted
                            </div>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            account <strong>&quot;{user.name}&quot;</strong> and remove all their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete User"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Impersonate Confirmation Dialog */}
            <AlertDialog open={impersonateDialogOpen} onOpenChange={setImpersonateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Impersonate User</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to impersonate <strong>{user.name}</strong>.
                            <br /><br />
                            While impersonating:<br />
                            <span>- You will see the application as this user</span><br />
                            <span>- All actions will be performed as this user</span><br />
                            <span>- You can stop impersonating at any time</span><br />
                            <span>- This action will be logged for security purposes</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleImpersonate}
                            disabled={isLoading}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Impersonate User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
