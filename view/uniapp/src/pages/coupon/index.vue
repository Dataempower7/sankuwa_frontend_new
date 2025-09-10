<template>
    <view>
        <tig-layout :title="navbarTitle">
            <!-- 分类栏 -->
            <view v-if="pageType == 2" class="coupon-tabs">
                <view class="tab-container">
                    <view
                        v-for="(tab, index) in tabList"
                        :key="index"
                        class="tab-item"
                        :class="{ active: currentTabIndex === index }"
                        @click="onTabChange(index)"
                    >
                        {{ tab.name }}
                    </view>
                </view>
            </view>

            <block v-if="filteredCouponList && filteredCouponList.length">
                <view class="tmcscoupon-list">
                    <block v-if="pageType == 1">
                        <view class="coupon-box">
                            <view v-for="(item, index) in filteredCouponList" :key="index" class="coupon-item">
                                <!-- 左侧折扣区域 -->
                                <view class="left-section">
                                    <view class="discount-area">
                                        <!-- 优惠金额方块框 -->
                                        <view class="discount-box">
                                            <view v-if="item.couponType === 2" class="discount-text">
                                                {{ item.couponDiscount }}
                                            </view>
                                            <view v-else class="discount-text">
                                                ¥{{ item.couponMoney }}
                                            </view>
                                            <view class="discount-unit">
                                                {{ item.couponType === 2 ? '折' : '' }}
                                            </view>
                                        </view>
                                    </view>

                                    <view class="coupon-info">
                                        <view class="coupon-title">{{ item.couponName }}</view>
                                        <view class="validity-text">
                                            <view v-if="item.sendType === 1">{{ $t("有效期至") }}：{{ item.useEndDate }}</view>
                                            <view v-if="item.sendType === 0 && item.delayDay > 0">
                                                {{ isOverseas() ? $t("领券{0}天后生效，有效期{1}天", [item.delayDay, item.useDay]) : `领券${item.delayDay}天后生效，有效期${item.useDay}天` }}
                                            </view>
                                            <view v-if="item.sendType === 0 && item.delayDay === 0">
                                                {{ isOverseas() ? $t("领券当日起{0}天内可用", [item.useDay]) : `领券当日起${item.useDay}天内可用` }}
                                            </view>
                                        </view>
                                    </view>
                                </view>

                                <!-- 右侧按钮区域 -->
                                <view class="right-section">
                                    <button
                                        class="action-btn"
                                        :class="{ disabled: couponStatus(item.isReceive, item.limitNum, item.receiveNum) === '已领取' }"
                                        :disabled="couponStatus(item.isReceive, item.limitNum, item.receiveNum) === '已领取'"
                                        @click="handleReceiveCoupon(item)"
                                    >
                                        {{ $t(couponStatus(item.isReceive, item.limitNum, item.receiveNum)) }}
                                    </button>
                                </view>
                            </view>
                        </view>
                    </block>
                    <block v-if="pageType == 2">
                        <view class="coupon-box">
                            <view
                                v-for="(item, index) in filteredCouponList"
                                :key="index"
                                class="coupon-item"
                                :class="{
                                    used: item.status === 4,
                                    expired: item.status === 5
                                }"
                            >
                                <!-- 左侧折扣区域 -->
                                <view class="left-section">
                                    <view class="discount-area">
                                        <!-- 优惠金额方块框 -->
                                        <view class="discount-box">
                                            <view v-if="item.couponType === 2" class="discount-text">
                                                {{ item.couponDiscount }}
                                            </view>
                                            <view v-else class="discount-text">
                                                ¥{{ item.couponMoney }}
                                            </view>
                                            <view class="discount-unit">
                                                {{ item.couponType === 2 ? '折' : '' }}
                                            </view>
                                        </view>
                                    </view>

                                    <view class="coupon-info">
                                        <view class="coupon-title">{{ item.couponName }}</view>
                                        <view class="validity-text">
                                            {{ $t("有效期至") }}：{{ item.endDate }}
                                        </view>
                                    </view>
                                </view>

                                <!-- 右侧按钮区域 -->
                                <view class="right-section">
                                    <button
                                        v-if="item.status === 1 || item.status === 2"
                                        class="action-btn"
                                        @click="toPages(item)"
                                    >
                                        {{ $t("去使用") }}
                                    </button>
                                    <button
                                        v-if="item.status === 3"
                                        class="action-btn disabled"
                                        disabled
                                    >
                                        {{ $t("即将生效") }}
                                    </button>
                                    <image
                                        v-if="item.status === 4"
                                        class="status-image"
                                        src="/static/images/common/expired.png"
                                        mode="aspectFit"
                                    />
                                    <image
                                        v-if="item.status === 5"
                                        class="status-image"
                                        src="/static/images/common/used.png"
                                        mode="aspectFit"
                                    />
                                </view>
                            </view>
                        </view>
                    </block>
                </view>
            </block>
            <view v-if="!loading && filteredCouponList && filteredCouponList.length === 0" class="empty-box">
                <view class="pictrue">
                    <image src="@/static/images/missing_page/coupons.png" />
                </view>
                <view class="txt">{{ $t("暂无优惠券") }}</view>
            </view>
        </tig-layout>
    </view>
