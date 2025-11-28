
import request from "@/utils/request";
import { CityDeliveryResponse, SaveIntraCityDeliveryConfigParams, SelfShopDetailResponse } from "@/types/setting/intraCityDelivery";

export const getConfigAmapAllSettings = (params?: object) => {
    return request<CityDeliveryResponse>({
        url: "setting/config/amapAllSettings",
        method: "get",
        params
    });
};
export const saveAllAmapSettings = (data: CityDeliveryResponse) => {
    return request({
        url: "setting/config/saveAllAmapSettings",
        method: "post",
        data
    });
};

//获取门店同城配送配置详情
export const getIntraCityDeliveryConfig = (params?: object) => {
    return request<SaveIntraCityDeliveryConfigParams>({
        url: "o2o/localDelivery/getConfig",
        method: "get",
        params
    });
};
//保存门店同城配送配置
export const saveIntraCityDeliveryConfig = (data: SaveIntraCityDeliveryConfigParams) => {
    return request({
        url: "o2o/localDelivery/saveConfig",
        method: "post",
        data
    });
};

//获取平台门店详情
export const getSelfShopDetail = (params?: object) => {
    return request<SelfShopDetailResponse>({
        url: "setting/config/storeSelfOperatedSettings",
        method: "get",
        params
    });
};
//保存平台门店设置
export const saveSelfShopDetail = (data: SelfShopDetailResponse) => {
    return request({
        url: "setting/config/saveStoreSelfOperated",
        method: "post",
        data
    });
};