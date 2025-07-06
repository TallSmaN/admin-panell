import type {ImageUploadResponse} from "@/types"
import {apiClient} from "./api-client"
import {API_CDN, EndPoints} from "@/config/api-endpoints"

class ImageService {
  private USE_API = false

  async uploadImage(file: File, productId: string): Promise<ImageUploadResponse> {

    const response = await apiClient.uploadFile(
        API_CDN.ADMIN,
        EndPoints.Images.UPLOAD(productId), // ← теперь строка
        file,
    )

    if (response.success) {
      return {
        success: true,
        imageUrl: API_CDN.ADMIN + EndPoints.Images.FETCH(productId),
      }
    } else {
      return {
        success: false,
        error: response.error || "Ошибка загрузки изображения",
      }
    }
  }

  async deleteImage(productId: string): Promise<boolean> {
    const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Images.DELETE(productId))
    return response.success
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
