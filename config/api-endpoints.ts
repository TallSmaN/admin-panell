// Конфигурация API эндпоинтов
// Фронтендеру нужно только изменить BASE_URL и при необходимости пути к эндпоинтам

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  ENDPOINTS: {
    // Аутентификация
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
    },

    // Категории
    CATEGORIES: {
      LIST: "/categories",
      CREATE: "/categories",
      UPDATE: (id: string) => `/categories/${id}`,
      DELETE: (id: string) => `/categories/${id}`,
    },

    // Подкатегории
    SUBCATEGORIES: {
      LIST: "/subcategories",
      CREATE: "/subcategories",
      UPDATE: (id: string) => `/subcategories/${id}`,
      DELETE: (id: string) => `/subcategories/${id}`,
    },

    // Товары
    PRODUCTS: {
      LIST: "/products",
      LIST_FOR_COURIER: (courierId: string) => `/products/courier/${courierId}`,
      CREATE: "/products",
      UPDATE: (id: string) => `/products/${id}`,
      DELETE: (id: string) => `/products/${id}`,
      UPDATE_COURIER_QUANTITY: (productId: string, courierId: string) =>
        `/products/${productId}/courier/${courierId}/quantity`,
    },

    // Курьеры
    COURIERS: {
      LIST: "/couriers",
      CREATE: "/couriers",
      UPDATE: (id: string) => `/couriers/${id}`,
      DELETE: (id: string) => `/couriers/${id}`,
      UPDATE_CITIES: (id: string) => `/couriers/${id}/cities`,
    },

    // Изображения
    IMAGES: {
      UPLOAD: "/images/upload",
      DELETE: "/images/delete",
    },

    // Справочники
    REFERENCES: {
      CITIES: "/references/cities",
    },
  },
}

// Хелпер для построения полного URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
