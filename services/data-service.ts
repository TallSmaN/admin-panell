import type {Category, Courier, CourierProduct, Product, Subcategory} from "@/types"
import {apiClient} from "./api-client"
import {API_CDN, EndPoints} from "@/config/api-endpoints"

class DataService {
    private categories: Category[] = [
        {id: "1", name: "Elektronik", subcategoriesCount: 2},
        {id: "2", name: "Kleidung", subcategoriesCount: 1},
    ]

    private subcategories: Subcategory[] = [
        {id: "1", name: "Smartphones", categoryId: "1", categoryName: "Elektronik", productsCount: 2},
        {id: "2", name: "Laptops", categoryId: "1", categoryName: "Elektronik", productsCount: 1},
        {id: "3", name: "T-Shirts", categoryId: "2", categoryName: "Kleidung", productsCount: 1},
    ]

    private products: Product[] = [
        {
            id: "1",
            name: "iPhone 15",
            price: 800,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 15,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 5},
                    {id: "3", username: "CourierB", quantity: 10},
                ],
            },
            category: {
                id: "1",
                name: "Smartphones",
                subcategory: {id: "1", name: "Smartphones"},
            },
        },
        {
            id: "2",
            name: "Samsung Galaxy S24",
            price: 700,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 13,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 3},
                    {id: "3", username: "CourierB", quantity: 10},
                ],
            },
            category: {
                id: "1",
                name: "Smartphones",
                subcategory: {id: "1", name: "Smartphones"},
            },
        },
        {
            id: "3",
            name: "MacBook Pro",
            price: 1500,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 7,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 2},
                    {id: "3", username: "CourierB", quantity: 5},
                ],
            },
            category: {
                id: "2",
                name: "Laptops",
                subcategory: {id: "2", name: "Laptops"},
            },
        },
        {
            id: "4",
            name: "Basic T-Shirt",
            price: 25,
            imageUrl: "/placeholder.svg?height=200&width=200",
            stock: {
                total: 20,
                perCourier: [
                    {id: "2", username: "CourierA", quantity: 8},
                    {id: "3", username: "CourierB", quantity: 12},
                ],
            },
            category: {
                id: "3",
                name: "T-Shirts",
                subcategory: {id: "3", name: "T-Shirts"},
            },
        },
    ]

    private couriers: Courier[] = [
        {id: "2", login: "courier1", cities: ["Bocholt", "Köln"]},
        {id: "3", login: "courier2", cities: ["Herne", "Lünen", "Dortmund"]},
    ]

    private courierPasswords: Record<string, string> = {
        "2": "courier123",
        "3": "courier456",
    }

    // Флаг для переключения между моком и API
    private USE_API = false // Фронтендер меняет на true для подключения бэкенда

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await apiClient.get<Category[]>(API_CDN.ADMIN, EndPoints.Categories.LIST)
        return response.success ? response.data! : []
    }

    async createCategory(name: string): Promise<Category | null> {
        const response = await apiClient.post<Category>(API_CDN.ADMIN, EndPoints.Categories.CREATE, {name})
        return response.success ? response.data! : null
    }

    async updateCategory(id: string, name: string): Promise<Category | null> {

        const response = await apiClient.put<Category>(API_CDN.ADMIN, EndPoints.Categories.UPDATE(id), {name})
        return response.success ? response.data! : null

    }

    async deleteCategory(id: string): Promise<boolean> {

        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Categories.DELETE(id))
        return response.success


    }

    // Subcategories
    async getSubcategories(): Promise<Subcategory[]> {

        const response = await apiClient.get<Subcategory[]>(API_CDN.ADMIN, EndPoints.Subcategories.LIST)
        return response.success ? response.data! : []


    }

    async createSubcategory(name: string, categoryId: string): Promise<Subcategory | null> {

        const response = await apiClient.post<Subcategory>(API_CDN.ADMIN, EndPoints.Subcategories.CREATE, {
            name,
            categoryId,
        })
        return response.success ? response.data! : null


    }

    async updateSubcategory(id: string, name: string, categoryId: string): Promise<Subcategory | null> {

        const response = await apiClient.put<Subcategory>(API_CDN.ADMIN, EndPoints.Subcategories.UPDATE(id), {
            name,
            categoryId,
        })
        return response.success ? response.data! : null
    }

    async deleteSubcategory(id: string): Promise<boolean> {

        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Subcategories.DELETE(id))
        return response.success
    }

    // Products
    async getProducts(): Promise<Product[]> {
        const response = await apiClient.get<Product[]>(API_CDN.ADMIN, EndPoints.Products.LIST)
        return response.success ? response.data! : []

    }

    async getProductsForCourier(courierId: string): Promise<CourierProduct[]> {
        const resp = await apiClient.get<{ products: CourierProduct[] }>(
            API_CDN.COURIER,
            EndPoints.Products.LIST_FOR_COURIER(courierId),
        )
        return resp.success ? resp.data!.products : []
    }

    async createProduct(name: string, subcategoryId: string, price: number, imageUrl?: string): Promise<Product | null> {

        const response = await apiClient.post<Product>(API_CDN.ADMIN, EndPoints.Products.CREATE, {
            name,
            subcategoryId,
            price,
            imageUrl,
        })
        return response.success ? response.data! : null
    }

    async updateProduct(
        id: string,
        name: string,
        subcategoryId: string,
        price: number,
        imageUrl?: string,
    ): Promise<Product | null> {
        if (this.USE_API) {
            const response = await apiClient.put<Product>(API_CDN.ADMIN, EndPoints.Products.UPDATE(id), {
                name,
                subcategoryId,
                price,
                imageUrl,
            })
            return response.success ? response.data! : null
        }

        const index = this.products.findIndex((p) => p.id === id)
        const subcategory = this.subcategories.find((s) => s.id === subcategoryId)

        if (index !== -1 && subcategory) {
            this.products[index] = {
                ...this.products[index],
                name,
                subcategoryId,
                subcategoryName: subcategory.name,
                price,
                imageUrl: imageUrl !== undefined ? imageUrl : this.products[index].imageUrl,
            }
            return this.products[index]
        }
        return null
    }

    async updateCourierProductQuantity(productId: string, courierId: string, quantity: number): Promise<boolean> {
        const response = await apiClient.put(
            API_CDN.COURIER, EndPoints.Products.UPDATE_COURIER_QUANTITY(courierId), {productId, quantity})
        return response.success

    }

    async deleteProduct(id: string): Promise<boolean> {
        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Products.DELETE(id))
        return response.success
    }

    // Couriers
    async getCouriers(): Promise<Courier[]> {
        const response = await apiClient.get<Courier[]>(API_CDN.ADMIN, EndPoints.Couriers.LIST)
        return response.success ? response.data! : []
    }

    async createCourier(username: string, password: string, cities: string[]): Promise<Courier | null> {
        const response = await apiClient.post<Courier>(API_CDN.ADMIN, EndPoints.Couriers.CREATE, {
            username,
            password,
            cities,
        })
        return response.success ? response.data! : null
    }

    async updateCourier(id: string, login: string, cities?: string[]): Promise<Courier | null> {
        if (this.USE_API) {
            const response = await apiClient.put<Courier>(API_CDN.ADMIN, EndPoints.Couriers.UPDATE(id), {
                login,
                cities,
            })
            return response.success ? response.data! : null
        }

        const index = this.couriers.findIndex((c) => c.id === id)
        if (index !== -1) {
            this.couriers[index] = {
                ...this.couriers[index],
                login,
                cities: cities || this.couriers[index].cities,
            }
            return this.couriers[index]
        }
        return null
    }

    async updateCourierWithPassword(id: string, username: string, password: string): Promise<Courier | null> {
        const response = await apiClient.put<Courier>(API_CDN.ADMIN, EndPoints.Couriers.UPDATE(id), {
            username,
            password,
        })
        return response.success ? response.data! : null
    }

    async deleteCourier(id: string): Promise<boolean> {
        const response = await apiClient.delete(API_CDN.ADMIN, EndPoints.Couriers.DELETE(id))
        return response.success
    }

    // Cities
    async getAvailableCities(): Promise<string[]> {
        // if (this.USE_API) {
        //     const response = await apiClient.get<string[]>(API_CDN.COURIER, EndPoints.References.CITIES)
        //     return response.success ? response.data! : []
        // }

        return [
            "Bocholt",
            "Köln",
            "Herne",
            "Lünen",
            "Dortmund",
            "Moers",
            "Bonn",
            "Bad Honnef",
            "Rheinbach",
            "Kaarst",
            "Königswinter",
            "Werne",
            "Essen",
            "Erkelenz",
            "Wegberg",
            "Bad Salzuflen",
            "Lemgo",
            "Detmold",
            "Ratingen",
            "Linnich",
            "Wassenberg",
            "Jülich",
            "Hückelhoven",
            "Siegen",
            "Hohenhausen",
            "Lüdinghausen",
            "Neuss",
            "Monheim am Rhein",
            "Bergisch Gladbach",
            "Wesseling",
            "Euskirchen",
            "Lippstadt",
            "Uedem",
            "Selm",
            "Recklinghausen",
            "Vlotho",
            "Dörentrup",
            "Bösingfeld",
            "Höxter",
            "Löhne",
            "Langenfeld",
            "Datteln",
            "Oer-Erkenschwick",
            "Barntrup",
            "Salzkotten",
            "Geseke",
            "Erwitte",
            "Geldern",
            "Goch",
            "Borgentreich",
            "Bünde",
            "Kirchlengern",
            "Bad Oeynhausen",
            "Rheine",
            "Emsdetten",
            "Ahaus",
            "Stadtlohn",
            "Gescher",
            "Würselen",
            "Delbrück",
            "Drensteinfurt",
            "Sendenhorst",
            "Porta Westfalica",
            "Dormagen",
            "Hilden",
            "Leichlingen",
            "Sankt Augustin",
            "Siegburg",
            "Emmerich am Rhein",
            "Meerbusch",
            "Dinslaken",
            "Troisdorf",
            "Raesfeld",
            "Rees",
            "Kreuzau",
            "Xanten",
            "Radevormwald",
            "Rösrath",
            "Eitorf",
            "Waldbröl",
            "Ennepetal",
            "Havixbeck",
            "Sprockhövel",
            "Bad Driburg",
            "Oerlinghausen",
            "Beverungen",
            "Rheda-Wiedenbrück",
            "Sindorf",
            "Halver",
            "Lüdenscheid",
            "Viersen",
            "Süchteln",
            "Kevelaer",
            "Mechernich",
            "Wülfrath",
            "Erkrath",
            "Neukirchen-Vluyn",
            "Kamp-Lintfort",
            "Gummersbach",
            "Lohmar",
            "Nümbrecht",
            "Wiehl",
            "Geilenkirchen",
            "Wermelskirchen",
            "Preußisch Oldendorf",
            "Bestwig",
            "Odenthal",
            "Hückeswagen",
            "Korschenbroich",
            "Attendorn",
            "Plettenberg",
            "Jüchen",
            "Grevenbroich",
            "Netphen",
            "Ibbenbüren",
            "Lennestadt",
            "Ochtrup",
            "Baesweiler",
            "Übach-Palenberg",
            "Holzwickede",
            "Waldniel",
            "Wesel",
            "Schwerte",
            "Monschau",
            "Spenge",
            "Hiddenhausen",
            "Lotte",
            "Warstein",
            "Brilon",
            "Espelkamp",
            "Nieheim",
            "Telgte",
            "Schmallenberg",
            "Harsewinkel",
            "Lindlar",
            "Castrop-Rauxel",
            "Heiligenhaus",
            "Warendorf",
            "Lage",
            "Bottrop",
            "Rahden",
            "Overath",
            "Steinhagen",
            "Petershagen",
            "Senden",
            "Rietberg",
            "Hürth",
            "Hattingen",
            "Marienheide",
            "Bielefeld",
            "Hövelhof",
            "Aachen",
            "Hamminkeln",
            "Altena",
            "Bergneustadt",
            "Minden",
            "Blomberg",
            "Wetter (Ruhr)",
            "Borken",
            "Beckum",
            "Krefeld",
            "Borgholzhausen",
            "Olpe",
            "Freudenberg",
            "Grefrath",
            "Bergkamen",
            "Herford",
            "Gelsenkirchen",
            "Marl",
            "Greven",
            "Duisburg",
            "Sundern",
            "Kierspe",
            "Medebach",
            "Unna",
            "Enger",
            "Bedburg",
            "Morsbach",
            "Kalkar",
            "Marsberg",
            "Mönchengladbach",
            "Remscheid",
            "Rödinghausen",
            "Werther (Westf.)",
            "Wickede (Ruhr)",
            "Eschweiler",
            "Hemer",
            "Ahlen",
            "Solingen",
            "Rhede",
            "Brühl",
            "Waltrop",
            "Hörstel",
            "Kürten",
            "Kreuztal",
            "Herten",
            "Lengerich",
            "Büren",
            "Schwelm",
            "Ennigerloh",
            "Finnentrop",
            "Kamen",
            "Kranenburg",
            "Neuenrade",
            "Elsdorf",
            "Steinfurt",
            "Schieder-Schwalenberg",
            "Bad Berleburg",
            "Wuppertal",
            "Schloß Holte-Stukenbrock",
            "Bornheim",
            "Arnsberg",
            "Steinheim",
            "Niederkassel",
            "Werl",
            "Soest",
            "Heinsberg",
            "Tecklenburg",
            "Schalksmühle",
            "Straelen",
            "Kleve",
            "Ascheberg",
            "Bochum",
            "Burscheid",
            "Herdecke",
            "Bad Lippspringe",
            "Haan",
            "Halle (Westf.)",
            "Rheurdt",
            "Kerpen",
            "Bönen",
            "Iserlohn",
            "Werdohl",
            "Bad Laasphe",
            "Hagen",
            "Versmold",
            "Paderborn",
            "Oelde",
            "Schermbeck",
            "Hilchenbach",
            "Fröndenberg/Ruhr",
            "Winterberg",
            "Willebadessen",
            "Bad Wünnenberg",
            "Wenden",
            "Alsdorf",
            "Meckenheim",
            "Drolshagen",
            "Mettmann",
            "Stolberg",
            "Düsseldorf",
            "Brüggen",
            "Frechen",
            "Windeck",
            "Warburg",
            "Breckerfeld",
            "Verl",
            "Engelskirchen",
            "Witten",
            "Hüsten",
            "Wipperfürth",
            "Beyenburg",
            "Münster",
            "Liblar",
            "Gütersloh",
            "Düren",
            "Voerde",
            "Lechenich",
            "Vreden",
            "St. Tönis",
            "Horn",
            "Kirchhellen",
            "Neheim",
            "Zülpich",
            "Willich",
            "Schleiden",
            "Niederkrüchten",
            "Bad Münstereifel",
            "Meinerzhagen",
            "Kall",
            "Oberstadt",
            "Mülheim an der Ruhr",
            "Gevelsberg",
            "Dorsten",
            "Gladbeck",
            "Oberhausen",
            "Leverkusen",
            "Herzogenrath",
            "Kaldenkirchen",
            "Menden (Sauerland)",
            "Herscheid",
            "Lobberich",
            "Dülken",
            "Kempen",
            "Velbert",
            "Haltern am See",
            "Hamm",
            "Meschede",
            "Coesfeld",
            "Hennef",
            "Dülmen",
            "Nottuln",
            "Rheinberg",
            "Simmerath",
            "Billerbeck",
            "Gronau",
            "Olfen",
            "Wulfen",
            "Brakel",
            "Pulheim",
            "Lübbecke",
            "Bergheim",
            "Neunkirchen-Seelscheid",
            "Lügde",
            "Arbeiter Kolonie Haus Maria Veen",
            "Reichshof",
            "Paulshöfe",
            "Mühlenviertel",
            "Wallhöfe"
        ]
    }

    async getCourierCities(courierId: string): Promise<string[]> {
        const response = await apiClient.get<string[]>(API_CDN.COURIER, EndPoints.Couriers.FETCH_CITIES(courierId))
        return response.success ? response.data! : []
    }

    async updateCourierCities(courierId: string, cities: string[]): Promise<boolean> {

        const response = await apiClient.put(API_CDN.COURIER, EndPoints.Couriers.UPDATE_CITIES(courierId), {cities})
        return response.success

        //
        // const courier = this.couriers.find((c) => c.id === courierId)
        // if (courier) {
        //     courier.cities = cities
        //     return true
        // }
        // return false
    }

    getCourierByLogin(login: string): Courier | null {
        return this.couriers.find((c) => c.login === login) || null
    }
}

export const dataService = new DataService()
