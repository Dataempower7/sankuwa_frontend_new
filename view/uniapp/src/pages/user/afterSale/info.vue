<template>
    <tig-layout title="售后详情" :need-safe-top="true">
        <view class="after-sale-info">
            <template v-if="Object.keys(infoData).length">
                <!-- 审核状态显示 -->
                <view class="audit-status" v-if="infoData.status === 1">
                    <image src="/static/images/after_sale/one@3x.png" class="audit-icon" />
                    <text class="audit-text">客服审核中</text>
                </view>

                <!-- 审核状态显示 -->
                <view class="audit-status" v-if="infoData.status === 3">
                    <image src="/static/images/after_sale/three@3x.png" class="audit-icon" />
                    <text class="audit-text">审核不通过</text>
                </view>

                <!-- 审核状态显示 -->
                <view class="audit-status" v-if="infoData.status === 6">
                    <image src="/static/images/after_sale/two@3x.png" class="audit-icon" />
                    <text class="audit-text">售后已完成</text>
                </view>

                <template v-if="showReturngoodstip">
                    <view class="returngoodstip-box">
                        <view class="returngoodstip-bg" />
                        <view class="returngoodstip-content">
                            <view class="iconfont-h5 icon-tongzhi" />
                            <view class="returngoodstip-text line1">{{ infoData.returnGoodsTip }}</view>
                            <view class="iconfont-h5 icon-chacha" @click="showTip = false" />
                        </view>
                    </view>
                </template>

                <!-- 审核进度条
                <view class="after-sal-info-steps">
                    <uni-steps active-color="var(--general)" :options="infoData.stepStatus.steps" :active="infoData.stepStatus.current" />
                </view>  -->

                <!-- 拒绝原因 -->
                <!-- <view v-if="infoData.status === 3" class="refuse-reply">
                    <view class="refuse-reply-title"> {{ $t("拒绝原因") }}: </view>
                    <view class="refuse-reply-content line1">
                        {{ infoData.reply }}
                    </view>
                </view> -->


                <!-- 商品信息模块 -->
                <view class="product-module">
                    <view
                        v-for="item in infoData.aftersalesItems"
                        :key="item.aftersalesItemId"
                        class="product-item"
                        @click="handleProduct(item.productId)"
                    >
                        <view class="product-left">
                            <tig-image :src="item.picThumb" />
                        </view>
                        <view class="product-right">
                            <view class="product-name line2">
                                {{ item.productName }}
                            </view>
                            <view class="product-price">
                                <format-price
                                    :show-text="false"
                                    :decimals-style="{
                                        fontSize: '24rpx',
                                        fontWeight: 'bold'
                                    }"
                                    :currency-style="{
                                        fontSize: '22rpx',
                                        fontWeight: 'bold'
                                    }"
                                    class="price-num"
                                    :price-data="item.price"
                                />
                                <!-- <view class="product-spec">{{ item.skuName || '黑色' }} x{{ item.number }}</view> -->
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 售后详情模块 -->
                <view class="detail-module">
                    <!-- 协商记录 -->
                    <view class="detail-item negotiate-item" @click="handleNegotiate">
                        <view class="detail-label">协商记录</view>
                        <view class="detail-value">
                            <text class="detail-text">查看</text>
                            <uni-icons type="right" size="16" color="#999" />
                        </view>
                    </view>

                    <!-- 退款方式 -->
                    <view class="detail-item">
                        <view class="detail-label">退款方式：</view>
                        <view class="detail-value">{{ getAftersaleTypeText(infoData.aftersaleType) }}</view>
                    </view>

                    <!-- 退款原因 -->
                    <view class="detail-item">
                        <view class="detail-label">退款原因：</view>
                        <view class="detail-value">{{ infoData.aftersalesTypeName || '多拍/拍错/不喜欢' }}</view>
                    </view>

                    <!-- 问题描述 -->
                    <view class="detail-item">
                        <view class="detail-label">问题描述：</view>
                        <view class="detail-value">{{ infoData.description || '尺码不合适' }}</view>
                    </view>

                    <!-- 上传凭证 -->
                    <view v-if="infoData.pics && infoData.pics.length > 0" class="detail-item">
                        <view class="detail-label">上传凭证：</view>
                        <view class="detail-value">

                            <view class="evidence-images">
                                <image
                                    v-for="(pic, index) in infoData.pics"
                                    :key="index"
                                    :src="typeof pic === 'string' ? pic : pic.picThumb || pic.picUrl || pic.url || pic"
                                    class="evidence-image"
                                    mode="aspectFill"
                                    @click="previewImage(typeof pic === 'string' ? pic : pic.picThumb || pic.picUrl || pic.url || pic, getPicUrls(infoData.pics))"
                                />
                            </view>
                        </view>
                    </view>

                    <!-- 售后编号 -->
                    <view class="detail-item">
                        <view class="detail-label">售后编号：</view>
                        <view class="detail-value">{{ infoData.aftersalesSn }}</view>
                    </view>

                    <!-- 申请时间 -->
                    <view class="detail-item">
                        <view class="detail-label">申请时间：</view>
                        <view class="detail-value">{{ infoData.addTime }}</view>
                    </view>

                    <!-- 退货数量 -->
                    <view class="detail-item">
                        <view class="detail-label">退货数量：</view>
                        <view class="detail-value">{{ quantityNum }}</view>
                    </view>

                    <!-- 拒绝原因 (审核不通过时显示) -->
                    <view v-if="infoData.status === 3" class="detail-item">
                        <view class="detail-label">拒绝原因：</view>
                        <view class="detail-value reject-reason">{{ infoData.reply || '审核未通过' }}</view>
                    </view>
                </view>

                <!-- 去发货按钮 -->
                <view v-if="infoData.status === 4" class="negotiate" @click="handleShipments">
                    <view class="negotiate-text"> {{ $t("去发货") }} </view>
                    <view class="negotiate-icon">
                        <uni-icons type="right" size="20" color="#999" />
                    </view>
                </view>


                <template v-if="infoData.logisticsName && infoData.trackingNo">
                    <view class="info-content">
                        <view class="info-content-title"> {{ $t("退货信息") }} </view>
                        <view class="after-sale">
                            <view class="after-sale-item">
                                <view class="label">{{ $t("快递公司") }}：</view>
                                <view class="value">{{ infoData.logisticsName }}</view>
                            </view>
                            <view class="after-sale-item">
                                <view class="label">{{ $t("快递单号") }}：</view>
                                <view class="value">{{ infoData.trackingNo }}</view>
                            </view>
                        </view>
                    </view>
                </template>
                <template v-if="infoData.refund">
                    <view class="info-content">
                        <!-- refundStatus: 0 待处理 1:处理中 2：已处理  3:已取消 -->
                        <view class="info-content-title"> {{ $t("退款进度") }} </view>
                        <view class="after-sale">
                            <template v-if="infoData.refund.onlineBalance > 0">
                                <view class="after-sale-item">
                                    <view class="label">{{ $t("线上退款") }}：</view>
                                    <view class="value"
                                        ><format-price :show-text="false" :is-bottom="false" :price-data="infoData.refund.onlineBalance"
                                    /></view>
                                    <view class="after-sale-status">{{ infoData.refund.isOnline === 2 ? $t("退款成功") : $t("退款中") }}</view>
                                </view>
                            </template>
                            <template v-if="infoData.refund.offlineBalance > 0">
                                <view class="after-sale-item">
                                    <view class="label">{{ $t("线下退款") }}：</view>
                                    <view class="value"
                                        ><format-price :show-text="false" :is-bottom="false" :price-data="infoData.refund.offlineBalance"
                                    /></view>
                                    <view class="after-sale-status">{{ infoData.refund.isOnline === 2 ? $t("退款成功") : $t("退款中") }}</view>
                                </view>
                            </template>
                            <template v-if="infoData.refund.refundBalance > 0">
                                <view class="after-sale-item">
                                    <view class="label">{{ $t("余额退款") }}：</view>
                                    <view class="value"
                                        ><format-price :show-text="false" :is-bottom="false" :price-data="infoData.refund.refundBalance"
                                    /></view>
                                    <view class="after-sale-status">{{ infoData.refund.isOnline === 2 ? $t("退款成功") : $t("退款中") }}</view>
                                </view>
                            </template>
                        </view>
                    </view>
                </template>

                <tig-fixed-placeholder v-if="infoData.canCancel" height="100rpx" background-color="#fff">
                    <view class="after-sale-btn">
                        <view class="after-sale-btn-box">
                            <tig-button class="btn" :plain="true" @click="handleRevocation">
                                {{ $t("撤销申请") }}
                            </tig-button>
                            <tig-button :plain="true" class="btn" @click="handleEdit"> {{ $t("修改申请") }} </tig-button>
                        </view>
                    </view>
                </tig-fixed-placeholder>
            </template>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { aftersalesViewRecord, aftersalesCancel } from "@/api/user/afterSale";
