declare class ShopeeService {
    baseURL: string;
    apiClient: any;
    cache: Map<string, any>;
    cacheTTL: number;
    constructor();
    searchProducts(params: {
        query: string;
        limit?: number;
        offset?: number;
        category?: string;
        userId?: number;
    }): Promise<any>;
    getProductDetails(productId: string): Promise<any>;
    compareProducts(productIds: string[]): Promise<{
        success: boolean;
        data: any[];
        comparison: {
            count: number;
            avgPrice: number;
        };
    } | {
        success: boolean;
        data: never[];
        comparison: {
            count?: undefined;
            avgPrice?: undefined;
        };
    }>;
    getPriceHistory(productId: string): Promise<{
        date: string;
        price: number;
    }[]>;
    testAPIConnection(): Promise<{
        success: boolean;
        message: string;
        data: {
            status: any;
            items: any;
        };
    } | {
        success: boolean;
        message: string;
        data: null;
    }>;
    mapProduct(item: any): {
        id: any;
        title: any;
        price: any;
        currency: any;
        thumbnail: any;
        sold: any;
        rating: any;
        seller: {
            id: any;
            name: any;
        };
    };
    mapProductDetails(raw: any): {
        id: any;
        title: any;
        price: any;
        currency: any;
        sold: any;
        rating: any;
        seller: {
            id: any;
            name: any;
        };
        description: any;
    };
}
declare const _default: ShopeeService;
export default _default;
//# sourceMappingURL=shopeeService.d.ts.map