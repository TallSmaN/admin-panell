import type { Category, Subcategory, Product, Courier } from "@/types"
import { apiClient } from "./api-client"
import { API_CONFIG } from "@/config/api-endpoints"

class DataService {
  // Моковые данные для разработки (можно удалить при подключении бэкенда)
  private categories: Category[] = [
    { id: "1", name: "Elektronik", subcategoriesCount: 2 },
    { id: "2", name: "Kleidung", subcategoriesCount: 1 },
  ]

  private subcategories: Subcategory[] = [
    { id: "1", name: "Smartphones", categoryId: "1", categoryName: "Elektronik", productsCount: 2 },
    { id: "2", name: "Laptops", categoryId: "1", categoryName: "Elektronik", productsCount: 1 },
    { id: "3", name: "T-Shirts", categoryId: "2", categoryName: "Kleidung", productsCount: 1 },
  ]

  private products: Product[] = [
    {
      id: "1",
      name: "iPhone 15",
      subcategoryId: "1",
      subcategoryName: "Smartphones",
      price: 800,
      totalQuantity: 15,
      courierQuantities: { "2": 5, "3": 10 },
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "2",
      name: "Samsung Galaxy S24",
      subcategoryId: "1",
      subcategoryName: "Smartphones",
      price: 700,
      totalQuantity: 13,
      courierQuantities: { "2": 3, "3": 10 },
    },
    {
      id: "3",
      name: "MacBook Pro",
      subcategoryId: "2",
      subcategoryName: "Laptops",
      price: 1500,
      totalQuantity: 7,
      courierQuantities: { "2": 2, "3": 5 },
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "4",
      name: "Basic T-Shirt",
      subcategoryId: "3",
      subcategoryName: "T-Shirts",
      price: 25,
      totalQuantity: 20,
      courierQuantities: { "2": 8, "3": 12 },
    },
  ]

  private couriers: Courier[] = [
    { id: "2", login: "courier1", cities: ["Bocholt", "Köln"] },
    { id: "3", login: "courier2", cities: ["Herne", "Lünen", "Dortmund"] },
  ]

  private courierPasswords: Record<string, string> = {
    "2": "courier123",
    "3": "courier456",
  }

  // Флаг для переключения между моком и API
  private USE_API = false // Фронтендер меняет на true для подключения бэкенда