</template>

<script lang="ts" setup>
import tag from "./src/tag.vue";
import { reactive, ref, computed } from "vue";
import { addCoupon, getCouponList, getMyCouponList } from "@/api/coupon/coupon";
import type { CouponFilterParams, CouponFilterResult, CouponData } from "@/types/coupon/coupon";
import { onLoad, onReachBottom, onShow } from "@dcloudio/uni-app";
import { staticResource } from "@/utils";
import { useI18n } from "vue-i18n";
import { isOverseas } from "@/utils";

const { t } = useI18n();

const navbarTitle = ref("优惠券");

const filterParams = reactive<CouponFilterParams>({
    page: 1,
    size: 10
});
const pageType = ref<number>(1);
const total = ref(0);
const couponList = ref<CouponFilterResult[]>([]);
const loading = ref(true);

// 分类栏相关
const currentTabIndex = ref(0);
const tabList = ref([
    { name: "待使用", status: [1, 2] },
    { name: "已使用", status: [4] },
    { name: "已过期", status: [5] }
]);

// 计算属性：根据当前选中的tab过滤优惠券列表
const filteredCouponList = computed(() => {
    if (pageType.value === 1) {
        // 优惠券中心页面，显示所有优惠券
        return couponList.value;
    } else {
        // 我的优惠券页面，根据当前选中的状态过滤
        const currentStatuses = tabList.value[currentTabIndex.value].status;
        return couponList.value.filter(item =>
            currentStatuses.includes(item.status || 1)
        );
    }
});

// Tab切换方法
const onTabChange = (index: number) => {
    currentTabIndex.value = index;
};

const __getCouponList = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        let result = {} as CouponData;
        if (pageType.value == 1) {
            result = await getCouponList(filterParams);
        } else {
            result = await getMyCouponList(filterParams);
        }
        couponList.value = [...couponList.value, ...result.records];
        total.value = result.total;
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
        loading.value = false;
    }
};

const couponStatus = (isReceive: number, limitNum: number, receiveNum: number) => {
    if (limitNum === 0) {
        if (isReceive === 1) {
            return "已领取";
        } else if (receiveNum > 0) {
            return "再次领取";
        } else {
            return t("马上领");
        }
    } else {
        if (isReceive === 0) {
            return "马上领";
        } else if (receiveNum >= limitNum) {
            return "已领取";
        } else {
            return "再次领取";
        }
    }
};

