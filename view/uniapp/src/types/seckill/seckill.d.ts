// 秒杀数据
export interface SeckkillData {
    seckillId: number;
    seckillName: string;
    seckillStartTime: string;
    seckillEndTime: string;
    seckillLimitNum: number;
    productId: number;
    seckillItem?: any[];
}

// 获取列表返回参数类型
export interface SeckillFilterState {
    productId: number;
    seckillLimitNum: number;
    seckillSales: number;
    productName: string;
    picThumb: string;
    productSn: string;
    marketPrice: string;
    seckillPrice: string;
    seckillStock: number;
    skuId: number;
    seckkillData?: SeckkillData;
    isBest?: number;
    isHot?: number;
    isNew?: number;
}

export interface SeckillFilterResult {
    data: SeckillData;
    code: number;
    message: string;
}

export interface SeckillData {
    records: SeckillFilterState[];
    total: number;
}
