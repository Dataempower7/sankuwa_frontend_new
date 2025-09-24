<template>
    <tig-layout title="商品收藏">
        <!-- 统计和管理栏 -->
        <view v-if="collectList.length > 0" class="collect-header">
            <view class="collect-count">
                <text class="count-text">共</text>
                <text class="count-number">{{ collectList.length }}</text>
                <text class="count-text">件商品</text>
            </view>
            <view class="manage-btn" @click="toggleManage">
                <text class="manage-text">{{ isManaging ? '完成' : '管理' }}</text>
            </view>
        </view>

        <view v-if="collectList.length > 0" class="collect-product">
            <uni-swipe-action>
                <block v-for="item in collectList" :key="item.productId">
                    <view class="move-item">
                        <uni-swipe-action-item :threshold="0" auto-close>
                            <view class="collect-product-item" @click="handleItemClick(item)">
                                <!-- 复选框 -->
                                <view v-if="isManaging" class="checkbox-wrapper">
                                    <tig-checkbox
                                        v-model:checked="item.isChecked"
                                        size="20"
                                        @change="onCheckChange"
                                    />
                                </view>

                                <view class="collect-product-item-left">
                                    <view class="img-box">
                                        <tig-image :src="item.picThumb" />
                                    </view>
                                </view>
                                <view class="collect-product-item-right">
                                    <view class="title">{{ item.productName }}</view>
                                    <view class="item-bottom">
                                        <view class="price">
                                            <format-price
                                                :decimals-style="{
                                                    fontSize: '25rpx'
                                                }"
                                                :currency-style="{
                                                    fontSize: '23rpx'
                                                }"
                                                :price-data="item.price"
                                            />
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <template v-if="!isManaging" #right>
                                <view class="collect-move-box">
                                    <view class="btn-del" @click="__delCollect(item.productId)"
                                        ><text>{{ $t("取消收藏") }}</text></view
                                    >
                                </view>
                            </template>
                        </uni-swipe-action-item>
                    </view>
                </block>
            </uni-swipe-action>
        </view>

        <!-- 底部操作栏 -->
        <view v-if="isManaging && collectList.length > 0" class="bottom-action-bar">
            <view class="action-left">
                <tig-checkbox
                    v-model:checked="allChecked"
                    size="20"
                    @change="onCheckAll"
                />
                <text class="all-select-text" @click="onCheckAllText">全选</text>
            </view>
            <view class="action-right">
                <view class="action-btn cancel-btn" @click="cancelManage">
                    <text class="btn-text">取消</text>
                </view>
                <view class="action-btn delete-btn" @click="batchDelete">
                    <text class="btn-text">删除</text>
                </view>
            </view>
        </view>
        <view v-if="collectList.length === 0 && loadend === true" class="empty-collect-container">
            <view class="empty-content"> 
                <image class="empty-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880KR1xldruCfkdYsFnqr.jpeg" mode="aspectFit" />
                <text class="empty-text">{{ $t("暂无收藏记录") }}</text>
                <text class="empty-desc">{{ $t("收藏喜欢的商品，方便下次查看") }}</text>
            </view>
        </view>
        <loading-box v-model="loaded" :page="filterParams.page" :length="collectList.length" />
    </tig-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { getCollectProductList, delCollectProduct } from "@/api/user/collectProduct";
import type { CollectProductList, CollectProductFilterParams } from "@/types/user/collectProduct";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const filterParams = reactive<CollectProductFilterParams>({
    //初使化用于查询的参数
    page: 1,
    size: 10,
    keyword: ""
});
const total = ref(0);
const loaded = ref(false);
const loadend = ref(false);
const collectList = ref<(CollectProductList & { isChecked?: boolean })[]>([]);

// 管理状态
const isManaging = ref(false);

// 全选状态
const allChecked = computed({
    get: () => {
        if (collectList.value.length === 0) return false;
        return collectList.value.every(item => item.isChecked);
    },
    set: (value: boolean) => {
        collectList.value.forEach(item => {
            item.isChecked = value;
        });
    }
});
const __getCollectProductList = async () => {
    if (filterParams.page > 1) {
        loaded.value = true;
    } else {
        uni.showLoading({
            title: t("加载中")
        });
    }
    try {
        const result = await getCollectProductList({ ...filterParams });
        total.value = result.total;
        collectList.value = [...collectList.value, ...result.records];
        // collectList.value = Object.assign(collectList.value, result.records)
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
        loaded.value = false;
        loadend.value = true;
    }
};

// 切换管理状态
const toggleManage = () => {
    isManaging.value = !isManaging.value;
    if (!isManaging.value) {
        // 退出管理模式时清除所有选中状态
        collectList.value.forEach(item => {
            item.isChecked = false;
        });
    }
};

