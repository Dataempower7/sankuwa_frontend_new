import request from "@/utils/request";
import type { BuyerShowCommentListFilter, BuyerShowListFilter } from "@/types/buyerShow/buyerShow";

export const buyerShowLike = (data: object) => {
    return request({
        url: "buyerShow/buyerShow/like",
        method: "post",
        data
    });
};

export const buyerShowComment = (data: object) => {
    return request({
        url: "buyerShow/buyerShow/comment",
        method: "post",
        data
    });
};

export const buyerShowCommentLike = (data: object) => {
    return request({
        url: "buyerShow/buyerShow/comment/like",
        method: "post",
        data
    });
};

export const buyerShowAdd = (data: object) => {
    return request({
        url: "buyerShow/buyerShow/add",
        method: "post",
        data
    });
};

export const buyerShowList = (params: object) => {
    return request<BuyerShowListFilter>({
        url: "buyerShow/buyerShow/list",
        method: "get",
        params
    });
};

export const buyerShowDetail = (params: object) => {
    return request({
        url: "buyerShow/buyerShow/detail",
        method: "get",
        params
    });
};

export const buyerShowCommentList = (params: object) => {
    return request<BuyerShowCommentListFilter>({
        url: "buyerShow/buyerShow/comment/pageList",
        method: "get",
        params
    });
};

// 获取买家秀选择已购买的商品列表
export const getHistoryProduct = (params: object) => {
    return request({
        url: "product/product/getHistoryProduct",
        method: "get",
        params
    });
};

// 获取买家秀分组列表
export const getBuyerShowGroupList = (params?: object) => {
    return request({
        url: "buyerShow/buyerShow/groupList",
        method: "get",
        params
    });
};
