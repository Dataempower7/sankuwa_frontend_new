<template>
    <tig-layout title="店铺收藏">
        <view class="collection-shop">
            <template v-if="collectionShopList.length > 0">
                <uni-swipe-action>
                    <view class="collection-content">
                        <template v-for="item in collectionShopList" :key="item.shopId">
                            <view class="move-item">
                                <uni-swipe-action-item :threshold="0" auto-close>
                                    <view class="shop-item">
                                        <view class="shop-item-left" @click="handleLink(item.shopId)">
                                            <tig-image :src="item.shop.shopLogo" />
                                        </view>
                                        <view class="shop-item-middle" @click="handleLink(item.shopId)">
                                            <view class="shop-name line1">{{ item.shop.shopTitle }}</view>
                                            <view class="shop-desc line1">{{ item.shop.description ? item.shop.description : "店家比较懒，暂无店铺描述" }}</view>
                                            <view class="shop-info">
                                                <text class="shop-info-text">上架商品：{{ item.productCount }}</text>   
                                                <text class="shop-info-text">店铺收藏：{{ item.collectCount }}</text>
                                            </view>
                                        </view>
                                        <view class="shop-item-right">
                                            <view class="enter-shop-btn" @click="handleLink(item.shopId)">
                                                <text>进店</text>
                                            </view>
                                        </view>
                                    </view>
                                    <template #right>
                                        <view class="collect-move-box">
                                            <view class="btn-del" @click="handleCancel(item.shopId)"
                                                ><text>{{ $t("取消收藏") }}</text></view
                                            >
                                        </view>
                                    </template>
                                </uni-swipe-action-item>
                            </view>
                        </template>
                    </view>
                </uni-swipe-action>
            </template>
            <!-- <empty-box v-if="collectionShopList.length == 0 && !loading && !loaded" text="暂无收藏记录！"></empty-box> -->
            <view v-if="collectionShopList.length === 0 && !loading && !loaded" class="empty-shop-container">
                <view class="empty-content">
                    <image class="empty-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880eQjtdumcN6A9yOB11i.jpeg" mode="aspectFit" />
                    <text class="empty-text">{{ $t("暂无收藏店铺") }}</text>
                    <text class="empty-desc">{{ $t("收藏喜欢的店铺，方便下次查看") }}</text>
                </view>
            </view>
            <loading-box v-model="loaded" :page="filterParams.page" :length="collectionShopList.length"></loading-box>
            <!-- <tig-loadingpage v-model="loading"></tig-loadingpage> -->
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { getCollectionShop } from "@/api/user/collectionShop";
import { shopCollection } from "@/api/shop/shop";
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import type { collectionShopList } from "@/types/user/collectionShop";
import { useI18n } from "vue-i18n";


const { t } = useI18n();

const filterParams = reactive({
    //初使化用于查询的参数
    page: 1,
    size: 10,
    keyword: ""
});
const collectionShopList = ref<collectionShopList[]>([]);
const total = ref(0);
const loading = ref(false);
const loaded = ref(false);
const __getCollectionShop = async () => {
    if (filterParams.page > 1) {
        loaded.value = true;
    } else {
        loading.value = true;
    }
    try {
        const result = await getCollectionShop(filterParams);
        collectionShopList.value = result.records;
        total.value = result.total;
    } catch (error) {
        console.error(error);
    } finally {
        loaded.value = false;
        loading.value = false;
    }
};

onLoad(() => {
    __getCollectionShop();
});

const handleLink = (id: number) => {
    uni.navigateTo({
        url: `/pages/shop/index?shopId=${id}`
    });
};

const handleCancel = async (id: number) => {
    try {
        const result = await shopCollection({ shopId: id });
        uni.showToast({
            title: t("取消成功"),
            icon: "none"
        });
        filterParams.page = 1;
        collectionShopList.value = [];
        __getCollectionShop();
    } catch (error) {
        console.error(error);
    }
};

onReachBottom(() => {
    if (filterParams.page < Math.ceil(total.value / filterParams.size)) {
        filterParams.page++;
        __getCollectionShop();
    }
});
</script>

<style lang="scss" scoped>
.collection-content {
    padding: 25rpx;
    .move-item {
        margin-bottom: 20rpx;
    }
    .shop-item {
        padding: 30rpx 20rpx;
        background-color: #fff;
        border-radius: 32rpx;
        display: flex;
        align-items: center;
        
        .shop-item-left {
            width: 130rpx;
            height: 130rpx;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .shop-item-middle {
            flex: 1;
            padding-left: 20rpx;
            padding-right: 20rpx;
            
            .shop-name {
                font-size: 32rpx;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: black;
                font-weight: 500;
            }

            .shop-desc {
                font-size: 24rpx;
                color: #999;
                width: 100%;
                padding-top: 15rpx;
                height: 50rpx;
            }
            
            .shop-info {
                font-size: 24rpx;
                color: #999;
                padding-top: 10rpx;

                .shop-info-text {
                    &:first-child {
                        padding-right: 18rpx;
                    }
                }
            }
        }
        
        .shop-item-right {
            flex-shrink: 0;
            
            .enter-shop-btn {
                padding: 16rpx 32rpx;
                background-color: #fff;
             //   border: 2rpx solid #000;
                border-radius: 8rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                
                text {
                    font-size: 28rpx;
                    color: #000;
                    font-weight: 500;
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

/* 空白收藏店铺页面 */
.empty-shop-container {
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
