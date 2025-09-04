<template>
    <tig-layout title="浏览记录">
        <!-- 统计和管理栏 -->
        <view v-if="historyList.length > 0" class="history-header">
            <view class="history-count">
                <text class="count-text">共</text>
                <text class="count-number">{{ historyList.length }}</text>
                <text class="count-text">件商品</text>
            </view>
            <view class="manage-btn" @click="toggleManage">
                <text class="manage-text">{{ edit ? '完成' : '管理' }}</text>
            </view>
        </view>

        <up-checkbox-group v-model="checkboxValue" active-color="var(--general)" placement="column" @change="checkboxChange">
            <template v-if="historyList.length > 0">
                <view class="history-product">
                    <template v-for="item in historyList" :key="item.productId">
                        <view class="history-product-item" @click="handleLink(item.productId)">
                            <view class="history-product-item-top">
                                <view class="img-box">
                                    <tig-image :src="item.picThumb" mode="widthFix" />
                                </view>
                            </view>
                            <view class="history-product-item-bottom">
                                <view class="detail line2">
                                    {{ item.productName }}
                                </view>
                                <view class="price">
                                    <format-price
                                        :font-style="{ fontSize: '32rpx' }"
                                        :currency-style="{
                                            fontSize: '22rpx'
                                        }"
                                        :decimals-style="{
                                            fontSize: '25rpx'
                                        }"
                                        :price-data="item.price"
                                    />
                                </view>
                            </view>
                            <view v-show="edit" class="item-btn" @click.stop="">
                                <view class="btn-box">
                                    <up-checkbox :custom-style="{ border: 'none' }" size="20" shape="circle" :name="item.productId" />
                                </view>
                            </view>
                        </view>
                    </template>
                </view>
            </template>
        </up-checkbox-group>

        <template v-if="!loading && historyList.length == 0">
            <view class="empty-history-container">
                <view class="empty-content">
                    <image class="empty-image" src="/static/images/missing_page/browse.png" mode="aspectFit" />
                    <text class="empty-text">{{ $t("暂无浏览记录") }}</text>
                    <text class="empty-desc">{{ $t("浏览过的商品会在这里显示") }}</text>
                </view>
            </view>
        </template>

        <!-- 底部操作栏 -->
        <view v-if="edit && historyList.length > 0" class="bottom-action-bar">
            <view class="action-left">
                <tig-checkbox
                    v-model:checked="allChecked"
                    size="20"
                    @change="handleAll"
                />
                <text class="all-select-text" @click="onCheckAllText">全选</text>
            </view>
            <view class="action-right">
                <view class="action-btn cancel-btn" @click="cancelManage">
                    <text class="btn-text">取消</text>
                </view>
                <view class="action-btn delete-btn" @click="handleDel">
                    <text class="btn-text">删除</text>
                </view>
            </view>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { historyProductList, delHistoryProduct } from "@/api/user/historyProduct";
import { ref } from "vue";
import type { HistoryProductList } from "@/types/user/historyProduct";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading = ref(true);
const historyList = ref<HistoryProductList[]>([]);
const checkboxValue = ref<number[]>([]);
const edit = ref(false);
const allChecked = ref(false);

const checkboxChange = (val: any) => {
    if (val.length == historyList.value.length) {
        allChecked.value = true;
    } else {
        allChecked.value = false;
    }
};
const handleAll = () => {
    if (allChecked.value) {
        checkboxValue.value = historyList.value.map((item) => item.productId);
        return;
    }
    checkboxValue.value = [];
};

const handleDel = async () => {
    const selectedCount = checkboxValue.value.length;
    if (selectedCount === 0) {
        uni.showToast({
            title: '请选择要删除的商品',
            icon: 'none'
        });
        return;
    }

    uni.showModal({
        title: t("提示"),
        content: t(`确定删除选中的${selectedCount}条浏览记录吗？`),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await delHistoryProduct(checkboxValue.value);
                    uni.showToast({
                        title: t("删除成功"),
                        icon: "none"
                    });

                    // 重新加载数据
                    await getHistoryProductList();

                    // 退出管理模式
                    edit.value = false;
                    checkboxValue.value = [];
                    allChecked.value = false;
                } catch (error) {
                    console.error(error);
                    uni.showToast({
                        title: '删除失败，请重试',
                        icon: 'none'
                    });
                }
            }
        }
    });
};
const getHistoryProductList = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        const result = await historyProductList();
        historyList.value = result;
        if (allChecked.value) {
            checkboxValue.value = historyList.value.map((item) => item.productId);
            return;
        }
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
        loading.value = false;
    }
};
getHistoryProductList();
// 切换管理状态
const toggleManage = () => {
    edit.value = !edit.value;
    if (!edit.value) {
        // 退出管理模式时清除所有选中状态
        checkboxValue.value = [];
        allChecked.value = false;
    }
};