import type { afterSaleInfoItem } from "@/types/user/afterSale";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

onLoad((options) => {
    if (options && options.id) {
        id.value = Number(options.id);
        getAftersalesViewRecord();
    }
});

onShow(() => {
    uni.$on("refreshInfo", (data: number) => {
        id.value = data;
        getAftersalesViewRecord();
    });
});

onUnload(() => {
    uni.$off("refreshInfo");
});

const id = ref<number>();
const infoData = ref<afterSaleInfoItem>({} as afterSaleInfoItem);
const quantityNum = ref(0);
const getAftersalesViewRecord = async () => {
    try {
        const result = await aftersalesViewRecord(id.value!);
        infoData.value = result;
        infoData.value.aftersalesItems.forEach((item: any) => {
            quantityNum.value += item.number;
        });
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

const handleRevocation = () => {
    uni.showModal({
        title: t("提示"),
        content: t("确认要撤销申请吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await aftersalesCancel({ aftersaleId: infoData.value.aftersaleId });
                    uni.showToast({
                        title: t("撤销成功")
                    });
                    uni.redirectTo({
                        url: "/pages/user/afterSale/list"
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
    });
};

const handleEdit = async () => {
    try {
        if (infoData.value.aftersalesItems.length === 1) {
            uni.redirectTo({
                url: `/pages/user/afterSale/edit?aftersaleId=${infoData.value.aftersaleId}&itemId=${infoData.value.aftersalesItems[0].orderItemId}`
            });
        } else {
            uni.redirectTo({
                url: `/pages/user/afterSale/edit?aftersaleId=${infoData.value.aftersaleId}`
            });
        }
    } catch (error) {
        console.error(error);
    }
};

const showTip = ref(true);
const showReturngoodstip = computed(() => {
    return infoData.value.returnGoodsTip && showTip.value;
});

const handleProduct = (id: number) => {
    uni.navigateTo({
        url: `/pages/product/index?id=${id}`
    });
};

const handleNegotiate = () => {
    uni.navigateTo({
        url: "/pages/user/afterSale/negotiate?id=" + infoData.value.aftersaleId
    });
};
const handleShipments = () => {
    uni.navigateTo({
        url: `/pages/user/afterSale/shipments?id=${infoData.value.aftersaleId}&returnAddress=${infoData.value.returnAddress}`
    });
};

// 获取售后类型文本
const getAftersaleTypeText = (type: number) => {
    const typeMap: { [key: number]: string } = {
        1: '仅退款',
        2: '退货退款',
        3: '换货'
    };
    return typeMap[type] || '仅退款';
};

// 预览图片
const previewImage = (current: string, urls: string[]) => {
    uni.previewImage({
        current,
        urls
    });
};

// 获取图片URL数组
const getPicUrls = (pics: any[]) => {
    return pics.map((pic: any) => {
        if (typeof pic === 'string') {
            return pic;
        } else if (pic && (pic.picThumb || pic.picUrl || pic.url)) {
            // 优先使用picUrl（原图），用于预览
            return pic.picUrl || pic.picThumb || pic.url;
        } else {
            return pic;
        }
    });
};
</script>

<style lang="scss" scoped>
.after-sale-info {
    background-color: #f5f5f5;
    margin-top: -150rpx;
}

// 审核状态样式
.audit-status {
    padding: 30rpx 20rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .audit-icon {
        width: 55rpx;
        height: 55rpx;
        margin-right: 10rpx;
    }

    .audit-text {
        font-size: 40rpx;
        color: #333;
        font-weight: 500;
    }
}

// 商品信息模块
.product-module {
    background-color: #fff;
    border-radius: 20rpx;
    margin: 20rpx;
    padding: 30rpx;

    .product-item {
        display: flex;
        align-items: flex-start;

        &:not(:last-child) {
            margin-bottom: 30rpx;
            padding-bottom: 30rpx;
            border-bottom: 1rpx solid #f5f5f5;
        }

        .product-left {
            width: 120rpx;
            height: 120rpx;
            border-radius: 12rpx;
            overflow: hidden;
            margin-right: 20rpx;
            flex-shrink: 0;
        }

        .product-right {
            flex: 1;

            .product-name {
                font-size: 28rpx;
                color: #333;
                line-height: 1.4;
                margin-bottom: 16rpx;
            }

            .product-price {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .price-num {
                    font-size: 32rpx;
                    color: #333;
                    font-weight: bold;
                }

                .product-spec {
                    font-size: 28rpx;
                    color: #666;
                }
            }
        }
    }
}

// 售后详情模块
.detail-module {
    background-color: #fff;
    border-radius: 20rpx;
    margin: 20rpx;
    padding: 30rpx;

    .detail-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 30rpx;

        &:last-child {
            margin-bottom: 0;
        }

        &.negotiate-item {
            align-items: center;
            justify-content: space-between;
            padding-bottom: 30rpx;
            border-bottom: 1rpx solid #f5f5f5;
            margin-bottom: 30rpx;
        }

        .detail-label {
            font-size: 28rpx;
            color: #666;
            min-width: 140rpx;
            flex-shrink: 0;
        }

        .detail-value {
            font-size: 28rpx;
            color: #333;
            display: flex;
            align-items: center;

            .detail-text {
                margin-right: 8rpx;
            }

            &.reject-reason {
                color: #ff4757;
                font-weight: 500;
            }
        }

        .evidence-images {
            display: flex;
            flex-wrap: wrap;
            gap: 16rpx;

            .evidence-image {
                width: 120rpx;
                height: 120rpx;
                border-radius: 12rpx;
            }
        }
    }
}

.returngoodstip-box {
    margin: 20rpx 0;
    padding: 25rpx 0 25rpx 26rpx;
    color: var(--general);
    position: relative;

    .returngoodstip-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--general);
        opacity: 0.1;
        z-index: 0;
    }

    .returngoodstip-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;

        .returngoodstip-text {
            font-size: 24rpx;
            flex: 1;
            padding-left: 16rpx;
        }

        .icon-tongzhi {
            font-size: 34rpx;
        }

        .icon-chacha {
            font-size: 28rpx;
            padding-left: 20rpx;
            padding-right: 16rpx;
        }
    }
}

.after-sal-info-steps {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
}
.refuse-reply {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
    display: flex;
    font-size: 28rpx;
    .refuse-reply-title {
        color: #999;
    }
    .refuse-reply-content {
        padding-left: 15rpx;
        width: 550rpx;
    }
}

.negotiate {
    display: flex;
    justify-content: space-between;
    padding: 20rpx;
    background-color: #fff;
    .negotiate-text {
        font-weight: 500;
        color: #000;
    }
}

.info-content {
    background-color: #fff;
    border-radius: 20rpx;
    margin: 20rpx;
    padding: 30rpx;

    .info-content-title {
        color: #000;
        font-weight: 500;
    }

    .info-content-product {
        padding: 10rpx 20rpx;
        background-color: #fafafa;

        .info-content-product-item {
            display: flex;
            padding: 10rpx 0;

            .product-item-left {
                width: 160rpx;
                height: 160rpx;
                border-radius: 10rpx;
                overflow: hidden;
            }

            .product-item-right {
                padding-left: 20rpx;

                .product-item-name {
                    font-weight: bold;
                    width: 500rpx;
                }

                .right-price {
                    display: flex;
                    font-size: 28rpx;
                    padding-top: 20rpx;
                    .right-price-pricenum {
                        font-weight: bold;
                        color: var(--general);
                        padding-right: 10rpx;
                        :deep(.util) {
                            font-size: 22rpx;
                            font-weight: normal;
                        }
                    }

                    .right-price-quantity {
                        color: #999;
                    }
                }
            }
        }
    }

    .refund-info {
        padding: 15rpx 20rpx;
        border-bottom: 1rpx solid #f5f5f5;
        .refund-info-item {
            display: flex;
            padding: 10rpx 0;

            .price {
                color: var(--general);
            }
        }
    }

    .after-sale {
        padding: 10rpx 0;
        padding-top: 15rpx;
        .after-sale-item {
            display: flex;
            padding: 10rpx 0;
        }
    }
}

.after-sale-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding: 20rpx 30rpx;

    .after-sale-btn-box {
        display: flex;
        align-items: center;

        .btn {
            height: 80rpx;
            font-size: 32rpx;
            border-radius: 40rpx;

            &.special {
                color: var(--general);
                border-color: var(--general);
            }
            &:active {
                background-color: #d9d9d9;
            }

            &:first-child {
                margin-right: 20rpx;
            }
        }
    }
}

.label {
    color: #6a6a6a;
    font-size: 24rpx;
}
.value {
    color: #000;
    font-size: 24rpx;
}
.after-sale-status {
    color: #000;
    font-size: 24rpx;
    color: var(--general);
    padding-left: 15rpx;
}

:deep(.uni-steps__row-desc) {
    font-size: 20rpx;
}
</style>
