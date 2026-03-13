export declare const shopeeConfig: {
    partnerId: string;
    partnerKey: string;
    baseUrl: string;
    redirectUri: string;
    rateLimitPerMinute: number;
    accessTokenTTL: number;
    refreshTokenTTL: number;
    refreshMargin: number;
    cache: {
        productPrice: number;
        productVariations: number;
        productReviews: number;
        shopInfo: number;
        categories: number;
    };
    endpoints: {
        authPartner: string;
        tokenGet: string;
        tokenRefresh: string;
        getItemList: string;
        getItemBaseInfo: string;
        getModelList: string;
        getComment: string;
        getItemExtraInfo: string;
        getShopInfo: string;
        getCategory: string;
    };
};
export default shopeeConfig;
//# sourceMappingURL=shopee.d.ts.map