// 全选文字点击
const onCheckAllText = () => {
    allChecked.value = !allChecked.value;
    handleAll();
};

// 取消管理
const cancelManage = () => {
    edit.value = false;
    checkboxValue.value = [];
    allChecked.value = false;
};

const handleLink = (id: number) => {
    uni.redirectTo({
        url: "/pages/product/index?id=" + id
    });
};
</script>

<style lang="scss" scoped>
/* 统计和管理栏 */
.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 25rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;

    .history-count {
        display: flex;
        align-items: center;

        .count-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
        }

        .count-number {
            font-size: 32rpx;
            color: #3744B2;
            font-weight: 600;
            margin: 0 4rpx;
        }
    }

    .manage-btn {
        padding: 16rpx 32rpx;
        // background-color: #fff;
        // border: 2rpx solid #e0e0e0;
        // border-radius: 30rpx;
        // box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
        // transition: all 0.3s ease;

        .manage-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
        }

        &:active {
            opacity: 0.8;
            transform: scale(0.96);
            background-color: #f8f8f8;
            border-color: #d0d0d0;
        }
    }
}

.history-product {
    padding: 25rpx 25rpx;
    padding-bottom: 120rpx; /* 为底部操作栏留出空间 */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 25rpx;

    .history-product-item {
        background-color: #fff;
        border-radius: 20rpx;
        overflow: hidden;
        padding: 20rpx;
        position: relative;

        .item-btn {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 2;
            .btn-box {
                position: absolute;
                right: 10rpx;
                top: 10rpx;
            }
        }

        .history-product-item-top {
            .img-box {
                width: 100%;
            }
        }

        .history-product-item-bottom {
            .detail {
                font-weight: bold;
                color: #2a3145;
                font-size: 26rpx;
                line-height: 40rpx;
                height: 80rpx;
                margin: 0 16rpx 10rpx;
            }

            .price {
                color: var(--general);
            }
        }
    }
}

/* 空白历史页面 */
.empty-history-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 80rpx 40rpx;

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .empty-image {
            width: 300rpx;
            height: 300rpx;
            margin-bottom: 40rpx;
        }

        .empty-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 16rpx;
        }

        .empty-desc {
            font-size: 28rpx;
            color: #999;
            line-height: 1.5;
        }
    }
}

/* 底部操作栏 */
.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-top: 1rpx solid #f0f0f0;
    padding: 20rpx 25rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 999;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

    .action-left {
        display: flex;
        align-items: center;

        .all-select-text {
            font-size: 28rpx;
            color: #333;
            margin-left: 12rpx;
        }
    }

    .action-right {
        display: flex;
        gap: 24rpx;

        .action-btn {
            padding: 20rpx 50rpx;
            border-radius: 50rpx;
            min-width: 180rpx;
            height: 88rpx;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            .btn-text {
                font-size: 30rpx;
                font-weight: 500;
                line-height: 1;
            }

            &:active {
                opacity: 0.8;
                transform: scale(0.96);
            }
        }

        .cancel-btn {
            background-color: #fff;
            border: 2rpx solid #e0e0e0;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

            .btn-text {
                color: #666;
            }

            &:active {
                background-color: #f8f8f8;
                border-color: #d0d0d0;
            }
        }

        .delete-btn {
            background: linear-gradient(135deg, #4A5FE7, #3744B2);
            border: none;
            box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

            .btn-text {
                color: #fff;
            }

            &:active {
                background: linear-gradient(135deg, #3744B2, #2A3A9F);
                box-shadow: 0 2rpx 8rpx rgba(55, 68, 178, 0.4);
            }
        }
    }
}
</style>
