// 获取列表返回参数类型
export interface DiscountFilterState {
    productId: number;
    discountLimitNum: number;
    discountSales: number;
    productName: string;
    picThumb: string;
    productSn: string;
    marketPrice: string;
    discountPrice: string;
    discountStock: number;
    discountPercent: number; // 折扣百分比，如8.5折
    skuId: number;
    // 筛选条件字段
    isBest?: number;
    isHot?: number;
    isNew?: number;
}

export interface DiscountFilterResult {
    data: DiscountData;
    code: number;
    message: string;
}

export interface DiscountData {
    records: DiscountFilterState[];
    total: number;
}