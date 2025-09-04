import request from "@/utils/request";
import type {MerchantSearchFilterResult} from "@/types/merchant/shop.d";

export const getShopMyShop = (params: object) => {
    return request<any>({
        url: "merchant/shop/myShop",
        method: "get",
        params,
        noErrorTip: true
    });
};
export const createShop = (data: object) => {
    return request<MerchantSearchFilterResult>({
        url: "merchant/shop/create",
        method: "post",
        data
    });
};
