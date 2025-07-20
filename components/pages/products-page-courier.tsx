"use client"
import { useState, useEffect } from "react"
import type {APIUser, CourierProduct, Product, User} from "@/types"
import { dataService } from "@/services/data-service"
import { useSort } from "@/hooks/use-sort"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Minus, Plus, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProductsPageCourierProps {
  user: APIUser
}

export function ProductsPageCourier({ user }: ProductsPageCourierProps) {
  const [products, setProducts] = useState<CourierProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingQuantities, setEditingQuantities] = useState<Record<string, number>>({})

  const { sortedData, requestSort, sortConfig } = useSort(products)

  useEffect(() => {
    loadProducts()
  }, [user])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      console.log(user)
      const courierProducts = await dataService.getProductsForCourier(user.id)
      setProducts(Array.isArray(courierProducts) ? courierProducts : [])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = (Array.isArray(sortedData) ? sortedData : []).filter(p =>
      (p.name + p.subcategory.name).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDisplayQuantity = (p: CourierProduct) => editingQuantities[p.id] ?? p.quantity

  const handleQuantityChange = (id: string, qty: number) =>
      qty >= 0 &&
      setEditingQuantities(prev => ({ ...prev, [id]: qty }))

  const handleQuickAdjust = (id: string, delta: number) => {
    const base = editingQuantities[id] ?? products.find(p => p.id === id)?.quantity ?? 0
    setEditingQuantities(prev => ({ ...prev, [id]: Math.max(0, base + delta) }))
  }

  const handleSaveQuantity = async (id: string) => {
    const qty = editingQuantities[id]
    if (qty === undefined) return
    try {
      await dataService.updateCourierProductQuantity(id, user.id, qty)
      await loadProducts()
      setEditingQuantities(prev => {
        const r = { ...prev }
        delete r[id]
        return r
      })
      toast({ title: "Количество обновлено", description: "Количество товара успешно изменено" })
    } catch {
      toast({ title: "Ошибка", description: "Не удалось обновить количество", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Мои товары</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Мои товары</h1>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(p => (
          <Card key={p.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{p.name}</CardTitle>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {p.subcategory.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Мое количество:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleQuickAdjust(p.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Input
                    type="number"
                    value={getDisplayQuantity(p)}
                    onChange={(e) => handleQuantityChange(p.id, Number.parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                    min="0"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleQuickAdjust(p.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(p.id, -5)}
                  className="flex-1"
                >
                  -5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(p.id, -10)}
                  className="flex-1"
                >
                  -10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(p.id, 10)}
                  className="flex-1"
                >
                  +10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(p.id, 50)}
                  className="flex-1"
                >
                  +50
                </Button>
              </div>

              {editingQuantities[p.id] !== undefined && (
                  <Button size="sm" className="w-full" onClick={() => handleSaveQuantity(p.id)}>
                    <Check className="mr-2 h-4 w-4" /> Сохранить изменения
                  </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Попробуйте изменить поисковый запрос" : "У вас пока нет товаров"}
          </p>
        </div>
      )}
    </div>
  )
}
