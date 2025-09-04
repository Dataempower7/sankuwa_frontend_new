<template>
    <tig-layout title="提交订单">
        <view class="order-check">
            <!-- 地址模块 -->
            <view class="module-card module-margin">
                <addressInfo :data="getAddressInfo" />
            </view>

            <!-- 商品列表模块 -->
            <view class="module-card module-margin" v-if="cartListData && cartListData.length > 0">
                <stroeCard
                    v-model:shipping-type="formState.shippingType"
                    :cart-list="cartListData"
                    :shipping-type-list="shippingTypeData"
                    :shipping-fee="getShippingFee()"
                    @change="updateOrderCheck"
                    @change-product-extra="changeProductExtra"
                />
            </view>

            <!-- 价格明细和优惠选择模块 -->
            <view class="module-card module-margin">
                <view class="price-detail">
                    <!-- 商品总价 -->
                    <view class="price-item">
                        <view class="price-label">商品总价</view>
                        <view class="price-value">
                            <text class="item-count">共{{ getTotalItemCount() }}件</text>
                            <format-price :price-data="totalData?.productAmount" />
                        </view>
                    </view>

                    <!-- 活动优惠 -->
                    <view v-if="showActivityDiscount" class="price-item">
                        <view class="price-label">活动优惠</view>
                        <view class="price-value_aaa activity-discount">
                            共优惠：¥{{ (totalData?.pointsAmount || 0) + (totalData?.discountCouponAmount || 0) }}
                        </view>
                    </view>

                    <!-- 优惠券组件 -->
                    <couponInfo
                        v-if="configStore.useCoupon == 1"
                        :coupon-list="couponListData"
                        :use-coupon-ids="formState.useCouponIds"
                        :select-user-coupon-ids="formState.selectUserCouponIds"
                        :coupon-amount="totalData?.discountCouponAmount || 0"
                        :balance="userStore.userInfo.balance || 0"
                        :points="userStore.userInfo.points || 0"
                        :available-points="availablePoints"
                        :points-amount="totalData?.pointsAmount || 0"
                        :use-point="formState.usePoint"
                        :flow-type="flowType"
                        @update:use-coupon-ids="handleUpdateUseCouponIds"
                        @update:select-user-coupon-ids="handleUpdateSelectUserCouponIds"
                        @update:use-point="handleUpdateUsePoint"
                        @send-balance-status="handleBalanceStatus"
                        @change="handleCouponChange"
                    />

                    <!-- 积分选择
                    <view v-if="configStore.usePoints == 1" class="price-item points-item">
                        <view class="price-label">
                            <view class="label-row">
                                <text>积分</text>
                                <text class="available-text">账户积分：{{ userStore.userInfo.points || 0 }}</text>
                            </view>
                        </view>
                        <view class="price-value">
                            <view class="switch-container">
                                <template v-if="usePointsSwitch && totalData?.pointsAmount">
                                    <text class="price-value_aaa">-¥{{ totalData?.pointsAmount }}</text>
                                </template>
                                <template v-else-if="!usePointsSwitch">
                                    <text class="no-use" style=" color: #999;font-size: 26rpx;">不使用积分</text>
                                </template>
                                <image
                                    :src="usePointsSwitch ? '/static/images/common/on.png' : '/static/images/common/off.png'"
                                    class="switch-icon"
                                    @click="togglePoints"
                                    style="  width: 48rpx;height: 28rpx;margin-left: 10rpx;"
                                />
                            </view>
                        </view>
                    </view>
 -->
                    <!-- 余额选择 
                    <view v-if="configStore.useSurplus == 1" class="price-item balance-item">
                        <view class="price-label">
                            <view class="label-row">
                                <text>余额</text>
                                <text class="available-text">账户余额：¥{{ userStore.userInfo.balance || 0 }}</text>
                            </view>
                        </view>
                        <view class="price-value">
                            <view class="switch-container">
                                <template v-if="useBalanceSwitch && totalData?.balance && Number(totalData.balance) >= 0">
                                    <text class="price-value_aaa">-¥{{ totalData?.balance }}</text>
                                </template>
                                <template v-else-if="!useBalanceSwitch">
                                    <text class="no-use">不使用余额</text>
                                </template>
                                <image
                                    :src="useBalanceSwitch ? '/static/images/common/on.png' : '/static/images/common/off.png'"
                                    class="switch-icon"
                                    @click="toggleBalance"
                                />
                            </view>
                        </view>
                    </view> -->

                    <!-- 共减金额 - 已合并到活动优惠中显示 -->
                    <!-- <view v-if="getTotalDiscount() > 0" class="price-item total-discount">
                        <view class="price-label"></view>
                        <view class="price-value total-discount-value">
                            共减 <format-price :price-data="getTotalDiscount()" />
                        </view>
                    </view> -->

                    <!-- 快递运费 -->
                    <view class="price-item shipping-fee-item">
                        <view class="price-label">配送费用</view>
                        <view class="price-value">
                            <template v-if="getShippingFee() > 0">
                                <format-price :price-data="getShippingFee()" />
                            </template>
                            <template v-else>
                                <text class="free-shipping">包邮</text>
                            </template>
                        </view>
                    </view>

                    <!-- 合计 -->
                    <view class="price-item total-item">
                        <view class="price-label total-label">合计</view>
                        <view class="price-value total-value">
                            <format-price
                                :font-style="{ fontWeight: 'bold', fontSize: '36rpx' }"
                                :price-data="totalData?.unpaidAmount"
                            />
                        </view>
                    </view>
                </view>
            </view>

            <!-- 支付方式模块 - 仅微信支付 -->
            <!-- #ifdef MP-WEIXIN -->
            <view class="module-card module-margin">
                <view class="payment-section">
                    <view class="section-title">支付方式</view>
                    <view class="payment-methods">
                        <view class="payment-item">
                            <view class="payment-left">
                                <image
                                    src="/static/images/common/wechatpay.png"
                                    class="payment-icon"
                                />
                                <text class="payment-name">微信支付</text>
                            </view>
                            <view class="payment-right">
                                <image
                                    src="/static/images/common/check.png"
                                    class="payment-check-icon"
                                />
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <!-- #endif -->

            <!-- 其他平台支付方式 -->
            <!-- #ifndef MP-WEIXIN -->
            <!-- <template v-if="paymentTypeList.length > 0">
                <view class="module-card module-margin">
                    <view class="payment-section">
                        <view class="section-title">支付方式</view>
                        <view class="payment-methods">
                            <view
                                v-for="payment in paymentTypeList"
                                :key="payment.typeId"
                                class="payment-item"
                                @click="selectPayment(payment.typeId)"
                            >
                                <view class="payment-left">
                                    <image
                                        :src="getPaymentIcon(payment.typeName)"
                                        class="payment-icon"
                                    />
                                    <text class="payment-name">{{ payment.typeName }}</text>
                                </view>
                                <view class="payment-right">
                                    <view
                                        class="payment-radio"
                                        :class="{ active: formState.payTypeId === payment.typeId }"
                                    >
                                        <view v-if="formState.payTypeId === payment.typeId" class="radio-dot"></view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </template> -->
            <!-- #endif -->

            <!-- 备注模块 -->
            <view class="module-card module-margin">
                <remark v-model="formState.buyerNote" />
            </view>

            <!-- 发票服务模块 -->
            <template v-if="configStore.canInvoice === 1 && !isOverseas()">
                <view class="module-card module-margin">
                    <invoiceInfo v-model:invoice-info="formState.invoiceData" :get-address-info="getAddressInfo" />
                </view>
            </template>
        </view>

        <tig-fixed-placeholder background-color="#fff">
            <view class="submit-btn-box">
                <view class="submit-btn-price">
                    <view class="price-text">{{ $t("待支付") }}:</view>
                    <template v-if="flowType == 3">
                        <view class="points-box">
                            <view class="points-value">
                                {{ totalData?.exchangePoints }}
                                <view class="points-text">{{ $t("积分") }} </view>
                            </view>
                            <view class="symbol">+</view>
                        </view>
                    </template>

                    <format-price
                        :font-style="{ fontWeight: 'bold', fontSize: '34rpx' }"
                        :decimals-style="{
                            fontSize: '24rpx',
                            fontWeight: 'bold'
                        }"
                        :currency-style="{
                            fontSize: '23rpx',
                            fontWeight: 'bold'
                        }"
                        :price-data="totalData?.unpaidAmount"
                    />
                </view>
                <view>
                    <tig-button class="btn" color="#3544BA" :disabled="shippingTypeStaus" @click="submit"> {{ $t("立即支付") }} </tig-button>
                </view>
            </view>
        </tig-fixed-placeholder>
    </tig-layout>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, reactive, ref, nextTick } from "vue";
