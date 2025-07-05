"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Subcategory, Category } from "@/types"
import { dataService } from "@/services/data-service"
import { useSort } from "@/hooks/use-sort"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

export function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState({ name: "", categoryId: "" })

  const { sortedData, requestSort, sortConfig } = useSort(subcategories)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [subcategoriesData, categoriesData] = await Promise.all([
        dataService.getSubcategories(),
        dataService.getCategories(),
      ])
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error("Error loading data:", error)
      setSubcategories([])
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.categoryId) return

    try {
      if (editingSubcategory) {
        await dataService.updateSubcategory(editingSubcategory.id, formData.name, formData.categoryId)
      } else {
        await dataService.createSubcategory(formData.name, formData.categoryId)
      }
      await loadData()
      resetForm()
    } catch (error) {
      console.error("Error saving subcategory:", error)
    }
  }

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setFormData({ name: subcategory.name, categoryId: subcategory.categoryId })
    setIsDialogOpen(true)
  }

  const handleDelete = async (subcategory: Subcategory) => {
    if (confirm("Вы уверены, что хотите удалить эту подкатегорию?")) {
      try {
        await dataService.deleteSubcategory(subcategory.id)
        await loadData()
      } catch (error) {
        console.error("Error deleting subcategory:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", categoryId: "" })
    setEditingSubcategory(null)
    setIsDialogOpen(false)
  }

  const columns = [
    {
      key: "name" as keyof Subcategory,
      label: "Название",
      sortable: true,
    },
    {
      key: "categoryName" as keyof Subcategory,
      label: "Категория",
      sortable: true,
    },
    {
      key: "productsCount" as keyof Subcategory,
      label: "Количество товаров",
      sortable: true,
    },
  ]

  const actions = (subcategory: Subcategory) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(subcategory)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(subcategory)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Подкатегории</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Подкатегории</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSubcategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить подкатегорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{editingSubcategory ? "Редактировать подкатегорию" : "Добавить подкатегорию"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button type="submit">{editingSubcategory ? "Сохранить" : "Создать"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={sortedData} columns={columns} sortConfig={sortConfig} onSort={requestSort} actions={actions} />
    </div>
  )
}
