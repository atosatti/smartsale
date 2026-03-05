/**
 * Mock data do Mercado Livre para testes em ambientes com restrição de rede
 */
export declare const mockSearchResults: {
    results: {
        id: string;
        title: string;
        price: number;
        currency_id: string;
        thumbnail: string;
        condition: string;
        seller: {
            id: number;
            nickname: string;
            type: string;
            power_seller_status: string;
        };
        shipping: {
            free_shipping: boolean;
        };
        attributes: {
            name: string;
            value_name: string;
        }[];
    }[];
    paging: {
        total: number;
        offset: number;
        limit: number;
    };
};
export declare const mockProductDetails: {
    id: string;
    title: string;
    price: number;
    currency_id: string;
    initial_quantity: number;
    sold_quantity: number;
    available_quantity: number;
    condition: string;
    description: {
        plain_text: string;
    };
    pictures: {
        url: string;
        secure_url: string;
    }[];
    category_id: string;
    category_name: string;
    seller_id: number;
    attributes: {
        name: string;
        value_name: string;
    }[];
};
export declare const mockPriceHistory: {
    date: string;
    price: number;
}[];
//# sourceMappingURL=mockMercadoLivre.d.ts.map