import { getOrderCheckData, updateOrderCheckData, orderSubmit, updateCouponData, getShippingType } from "@/api/order/check";
import type { CartList, Total, ShippingTypeItem } from "@/types/order/check";
// import { getPaymentType } from "@/api/order/check"; // 微信小程序只用微信支付
// import type { PaymentTypeItem } from "@/types/order/check"; // 微信小程序只用微信支付
import type { AddressFilterResult } from "@/types/user/address";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getAddressList } from "@/api/user/address";
import { useConfigStore } from "@/store/config";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
import { isOverseas, redirect } from "@/utils";
import addressInfo from "./src/addressInfo.vue";
// import paymentMode from "./src/paymentMode.vue"; // 微信小程序只用微信支付，不需要此组件
import stroeCard from "./src/storeCard.vue";
import couponInfo from "./src/couponInfo.vue";
import invoiceInfo from "./src/invoiceInfo.vue";
import remark from "./src/remark.vue";
// import totalCard from "./src/totalCard.vue"; // 已重构为内联价格明细

const { t } = useI18n();

const configStore = useConfigStore();

const userStore = useUserStore();

// 当前结算表单数据
interface IformState {
    addressId: number;
    shippingType: {
        [key: string]: {
            typeId: number;
            shopId: number;
            typeName: string;
        };
    };
    productExtra: any;
    payTypeId: number;
    usePoint: number;
    useBalance: number;
    useCouponIds: number[];
    selectUserCouponIds: number[];
    buyerNote: string;
    invoiceData: any;
    useDefaultCouponIds?: number;
}

