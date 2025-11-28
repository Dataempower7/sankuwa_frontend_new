// 买家秀详情
export interface BuyerShowDetailState {
    buyerName?: string;
    buyerPhoto?: string;
    buyerShowId?: number;
    content?: string;
    likeCount?: number | undefined;
    commentCount?: number;
    productList?: any[];
    videoList?: any[];
    imgList?: any[];
    addTime?: string;
    isLike?: boolean;
}

// 获取买家秀列表
export interface BuyerShowListParams {
    page: number;
    size: number;
    sortField?: string;
    keyword?: string;
    sortOrder?: string;
    goodsId?: number;
    productId?: number;
}

export interface BuyerShowData {
    records: BuyerShowFilterState[];
    total: number;
}
export interface BuyerShowFilterState {
    buyerName?: string;
    buyerPhoto?: string;
    buyerShowId?: number;
    content?: string;
    likeCount?: number | undefined;
    isLike?: boolean | undefined;
}

export interface BuyerShowListFilter {
    data: BuyerShowData[];
    code: number;
    message: string;
}

export interface BuyerShowCommentData {
    records: BuyerShowCommentFilterState[];
    total: number;
}
export interface BuyerShowCommentFilterState {
    buyerName?: string;
    buyerPhoto?: string;
    buyerShowId?: number;
    content?: string;
    likeCount?: number;
    isLike?: boolean;
    toggleText?: string;
}

export interface BuyerShowCommentListFilter {
    data: BuyerShowCommentData[];
    code: number;
    message: string;
}

// 获取买家秀点赞
export interface BuyerShowLikeListParams {
    buyerShowId: number;
}

// 评论分页列表
export interface BuyerShowCommentListParams {
    page: number;
    size: number;
    sortField?: string;
    sortOrder?: string;
    keyword?: string;
    parentId?: number;
    buyerShowId?: number | string;
}
