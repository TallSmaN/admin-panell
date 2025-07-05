import {APIUser, User} from "@/types"
import { apiClient } from "./api-client"
import { API_CONFIG } from "@/config/api-endpoints"
import { jwtDecode } from "jwt-decode"

interface JwtClaims {
  username: string
  user_id: string
  isManager: boolean
  exp: number
}

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

  async login(username: string, password: string): Promise<APIUser | null> {
    const response = await apiClient.post<{ token: string }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {username, password})

    if (response.success && response.data) {
      let claims: JwtClaims


      claims = jwtDecode<JwtClaims>(response.data.token)


      localStorage.setItem("authToken", response.data.token)
      localStorage.setItem("currentUser", JSON.stringify(claims))

      return {
        username: claims.username,
        id: claims.user_id,
        isManager: claims.isManager
      }
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

  getCurrentUser(): APIUser | null {
    const userData = localStorage.getItem("currentUser")


    return userData ? JSON.parse(userData) : null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const authService = new AuthService()