// 当前结算表单数据
const formState = reactive<IformState>({
    addressId: 0,
    shippingType: {},
    payTypeId: 0,
    usePoint: 0,
    useBalance: 0,
    useCouponIds: [],
    selectUserCouponIds: [],
    buyerNote: "",
    invoiceData: {},
    productExtra: {}
});

const addressList = ref<AddressFilterResult[]>([]);
const getAddressInfo = ref<AddressFilterResult>({} as AddressFilterResult);
const getAddressListData = async () => {
    try {
        const result = await getAddressList({ page: 1, size: 99 });
        const isLink = uni.getStorageSync("link");
        if (result.records.length === 0 && !isLink) {
            return uni.navigateTo({
                url: "/pages/address/list"
            });
        }
        if (result.records.length > 0) {
            getAddressInfo.value = result.records[0];
            formState.addressId = result.records[0].addressId;
            addressList.value = result.records;
        }
    } catch (error) {
        console.error(error);
    }
};

// 微信小程序只用微信支付，注释掉支付方式获取
// const paymentTypeList = ref<PaymentTypeItem[]>([]);
// const getPaymentTypeData = async () => {
//     try {
//         const result = await getPaymentType();
//         formState.payTypeId = result[0].typeId;
//         paymentTypeList.value = result;
//         // console.log(paymentTypeList.value);
//     } catch (e) {
//         console.log(e);
//     }
// };

const shippingTypeData = ref<{ [key: string]: ShippingTypeItem[] }>({});
const getShippingTypeData = async () => {
    try {
        const result = await getShippingType({ flowType: flowType.value });
        shippingTypeData.value = result;
        for (const key in result) {
            if (result[key] && result[key].length > 0) {
                formState.shippingType[key] = {
                    typeId: result[key][0].shippingTypeId,
                    shopId: result[key][0].shopId,
                    typeName: result[key][0].shippingTypeName
                };
            }
        }
    } catch (e) {
        console.log(e);
    }
};

const cartListData = ref<CartList[]>([]);
const totalData = ref<Total>();
const couponListData = ref<any>({ enableCoupons: [], disableCoupons: [] });
const tmplIdsData = ref<any>([]);
const flowType = ref<number>(1);
const availablePoints = ref(0);

// 优惠选择开关状态
const useCouponSwitch = ref(false);
const usePointsSwitch = ref(false);
const useBalanceSwitch = ref(false);

