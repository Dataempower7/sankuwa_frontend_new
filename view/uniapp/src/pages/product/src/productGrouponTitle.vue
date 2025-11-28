<template>
    <view class="product-group-title flex justify-between align-center">
        <view class="group-price-box">
            <view class="title-top-price">
                <view class="num-group"> {{ $t('拼团优惠') }}<text class="separator">|</text>{{ grouponValue.currentGroupNum
                    +
                    $t('人团') }} </view>
                <view class="price-box">
                    <view class="price">
                        <format-price :font-style="{ fontWeight: 'bold' }" :decimals-style="{
                            fontSize: '24rpx',
                            fontWeight: 'bold'
                        }" :currency-style="{
                            fontSize: '23rpx',
                            fontWeight: 'bold'
                        }" :price-data="productPrice" />
                    </view>
                </view>
                <view class="title-top-market_price flex align-center">
                    <view class="originalprice-box">
                        <view>
                            <format-price :is-bottom="false" :price-data="productOriginPrice"
                                :font-style="{ 'text-decoration': 'line-through' }" />
                        </view>
                    </view>
                    <view class="discountStock" v-if="grouponValue.groupSuccessCount > 0">
                        <view> {{ $t("已成团") }}{{ grouponValue.groupSuccessCount }} {{ $t('件') }}</view>
                    </view>
                </view>
            </view>
        </view>
        <view class="group-time-box">
            <view class="countdown-box flex align-center flex-column">
                <view class="title-top-time">{{ $t(timeText) }}</view>
                <tig-countdown background-color="#FFF" :end-time="targetTime" :font-size="11" color="#FB424E" />
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import type { ProductItem } from "@/types/product/product";
import { computed } from "vue";

interface Props {
    productInfo: ProductItem;
    productOriginPrice: string | number;
    productPrice: string | number;
    productStock: number;
    grouponValue: AnyObject;
}

const props = defineProps<Props>();
// console.log('productGroupTITLE', props.grouponValue);

/**
 * 获取时间文本
 */
const timeText = computed(() => {
    return isActivityStart(props.grouponValue.startTime) ? "距离结束仅剩" : "距开始";
});

/**
 * 计时器用的目标时间
 */
const targetTime = computed(() => {
    return isActivityStart(props.grouponValue.startTime) ? props.grouponValue.endTime : props.grouponValue.startTime;
});

/*转时间搓 */
const dateStringToTimestamp = (dateString: any) => {
    const dateParts = dateString.split(" ");
    const [year, month, day] = dateParts[0].split("-");
    const [hour, minute, second] = dateParts[1].split(":");
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.getTime();
};

/**
 * 是否活动开始
 * @param item 团购活动信息
 */
const isActivityStart = (datetime: string) => {
    const startTime = dateStringToTimestamp(datetime);
    return startTime < new Date().getTime();
};

</script>

<style lang="scss" scoped>
.product-group-title {
    margin-bottom: 20rpx;
    background: linear-gradient(45deg, var(--ump-start-bg, #323233), var(--ump-end-bg, #323233));
    padding: 20rpx 20rpx 15rpx 25rpx;

    .title-top-price {
        .num-group {
            color: #fff;
            font-size: 28rpx;

            .separator {
                padding: 0 16rpx;
            }
        }

        .price-box {
            display: flex;
        }

        .price {
            color: #fff;
            font-size: 38rpx;
            display: flex;
            align-items: center;
            margin-top: 8rpx;
        }

        .title-top-market_price {

            font-size: 24rpx;

            .originalprice-box {
                display: flex;
                font-size: 24rpx;
                color: #fff;
            }

            .discountStock {
                color: #fff;
                position: relative;
                padding: 0 18rpx;
                margin-left: 18rpx;

                &::before {
                    position: absolute;
                    content: "";
                    left: 0;
                    top: 0;
                    width: 2rpx;
                    height: 100%;
                    background-color: #fff;
                }
            }
        }
    }

    .group-time-box {
        align-self: flex-start;
        padding-top: 14rpx;

        .title-top-time {
            text-align: right;
            width: 100%;
            font-size: 24rpx;
            color: #fff;
            padding-right: 8rpx;
            padding-bottom: 15rpx;
        }
    }
}
</style>

