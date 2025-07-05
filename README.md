# Инструкция для подключения бэкенда

## Быстрое подключение API

### 1. Настройка эндпоинтов
Откройте файл `config/api-endpoints.ts` и измените:
\`\`\`typescript
export const API_CONFIG = {
  BASE_URL: "https://your-api-domain.com/api", // Замените на ваш домен
  // Остальные эндпоинты можно оставить как есть или изменить при необходимости
}
\`\`\`

### 2. Включение API режима
В каждом сервисе измените флаг `USE_API` на `true`:

**services/data-service.ts:**
\`\`\`typescript
private USE_API = true // Изменить с false на true
\`\`\`

**services/auth-service.ts:**
\`\`\`typescript
private USE_API = true // Изменить с false на true
\`\`\`

**services/image-service.ts:**
\`\`\`typescript
private USE_API = true // Изменить с false на true
\`\`\`

### 3. Переменные окружения
Создайте файл `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
\`\`\`

## Структура API эндпоинтов

### Аутентификация
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/me` - Получить текущего пользователя

### Категории
- `GET /categories` - Список категорий
- `POST /categories` - Создать категорию
- `PUT /categories/:id` - Обновить категорию
- `DELETE /categories/:id` - Удалить категорию (каскадно удаляет подкатегории и товары)

### Подкатегории
- `GET /subcategories` - Список подкатегорий
- `POST /subcategories` - Создать подкатегорию
- `PUT /subcategories/:id` - Обновить подкатегорию
- `DELETE /subcategories/:id` - Удалить подкатегорию (каскадно удаляет товары)

### Товары
- `GET /products` - Список товаров
- `GET /products/courier/:courierId` - Товары для курьера
- `POST /products` - Создать товар
- `PUT /products/:id` - Обновить товар
- `DELETE /products/:id` - Удалить товар
- `PUT /products/:productId/courier/:courierId/quantity` - Обновить количество у курьера

### Курьеры
- `GET /couriers` - Список курьеров
- `POST /couriers` - Создать курьера
- `PUT /couriers/:id` - Обновить курьера
- `DELETE /couriers/:id` - Удалить курьера
- `PUT /couriers/:id/cities` - Обновить города курьера

### Изображения
- `POST /images/upload` - Загрузить изображение
- `POST /images/delete` - Удалить изображение

### Справочники
- `GET /references/cities` - Список доступных городов

## Формат ответов API

Все ответы должны иметь следующий формат:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Опциональное сообщение"
}
\`\`\`

При ошибке:
\`\`\`json
{
  "success": false,
  "error": "Описание ошибки"
}
\`\`\`

## Аутентификация

API должно поддерживать Bearer токены:
\`\`\`
Authorization: Bearer <token>
\`\`\`

Токен сохраняется в localStorage как `authToken`.
