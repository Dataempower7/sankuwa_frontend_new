import request from "@/utils/request";

/**
 * 品牌数据类型
 */
export interface Brand {
    brandId: number;
    brandName: string;
    brandEnName?: string;
    brandLogo: string;
    brandDesc?: string;
    siteUrl?: string;
    shopId?: number;
    status?: number;
    isShow?: number;
    brandIsHot?: number;
    sortOrder?: number;
    brandType?: string;
    firstWord?: string;
}

/**
 * 获取精选品牌列表
 */
export const getFeaturedBrands = () => {
    return request({
        url: "brand/brand/featured",
        method: "get",
        noSkipLogin: true // 不需要登录
    });
};

/**
 * 获取热门品牌列表
 */
export const getHotBrands = () => {
    return request({
        url: "brand/brand/hot",
        method: "get",
        noSkipLogin: true // 不需要登录
    });
};

/**
 * 获取所有显示的品牌
 */
export const getAllBrands = () => { 
    return request({
        url: "brand/brand/list",
        method: "get",
        noSkipLogin: true // 不需要登录
    });
};