// 处理商品点击
const handleItemClick = (item: CollectProductList & { isChecked?: boolean }) => {
    if (isManaging.value) {
        // 管理模式下切换选中状态
        item.isChecked = !item.isChecked;
    } else {
        // 非管理模式下跳转到商品详情
        handleLink(item.productId);
    }
};

const handleLink = (id: number) => {
    uni.redirectTo({
        url: "/pages/product/index?id=" + id
    });
};

// 复选框变化处理
const onCheckChange = () => {
    // 这里可以添加额外的逻辑，比如更新UI状态
};

// 全选处理
const onCheckAll = () => {
    // computed 属性会自动处理
};

const onCheckAllText = () => {
    allChecked.value = !allChecked.value;
};

// 取消管理
const cancelManage = () => {
    isManaging.value = false;
    collectList.value.forEach(item => {
        item.isChecked = false;
    });
};

// 批量删除
const batchDelete = () => {
    const selectedItems = collectList.value.filter(item => item.isChecked);
    if (selectedItems.length === 0) {
        uni.showToast({
            title: '请选择要删除的商品',
            icon: 'none'
        });
        return;
    }

    uni.showModal({
        title: t("提示"),
        content: t(`确定删除选中的${selectedItems.length}件商品吗？`),
        success: async (res) => {
            if (res.confirm) {
                batchDeleteCollect(selectedItems.map(item => item.productId));
            }
        }
    });
};

// 批量删除收藏
const batchDeleteCollect = async (productIds: number[]) => {
    try {
        // 这里需要根据实际API调用批量删除
        for (const id of productIds) {
            await delCollectProduct({ id });
        }

        uni.showToast({
            title: t("删除成功"),
            icon: "none"
        });

        // 重新加载数据
        filterParams.page = 1;
        collectList.value = [];
        await __getCollectProductList();

        // 退出管理模式
        isManaging.value = false;
    } catch (error: any) {
        uni.showToast({
            title: error.message || '删除失败',
            icon: "none",
            duration: 1000
        });
    }
};

const __delCollect = (id: number) => {
    uni.showModal({
        title: t("提示"),
        content: t("确定取消收藏吗？"),
        success: async (res) => {
            if (res.confirm) {
                deleteASiteCollection(id);
            }
        }
    });
};

const deleteASiteCollection = async (value: number) => {
    try {
        await delCollectProduct({ id: value });
        uni.showToast({
            title: t("取消收藏成功"),
            icon: "none"
        });

        filterParams.page = 1;
        collectList.value = [];
        __getCollectProductList();
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1000
        });
    }
};

onLoad(() => {
    __getCollectProductList();
});

onReachBottom(() => {
    if (filterParams.page < Math.ceil(total.value / filterParams.size)) {
        filterParams.page++;
        __getCollectProductList();
    }
});
</script>

<style lang="scss" scoped>
/* 统计和管理栏 */
.collect-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 25rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;

    .collect-count {
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

.collect-product {
    padding: 25rpx 25rpx;
    padding-bottom: 120rpx; /* 为底部操作栏留出空间 */

    .move-item {
        margin-bottom: 20rpx;
    }

    .collect-product-item {
        padding: 25rpx;
        background-color: #fff;
        border-radius: 30rpx;
        display: flex;
        overflow: hidden;
        position: relative;

        .checkbox-wrapper {
            display: flex;
            align-items: center;
            padding-right: 15rpx;
        }

        .collect-product-item-left {
            .img-box {
                width: 150rpx;
                height: 150rpx;
            }
        }

        .collect-product-item-right {
            width: 100%;
            padding-top: 15rpx;
            padding-left: 12rpx;
            .title {
                width: 500rpx;
                font-size: 28rpx;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .item-bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 25rpx;

                .price {
                    font-size: 32rpx;
                    color: var(--general);
                }
            }
        }
    }
}
.collect-move-box {
    width: 150rpx;
    height: 100%;
    color: #fff;
    text-align: center;
    vertical-align: middle;
    display: flex;
    text {
        display: block;
        position: absolute;
        top: 50%;
        margin-top: -20rpx;
        font-size: 24rpx;
        text-align: center;
        width: 100%;
    }
    .btn-collect {
        width: 150rpx;
        background: var(--vice-bg);
        color: var(--general);
        display: inline-block;
        height: 100%;
        vertical-align: middle;
        display: table-cell;
        position: relative;
    }
    .btn-del {
        width: 150rpx;
        background: var(--general);
        display: inline-block;
        height: 100%;
        vertical-align: middle;
        display: table-cell;
        position: relative;
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

/* 空白收藏页面 */
.empty-collect-container {
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
</style>
