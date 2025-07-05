// Конфигурация API эндпоинтов
// Фронтендеру нужно только изменить BASE_URL и при необходимости пути к эндпоинтам

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:2331/api",
  ENDPOINTS: {
    // Аутентификация
    AUTH: {
      LOGIN: "/login",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
    },

    // Категории
    CATEGORIES: {
      LIST: "/admin/categories",
      CREATE: "/admin/category",
      UPDATE: (id: string) => `/admin/category/${id}`,
      DELETE: (id: string) => `/admin/category/${id}`,
    },

    // Подкатегории
    SUBCATEGORIES: {
      LIST: "/admin/subcategories",
      CREATE: "/admin/subcategory",
      UPDATE: (id: string) => `/admin/subcategory/${id}`,
      DELETE: (id: string) => `/admin/subcategory/${id}`,
    },

    // Товары
    PRODUCTS: {
      LIST: "/admin/products",
      LIST_FOR_COURIER: (courierId: string) => `/products/courier/${courierId}`,
      CREATE: "/admin/product",
      UPDATE: (id: string) => `/admin/product/${id}`,
      DELETE: (id: string) => `/admin/product/${id}`,
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
      FETCH: (id: string) => `/images/${id}`,
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
