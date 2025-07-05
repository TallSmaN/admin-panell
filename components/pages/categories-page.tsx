"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Category } from "@/types"
import { dataService } from "@/services/data-service"
import { useSort } from "@/hooks/use-sort"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "" })

  const { sortedData, requestSort, sortConfig } = useSort(categories)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await dataService.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingCategory) {
        await dataService.updateCategory(editingCategory.id, formData.name)
      } else {
        await dataService.createCategory(formData.name)
      }
      await loadCategories()
      resetForm()
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setIsDialogOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
      try {
        await dataService.deleteCategory(category.id)
        await loadCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "" })
    setEditingCategory(null)
    setIsDialogOpen(false)
  }

  const columns = [
    {
      key: "name" as keyof Category,
      label: "Название",
      sortable: true,
    },
    {
      key: "subcategoriesCount" as keyof Category,
      label: "Количество подкатегорий",
      sortable: true,
    },
  ]

  const actions = (category: Category) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(category)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Категории</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Категории</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Редактировать категорию" : "Добавить категорию"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button type="submit">{editingCategory ? "Сохранить" : "Создать"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={sortedData} columns={columns} sortConfig={sortConfig} onSort={requestSort} actions={actions} />
    </div>
  )
}