const getOrderInfo = async () => {
    try {
        const result = await getOrderCheckData({ flowType: flowType.value, ...formState });
        const { cartList, total, couponList, tmplIds, item, useCouponIds, selectUserCouponIds } = result;
        Object.assign(formState, item);
        cartListData.value = cartList;
        totalData.value = total;
        couponListData.value = couponList || { enableCoupons: [], disableCoupons: [] };
        tmplIdsData.value = tmplIds;
        availablePoints.value = result.availablePoints;

        if (useCouponIds && useCouponIds.length > 0) {
            formState.useCouponIds = useCouponIds;
            useCouponSwitch.value = true;
        }
        if (selectUserCouponIds && selectUserCouponIds.length > 0) {
            formState.selectUserCouponIds = selectUserCouponIds;
        }

        // 初始化开关状态
        usePointsSwitch.value = formState.usePoint > 0;
        useBalanceSwitch.value = formState.useBalance > 0;

        // 初始化活动优惠显示
        updateActivityDiscount();
    } catch (error: any) {
        console.error(error);
    }
};

const changeProductExtra = async (data: any) => {
    formState.productExtra = data;
    const result = await updateOrderCheck();
    if (result) {
        cartListData.value = result.cartList;
    }
};

const updateOrderCheck = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        const result = await updateOrderCheckData({ flowType: flowType.value, ...formState });
        Object.assign(formState, result.item);
        totalData.value = result.total;
        availablePoints.value = result.availablePoints;
        return result;
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            duration: 1500
        });
    } finally {
        uni.hideLoading();
    }
};

const updateCoupon = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        const result = await updateCouponData(formState);
        couponListData.value = result.couponList || { enableCoupons: [], disableCoupons: [] };
        totalData.value = result.total;
        cartListData.value = result.cartList;
        formState.useCouponIds = result.useCouponIds;
        formState.selectUserCouponIds = result.selectUserCouponIds;
        return result;
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
    }
};

// 原有的余额状态方法，已整合到新的开关逻辑中
// const getBalanceStatus = (status: boolean) => {
//     if (status) {
//         formState.useBalance = userStore.userInfo.balance;
//     } else {
//         formState.useBalance = 0;
//     }
//     updateOrderCheck();
// };

const shippingTypeStaus = computed(() => {
    if (!formState.shippingType) {
        return true;
    }

    for (const item of cartListData.value) {
        if (item.noShipping === 0 && !formState.shippingType[item.shopId]) {
            return true;
        }
    }

    return false;
});
// 计算总优惠金额
const getTotalDiscount = () => {
    let total = 0;
    if (totalData.value?.discountCouponAmount) {
        total += Number(totalData.value.discountCouponAmount);
    }
    if (totalData.value?.pointsAmount) {
        total += Number(totalData.value.pointsAmount);
    }
    if (totalData.value?.balance) {
        total += Number(totalData.value.balance);
    }
    return total;
};

// 计算商品总件数
const getTotalItemCount = () => {
    let count = 0;
    if (cartListData.value) {
        cartListData.value.forEach(store => {
            if (store.carts) {
                store.carts.forEach(item => {
                    count += item.quantity;
                });
            }
        });
    }
    return count;
};

// 活动优惠显示状态
const activityDiscountAmount = ref(0);
const showActivityDiscount = ref(false);

// 更新活动优惠显示
const updateActivityDiscount = () => {
    let total = 0;

    // 原有的活动优惠
    if (totalData.value?.discounts) {
        total += Number(totalData.value.discounts);
    }

    // 优惠券优惠（只有在使用时才计算）
    if (useCouponSwitch.value && totalData.value?.discountCouponAmount) {
        total += Number(totalData.value.discountCouponAmount);
    }

    // 积分优惠（只有在使用时才计算）
    if (usePointsSwitch.value && totalData.value?.pointsAmount) {
        total += Number(totalData.value.pointsAmount);
    }

    // 余额优惠（只有在使用时才计算）
    if (useBalanceSwitch.value && totalData.value?.balance) {
        total += Number(totalData.value.balance);
    }

    activityDiscountAmount.value = total;
    showActivityDiscount.value = total > 0;
};

// 获取活动优惠金额
const getActivityDiscountAmount = () => {
    return activityDiscountAmount.value;
};

// 计算快递运费
const getShippingFee = () => {
    if (!totalData.value?.shippingFee) {
        return 0;
    }
    return Number(totalData.value.shippingFee);
};

// 优惠券组件事件处理
const handleUpdateUseCouponIds = (ids: number[]) => {
    formState.useCouponIds = ids;
};

