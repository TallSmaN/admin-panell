"use client"

import { useState, useMemo } from "react"
import type { SortConfig, SortDirection } from "@/types"

export function useSort<T>(data: T[], initialSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key]
      const bValue = (b as any)[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const requestSort = (key: string) => {
    let direction: SortDirection = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  return { sortedData, requestSort, sortConfig }
}
