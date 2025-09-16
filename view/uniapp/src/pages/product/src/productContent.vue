<template>
    <view class="product-card-row product-detail-area">
        <view class="tab-box flex align-center justify-around">
            <view class="tab" :class="{ active: tabIndex == 0 }" @click="tabIndex = 0">{{ $t("商品介绍") }}</view>
            <!-- 分割线 -->
            <view class="divider-line-vertical"></view>
            <view class="tab" :class="{ active: tabIndex == 1 }" @click="tabIndex = 1">{{ $t("售后服务") }}</view>
        </view>
        <view v-if="tabIndex == 0" class="default">
            <template v-if="isPro() && productType === 4">
                <template v-if="isBuy === 1 && paidContent">
                    <template v-for="(item, index) in paidContent" :key="index">
                        <view v-if="item.type == 'pic'" class="desc-pic-item">
                            <image 
                                lazy-load 
                                :src="imageFormat(item?.pic || '')" 
                                class="slide-image" 
                                mode="widthFix" 
                                @click="previewImage(imageFormat(item?.pic || ''), paidContent.filter(i => i.type === 'pic').map(i => imageFormat(i.pic)))"
                            />
                        </view>
                        <rich-text v-if="item.type == 'text'" class="desc-text-item" :nodes="formatRichText(item.html)" />
                    </template>
                </template>
                <template v-else>
                    <image class="img" :src="staticResource('product/paid_content_bg.png')" mode="widthFix" />
                </template>
            </template>

            <template v-for="(item, index) in descArr" :key="index">
                <view v-if="item.type == 'pic'" class="desc-pic-item">
                    <image 
                        lazy-load 
                        :src="imageFormat(item?.pic || '')" 
                        class="slide-image" 
                        mode="widthFix" 
                        @click="previewImage(imageFormat(item?.pic || ''), descArr.filter(i => i.type === 'pic').map(i => imageFormat(i.pic)))"
                    />
                </view>
                <rich-text v-if="item.type == 'text'" class="desc-text-item" :nodes="formatRichText(item.html)" />
            </template>
        </view>
        <view v-show="tabIndex == 1" class="default">
            <afterSaleService :id="productId" />
        </view>
    </view>
</template>

<script setup lang="ts">
import afterSaleService from "./afterSaleService.vue";
import { imageFormat } from "@/utils/format";
import { isPro, staticResource, formatRichText } from "@/utils";
import { ref } from "vue";
import type { PropType } from "vue";
const props = defineProps({
    descArr: {
        type: Array as PropType<Array<any>>,
        default: () => []
    },
    productId: {
        type: Number,
        default: ""
    },
    productType: {
        type: Number,
        default: 1
    },
    isBuy: {
        type: Number,
        default: 0
    },
    paidContent: {
        type: Array as PropType<Array<any>>,
        default: ""
    }
});
const tabIndex = ref(0);

// 图片预览功能
const previewImage = (current: string, urls: string[]) => {
    uni.previewImage({
        current,
        urls
    });
};
</script>

<style lang="scss" scoped>
.product-card-row {
    background-color: #fff;
    padding: 20rpx;
    border-radius: 25rpx;
    margin: 20rpx 0;
    .cart-item {
        font-size: 26rpx;
        margin: 25rpx 0;
        .title {
            min-width: 110rpx;
            color: #81838e;
            padding-right: 10rpx;
        }
        .attr_text {
            display: block;
            width: 66vw;
        }
        .label {
            .tips {
                color: var(--general);
                font-size: 24rpx;
                margin-top: 5rpx;
            }
        }
    }

    .traceability-item {
        padding: 10rpx;
        background-color: #fdf6f0;
        color: #ff9627;
        font-size: 24rpx;
        image {
            width: 115rpx;
            height: 35rpx;
            margin-right: 20rpx;
        }
    }

    .tab-box {
        padding: 10rpx 0 20rpx 0;
        margin-bottom: 0;
        font-size: 30rpx;
        font-weight: 500;

        .active {
            color: var(--general);
        }
    }
    
    // 垂直分割线样式
    .divider-line-vertical {
        width: 1rpx;
        height: 30rpx;
        background-color: #e5e5e5;
        margin: 0 20rpx;
    }

    .default {
        color: #9b9c9f;
        font-size: 24rpx;
        padding: 10rpx;

        .img {
            width: 100%;
        }

        .desc-text-item {
            width: 100%;
            overflow: hidden;
            display: block;
            height: auto;
        }

        .desc-pic-item {
            margin: 30rpx 0; // 图片上下间隙
            
            .slide-image {
                display: block;
                width: 100%;
                cursor: pointer;
                transition: opacity 0.3s ease;
                
                &:hover {
                    opacity: 0.8;
                }
                
                &:active {
                    opacity: 0.9;
                }
            }
        }
    }
}
</style>