const handleUpdateSelectUserCouponIds = (ids: number[]) => {
    formState.selectUserCouponIds = ids;
    useCouponSwitch.value = ids.length > 0;
};

const handleUpdateUsePoint = (point: number) => {
    formState.usePoint = point;
    usePointsSwitch.value = point > 0;
};

const handleBalanceStatus = (status: boolean) => {
    useBalanceSwitch.value = status;
    if (status) {
        formState.useBalance = userStore.userInfo.balance;
    } else {
        formState.useBalance = 0;
    }
};

const handleCouponChange = async () => {
    await updateOrderCheck();
    updateActivityDiscount();
};





// 切换积分使用
const togglePoints = () => {
    usePointsSwitch.value = !usePointsSwitch.value;
    if (usePointsSwitch.value) {
        formState.usePoint = availablePoints.value;
    } else {
        formState.usePoint = 0;
    }
    updateOrderCheck();
    // 更新活动优惠显示
    updateActivityDiscount();
};

// 切换余额使用
const toggleBalance = () => {
    useBalanceSwitch.value = !useBalanceSwitch.value;
    if (useBalanceSwitch.value) {
        formState.useBalance = userStore.userInfo.balance;
    } else {
        formState.useBalance = 0;
    }
    updateOrderCheck();
    // 更新活动优惠显示
    updateActivityDiscount();
};

// 微信小程序只用微信支付，以下方法暂时注释
// 选择支付方式
// const selectPayment = (payTypeId: number) => {
//     formState.payTypeId = payTypeId;
//     updateOrderCheck();
// };

// 获取支付方式图标
// const getPaymentIcon = (payTypeName: string) => {
//     if (payTypeName.includes('微信') || payTypeName.includes('WeChat')) {
//         return '/static/images/common/wechatpay.png';
//     } else if (payTypeName.includes('支付宝') || payTypeName.includes('Alipay')) {
//         return '/static/images/common/alipay.png';
//     }
//     return '/static/images/common/alipay.png'; // 默认使用支付宝图标
// };

const submitLoading = ref(false);
const submit = async () => {
    if (submitLoading.value) return;
    if (formState.payTypeId === 0) {
        return uni.showToast({
            title: t("请选择付款方式"),
            icon: "none"
        });
    }
    if (shippingTypeStaus.value) {
        return;
    }

    if (submitLoading.value) return;

    submitLoading.value = true;
    // #ifdef MP-WEIXIN
    //小程序调用订阅消息需要授权模板
    // @ts-ignore
    wx.requestSubscribeMessage({
        tmplIds: tmplIdsData.value,
        complete: () => {
            submitOrder();
        }
    });
    // #endif

    // #ifdef APP-PLUS || H5 || MP-QQ || MP-TOUTIAO || MP-BAIDU || MP-ALIPAY
    submitOrder();
    // #endif
};
/**
 * 提交订单
 */
const submitOrder = async () => {
    try {
        const result = await orderSubmit(formState);
        if (result.returnType === 2) {
            redirect({
                url: `/pages/order/payStatus?id=${result.orderId}`,
                mode: "redirectTo"
            });
        } else {
            redirect({
                url: `/pages/order/pay?orderId=${result.orderId}`,
                mode: "redirectTo"
            });
        }
    } catch (error: any) {
        console.error(error);

        if (configStore.XClientType === "wechat" && error.code === 5002) {
            uni.setStorageSync("bindWechatFlowType", flowType.value);
            return redirect({
                url: `/pages/user/profile/index?bindWechat=true&flowType=${flowType.value}`
            });
        }

        uni.showToast({
            title: error.message,
            icon: "none"
        });
        setTimeout(() => {
            redirect({
                url: `/pages/cart/index`,
                mode: "redirectTo"
            });
        }, 1500);
    } finally {
        submitLoading.value = false;
    }
};

const couponInfoRef = ref();

onShow(async () => {
    initPageData();
    if (couponInfoRef?.value) {
        couponInfoRef.value.isBalance = false;
        formState.useBalance = 0;
    }
});

const initPageData = async () => {
    try {
        uni.showLoading({
            title: t("加载中")
        });

        // #ifdef MP-WEIXIN
        // 微信小程序默认使用微信支付，设置默认支付方式ID
        formState.payTypeId = 1; // 假设微信支付的ID为1，根据实际情况调整
        // #endif

        // 微信小程序只用微信支付，不需要获取支付方式数据
        await Promise.all([getAddressListData(), getShippingTypeData(), userStore.getUserInfo()]);
        await getOrderInfo();
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
        setTimeout(() => {
            redirect({
                url: `/pages/cart/index`,
                mode: "redirectTo"
            });
        }, 1500);
    } finally {
        uni.hideLoading();
    }
};

