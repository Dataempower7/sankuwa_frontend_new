import { request, asyncRequest } from "~/utils/request";
import type { filterSeleted, SearchFilter, SearchFilterResult, SearchProductListResult } from "@/types/search/search.d";

// 获取搜索筛选项
export const getSearchFilter = (data: {}) => {
    return request<SearchFilterResult>({
        url: "search/search/getFilter",
        method: "get",
        params: data
    });
};
// 获取搜索商品列表
export const getSearchProductList = (data: {}) => {
    return asyncRequest<SearchProductListResult>({
        url: "search/search/getProduct",
        method: "get",
        params: data
    });
};
