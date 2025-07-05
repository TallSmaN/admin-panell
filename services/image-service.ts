import type { ImageUploadResponse } from "@/types"
import { apiClient } from "./api-client"
import { API_CONFIG } from "@/config/api-endpoints"

class ImageService {
  // Флаг для переключения между моком и API
  private USE_API = false // Фронтендер меняет на true для подключения бэкенда

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    if (this.USE_API) {
      const response = await apiClient.uploadFile<{ imageUrl: string }>(API_CONFIG.ENDPOINTS.IMAGES.UPLOAD, file)

      if (response.success && response.data) {
        return {
          success: true,
          imageUrl: response.data.imageUrl,
        }
      } else {
        return {
          success: false,
          error: response.error || "Ошибка загрузки изображения",
        }
      }
    }

    // Мок для разработки
    return new Promise((resolve) => {
      setTimeout(() => {
        if (file.size > 5 * 1024 * 1024) {
          resolve({
            success: false,
            error: "Размер файла не должен превышать 5MB",
          })
          return
        }

        if (!file.type.startsWith("image/")) {
          resolve({
            success: false,
            error: "Файл должен быть изображением",
          })
          return
        }

        const imageUrl = URL.createObjectURL(file)
        resolve({
          success: true,
          imageUrl: imageUrl,
        })
      }, 1000)
    })
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (this.USE_API) {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.IMAGES.DELETE, { imageUrl })
      return response.success
    }

    // Мок для разработки
    return new Promise((resolve) => {
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl)
        resolve(true)
      }, 500)
    })
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Файл должен быть изображением" }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: "Размер файла не должен превышать 5MB" }
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Поддерживаются только форматы: JPEG, PNG, WebP" }
    }

    return { valid: true }
  }
}

export const imageService = new ImageService()