onUnmounted(() => {
    uni.removeStorageSync("link");
});

onLoad((options) => {
    if (options) {
        if (options.flowType) {
            flowType.value = options.flowType;
        }
    }
});
</script>

<style lang="scss" scoped>
.order-check {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 20rpx 0;
}

// 通用模块样式
.module-card {
    background-color: #fff;
    border-radius: 30rpx;
    overflow: hidden;

    // 确保内部组件样式不被影响
    :deep(.address-info) {
        background: none !important;
        border-radius: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;

        .address-content {
            padding: 30rpx;
        }
    }

    :deep(.store-card) {
        border-radius: 0 !important;
        margin-bottom: 0 !important;
        background: none !important;
    }
}

.module-margin {
    margin: 20rpx;
}

// 价格明细模块
.price-detail {
    padding: 28rpx 25rpx 31rpx 25rpx;

    .price-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25rpx;
        margin-top: 20rpx;

        &:last-child {
            margin-bottom: 0;
        }

        &.total-item {
            padding-top: 20rpx;
            border-top: 1rpx solid #f5f5f5;
            margin-top: 20rpx;
        }

        &.total-discount {
            margin-bottom: 10rpx;
        }

        .price-label {
            font-size: 28rpx;
            color: #666;

            &.total-label {
                font-size: 32rpx;
                color: #333;
                font-weight: 500;
            }
        }

        .price-value {
            font-size: 28rpx;
            color: #252525;
            display: flex;
            align-items: center;

            .item-count {
                color: #999;
                font-size: 24rpx;
                margin-right: 15rpx;
            }

            .discount {
                color: #ff4757;
            }

            .activity-discount {
                color: #ff4757;
                font-weight: 500;
            }

            .value-content {
                flex: 1;
                display: flex;
                align-items: center;
            }

            .switch-container {
                display: flex;
                align-items: center;
                gap: 20rpx;
            }

            .free-shipping {
                color: #00C851;
                font-size: 28rpx;
            }
        }

        .shipping-fee-section {
            .price-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 30rpx 0;

                .price-label {
                    font-size: 28rpx;
                    color: #333;
                }

                .price-value {
                    font-size: 28rpx;
                    color: #333;

                    .free-shipping {
                        color: #00C851;
                    }
                }
            }

            .no-use {
                color: #999;
                font-size: 26rpx;
            }

            .arrow-right {
                color: #999;
                margin-left: 10rpx;
                font-size: 24rpx;
            }

            .arrow-right-icon {
                width: 24rpx;
                height: 24rpx;
                margin-left: 10rpx;
                opacity: 0.6;
            }

            .switch-icon {
                width: 48rpx;
                height: 28rpx;
                margin-left: 10rpx;
            }

            &.total-discount-value {
                color: #ff4757;
                font-size: 26rpx;
            }

            &.total-value {
                font-size: 36rpx;
                color: #333;
                font-weight: bold;
            }
        }

        // 特殊项目样式
        &.coupon-item, &.points-item, &.balance-item {
            cursor: pointer;

            &:hover {
                background-color: #f8f8f8;
            }
        }

        .label-row {
            display: flex;
            align-items: center;
            gap: 20rpx;
        }

        .available-text {
            color: #3544BA;
            font-size: 22rpx;
            white-space: nowrap;
        }
    }
}

// 支付方式模块
.payment-section {
    padding: 30rpx;

    .section-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 30rpx;
    }

    .payment-methods {
        .payment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20rpx 0;
            border-bottom: 1rpx solid #f5f5f5;

            &:last-child {
                border-bottom: none;
            }

            .payment-left {
                display: flex;
                align-items: center;

                .payment-icon {
                    width: 48rpx;
                    height: 48rpx;
                    margin-right: 20rpx;
                }

                .payment-name {
                    font-size: 30rpx;
                    color: #333;
                }
            }

            .payment-right {
                .payment-check-icon {
                    width: 40rpx;
                    height: 40rpx;
                }

                .payment-radio {
                    width: 40rpx;
                    height: 40rpx;
                    border: 2rpx solid #ddd;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &.active {
                        border-color: #3544BA;

                        .radio-dot {
                            width: 20rpx;
                            height: 20rpx;
                            background-color: #3544BA;
                            border-radius: 50%;
                        }
                    }
                }
            }
        }
    }
}

