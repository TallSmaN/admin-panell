import type { User } from "@/types"
import { apiClient } from "./api-client"
import { API_CONFIG } from "@/config/api-endpoints"

class AuthService {
  // Флаг для переключения между моком и API
  private USE_API = false // Фронтендер меняет на true для подключения бэкенда

  // Моковые данные для разработки
  private users: User[] = [
    {
      id: "1",
      login: "manager",
      password: "manager123",
      role: "manager",
    },
    {
      id: "2",
      login: "courier1",
      password: "courier123",
      role: "courier",
      cities: ["Bocholt", "Köln"],
    },
  ]

  async login(login: string, password: string): Promise<User | null> {
    if (this.USE_API) {
      const response = await apiClient.post<{ user: User; token: string }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        login,
        password,
      })

      if (response.success && response.data) {
        localStorage.setItem("authToken", response.data.token)
        localStorage.setItem("currentUser", JSON.stringify(response.data.user))
        return response.data.user
      }
      return null
    }

    // Мок для разработки
    const user = this.users.find((u) => u.login === login && u.password === password)
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }
    return null
  }

  async logout(): Promise<void> {
    if (this.USE_API) {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    }

    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const authService = new AuthService()
