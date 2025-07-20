"use client"

import React, {useEffect} from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { imageService } from "@/services/image-service"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {API_CDN} from "@/config/api-endpoints";

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string | null) => void
  isDisabled?: boolean
  productId: string
}

export function ImageUpload({ currentImageUrl, onImageChange, isDisabled = false, productId}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null)
  }, [currentImageUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !productId) return

    const validation = imageService.validateImage(file)
    if (!validation.valid) {
      toast({
        title: "Ошибка загрузки",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const result = await imageService.uploadImage(file, productId)
      if (result.success && result.imageUrl) {
        setPreviewUrl(result.imageUrl)
        onImageChange(result.imageUrl)
        toast({
          title: "Изображение загружено",
          description: "Фотография товара успешно добавлена",
        })
      } else {
        toast({
          title: "Ошибка загрузки",
          description: result.error || "Не удалось загрузить изображение",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке изображения",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (previewUrl) {
      try {
        await imageService.deleteImage(productId)
        setPreviewUrl(null)
        onImageChange(null)
        toast({
          title: "Изображение удалено",
          description: "Фотография товара была удалена",
        })
      } catch (error) {
        toast({
          title: "Ошибка удаления",
          description: "Не удалось удалить изображение",
          variant: "destructive",
        })
      }
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  console.log(previewUrl)

  return (
    <div className="space-y-2">

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isDisabled || isUploading}
      />

      {previewUrl ? (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 bg-background rounded-md overflow-hidden border">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Предварительный просмотр"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Изображение загружено</p>
                <p className="text-xs text-muted-foreground">Максимальный размер: 5MB</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRemoveImage}
                disabled={isDisabled || isUploading}
                className="text-red-500 hover:text-red-600 bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-2 bg-muted rounded-full">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP до 5MB</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileSelect}
              disabled={isDisabled || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Выбрать файл
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
