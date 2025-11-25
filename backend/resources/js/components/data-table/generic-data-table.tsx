/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
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
    onSearch?: (value: string) => void
    searchValue?: string
    filters?: React.ReactNode
    isLoading?: boolean
    pagination?: {
        currentPage: number
        lastPage: number
        perPage: number
        total: number
        onPageChange: (page: number) => void
        onPerPageChange?: (perPage: number) => void
    }
    onRowClick?: (row: TData) => void
    className?: string
    clientSide?: boolean
    initialPerPage?: number
    clientFilters?: {
        status?: string
        type?: string
        plan?: string
        sort_by?: string
        sort_direction?: string
    }
    enableRowSelection?: boolean
    onSelectionChange?: (rows: TData[]) => void
    onRowSelectionChange?: (rows: TData[]) => void
    getRowId?: (row: TData, index: number) => string
}

export function GenericDataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    onSearch,
    searchValue,
    filters,
    isLoading = false,
    pagination,
    onRowClick,
    className,
    clientSide,
    initialPerPage = 15,
    clientFilters,
    enableRowSelection = false,
    onSelectionChange,
    onRowSelectionChange,
    getRowId,
}: GenericDataTableProps<TData, TValue>) {
    const normalizedSearch = (searchValue || '').toLowerCase().trim()
    const workingData: any[] = React.useMemo(() => {
        let rows: any[] = Array.isArray(data) ? [...data] : []
        if (clientSide) {
            if (normalizedSearch && searchKey) {
                rows = rows.filter((row: any) => {
                    const primary = String(row?.[searchKey] ?? '').toLowerCase()
                    const emailValue = String(row?.email ?? '').toLowerCase()
                    return primary.includes(normalizedSearch) || emailValue.includes(normalizedSearch)
                })
            }

            if (clientFilters?.status) {
                rows = rows.filter((row: any) => String(row?.status) === clientFilters.status)
            }
            if (clientFilters?.type) {
                rows = rows.filter((row: any) => String(row?.type) === clientFilters.type)
            }
            if (clientFilters?.plan) {
                rows = rows.filter((row: any) => String(row?.plan) === clientFilters.plan)
            }

            if (clientFilters?.sort_by) {
                const key = clientFilters.sort_by
                const dir = (clientFilters.sort_direction || 'desc') === 'asc' ? 1 : -1
                rows.sort((a: any, b: any) => {
                    const va = a?.[key]
                    const vb = b?.[key]
                    if (va == null && vb == null) return 0
                    if (va == null) return 1
                    if (vb == null) return -1
                    const isDateKey = key === 'created_at' || key === 'last_login_at'
                    const aa = isDateKey ? new Date(va).getTime() : String(va).toLowerCase()
                    const bb = isDateKey ? new Date(vb).getTime() : String(vb).toLowerCase()
                    if (aa < bb) return -1 * dir
                    if (aa > bb) return 1 * dir
                    return 0
                })
            }
        }
        return rows
    }, [data, clientSide, normalizedSearch, searchKey, clientFilters])

    let page = 1
    let perPage = initialPerPage
    let total = workingData.length
    let lastPage = Math.max(1, Math.ceil(total / perPage))
    let pagedData = React.useMemo(() => workingData.slice((page - 1) * perPage, page * perPage), [workingData, page, perPage])

    const [statePage, setStatePage] = React.useState(page)
    const [statePerPage, setStatePerPage] = React.useState(perPage)
    const [rowSelection, setRowSelection] = React.useState({} as Record<string, boolean>)

    if (clientSide) {
        page = statePage
        perPage = statePerPage
        total = workingData.length
        lastPage = Math.max(1, Math.ceil(total / perPage))
        if (page > lastPage) page = lastPage
        pagedData = workingData.slice((page - 1) * perPage, page * perPage)
    }

    const selectionColumn = React.useMemo<ColumnDef<TData, unknown>>(() => ({
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
                onClick={(e) => e.stopPropagation()}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
                onClick={(e) => e.stopPropagation()}
            />
        ),
        size: 32,
    }), [])

    const composedColumns = React.useMemo(() => {
        return enableRowSelection ? ([selectionColumn, ...columns] as ColumnDef<TData, any>[]) : columns
    }, [enableRowSelection, selectionColumn, columns])

    const table = useReactTable({
        data: clientSide ? pagedData : workingData,
        columns: composedColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        enableRowSelection,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
        getRowId: (row, index) => (typeof getRowId === "function" ? getRowId(row as TData, index) : String(index)),
    })

    React.useEffect(() => {
        const selected = table.getSelectedRowModel().flatRows.map(r => r.original as TData)
        if (onSelectionChange) onSelectionChange(selected)
        if (onRowSelectionChange) onRowSelectionChange(selected)
    }, [onSelectionChange, onRowSelectionChange, table, rowSelection])

    if (isLoading) {
        return <DataTableSkeleton columns={columns.length} />
    }

    return (
        <div className={cn("space-y-4 bg-card rounded-lg border shadow-sm", className)}>
            {/* Toolbar dengan search dan filters */}
            {(searchKey || filters) && (
                <DataTableToolbar
                    searchKey={searchKey}
                    searchPlaceholder={searchPlaceholder}
                    value={searchValue}
                    onSearch={onSearch}
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
                                        <TableCell key={cell.id} onClick={(e) => {
                                            if (cell.column.id === "select") e.stopPropagation()
                                        }}>
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
            {clientSide ? (
                <DataTablePagination
                    currentPage={page}
                    lastPage={lastPage}
                    perPage={perPage}
                    total={total}
                    onPageChange={(p) => setStatePage(Math.max(1, Math.min(p, lastPage)))}
                    onPerPageChange={(pp) => { setStatePerPage(pp); setStatePage(1); }}
                />
            ) : pagination && (
                <DataTablePagination
                    currentPage={pagination.currentPage}
                    lastPage={pagination.lastPage}
                    perPage={pagination.perPage}
                    total={pagination.total}
                    onPageChange={pagination.onPageChange}
                    onPerPageChange={pagination.onPerPageChange}
                />
            )}
        </div>
    )
}
