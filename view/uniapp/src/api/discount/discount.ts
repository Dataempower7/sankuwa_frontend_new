import request from "@/utils/request";
import type { DiscountFilterResult } from "@/types/discount/discount";

// 折扣商品列表
export const getDiscount = (params: any) => {
    return request<DiscountFilterResult>({
        url: "home/home/getDiscount",
        method: "get",
        params
    });
};