  // Categories
  async getCategories(): Promise<Category[]> {
    if (this.USE_API) {
      const response = await apiClient.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST)
      return response.success ? response.data! : []
    }
    return [...this.categories]
  }

  async createCategory(name: string): Promise<Category | null> {
    if (this.USE_API) {
      const response = await apiClient.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, { name })
      return response.success ? response.data! : null
    }

    const category: Category = {
      id: Date.now().toString(),
      name,
      subcategoriesCount: 0,
    }
    this.categories.push(category)
    return category
  }

  async updateCategory(id: string, name: string): Promise<Category | null> {
    if (this.USE_API) {
      const response = await apiClient.put<Category>(API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE(id), { name })
      return response.success ? response.data! : null
    }

    const index = this.categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], name }
      return this.categories[index]
    }
    return null
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CATEGORIES.DELETE(id))
      return response.success
    }

    const index = this.categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.categories.splice(index, 1)

      // Каскадное удаление подкатегорий
      const subcategoriesToDelete = this.subcategories.filter((s) => s.categoryId === id)
      this.subcategories = this.subcategories.filter((s) => s.categoryId !== id)

      // Каскадное удаление товаров из удаленных подкатегорий
      const subcategoryIds = subcategoriesToDelete.map((s) => s.id)
      this.products = this.products.filter((p) => !subcategoryIds.includes(p.subcategoryId))

      return true
    }
    return false
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    if (this.USE_API) {
      const response = await apiClient.get<Subcategory[]>(API_CONFIG.ENDPOINTS.SUBCATEGORIES.LIST)
      return response.success ? response.data! : []
    }

    return this.subcategories.map((sub) => ({
      ...sub,
      productsCount: this.products.filter((p) => p.subcategoryId === sub.id).length,
    }))
  }

  async createSubcategory(name: string, categoryId: string): Promise<Subcategory | null> {
    if (this.USE_API) {
      const response = await apiClient.post<Subcategory>(API_CONFIG.ENDPOINTS.SUBCATEGORIES.CREATE, {
        name,
        categoryId,
      })
      return response.success ? response.data! : null
    }

    const category = this.categories.find((c) => c.id === categoryId)
    if (!category) return null

    const subcategory: Subcategory = {
      id: Date.now().toString(),
      name,
      categoryId,
      categoryName: category.name,
      productsCount: 0,
    }
    this.subcategories.push(subcategory)
    category.subcategoriesCount++
    return subcategory
  }

  async updateSubcategory(id: string, name: string, categoryId: string): Promise<Subcategory | null> {
    if (this.USE_API) {
      const response = await apiClient.put<Subcategory>(API_CONFIG.ENDPOINTS.SUBCATEGORIES.UPDATE(id), {
        name,
        categoryId,
      })
      return response.success ? response.data! : null
    }

    const index = this.subcategories.findIndex((s) => s.id === id)
    const category = this.categories.find((c) => c.id === categoryId)

    if (index !== -1 && category) {
      this.subcategories[index] = {
        ...this.subcategories[index],
        name,
        categoryId,
        categoryName: category.name,
      }
      return this.subcategories[index]
    }
    return null
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.SUBCATEGORIES.DELETE(id))
      return response.success
    }

    const index = this.subcategories.findIndex((s) => s.id === id)
    if (index !== -1) {
      const subcategory = this.subcategories[index]
      this.subcategories.splice(index, 1)

      // Обновляем счетчик подкатегорий в категории
      const category = this.categories.find((c) => c.id === subcategory.categoryId)
      if (category) {
        category.subcategoriesCount--
      }

      // Каскадное удаление товаров из этой подкатегории
      this.products = this.products.filter((p) => p.subcategoryId !== id)
      return true
    }
    return false
  }

  // Products
  async getProducts(): Promise<Product[]> {
    if (this.USE_API) {
      const response = await apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST)
      return response.success ? response.data! : []
    }
    return [...this.products]
  }

  async getProductsForCourier(courierId: string): Promise<Product[]> {
    if (this.USE_API) {
      const response = await apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST_FOR_COURIER(courierId))
      return response.success ? response.data! : []
    }

    return this.products.map((product) => ({
      ...product,
      totalQuantity: product.courierQuantities[courierId] || 0,
    }))
  }

  async createProduct(name: string, subcategoryId: string, price: number, imageUrl?: string): Promise<Product | null> {
    if (this.USE_API) {
      const response = await apiClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, {
        name,
        subcategoryId,
        price,
        imageUrl,
      })
      return response.success ? response.data! : null
    }

    const subcategory = this.subcategories.find((s) => s.id === subcategoryId)
    if (!subcategory) return null

    const product: Product = {
      id: Date.now().toString(),
      name,
      subcategoryId,
      subcategoryName: subcategory.name,
      price,
      totalQuantity: 0,
      courierQuantities: {},
      imageUrl,
    }
    this.products.push(product)
    return product
  }

  async updateProduct(
    id: string,
    name: string,
    subcategoryId: string,
    price: number,
    imageUrl?: string,
  ): Promise<Product | null> {
    if (this.USE_API) {
      const response = await apiClient.put<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id), {
        name,
        subcategoryId,
        price,
        imageUrl,
      })
      return response.success ? response.data! : null
    }

    const index = this.products.findIndex((p) => p.id === id)
    const subcategory = this.subcategories.find((s) => s.id === subcategoryId)

    if (index !== -1 && subcategory) {
      this.products[index] = {
        ...this.products[index],
        name,
        subcategoryId,
        subcategoryName: subcategory.name,
        price,
        imageUrl: imageUrl !== undefined ? imageUrl : this.products[index].imageUrl,
      }
      return this.products[index]
    }
    return null
  }

  async updateCourierProductQuantity(productId: string, courierId: string, quantity: number): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE_COURIER_QUANTITY(productId, courierId),
        { quantity },
      )
      return response.success
    }

    const product = this.products.find((p) => p.id === productId)
    if (product) {
      product.courierQuantities[courierId] = quantity
      product.totalQuantity = Object.values(product.courierQuantities).reduce((sum, qty) => sum + qty, 0)
      return true
    }
    return false
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id))
      return response.success
    }

    const index = this.products.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.products.splice(index, 1)
      return true
    }
    return false
  }

  // Couriers
  async getCouriers(): Promise<Courier[]> {
    if (this.USE_API) {
      const response = await apiClient.get<Courier[]>(API_CONFIG.ENDPOINTS.COURIERS.LIST)
      return response.success ? response.data! : []
    }
    return [...this.couriers]
  }

  async createCourier(login: string, password: string, cities: string[]): Promise<Courier | null> {
    if (this.USE_API) {
      const response = await apiClient.post<Courier>(API_CONFIG.ENDPOINTS.COURIERS.CREATE, {
        login,
        password,
        cities,
      })
      return response.success ? response.data! : null
    }

    const courier: Courier = {
      id: Date.now().toString(),
      login,
      cities,
    }
    this.couriers.push(courier)
    this.courierPasswords[courier.id] = password
    return courier
  }

  async updateCourier(id: string, login: string, cities?: string[]): Promise<Courier | null> {
    if (this.USE_API) {
      const response = await apiClient.put<Courier>(API_CONFIG.ENDPOINTS.COURIERS.UPDATE(id), {
        login,
        cities,
      })
      return response.success ? response.data! : null
    }

    const index = this.couriers.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.couriers[index] = {
        ...this.couriers[index],
        login,
        cities: cities || this.couriers[index].cities,
      }
      return this.couriers[index]
    }
    return null
  }

  async updateCourierWithPassword(id: string, login: string, password: string): Promise<Courier | null> {
    if (this.USE_API) {
      const response = await apiClient.put<Courier>(API_CONFIG.ENDPOINTS.COURIERS.UPDATE(id), {
        login,
        password,
      })
      return response.success ? response.data! : null
    }

    const courier = await this.updateCourier(id, login)
    if (courier && password.trim()) {
      this.courierPasswords[id] = password
    }
    return courier
  }

  async deleteCourier(id: string): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.COURIERS.DELETE(id))
      return response.success
    }

    const index = this.couriers.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.couriers.splice(index, 1)
      delete this.courierPasswords[id]
      return true
    }
    return false
  }

  // Cities
  async getAvailableCities(): Promise<string[]> {
    if (this.USE_API) {
      const response = await apiClient.get<string[]>(API_CONFIG.ENDPOINTS.REFERENCES.CITIES)
      return response.success ? response.data! : []
    }

    return ["Bocholt", "Köln", "Herne", "Lünen", "Dortmund", "Moers", "Bonn", "Bad Honnef", "Rheinbach", "Kaarst"]
  }

  async getCourierCities(courierId: string): Promise<string[]> {
    if (this.USE_API) {
      const response = await apiClient.get<string[]>(`/couriers/${courierId}/cities`)
      return response.success ? response.data! : []
    }

    const courier = this.couriers.find((c) => c.id === courierId)
    return courier?.cities || []
  }

  async updateCourierCities(courierId: string, cities: string[]): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.COURIERS.UPDATE_CITIES(courierId), { cities })
      return response.success
    }

    const courier = this.couriers.find((c) => c.id === courierId)
    if (courier) {
      courier.cities = cities
      return true
    }
    return false
  }

  getCourierByLogin(login: string): Courier | null {
    return this.couriers.find((c) => c.login === login) || null
  }
}

export const dataService = new DataService()
