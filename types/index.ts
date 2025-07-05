export interface User {
  id: string
  login: string
  password: string
  role: "manager" | "courier"
  cities?: string[]
}

export interface Category {
  id: string
  name: string
  subcategoriesCount: number
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
  categoryName: string
  productsCount: number
}

export interface Product {
  id: string
  name: string
  subcategoryId: string
  subcategoryName: string
  price: number
  totalQuantity: number
  courierQuantities: Record<string, number>
  imageUrl?: string // Добавляем поле для фотографии
}

export interface Courier {
  id: string
  login: string
  cities: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  key: string
  direction: SortDirection
}

// Новые типы для работы с изображениями
export interface ImageUploadResponse {
  success: boolean
  imageUrl?: string
  error?: string
}
