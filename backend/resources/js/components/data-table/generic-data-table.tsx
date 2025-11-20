/* eslint-disable react-hooks/incompatible-library */
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { cn } from "@/lib/utils"

interface GenericDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    filters?: React.ReactNode
    isLoading?: boolean
    pagination?: {
        currentPage: number
        lastPage: number
        perPage: number
        total: number
        onPageChange: (page: number) => void
    }
    onRowClick?: (row: TData) => void
    className?: string
}

export function GenericDataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    filters,
    isLoading = false,
    pagination,
    onRowClick,
    className,
}: GenericDataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    })

    if (isLoading) {
        return <DataTableSkeleton columns={columns.length} />
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Toolbar dengan search dan filters */}
            {(searchKey || filters) && (
                <DataTableToolbar
                    searchKey={searchKey}
                    searchPlaceholder={searchPlaceholder}
                    filters={filters}
                />
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={cn(
                                        onRowClick && "cursor-pointer hover:bg-muted/50"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No data found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <DataTablePagination
                    currentPage={pagination.currentPage}
                    lastPage={pagination.lastPage}
                    perPage={pagination.perPage}
                    total={pagination.total}
                    onPageChange={pagination.onPageChange}
                />
            )}
        </div>
    )
}
