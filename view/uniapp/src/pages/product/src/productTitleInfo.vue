<template>
    <view class="product-title-info">
        <view class="title-info-top">
            <template v-if="isSeckill || isDiscount">
                <view class="title-info-bottom line2">
                    {{ productInfo.productName }}
                </view>
            </template>
            <template v-else>
                <view class="title-top-price">
                    <format-price
                        :font-style="{ fontSize: '36rpx' }"
                        :decimals-style="{
                            fontSize: '25rpx'
                        }"
                        :currency-style="{
                            fontSize: '23rpx'
                        }"
                        :price-data="productPrice"
                    />
                    <template v-if="type === 'exchange'">
                        <view class="exchange-box">
                            <text class="exchange-icon">+</text>
                            <image class="exchange-img" :src="staticResource('exchange/exchange.png')" />
                            <text class="exchange-text">{{ exchangeIntegral }}</text>
                        </view>
                    </template>
                    <template v-if="type !== 'exchange' && configStore.showMarketprice && productInfo.marketPrice && Number(productInfo.marketPrice) > 0">
                        <view class="title-top-market_price">
                            <format-price :is-bottom="false" :price-data="productInfo.marketPrice" />
                        </view>
                    </template>
                </view>
            </template>
            <view class="title-top-panle">
                <view class="title-top-panle-collect" @click="addCollect">
                    <view class="icon-container">
                        <image 
                            class="icon-img" 
                            :src="isCollect ? 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ydrbAz3k2yeFUQ2ocC.jpeg' : 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ZVxAud1Q4FLWOU6E3o.jpeg'" 
                        />
                    </view>
                </view>
                <view class="title-top-panle-collect" @click.stop="handleShare">
                    <view class="icon-container">
                        <image class="icon-img" src="/static/images/product/share.png" />
                    </view>
                </view>
            </view>
        </view>

        <!-- 优惠券 -->
        <template v-if="promotionList.length > 0">
            <view class="activity-box" @click="handleCoupon">
                <view class="coupon-left">
                    <!-- <image class="coupon-icon" src="/static/images/product/coupon.png" /> -->
                    <view class="coupon-content">
                        <template v-for="item in promotionList.length > 2 ? promotionList.slice(0, 2) : promotionList" :key="item.promotionId">
                            <activityCard :activity-info="item" card-type="detail" />
                        </template>
                    </view>
                </view>
                <view class="activity-btn">
                    <image class="arrow-icon" src="/static/images/common/right.png"  />
                </view>
            </view>
        </template>
        <view v-if="!isSeckill && !isDiscount" class="title-info-bottom line2">
            {{ productInfo.productName }}
        </view>
        <productShare v-model="showShare" :product-id="Number(productId)" :product-info="productInfo" :product-price="productPrice" />
    </view>
</template>

<script setup lang="ts">
import type { ProductItem, SkuPromotion } from "@/types/product/product";
import { ref } from "vue";
import type { PropType } from "vue";
import { getCollectProduct, delCollectProduct, updateCollectProduct } from "@/api/product/product";
import productShare from "./productShare.vue";
import activityCard from "@/components/masonry/activityCard.vue";
import { watch } from "vue";
import { useConfigStore } from "@/store/config";
import { staticResource } from "@/utils";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";

const configStore = useConfigStore();
const userStore = useUserStore();

const props = defineProps({
    productInfo: {
        type: Object as PropType<ProductItem>,
        default: () => ({})
    },
    productPrice: {
        type: [String, Number],
        default: "0"
    },
    isSeckill: {
        type: Number,
        default: 0
    },
    isDiscount: {
        type: Number,
        default: 0
    },
    promotionList: {
        type: Array as PropType<SkuPromotion[]>,
        default: () => []
    },
    showCoupon: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: ""
    },
    exchangeIntegral: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(["update:showCoupon"]);

const { t } = useI18n();

const isCollect = ref(false);

const productId = ref<number>(0);

const handleCoupon = () => {
    emit("update:showCoupon", true);
};
const getCollect = async (id: any) => {
    try {
        const result = await getCollectProduct({ id });
        isCollect.value = result;
    } catch (error: any) {
        if (error.code === 401) return (isCollect.value = false);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};
const addCollect = async () => {
    try {
        if (isCollect.value) {
            await delCollectProduct({
                id: productId.value
            });
        } else {
            await updateCollectProduct({
                productId: productId.value
            });
        }
        uni.showToast({
            title: isCollect.value ? t("取消收藏成功") : t("收藏成功"),
            icon: "none"
        });
        await getCollect(productId.value);
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

const showShare = ref(false);
const handleShare = () => {
    if (!userStore.token) {
        uni.navigateTo({
            url: "/pages/login/index"
        });
        return;
    }
    showShare.value = true;
};

watch(
    () => props.productInfo,
    (newValue) => {
        if (newValue) {
            productId.value = newValue.productId;
            getCollect(newValue.productId);
        }
    }
);
</script>

<style lang="scss" scoped>
.product-title-info {
    background-color: #fff;
    padding: 15rpx 0 15rpx 15rpx;
    border-radius: 25rpx;
    margin-top: 20rpx;

    .title-info-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title-top-price {
            color: var(--general);
            font-weight: bold;
            font-size: 36rpx;
            display: flex;
            align-items: center;
        }

        .title-top-market_price {
            display: flex;
            position: relative;
            bottom: -5rpx;
            margin-left: 15rpx;
            font-size: 22rpx;
            color: #999;
            text-decoration: line-through;
        }
        .title-top-panle {
            display: flex;
            min-width: 115rpx;

            .title-top-panle-collect {
                color: #999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                margin-right: 30rpx;
                .icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 5rpx;
                    
                    .icon-img {
                        width: 45rpx;
                        height: 45rpx;
                    }
                }

                .title-panle-collect-text {
                    position: relative;
                    font-size: 20rpx;
                    white-space: nowrap;
                }
            }
        }
    }

    .title-info-bottom {
        font-size: 32rpx;
        font-weight: bold;
        padding: 0 10rpx 0;
        width: calc(100% - 115rpx);
    }
}

.exchange-box {
    display: flex;
    align-items: center;
    .exchange-img {
        width: 35rpx;
        height: 35rpx;
        padding-right: 5rpx;
    }
    .exchange-icon {
        padding: 0 5rpx;
    }
    .exchange-text {
        font-size: 34rpx;
    }
}

.activity-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
   padding: 20rpx 12px 20rpx 5rpx;
    margin: 10rpx 0;
    
    .coupon-left {
        display: flex;
        align-items: center;
        // background-color: #FFECEE;
        // border-radius: 12rpx;
        padding: 6rpx 8rpx 8rpx 14rpx;
        
        .coupon-icon {
            width: 27rpx;
            height: 27rpx;
            margin-right: 7rpx;
        }
        
        .coupon-content {
            display: flex;
            align-items: center;
            flex: 1;
                gap: 10rpx;
        }
    }
    
    .activity-btn {
        font-size: 24rpx;
        color: #ff4444;
        display: flex;
        align-items: center;
        padding-left: 20rpx;
        
        .coupon-text {
            color: #ff4444;
            font-size: 24rpx;
            margin-right: 10rpx;
        }
        
        .arrow-icon {
          width: 27rpx; 
          height: 27rpx;
        }
        
        .icon-youjiantou {
            font-size: 36rpx;
            margin-left: -8rpx;
            color: #ff4444;
        }
    }
}
</style>
