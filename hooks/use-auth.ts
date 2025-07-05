"use client"

import { useState, useEffect } from "react"
import type {APIUser, User} from "@/types"
import { authService } from "@/services/auth-service"

export function useAuth() {
  const [user, setUser] = useState<APIUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])


  const login = async (username: string, password: string): Promise<boolean> => {
    const user = await authService.login(username, password)
    if (user) {
      setUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }
}
