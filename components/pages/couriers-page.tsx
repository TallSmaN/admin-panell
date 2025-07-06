"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Courier } from "@/types"
import { dataService } from "@/services/data-service"
import { useSort } from "@/hooks/use-sort"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null)
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })

  const { sortedData, requestSort, sortConfig } = useSort(couriers)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await dataService.getCouriers()
      setCouriers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading couriers:", error)
      setCouriers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.login.trim()) return

    try {
      if (editingCourier) {
        if (formData.password.trim()) {
          await dataService.updateCourierWithPassword(editingCourier.id, formData.login, formData.password)
          toast({
            title: "Курьер обновлен",
            description: "Логин и пароль успешно изменены",
          })
        } else {
          await dataService.updateCourier(editingCourier.id, formData.login, editingCourier.cities)
          toast({
            title: "Курьер обновлен",
            description: "Логин успешно изменен",
          })
        }
      } else {
        if (!formData.password.trim()) return
        await dataService.createCourier(formData.login, formData.password, [])
        toast({
          title: "Курьер создан",
          description: "Новый курьер успешно добавлен",
        })
      }

      await loadData()
      resetForm()
    } catch (error) {
      console.error("Error saving courier:", error)
    }
  }

  const handleEdit = (courier: Courier) => {
    setEditingCourier(courier)
    setFormData({
      login: courier.username,
      password: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (courier: Courier) => {
    if (confirm("Вы уверены, что хотите удалить этого курьера?")) {
      try {
        await dataService.deleteCourier(courier.id)
        await loadData()
        toast({
          title: "Курьер удален",
          description: "Курьер успешно удален из системы",
        })
      } catch (error) {
        console.error("Error deleting courier:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ login: "", password: "" })
    setEditingCourier(null)
    setIsDialogOpen(false)
  }

  const columns = [
    {
      key: "username" as keyof Courier,
      label: "Логин",
      sortable: true,
    },
    {
      key: "cities" as keyof Courier,
      label: "Города обслуживания",
      render: (cities: string[]) => {
        if (!Array.isArray(cities) || cities.length === 0) return "Не назначены"
        if (cities.length <= 2) return cities.join(", ")
        return `${cities.slice(0, 2).join(", ")} и еще ${cities.length - 2}`
      },
    },
  ]

  const actions = (courier: Courier) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(courier)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(courier)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Курьеры</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Курьеры</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourier(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить курьера
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{editingCourier ? "Редактировать курьера" : "Добавить курьера"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  disabled={!!editingCourier}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingCourier ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingCourier}
                  placeholder={editingCourier ? "Введите новый пароль" : "Введите пароль"}
                />
              </div>

              {editingCourier && (
                <div className="space-y-2">
                  <Label>Города обслуживания (только просмотр)</Label>
                  <div className="border rounded-md p-3 bg-muted">
                    <p className="text-sm text-muted-foreground">
                      {editingCourier.cities && editingCourier.cities.length > 0
                        ? editingCourier.cities.join(", ")
                        : "Города не назначены"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Курьер может изменить города самостоятельно в своем профиле
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button type="submit">{editingCourier ? "Сохранить" : "Создать"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={sortedData} columns={columns} sortConfig={sortConfig} onSort={requestSort} actions={actions} />
    </div>
  )
}