const handleReceiveCoupon = async (item: CouponFilterResult) => {
    uni.showLoading({
        title: t("加载中")
    });
    if (couponStatus(item.isReceive, item.limitNum, item.receiveNum) === "已领取") {
        uni.showToast({
            title: t("已领取"),
            icon: "none",
            duration: 1500
        });
        return;
    }

    try {
        await addCoupon({ couponId: item.couponId });
        uni.showToast({
            title: t("领取成功"),
            duration: 1500
        });
        setTimeout(() => {
            filterParams.page = 1;
            couponList.value = [];
            __getCouponList();
        }, 100);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1500
        });
    } finally {
        uni.hideLoading();
    }
};
const toPages = (item: any) => {
    const couponInfo = {
        couponId: item.couponId,
        couponName: item.couponName
    };
    uni.navigateTo({
        url: "/pages/search/result?couponInfo=" + encodeURIComponent(JSON.stringify(couponInfo))
    });
};
onLoad((options) => {
    if (options) {
        if (options.type) {
            pageType.value = options.type;
            options.type == 2 && (navbarTitle.value = "我的优惠券");
        }

        if (options.shopId) {
            filterParams.shopId = options.shopId;
            navbarTitle.value = "店铺优惠券";
        }
    }
});
onShow(() => {
    filterParams.page = 1;
    couponList.value = [];
    __getCouponList();
});

onReachBottom(() => {
    if (filterParams.page < Math.ceil(total.value / filterParams.size)) {
        filterParams.page++;
        __getCouponList();
    }
});
</script>

<style lang="scss" scoped>
/* 分类栏样式 */
.coupon-tabs {
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;

    .tab-container {
        display: flex;
        align-items: center;
        padding: 0 30rpx;

        .tab-item {
            flex: 1;
            text-align: center;
            padding: 30rpx 0;
            font-size: 28rpx;
            color: #666;
            position: relative;
            cursor: pointer;

            &.active {
                color: var(--general, #007aff);
                font-weight: 500;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80rpx;
                    height: 7rpx;
                    background-color: #3344BC;
                    border-radius: 55rpx;
                }
            }
        }
    }
}

/* 优惠券 */
.price {
    font-size: 48rpx;
    color: #666;
    display: flex;

    :deep(.util) {
        font-size: 30rpx;
        padding-left: 5rpx;
        height: 100%;
        position: relative;
        top: 8rpx;
    }

    .tmcscoupon-name {
        font-size: 26rpx;
        padding-left: 20rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        width: 280rpx;
    }
}

.tmcscoupon-list .tmcscoupon-item-1 {
    margin: 20rpx;
    height: 160rpx;
    overflow: hidden;
    background: #fff;
    border-radius: 12rpx;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    position: relative;
    background: #fff5c5;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m {
    flex: 1;
    height: 160rpx;
    margin-left: 32rpx;
    box-sizing: border-box;
    position: relative;
    min-width: 0;
}

.tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:before,
.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:after {
    content: "";
    position: absolute;
    border-radius: 50%;
    width: 16rpx;
    height: 16rpx;
    background: #f0f2f5;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:before {
    top: -8rpx;
    right: -8rpx;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-info {
    display: flex;
    align-items: baseline;
    font-weight: 700;
    height: 70rpx;
    line-height: 80rpx;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-rule {
    font-size: 24rpx;
    color: #999;
    margin-top: 6rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-date {
    font-size: 20rpx;
    color: #999;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:after {
    bottom: -8rpx;
    right: -8rpx;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r:before {
    content: "";
    height: 130rpx;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAABeAgMAAAB5il18AAAACVBMVEVHcEz/xy7/xi4WmQdzAAAAAnRSTlMAtc2YijsAAAAUSURBVAjXY9BggEARBhgQYRgiYgDQigepHfzaGwAAAABJRU5ErkJggg==);
    width: 4rpx;
    margin-left: -2rpx;
    position: absolute;
    top: 35%;
    left: 0;
    margin-top: -40rpx;
    -webkit-background-size: 100% 100%;
    -moz-background-size: 100% 100%;
    background-size: 100% 100%;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r {
    width: 208rpx;
    height: 160rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.tmcscoupon-list .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r .btn {
    width: 160rpx;
    height: 54rpx;
    background: #ff9400;
    border-radius: 28rpx;
    justify-content: center;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
}

.tmcscoupon-list .tmcscoupon-item-2 {
    .coupon-detail {
        box-sizing: border-box;
        margin-top: 20rpx;
        padding: 0 20rpx;

        .coupon-detail-item {
            display: flex;
            height: 200rpx;
            background-color: #fff;

            .coupon-detail-item-left {
                width: 260rpx;
                flex-shrink: 0;
                background-color: #609dde;
                background-image: -webkit-linear-gradient(left, #609dde 20%, #6781da);
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: #fff;

                .item-left-discount {
                    font-size: 40rpx;
                }

                .item-left-money {
                    font-size: 48rpx;
                    font-weight: bold;

                    :deep(.util) {
                        font-size: 30rpx;
                        padding-left: 5rpx;
                        line-height: 48rpx;
                    }
                }

                .item-left-desc {
                    color: #fff;
                    font-size: 24rpx;
                    margin-top: 10rpx;
                }

                &::before {
                    content: "";
                    z-index: 88;
                    width: 50rpx;
                    height: 100%;
                    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTQ2MEVGOUEwQUM4MTFFQTgwNkNDRDQzRDE5RjkyMzMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTQ2MEVGOUIwQUM4MTFFQTgwNkNDRDQzRDE5RjkyMzMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NDYwRUY5ODBBQzgxMUVBODA2Q0NENDNEMTlGOTIzMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1NDYwRUY5OTBBQzgxMUVBODA2Q0NENDNEMTlGOTIzMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrE8tH0AAAGJSURBVHja7Jq/K4VRGMfPq0t5F3U3dRdhMtxBmfwNDBZZDCz+A6SEEqtRCIOSDCw2k0lRkpIfWW7Joqh7FeX1OXnVzeDt3lLn+Xaf+gx3uMOne875Puc5N0qSxClUkxMpGZFcpVKp+8txHAf1ixSgWWFpHcAi9FgWisrl8s+xdQ17sA131pZWtYivT7iEWTiCd0t75PfnImzAFLRbP37zMA3z0GU9R1pgDBagI/gcydpDMJzunQl4tZ7sI+kB0KrQovhlNqQg0gaT0KnQNPr0H1fpfkfTrDEv4kNyUOU+MpDmjHmRXuhXuSH2qYgUVUS6VUQKKiJ5FRGnIvKsIlJSEblVEblQETlVEDmDEwWRQ5cxvLMg8ui+58Xmc2QrtI1ej8gVrFlP9hdYgnvrIuuwb73X2oE5eAtVJGv2699OdmHGBTz3zRLxOeFfr5bhIfQ2PvdHi74Cq2luOGsiNT29hSpS82NoaCLncAybcAMfFq+6XsTPcZ+sClSLlJxARY2/OTVE/qe+BBgAWkdOeDEfg30AAAAASUVORK5CYII=");
                    background-size: 17rpx 17rpx;
                    background-repeat: repeat-y;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
            }

            .coupon-detail-item-right {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding-left: 20rpx;
                color: #333;
                position: relative;

                .item-right-name {
                    font-size: 30rpx;
                    margin-top: 20rpx;
                    padding-bottom: 15rpx;
                }

                .item-right-time {
                    font-size: 24rpx;
                    color: #999;
                }

                .tmcscoupon-item-btn {
                    width: 170rpx;
                    position: absolute;
                    right: 10rpx;
                    bottom: 20rpx;
                }
            }
        }
    }
}

/*通用暂无数据样式 文字和图片居中显示*/
.empty-box {
    // background-color: #fff;
    padding: 350rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400rpx;
}

.empty-box .pictrue {
    width: 200rpx;
    height: 200rpx;
    margin: 0 auto 30rpx auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-box .pictrue image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.empty-box .txt {
    color: #999;
    text-align: center;
    font-size: 28rpx;
    line-height: 1.5;
}

/* 原来的优惠券样式 - 已注释
.coupon-box {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding: 30rpx;

    .grayScaleDiv {
        filter: grayscale(100%);
    }

    .coupon-item {
        box-shadow: 0px 0px 5px #f5f5f5;
        border-radius: 10rpx;
        box-sizing: border-box;
        background-color: #ffffff;
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: space-between;
*/

/* 新的优惠券样式 */
.coupon-box {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding: 15rpx 10rpx 15rpx 15rpx;

    .coupon-item {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 30rpx;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
        position: relative;
        overflow: hidden;
        display: flex;
        min-height: 160rpx;

        /* 已使用和已过期的灰色样式 */
        &.used, &.expired {
            background: linear-gradient(135deg, #ffffff 40%, #ffffff 100%);

            .left-section {
                .discount-area {
                    .discount-box {
                        background-color: #f0f0f0 !important;
                        border-color: #ccc !important;
                        box-shadow: 0 4rpx 12rpx rgba(204, 204, 204, 0.15) !important;
                            
                        .discount-text {
                            color: #999 !important;
                        }

                        .discount-unit {
                            color: #999 !important;
                        }
                    }
                }

                .coupon-title {
                    color: #999 !important;
                }
                .validity-text {
                    color: #ccc !important;
                }
            }

            .right-section {
                .action-btn {
                    background-color: #ccc !important;
                    color: #999 !important;
                }
            }
        }

        /* 左侧折扣区域 */
        .left-section {
            flex: 1;
            display: flex;
            align-items: center;
            padding: 15rpx 10rpx 15rpx 15rpx;
            position: relative;

            .discount-area {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                margin-right: 30rpx;

                .discount-box {
                    background-color: #FEF6F2;
                    border-radius: 28rpx;
                    padding: 30rpx;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 160rpx;
                    height: 160rpx;

                    .discount-text {
                        font-size: 56rpx;
                        font-weight: bold;
                        color: #ff4757;
                        line-height: 1;
                        margin-bottom: 4rpx;
                    }

                    .discount-unit {
                        font-size: 28rpx;
                        color: #ff4757;
                        font-weight: 500;
                        line-height: 1;
                    }
                }
            }

            .coupon-info {
                flex: 1;

                .coupon-title {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 12rpx;
                    line-height: 1.3;
                }

                .validity-text {
                    font-size: 24rpx;
                    color: #666;
                    line-height: 1.4;
                }
            }
        }

        /* 右侧按钮区域 */
        .right-section {
            width: 200rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30rpx 20rpx;

            .action-btn {
                width: 140rpx;
                height: 60rpx;
                background: #3544BA;
                border-radius: 30rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 26rpx;
                font-weight: 500;
                border: none;
                transition: all 0.3s ease;

                &:active {
                    transform: scale(0.95);
                }

                &.disabled {
                    background: #ccc;
                    color: #999;
                    box-shadow: none;
                }
            }

            .status-image {
                width: 140rpx;
                height: 140rpx;
                object-fit: contain;
            }
        }

        /* 分隔线装饰 */
        &::before {
            content: '';
            position: absolute;
            right: 200rpx;
            top: 0;
            bottom: 0;
            width: 2rpx;
            background: linear-gradient(to bottom, transparent 20%, #e0e0e0 50%, transparent 80%);
        }

        /* 右侧装饰圆点 */
        &::after {
            content: '';
            position: absolute;
            right: 190rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 20rpx;
            height: 20rpx;
            background-color: #f8f9fa;
            border: 2rpx solid #e0e0e0;
            border-radius: 50%;
        }
    }
}
</style>
