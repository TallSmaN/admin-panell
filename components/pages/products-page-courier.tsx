"use client"
import { useState, useEffect } from "react"
import type {APIUser, Product, User} from "@/types"
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
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingQuantities, setEditingQuantities] = useState<Record<string, number>>({})

  const { sortedData, requestSort, sortConfig } = useSort(products)

  useEffect(() => {
    loadProducts()
  }, [user])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const courierProducts = await dataService.getProductsForCourier(user.id)
      setProducts(Array.isArray(courierProducts) ? courierProducts : [])
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Убеждаемся, что sortedData всегда массив
  const safeData = Array.isArray(sortedData) ? sortedData : []

  const filteredProducts = safeData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    setEditingQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }))
  }

  const handleSaveQuantity = async (productId: string) => {
    const newQuantity = editingQuantities[productId]
    if (newQuantity !== undefined) {
      try {
        await dataService.updateCourierProductQuantity(productId, user.id, newQuantity)
        await loadProducts()

        // Убираем из редактируемых
        setEditingQuantities((prev) => {
          const updated = { ...prev }
          delete updated[productId]
          return updated
        })

        toast({
          title: "Количество обновлено",
          description: "Количество товара успешно изменено",
        })
      } catch (error) {
        console.error("Error updating quantity:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось обновить количество",
          variant: "destructive",
        })
      }
    }
  }

  const handleQuickAdjust = (productId: string, adjustment: number) => {
    const currentProduct = products.find((p) => p.id === productId)
    if (!currentProduct) return

    const currentQuantity = editingQuantities[productId] ?? currentProduct.stock.total
    const newQuantity = Math.max(0, currentQuantity + adjustment)

    setEditingQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }))
  }

  const isEditing = (productId: string) => {
    return editingQuantities[productId] !== undefined
  }

  const getDisplayQuantity = (product: Product) => {
    return editingQuantities[product.id] ?? product.stock.total
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
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {product.category.subcategory.name}
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
                    onClick={() => handleQuickAdjust(product.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Input
                    type="number"
                    value={getDisplayQuantity(product)}
                    onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                    min="0"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleQuickAdjust(product.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(product.id, -5)}
                  className="flex-1"
                >
                  -5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(product.id, -10)}
                  className="flex-1"
                >
                  -10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(product.id, 10)}
                  className="flex-1"
                >
                  +10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(product.id, 50)}
                  className="flex-1"
                >
                  +50
                </Button>
              </div>

              {isEditing(product.id) && (
                <Button onClick={() => handleSaveQuantity(product.id)} className="w-full" size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Сохранить изменения
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
