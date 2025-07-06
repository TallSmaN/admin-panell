export const enum API_CDN {
    AUTH = "http://localhost:2335/api",
    ADMIN = "http://localhost:2331/api",
    COURIER = "http://localhost:2333/api"
}

export const EndPoints = {
    Auth: {
        LOGIN: "/login",
        LOGOUT: "/auth/logout",
        ME: "/auth/me",
    },

    // admin
    Categories: {
        LIST: "/admin/categories",
        CREATE: "/admin/category",
        UPDATE: (id: string) => `/admin/category/${id}`,
        DELETE: (id: string) => `/admin/category/${id}`
    },

    // admin
    Subcategories: {
        LIST: "/admin/subcategories",
        CREATE: "/admin/subcategory",
        UPDATE: (id: string) => `/admin/subcategory/${id}`,
        DELETE: (id: string) => `/admin/subcategory/${id}`
    },

    // admin
    Products: {
        LIST: "/admin/products",
        LIST_FOR_COURIER: (courierId: string) => `/products/courier/${courierId}`,
        CREATE: "/admin/product",
        UPDATE: (id: string) => `/admin/product/${id}`,
        DELETE: (id: string) => `/admin/product/${id}`,
        UPDATE_COURIER_QUANTITY: (courierId: string) =>
            `/courier/stock/${courierId}`
    },

    Couriers: {
        LIST: "/admin/couriers",
        CREATE: "/admin/courier",
        UPDATE: (id: string) => `/admin/courier/${id}`,
        DELETE: (id: string) => `/admin/courier/${id}`,
        FETCH_CITIES: (id: string) => `/courier/${id}/cities`,
        UPDATE_CITIES: (id: string) => `/courier/${id}/cities`
    },

    Images: {
        FETCH: (id: string) => `/images/${id}`,
        UPLOAD: (id: string) => `/admin/images/${id}`,
        DELETE: (id: string) => `/admin/images/${id}`
    },

    References: {
        CITIES: "/references/cities"
    }
} as const

export const buildApiUrl = (apiUrl: API_CDN, endpoint: string): string => {
    return `${apiUrl}${endpoint}`
}