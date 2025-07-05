"use client"

import type { ReactNode } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { SortConfig } from "@/types"

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortConfig?: SortConfig | null
  onSort?: (key: string) => void
  actions?: (item: T) => ReactNode
}

export function DataTable<T extends { id: string }>({ data, columns, sortConfig, onSort, actions }: DataTableProps<T>) {
  // Убеждаемся, что data всегда массив
  const safeData = Array.isArray(data) ? data : []

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }

  console.log(columns)
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    onClick={() => onSort(String(column.key))}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    {column.label}
                    {getSortIcon(String(column.key))}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
            {actions && <TableHead>Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            safeData.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render((item as any)[column.key], item)
                      : String((item as any)[column.key] || "")}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(item)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
