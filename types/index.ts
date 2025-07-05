export interface User {
  id: string
  login: string
  password: string
  role: "manager" | "courier"
  cities?: string[]
}

export interface APIUser {
  id: string
  username: string
  isManager: boolean
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

// Дополняем отсутствующий SubcategoryDTO
export interface SubcategoryDTO {
  id: string;
  name: string;
}

export interface CourierStockDTO {
  id: string;
  username: string;
  quantity: number;
}

export interface StockSummaryDTO {
  total: number;
  perCourier: CourierStockDTO[];
}

export interface ProductCategoryDTO {
  id: string;
  name: string;
  subcategory: SubcategoryDTO;
}

export interface Product{
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: StockSummaryDTO;
  category: ProductCategoryDTO;
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
