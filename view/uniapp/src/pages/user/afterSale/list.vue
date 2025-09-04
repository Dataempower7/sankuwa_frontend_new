<template>
    <tig-layout title="申请列表">
        <view class="after-sale-list">
            <view class="order-list">
                <block v-for="item in afterSaleList" :key="item.orderId">
                    <view class="order-list-item">
                        <view class="order-list-item-header">
                            <text class="special-text"
                                >{{ $t("售后编号") }}：<text class="special-color">{{ item.aftersalesSn }}</text>
                            </text>
                            <text style="color: #404AAF;">{{ item.statusName }}</text>
                        </view>
                        <view class="order-list-item-content">
                            <view class="item-content-product">
                                <block v-for="subItem in item.aftersalesItems" :key="subItem.aftersalesItemId">
                                    <navigator :url="'/pages/product/index?id=' + subItem.productId" hover-class="navigator-hover">
                                        <view class="item-content-product-item">
                                            <view class="item-content-product-img">
                                                <tig-image :src="subItem.picThumb" />
                                            </view>
                                            <view class="item-content-product-info">
                                                <view class="product-item-title">
                                                    {{ subItem.productName }}
                                                </view>
                                                <view class="product-item-price">
                                                    <format-price
                                                        :show-text="false"
                                                        :decimals-style="{
                                                            fontSize: '25rpx'
                                                        }"
                                                        :currency-style="{
                                                            fontSize: '23rpx'
                                                        }"
                                                        class="product-item-pricenum"
                                                        :price-data="subItem.price"
                                                    />
                                                    <view class="product-item-quantity">x {{ subItem.quantity }}</view>
                                                </view>
                                            </view>
                                        </view>
                                    </navigator>
                                </block>
                            </view>
                        </view>
                        <!-- 售后申请列表底部样式 - 借鉴订单列表样式 -->
                        <view class="order-pay-footer">
                            <!-- 售后信息统计 -->
                            <view class="pay-summary">
                                <text class="summary-text">共{{ getTotalQuantity(item.aftersalesItems) }}件商品</text>
                                <view class="summary-price">
                                    <text style="font-size: 28rpx; color: #666;">申请金额：</text>
                                    <text class="price-amount">¥{{ formatTotalAmount(item.aftersalesItems) }}</text>
                                </view>
                            </view>

                            <!-- 操作按钮区域 -->
                            <view class="pay-actions">
                                <view class="action-left">
                                    <!-- 售后申请列表不需要更多按钮 -->
                                </view>

                                <view class="action-center">
                                    <!-- 无倒计时 -->
                                </view>

                                <view class="action-right">
                                    <!-- <view
                                        class="delete-btn"
                                        style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff; margin-right: 10rpx;"
                                        @tap="handleDeleteAfterSale(item.aftersaleId)"
                                        @click="handleDeleteAfterSale(item.aftersaleId)"
                                    >
                                        <text class="delete-btn-text" style="font-size: 28rpx; color: #1c1c1c;">删除售后单</text>
                                    </view> -->
                                    <view
                                        class="detail-btn"
                                        style="padding: 16rpx 40rpx; background: #3544BA; border-radius: 50rpx; box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);"
                                        @tap="handleAfterSaleDetail(item.aftersaleId)"
                                        @click="handleAfterSaleDetail(item.aftersaleId)"
                                    >
                                        <text class="detail-btn-text" style="font-size: 30rpx; color: #fff; font-weight: 500;">{{ $t("售后详情") }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </block>
            </view>
            <loading-box v-model="loaded" :page="filterParams.page" :length="afterSaleList.length" />
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { aftersalesRecord, aftersalesCancel } from "@/api/user/afterSale";
import type { AfterSaleListFilterResult } from "@/types/user/afterSale";
import { onShow, onReachBottom } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const filterParams = reactive({
    page: 1,
    size: 10
});
const loaded = ref(false);
const afterSaleList = ref<AfterSaleListFilterResult[]>([]);
const total = ref(0);
const getList = async () => {
    if (filterParams.page > 1) {
        loaded.value = true;
    } else {
        uni.showLoading({
            title: t("加载中")
        });
    }
    try {
        const result = await aftersalesRecord(filterParams);
        afterSaleList.value = [...afterSaleList.value, ...result.records];
        total.value = result.total;
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
        loaded.value = false;
    }
};

const handleAfterSaleDetail = (id: number) => {
    uni.navigateTo({
        url: `/pages/user/afterSale/info?id=${id}`
    });
};

// 处理删除售后申请
const handleDeleteAfterSale = (aftersaleId: number) => {
    uni.showModal({
        title: '确认删除售后单',
        content: '删除之后此售后单无法恢复，请谨慎操作',
        success: async (res) => {
            if (res.confirm) {
                try {
                    // 显示加载提示
                    uni.showLoading({
                        title: '删除中...'
                    });

                    // 调用撤销售后申请的API
                    await aftersalesCancel({ id: aftersaleId });

                    uni.hideLoading();
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });

                    // 删除成功后刷新列表
                    // 如果当前页面只有一条数据且不是第一页，则跳转到上一页
                    if (afterSaleList.value.length === 1 && filterParams.page > 1) {
                        filterParams.page = filterParams.page - 1;
                    } else {
                        filterParams.page = 1;
                    }
                    afterSaleList.value = [];
                    getList();
                } catch (error: any) {
                    uni.hideLoading();
                    console.error('删除售后单失败:', error);

                    // 根据错误信息显示不同的提示
                    let errorMessage = '删除失败，请重试';
                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (error?.data?.message) {
                        errorMessage = error.data.message;
                    }

                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 2000
                    });
                }
            }
        }
    });
};

