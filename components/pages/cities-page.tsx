"use client"

import { useState, useEffect } from "react"
import type {APIUser, User} from "@/types"
import { dataService } from "@/services/data-service"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X, Save, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface CitiesPageProps {
  user: APIUser
}

export function CitiesPage({ user }: CitiesPageProps) {
  const [savedCities, setSavedCities] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [cities, available] = await Promise.all([
        dataService.getCourierCities(user.id),
        dataService.getAvailableCities(),
      ])
      const citiesArray = Array.isArray(cities) ? cities : []
      const availableArray = Array.isArray(available) ? available : []

      setSavedCities(citiesArray)
      setSelectedCities([...citiesArray])
      setAvailableCities(availableArray)
    } catch (error) {
      console.error("Error loading cities:", error)
      setSavedCities([])
      setSelectedCities([])
      setAvailableCities([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city])
    }
    setOpen(false)
    setSearchValue("")
  }

  const handleRemoveCity = (cityToRemove: string) => {
    setSelectedCities(selectedCities.filter((city) => city !== cityToRemove))
  }

  const handleApplyChanges = async () => {
    try {
      await dataService.updateCourierCities(user.id, selectedCities)
      setSavedCities([...selectedCities])
      toast({
        title: "Города обновлены",
        description: "Ваши города обслуживания успешно сохранены",
      })
    } catch (error) {
      console.error("Error updating cities:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить города",
        variant: "destructive",
      })
    }
  }

  const handleResetChanges = () => {
    setSelectedCities([...savedCities])
    toast({
      title: "Изменения отменены",
      description: "Восстановлены сохраненные города",
    })
  }

  const hasChanges = () => {
    if (selectedCities.length !== savedCities.length) return true
    return selectedCities.some((city) => !savedCities.includes(city))
  }

  const filteredCities = availableCities.filter(
    (city) => !selectedCities.includes(city) && city.toLowerCase().includes(searchValue.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Мои города</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Мои города</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Добавить город</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-transparent"
              >
                Выберите город...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Поиск города..." value={searchValue} onValueChange={setSearchValue} />
                <CommandList>
                  <CommandEmpty>Город не найден.</CommandEmpty>
                  <CommandGroup>
                    {filteredCities.map((city) => (
                      <CommandItem key={city} value={city} onSelect={() => handleAddCity(city)}>
                        <Check
                          className={cn("mr-2 h-4 w-4", selectedCities.includes(city) ? "opacity-100" : "opacity-0")}
                        />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Выбранные города</Label>
          {selectedCities.length === 0 ? (
            <p className="text-muted-foreground">Города не выбраны</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCities.map((city) => (
                <Badge key={city} variant="secondary" className="flex items-center gap-1">
                  {city}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveCity(city)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {hasChanges() && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">У вас есть несохраненные изменения</p>
                <p className="text-sm text-muted-foreground">Нажмите "Применить", чтобы сохранить изменения</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleResetChanges}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Отменить
                </Button>
                <Button size="sm" onClick={handleApplyChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Применить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
