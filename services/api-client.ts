// Универсальный API клиент
// Фронтендеру не нужно изменять этот файл

import {API_CDN, buildApiUrl} from "@/config/api-endpoints"

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    code?: number
}

class ApiClient {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("authToken")
        return {
            "Content-Type": "application/json",
            ...(token && {Authorization: `Bearer ${token}`}),
        }
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        try {

            const data = await response.json()



            if (!response.ok) {
                return {
                    success: false,
                    code: response.status
                }
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            }
        } catch (error) {
            return {
                success: false,
                error: "Ошибка обработки ответа сервера",
            }
        }
    }

    async get<T>(api: API_CDN, endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(buildApiUrl(api, endpoint), {
                method: "GET",
                headers: this.getAuthHeaders(),
            })
            return this.handleResponse<T>(response)
        } catch (error) {
            return {
                success: false,
                error: "Ошибка сети",
            }
        }
    }

    async post<T>(api: API_CDN, endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(buildApiUrl(api, endpoint), {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })
            return this.handleResponse<T>(response)
        } catch (error) {
            return {
                success: false,
                error: "Ошибка сети",
            }
        }
    }

    async put<T>(api: API_CDN, endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(buildApiUrl(api, endpoint), {
                method: "PUT",
                headers: this.getAuthHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })
            return this.handleResponse<T>(response)
        } catch (error) {
            return {
                success: false,
                error: "Ошибка сети",
            }
        }
    }

    async delete<T>(api: API_CDN, endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(buildApiUrl(api, endpoint), {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            })
            return this.handleResponse<T>(response)
        } catch (error) {
            return {
                success: false,
                error: "Ошибка сети",
            }
        }
    }

    async uploadFile<T>(api: API_CDN, endpoint: string, file: File): Promise<ApiResponse<T>> {
        try {
            const formData = new FormData()
            formData.append("file", file)

            const token = localStorage.getItem("authToken")
            const headers: HeadersInit = {}
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }
            
            const response = await fetch(buildApiUrl(api, endpoint), {
                method: "POST",
                headers,
                body: formData,
            })
            return this.handleResponse<T>(response)
        } catch (error) {
            return {
                success: true,
                error: "Ошибка загрузки файла",
            }
        }
    }
}

export const apiClient = new ApiClient()
