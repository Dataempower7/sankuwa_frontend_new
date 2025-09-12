<template>
    <view class="shop-page">
        <!-- Custom Navigation Header -->
        <view class="custom-nav">
            <view class="nav-back" @click="goBack">
                <img src="/static/images/common/trolley_icon_back@3x.png" style="  width: 45rpx; height: 45rpx;" ></img>
            </view>
            <view class="nav-title">{{ navbarTitle }}</view>
        </view>
        
        <!-- Content -->
        <view class="decorate-page-window" :style="{ ...cssVariable }">
            <modules v-if="Object.keys(shopInfo).length > 0" :modules="modulesList" :shop-info="shopInfo" @refresh-shop-detail="getShopInfo" />
        </view>
    </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref, computed } from "vue";
import { getShopDecorate, getShopDetail } from "@/api/shop/shop";
import modules from "@/components/modules/shopModules.vue";
import type { ShopDetailItem } from "@/types/shop/shop";
import type { PageModule } from "@/types/home/home";

const shopId = ref(0);

onLoad((options) => {
    if (options && options.shopId) {
        shopId.value = options.shopId;
        getShopInfo();
        __getShopDecorate();
    }
});

const navbarTitle = ref("店铺详情");

const modulesList = ref<any[]>([]);
const pageModulesData = ref<PageModule>({} as PageModule);

const __getShopDecorate = async () => {
    try {
        const result = await getShopDecorate(shopId.value);
        modulesList.value = result.moduleList;
        pageModulesData.value = result.pageModule;
    } catch (error) {
        console.error(error);
    }
};

const cssVariable = computed(() => {
    return {
        "background-color": `${pageModulesData.value.backgroundColor}`,
        "background-image": `url("${pageModulesData.value.backgroundImage?.picUrl}")`,
        "background-size": `${getSize(pageModulesData.value?.backgroundSize)}`,
        "background-repeat": `${getRepeat(pageModulesData.value?.backgroundRepeat)}`
    };
});


const getSize = (key: string) => {
    let repeat:{[key: string]: any} = {
        '1': '100% auto',
        '2': 'auto 100%',
        '3': '100% 100%',
    }
    return repeat[key]
}

const getRepeat = (key: string) => {
    let repeat:{[key: string]: any} = {
        '1': 'no-repeat',
        '2': 'repeat',
        '3': 'repeat-x',
        '4': 'repeat-y'
    }
    return repeat[key]
}

const shopInfo = ref<ShopDetailItem>({} as ShopDetailItem);
const getShopInfo = async () => {
    try {
        const result = await getShopDetail(shopId.value);
        shopInfo.value = result;
        navbarTitle.value = result.shopTitle;
    } catch (error: any) {
        console.error(error);
    }
};

const goBack = () => {
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.shop-page {
    position: relative;
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* Custom Navigation */
.custom-nav {
    position: fixed;
    top: 88rpx;
    left: 0;
    right: 0;
    height: 88rpx;
   // background: rgba(255, 255, 255, 0.9);
   // backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    z-index: 1000;
    padding: 0 30rpx;
    
    .nav-back {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .iconfont-h5 {
            color: #333;
            font-size: 32rpx;
        }
    }
    
    .nav-title {
        flex: 1;
        text-align: center;
        font-size: 38rpx;
        font-weight: 500;
        color: #333;
        margin-right: 50rpx;
    }

    
    .nav-right {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .nav-more {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            
            .dot {
                width: 6rpx;
                height: 6rpx;
                background: #333;
                border-radius: 50%;
                margin: 0 2rpx;
            }
        }
        
        .nav-record {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 50%;
            
            .iconfont-h5 {
                color: #fff;
                font-size: 28rpx;
            }
        }
    }
}

.decorate-page-window {
    padding-top: calc(var(--status-bar-height, 44rpx) + 88rpx);
}

/* Shop page specific styles for product list */
.shop-page :deep(.goods-ad-warp) {
    padding: 0rpx 0rpx 20rpx;
    background: #f5f5f5;
}

.shop-page :deep(.goods-ad-warp .goods-ad-con) {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0 -10rpx;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item) {
    width: 50%;
    padding: 0 10rpx;
    margin-bottom: 20rpx;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-con) {
    background: #fff;
    border-radius: 33rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    border: 1rpx solid #f0f0f0;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-photo) {
    border-radius: 22rpx;
    overflow: hidden;
    margin: 12rpx;
    margin-bottom: 8rpx;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-photo image) {
    border-radius: 22rpx;
    width: 100%;
    height: auto;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info) {
    padding: 0 20rpx 20rpx;
}

/* Force all layouts to use two-column with margin method */
.shop-page :deep(.ad-style__1 .goods-ad-warp .goods-ad-con),
.shop-page :deep(.ad-style__2 .goods-ad-warp .goods-ad-con),
.shop-page :deep(.ad-style__4 .goods-ad-warp .goods-ad-con) {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10rpx;
    padding: 0;
}

.shop-page :deep(.ad-style__1 .goods-ad-warp .goods-ad-item),
.shop-page :deep(.ad-style__2 .goods-ad-warp .goods-ad-item),
.shop-page :deep(.ad-style__4 .goods-ad-warp .goods-ad-item) {
    width: 50%;
    padding: 0 10rpx;
    margin-bottom: 20rpx;
}

/* Three column layout */
.shop-page :deep(.ad-style__3 .goods-ad-warp .goods-ad-con) {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -5rpx;
    padding: 0;
}

.shop-page :deep(.ad-style__3 .goods-ad-warp .goods-ad-item) {
    width: 33.33%;
    padding: 0 5rpx;
    margin-bottom: 20rpx;
}

/* Horizontal scroll layout */
.shop-page :deep(.ad-style__6 .goods-ad-warp .goods-ad-con) {
    padding-left: 20rpx;
    padding-right: 20rpx;
}

.shop-page :deep(.ad-style__6 .goods-ad-warp .goods-ad-con .goods-ad-item) {
    margin-bottom: 0;
    margin-right: 20rpx;
}

/* Ensure proper spacing for all product items - force two columns */
.shop-page :deep(.module-goods_ad .goods-ad-warp .goods-ad-con) {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10rpx;
}

.shop-page :deep(.module-goods_ad .goods-ad-item) {
    width: 50%;
    padding: 0 10rpx;
    margin-bottom: 20rpx;
}

/* Reorder price above product name and improve styling */
.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info) {
    display: flex;
    flex-direction: column;
    padding: 0 20rpx 20rpx;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info .item-action) {
    order: 1;
    padding: 0;
    margin-bottom: 8rpx;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info .item-name) {
    order: 2;
    margin: 0;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info .item-price) {
    font-size: 32rpx;
    font-weight: bold;
    color: #000;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info .item-name .item-name-a) {
    font-size: 26rpx;
    color: #666;
    line-height: 36rpx;
    height: auto;
    margin-bottom: 0;
    font-weight: 400;
}

.shop-page :deep(.goods-ad-warp .goods-ad-item .item-info .item-buy) {
    display: none;
}

/* Move product module up more */
.shop-page :deep(.module-goods_ad) {
    margin-top: -50rpx;
}

.shop-page :deep(.module-goods_ad .module-ad-content) {
    padding-top: 5rpx;
}
</style>
