/**
 * AmapAllVO，地图设置参数
 */
export interface CityDeliveryResponse {
    /**
     * 高德地图Key
     */
    amapJsKey?: string;
    /**
     * 高德地图SECRET
     */
    amapJsSecret?: string;
    /**
     * 高德地图Key
     */
    amapMiniKey?: string;
    /**
     * 高德地图SECRET
     */
    amapMiniSecret?: string;
    /**
     * 高德地图Key
     */
    amapWebKey?: string;
    /**
     * 高德地图SECRET
     */
    amapWebSecret?: string;
    [property: string]: any;
}




//保存门店同城配送配置参数
export interface SaveIntraCityDeliveryConfigParams extends CityDeliveryResponse
    {
        enabled: number,
        deliveryRadius: number,
        minOrderAmount: number,
        baseDeliveryFee: number,
        distancePricingEnabled: number,
        distancePricingList: DistancePricingRule[]
    }

//距离溢价规则
export interface DistancePricingRule {
    distanceThreshold: number,
    distanceUnit: number,
    additionalFee: number,
    sortOrder: number
}

//自营门店详情，保存平台门店设置参数
export interface SelfShopDetailResponse {
    storeSelfOperatedName: string;
    storeSelfOperatedLogo: string;
    storeSelfOperatedRegion: string;
    storeSelfOperatedAddress: string;
    storeSelfOperatedLongitude: string;
    storeSelfOperatedLatitude: string;
    storeSelfOperatedRegions?: string[];
}


