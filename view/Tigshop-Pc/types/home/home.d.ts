// 首页
import type { CouponFilterState } from "~/types/user/coupon";

export interface HomeDataResult {
    decorateId: number;
    moduleList: ModuleListType[];
    couponList: CouponFilterState[];
}
export interface ModuleListType {
    module: {};
    moduleIndex: number;
    isShow: boolean;
    active: boolean;
    type: string;
    style: number;
}

export interface CouponResponse {
    isReceive: number;
    receiveNum: number;
    couponId: number;
    couponName: string;
    couponMoney: number;
    couponDiscount: number;
    couponDesc: string;
    couponType: number;
    sendRange: number;
    sendRangeData: number[];
    minOrderAmount: number;
    sendStartDate: string;
    sendEndDate: string;
    sendType: number;
    useDay: number;
    useStartDate: string;
    useEndDate: string;
    isShow: number;
    isGlobal: number;
    isNewUser: number;
    enabledClickGet: number;
    limitUserRank: number[];
    shopId: number;
    isDelete: number;
    limitNum: number;
    delayDay: number;
    sendNum: number;
    maxOrderAmount: number;
    couponUnit: number;
    reduceType: number;
    addTime: string;
}