const handleNavigateTo = (url: string) => {
    uni.navigateTo({
        url
    });
};

// 计算商品总数量
const getTotalQuantity = (items: any[]) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

// 计算申请总金额
const formatTotalAmount = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0);
    return total.toFixed(2);
};

onReachBottom(() => {
    if (filterParams.page < Math.ceil(total.value / filterParams.size)) {
        filterParams.page++;
        getList();
    }
});

onShow(() => {
    filterParams.page = 1;
    afterSaleList.value = [];
    getList();
});
</script>

<style lang="scss" scoped>
.after-sale-list {
    background-color: #f5f5f5;
    margin-top: -150rpx;
    padding-top: 170rpx;
    border-radius: 20rpx 20rpx 0 0;
    min-height: 100vh;
}

.order-list {
    padding: 10rpx 20rpx;

    .order-list-item {
        background-color: #fff;
        border-radius: 30rpx;
        margin-bottom: 20rpx;
        padding: 20rpx;
        font-size: 24rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .order-list-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20rpx;

            .special-text { 
                font-size: 26rpx;
                font-weight: 400;
                color: #727272;
            }
            .special-color {
                color: #999;
                font-weight: normal;
                font-size: 26rpx;
            }
        }

        .order-list-item-content {
            .item-content-text {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10rpx;

                .special-color {
                    color: #999;
                }
            }

            .item-content-product-item {
                padding-bottom: 15rpx;
                display: flex;
                &:first-child {
                    padding-top: 15rpx;
                }

                .item-content-product-img {
                    width: 140rpx;
                    height: 140rpx;
                }
                .item-content-product-info {
                    width: 495rpx;
                    padding-left: 25rpx;

                    .product-item-title {
                        font-weight: bold;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        font-size: 28rpx;
                    }

                    .product-item-price {
                        display: flex;
                        padding-top: 25rpx;
                        .product-item-pricenum {
                            font-size: 30rpx;
                        }

                        .product-item-quantity {
                            font-size: 28rpx;
                            color: #999;
                            padding-left: 15rpx;
                        }
                    }
                }
            }

            .item-content-pay {
                display: flex;
                justify-content: flex-end;

                .item-content-pay-box {
                    display: flex;
                    .pay-item {
                        padding: 0 10rpx;

                        &.pay-type {
                            color: #999;
                        }

                        &.total-money {
                            .price-content {
                                color: var(--general);
                            }
                        }
                    }
                }
            }
        }

        /* 售后申请列表底部样式 - 复用订单列表样式 */
        .order-pay-footer {
            border-top: 1rpx solid #f0f0f0;
            padding-top: 20rpx;
            position: relative;

            .pay-summary {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30rpx;

                .summary-text {
                    font-size: 28rpx;
                    color: #666;
                }

                .summary-price {
                    font-size: 32rpx;
                    display: flex;
                    align-items: center;

                    .price-amount {
                        color: #000000;
                        font-weight: 600;
                        margin-left: 8rpx;
                    }
                }
            }

            .pay-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;

                // .action-left 和 .action-center 在售后申请列表中不需要样式

                .action-right {
                    display: flex;
                    align-items: center;
                    gap: 10rpx;

                    /* 删除申请按钮 */
                    .delete-btn {
                        padding: 16rpx 32rpx;
                        border: 1rpx solid #808080;
                        border-radius: 50rpx;
                        background-color: #fff;

                        .delete-btn-text {
                            font-size: 28rpx;
                            color: #1c1c1c;
                            font-weight: 500;
                        }

                        &:active {
                            background-color: #f8f8f8;
                        }
                    }

                    /* 售后详情按钮 - 与立即支付样式一致 */
                    .detail-btn {
                        padding: 16rpx 40rpx;
                        background: #3544BA;
                        border-radius: 50rpx;
                        box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

                        .detail-btn-text {
                            font-size: 30rpx;
                            color: #fff;
                            font-weight: 500;
                        }

                        &:active {
                            background: linear-gradient(135deg, #3744B2, #2A3A9F);
                            transform: scale(0.96);
                        }
                    }
                }
            }
        }
    }
}
</style>
