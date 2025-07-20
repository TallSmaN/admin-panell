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

export interface Categoryy {
    id: string;
    name: string;
}

export interface Subcategory {
    id: string;
    name: string;
    productCount: number;
    category: Categoryy;
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

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: StockSummaryDTO;
    category: ProductCategoryDTO;
}

export interface CourierProduct {
    id: string
    name: string
    quantity: number
    subcategory: {
        id: string
        name: string
    }
}

export interface Courier {
    id: string
    username: string
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