.submit-btn-box {
    background-color: #fff;
    width: 100%;
    height: 100%;
    bottom: 0;
    padding: 0 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .submit-btn-price {
        color: var(--general);
        font-size: 32rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        column-gap: 10rpx;

        .price-text {
            font-weight: normal;
            color: #323233;
        }

        .points-box {
            display: flex;
            font-size: 34rpx;
            column-gap: 10rpx;
            .points-value {
                display: flex;
                align-items: flex-end;
                column-gap: 4rpx;
            }

            .points-text {
                font-size: 24rpx;
                position: relative;
                bottom: 4rpx;
            }
        }
    }

    .btn {
        width: 200rpx;
        background-color: #3544BA;
        color: #fff;
        font-weight: 500;
    }
}

.debug-info {
    padding: 30rpx;
    text-align: center;
    color: #999;
    font-size: 28rpx;
}

// 优惠券弹出框样式
.coupon-modal {
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    max-height: 80vh;
    display: flex;
    flex-direction: column;

    .modal-header {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f5f5f5;
        position: relative;

        .modal-title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            text-align: center;
        }

        .modal-close {
            position: absolute;
            right: 30rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40rpx;
            color: #999;
        }
    }

    .modal-content {
        flex: 1;
        overflow-y: auto;
        padding: 20rpx 30rpx;

        .coupon-section {
            margin-bottom: 30rpx;

            .section-title {
                font-size: 28rpx;
                color: #666;
                margin-bottom: 20rpx;
                padding-left: 10rpx;
            }
        }

        .divider {
            margin: 30rpx 0;
            display: flex;
            align-items: center;
            justify-content: center;

            .divider-line {
                width: 100%;
                height: 1rpx;
                background-color: #f0f0f0;
            }
        }

        .coupon-list {
            .coupon-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 30rpx 20rpx;
                margin-bottom: 20rpx;
                background-color: #fff;
                border: 2rpx solid #f5f5f5;
                border-radius: 12rpx;
                transition: all 0.3s ease;

                &.available {
                    &.selected {
                        border-color: #3544BA;
                        background-color: #f8f9ff;
                    }
                }

                &.unavailable {
                    opacity: 0.5;
                    background-color: #f8f8f8;

                    .coupon-info {
                        .coupon-amount {
                            color: #ccc !important;
                        }

                        .coupon-desc {
                            color: #999 !important;
                        }

                        .coupon-condition {
                            color: #ccc !important;
                        }
                    }
                }

                .coupon-info {
                    flex: 1;

                    .coupon-amount {
                        font-size: 36rpx;
                        font-weight: bold;
                        color: #ff4757;
                        margin-bottom: 10rpx;
                    }

                    .coupon-desc {
                        font-size: 28rpx;
                        color: #333;
                        margin-bottom: 8rpx;
                    }

                    .coupon-condition {
                        font-size: 24rpx;
                        color: #999;
                    }
                }

                .coupon-select {
                    .select-radio {
                        width: 40rpx;
                        height: 40rpx;
                        border: 2rpx solid #ddd;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        &.active {
                            border-color: #3544BA;

                            .radio-dot {
                                width: 20rpx;
                                height: 20rpx;
                                background-color: #3544BA;
                                border-radius: 50%;
                            }
                        }
                    }
                }

                .coupon-status {
                    .status-text {
                        font-size: 24rpx;
                        color: #999;
                    }
                }
            }
        }

        .no-coupon {
            text-align: center;
            padding: 100rpx 0;
            color: #999;
            font-size: 28rpx;
        }
    }

    .modal-footer {
        padding: 30rpx;
        border-top: 1rpx solid #f5f5f5;

        .confirm-btn {
            width: 100%;
            height: 88rpx;
            background-color: #3544BA;
            color: #fff;
            border-radius: 44rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32rpx;
            font-weight: 500;
            transition: all 0.3s ease;

            &:active {
                background-color: #2a3a9a;
                transform: scale(0.98);
            }
        }
    }
}

.price-value_aaa {
    color: #ff4757;
    font-weight: 500;
    font-size: 28rpx;
}
</style>
