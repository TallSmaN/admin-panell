import type {Category, Courier, Product, Subcategory} from "@/types"
import {apiClient} from "./api-client"
import {API_CDN, EndPoints} from "@/config/api-endpoints"

class DataService {
    private categories: Category[] = [
        {id: "1", name: "Elektronik", subcategoriesCount: 2},
        {id: "2", name: "Kleidung", subcategoriesCount: 1},
    ]

    private subcategories: Subcategory[] = [
        {id: "1", name: "Smartphones", categoryId: "1", categoryName: "Elektronik", productsCount: 2},
        {id: "2", name: "Laptops", categoryId: "1", categoryName: "Elektronik", productsCount: 1},
        {id: "3", name: "T-Shirts", categoryId: "2", categoryName: "Kleidung", productsCount: 1},
    ]

    private products: Product[] = [
        {
            id: "1",
            name: "iPhone 15",
            price: 800,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 15,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 5},
                    {id: "3", username: "CourierB", quantity: 10},
                ],
            },
            category: {
                id: "1",
                name: "Smartphones",
                subcategory: {id: "1", name: "Smartphones"},
            },
        },
        {
            id: "2",
            name: "Samsung Galaxy S24",
            price: 700,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 13,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 3},
                    {id: "3", username: "CourierB", quantity: 10},
                ],
            },
            category: {
                id: "1",
                name: "Smartphones",
                subcategory: {id: "1", name: "Smartphones"},
            },
        },
        {
            id: "3",
            name: "MacBook Pro",
            price: 1500,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 7,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 2},
                    {id: "3", username: "CourierB", quantity: 5},
                ],
            },
            category: {
                id: "2",
                name: "Laptops",
                subcategory: {id: "2", name: "Laptops"},
            },
        },
        {
            id: "4",
            name: "Basic T-Shirt",
            price: 25,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 20,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 8},
                    {id: "3", username: "CourierB", quantity: 12},
                ],
            },
            category: {
                id: "3",
                name: "T-Shirts",
                subcategory: {id: "3", name: "T-Shirts"},
            },
        },
    ]

    private couriers: Courier[] = [
        {id: "2", login: "courier1", cities: ["Bocholt", "Köln"]},
        {id: "3", login: "courier2", cities: ["Herne", "Lünen", "Dortmund"]},
    ]

    private courierPasswords: Record<string, string> = {
        "2": "courier123",
        "3": "courier456",
    }

    // Флаг для переключения между моком и API
    private USE_API = false // Фронтендер меняет на true для подключения бэкенда

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await apiClient.get<Category[]>(API_CDN.ADMIN, EndPoints.Categories.LIST)
        return response.success ? response.data! : []
    }

    async createCategory(name: string): Promise<Category | null> {
        const response = await apiClient.post<Category>(API_CDN.ADMIN, EndPoints.Categories.CREATE, {name})
        return response.success ? response.data! : null
    }

    async updateCategory(id: string, name: string): Promise<Category | null> {

        const response = await apiClient.put<Category>(API_CDN.ADMIN, EndPoints.Categories.UPDATE(id), {name})
        return response.success ? response.data! : null

    }

    async deleteCategory(id: string): Promise<boolean> {

        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Categories.DELETE(id))
        return response.success


    }

    // Subcategories
    async getSubcategories(): Promise<Subcategory[]> {

        const response = await apiClient.get<Subcategory[]>(API_CDN.ADMIN, EndPoints.Subcategories.LIST)
        return response.success ? response.data! : []


    }

    async createSubcategory(name: string, categoryId: string): Promise<Subcategory | null> {

        const response = await apiClient.post<Subcategory>(API_CDN.ADMIN, EndPoints.Subcategories.CREATE, {
            name,
            categoryId,
        })
        return response.success ? response.data! : null


    }

    async updateSubcategory(id: string, name: string, categoryId: string): Promise<Subcategory | null> {

        const response = await apiClient.put<Subcategory>(API_CDN.ADMIN, EndPoints.Subcategories.UPDATE(id), {
            name,
            categoryId,
        })
        return response.success ? response.data! : null
    }

    async deleteSubcategory(id: string): Promise<boolean> {

        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Subcategories.DELETE(id))
        return response.success
    }

    // Products
    async getProducts(): Promise<Product[]> {
        const response = await apiClient.get<Product[]>(API_CDN.ADMIN, EndPoints.Products.LIST)
        return response.success ? response.data! : []

    }

    async getProductsForCourier(courierId: string): Promise<Product[]> {
        if (this.USE_API) {
            const resp = await apiClient.get<Product[]>(
                API_CDN.ADMIN, EndPoints.Products.LIST_FOR_COURIER(courierId)
            );
            return resp.success ? resp.data! : [];
        }

        return this.products.map(product => {
            const entry = product.stock.perCourier.find(e => e.id === courierId);

            return {
                ...product,
                stock: {
                    total: entry?.quantity ?? 0,
                    perCourier: entry ? [entry] : [],
                },
            };
        });
    }

    async createProduct(name: string, subcategoryId: string, price: number, imageUrl?: string): Promise<Product | null> {

        const response = await apiClient.post<Product>(API_CDN.ADMIN, EndPoints.Products.CREATE, {
            name,
            subcategoryId,
            price,
            imageUrl,
        })
        return response.success ? response.data! : null
    }

    async updateProduct(
        id: string,
        name: string,
        subcategoryId: string,
        price: number,
        imageUrl?: string,
    ): Promise<Product | null> {
        if (this.USE_API) {
            const response = await apiClient.put<Product>(API_CDN.ADMIN, EndPoints.Products.UPDATE(id), {
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
                API_CDN.COURIER, EndPoints.Products.UPDATE_COURIER_QUANTITY(courierId), {productId, quantity})
            return response.success
        }

        const product = this.products.find((p) => p.id === productId)
        if (product) {
            const existing = product.stock.perCourier.find(c => c.id === courierId);
            if (existing) {
                existing.quantity = quantity;
            } else {
                product.stock.perCourier.push({
                    id: courierId,
                    username:
                    quantity,
                });
            }
            product.stock.total = product.stock.perCourier
                .reduce((sum, c) => sum + c.quantity, 0);

            return true;
        }
        return false
    }

    async deleteProduct(id: string): Promise<boolean> {
        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Products.DELETE(id))
        return response.success
    }

    // Couriers
    async getCouriers(): Promise<Courier[]> {
        const response = await apiClient.get<Courier[]>(API_CDN.ADMIN, EndPoints.Couriers.LIST)
        return response.success ? response.data! : []
    }

    async createCourier(username: string, password: string, cities: string[]): Promise<Courier | null> {
        const response = await apiClient.post<Courier>(API_CDN.ADMIN, EndPoints.Couriers.CREATE, {
            username,
            password,
            cities,
        })
        return response.success ? response.data! : null
    }

    async updateCourier(id: string, login: string, cities?: string[]): Promise<Courier | null> {
        if (this.USE_API) {
            const response = await apiClient.put<Courier>(API_CDN.ADMIN, EndPoints.Couriers.UPDATE(id), {
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

    async updateCourierWithPassword(id: string, username: string, password: string): Promise<Courier | null> {
        const response = await apiClient.put<Courier>(API_CDN.ADMIN, EndPoints.Couriers.UPDATE(id), {
            username,
            password,
        })
        return response.success ? response.data! : null
    }

    async deleteCourier(id: string): Promise<boolean> {
        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Couriers.DELETE(id))
        return response.success
    }

    // Cities
    async getAvailableCities(): Promise<string[]> {
        if (this.USE_API) {
            const response = await apiClient.get<string[]>(API_CDN.COURIER, EndPoints.References.CITIES)
            return response.success ? response.data! : []
        }

        return ["Bocholt", "Köln", "Herne", "Lünen", "Dortmund", "Moers", "Bonn", "Bad Honnef", "Rheinbach", "Kaarst"]
    }

    async getCourierCities(courierId: string): Promise<string[]> {
        if (this.USE_API) {
            const response = await apiClient.get<string[]>(API_CDN.COURIER, EndPoints.Couriers.FETCH_CITIES(courierId))
            return response.success ? response.data! : []
        }

        const courier = this.couriers.find((c) => c.id === courierId)
        return courier?.cities || []
    }

    async updateCourierCities(courierId: string, cities: string[]): Promise<boolean> {
        if (this.USE_API) {
            const response = await apiClient.put(API_CDN.COURIER, EndPoints.Couriers.UPDATE_CITIES(courierId), {cities})
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
