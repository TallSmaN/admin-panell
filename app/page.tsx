"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { Sidebar } from "@/components/layout/sidebar"
import { CategoriesPage } from "@/components/pages/categories-page"
import { SubcategoriesPage } from "@/components/pages/subcategories-page"
import { ProductsPage } from "@/components/pages/products-page"
import { CouriersPage } from "@/components/pages/couriers-page"
import { CitiesPage } from "@/components/pages/cities-page"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState("categories")

  if (isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>q
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Загрузка...</div>
        </div>
      </ThemeProvider>
    )
  }



  if (!isAuthenticated || !user) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LoginForm onLogin={login} />
      </ThemeProvider>
    )
  }

  // Установка начальной страницы в зависимости от роли
  const getInitialPage = () => {
    if (user.isManager) {
      return currentPage === "categories" ? "categories" : currentPage
    } else {
      return currentPage === "products" || currentPage === "cities" ? currentPage : "products"
    }
  }

  const renderPage = () => {
    const page = getInitialPage()
    switch (page) {
      case "categories":
        return user.isManager ? <CategoriesPage /> : null
      case "subcategories":
        return user.isManager ? <SubcategoriesPage /> : null
      case "products":
        console.log(1)
        return <ProductsPage user={user} />
      case "couriers":
        return user.isManager ? <CouriersPage /> : null
      case "cities":
        return !user.isManager ? <CitiesPage user={user} /> : null
      default:
        return user.isManager ? <CategoriesPage /> : <ProductsPage user={user} />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <Sidebar user={user} currentPage={getInitialPage()} onPageChange={setCurrentPage} onLogout={logout} />
        <main className="md:pl-64">
          <div className="p-6 pt-16 md:pt-6">{renderPage()}</div>
        </main>
      </div>
    </ThemeProvider>
  )
}
