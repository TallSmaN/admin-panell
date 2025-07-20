"use client"

import React, {useEffect, useState} from "react"
import type {APIUser, Product, Subcategory} from "@/types"
import {dataService} from "@/services/data-service"
import {useSort} from "@/hooks/use-sort"
import {DataTable} from "@/components/ui/data-table"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Badge} from "@/components/ui/badge"
import {ImageUpload} from "@/components/ui/image-upload"
import {Edit, ImageIcon, Plus, Trash2, Users} from "lucide-react"
import {ProductsPageCourier} from "./products-page-courier"
import {API_CDN} from "@/config/api-endpoints"

interface ProductsPageProps {
    user: APIUser
}

export function ProductsPage({user}: ProductsPageProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [couriers, setCouriers] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        subcategoryId: "",
        price: 0,
        quantity: 0,
        imageUrl: null as string | null
    })

    const {sortedData, requestSort, sortConfig} = useSort(products)

    useEffect(() => {
        loadData()
    }, [user])

    const loadData = async () => {
        try {
            const subcategoriesData = await dataService.getSubcategories()
            setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : [])

            if (user.isManager) {
                const [productsData, couriersData] = await Promise.all([
                    dataService.getProducts(),
                    dataService.getCouriers()
                ])
                setProducts(Array.isArray(productsData) ? productsData : [])
                setCouriers(Array.isArray(couriersData) ? couriersData : [])
            } else {
                const productsData = await dataService.getProductsForCourier(user.id)
                setProducts(Array.isArray(productsData) ? productsData : [])
            }
        } catch (error) {
            console.error("Error loading data:", error)
            setProducts([])
            setCouriers([])
            setSubcategories([])
        }
    }

    const resetForm = () => {
        setFormData({name: "", subcategoryId: "", price: 0, quantity: 0, imageUrl: null})
        setEditingProduct(null)
        setIsDialogOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (!user.isManager && editingProduct) {
                await dataService.updateCourierProductQuantity(
                    editingProduct.id,
                    user.id,
                    formData.quantity
                )
            } else if (user.isManager) {
                if (!formData.name.trim() || !formData.subcategoryId) return

                if (editingProduct) {
                    await dataService.updateProduct(
                        editingProduct.id,
                        formData.name,
                        formData.subcategoryId,
                        formData.price,
                        formData.imageUrl || undefined
                    )
                } else {
                    await dataService.createProduct(
                        formData.name,
                        formData.subcategoryId,
                        formData.price,
                        formData.imageUrl || undefined
                    )
                }
            }

            await loadData()
            resetForm()
        } catch (err) {
            console.error("Ошибка при сохранении товара:", err)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            subcategoryId: product.category.subcategory.id,
            price: product.price,
            quantity: user.isManager ? 0 : product.stock.total,
            imageUrl: product.imageUrl || null
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (product: Product) => {
        if (confirm("Вы уверены, что хотите удалить этот товар?")) {
            await dataService.deleteProduct(product.id)
            await loadData()
        }
    }

    const getCourierName = (courierId: string) => {
        const courier = couriers.find((c) => c.id === courierId)
        return courier ? courier.login : `Курьер ${courierId}`
    }

    const renderCourierQuantities = (quantities: Record<string, number>) => {
        const entries = Object.entries(quantities ?? {}).filter(([_, qty]) => qty > 0)

        if (entries.length === 0) {
            return <span className="text-muted-foreground">Не распределено</span>
        }

        if (entries.length <= 2) {
            return (
                <div className="flex flex-wrap gap-1">
                    {entries.map(([courierId, qty]) => (
                        <Badge key={courierId} variant="secondary" className="text-xs">
                            {getCourierName(courierId)}: {qty}
                        </Badge>
                    ))}
                </div>
            )
        }

        const [first, second, ...rest] = entries
        return (
            <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                        {getCourierName(first[0])}: {first[1]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {getCourierName(second[0])}: {second[1]}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground"/>
                    <span className="text-xs text-muted-foreground">
            +{rest.length} курьер{rest.length > 1 ? "а" : ""} ({rest.reduce((sum, [_, qty]) => sum + qty, 0)} шт.)
          </span>
                </div>
            </div>
        )
    }

    const columns = [
        {
            key: "imageUrl" as keyof Product,
            label: "Фото",
            render: (imageUrl: string | undefined) => (
                <div className="w-12 h-12 bg-muted rounded-md overflow-hidden border flex items-center justify-center">
                    {/*{(() => { console.log(imageUrl); return null })()}*/}
                    {imageUrl ? (
                        <img
                            src={`${API_CDN.ADMIN}/uploads/${imageUrl}`}
                            alt="Товар"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground"/>
                    )}
                </div>
            )
        },
        {
            key: "name" as keyof Product,
            label: "Название",
            sortable: true
        },
        {
            key: "subcategoryName" as keyof Product,
            label: "Подкатегория",
            sortable: true,
            render: (_: any, product: Product) => product.category?.subcategory?.name ?? "—"
        },
        ...(user.isManager
            ? [
                {
                    key: "price" as keyof Product,
                    label: "Цена",
                    sortable: true,
                    render: (value: number) => `${value.toLocaleString()} €`
                },
                {
                    key: "totalQuantity" as keyof Product,
                    label: "Общее количество",
                    sortable: true,
                    render: (_: any, product: Product) => product.stock.total ?? "—"
                },
                {
                    key: "courierQuantities" as keyof Product,
                    label: "По курьерам",
                    render: (_: any, product: Product) =>
                        renderCourierQuantities(
                            Object.fromEntries(product.stock.perCourier.map((c) => [c.username, c.quantity]))
                        )
                }
            ]
            : [
                {
                    key: "totalQuantity" as keyof Product,
                    label: "Мое количество",
                    sortable: true
                }
            ])
    ]

    const actions = (product: Product) => (
        <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                <Edit className="h-4 w-4"/>
            </Button>
            {user.isManager && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product)}
                    className="text-red-500 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4"/>
                </Button>
            )}
        </div>
    )

    if (!user.isManager) {
        return <ProductsPageCourier user={user}/>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Товары</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) resetForm()
                    setIsDialogOpen(open)
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingProduct(null)}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Добавить товар
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct ? "Редактировать товар" : "Добавить товар"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {editingProduct && (
                                <ImageUpload
                                    productId={editingProduct.id}
                                    currentImageUrl={formData.imageUrl || undefined}
                                    onImageChange={(imageUrl) =>
                                        setFormData({...formData, imageUrl})
                                    }
                                />
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Название</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({...formData, name: e.target.value})
                                    }
                                    required
                                    disabled={!user.isManager}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subcategory">Подкатегория</Label>
                                <Select
                                    value={formData.subcategoryId}
                                    onValueChange={(value) =>
                                        setFormData({...formData, subcategoryId: value})
                                    }
                                    required
                                    disabled={!user.isManager}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите подкатегорию"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((subcategory) => (
                                            <SelectItem key={
                                                subcategory.id} value={subcategory.id}>
                                                {subcategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Цена (€)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                    required
                                    disabled={!user.isManager}
                                />
                            </div>
                            {!user.isManager && (
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Количество</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Отмена
                                </Button>
                                <Button type="submit">{editingProduct ? "Сохранить" : "Создать"}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <DataTable
                data={sortedData}
                columns={columns}
                sortConfig={sortConfig}
                onSort={requestSort}
                actions={actions}
            />
        </div>
    )
}