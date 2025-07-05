"use client"

import type {APIUser, User} from "@/types"
import { Button } from "@/components/ui/button"
import { Package, Tags, ShoppingCart, Users, MapPin, LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  user: APIUser
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
}

export function Sidebar({ user, currentPage, onPageChange, onLogout }: SidebarProps) {
  const managerMenuItems = [
    { key: "categories", label: "Категории", icon: Tags },
    { key: "subcategories", label: "Подкатегории", icon: Package },
    { key: "products", label: "Товары", icon: ShoppingCart },
    { key: "couriers", label: "Курьеры", icon: Users },
  ]

  const courierMenuItems = [
    { key: "products", label: "Товары", icon: ShoppingCart },
    { key: "cities", label: "Города", icon: MapPin },
  ]


  const menuItems = user.isManager ? managerMenuItems : courierMenuItems


  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Админ-панель</h2>
        <p className="text-sm text-muted-foreground">
          {user.username} ({user.isManager ? "Менеджер" : "Курьер"})
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.key}
              variant={currentPage === item.key ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onPageChange(item.key)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
