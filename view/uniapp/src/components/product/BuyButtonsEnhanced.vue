<template>
    <view class="buy-buttons-container">
        <!-- 只显示立即购买 -->
        <template v-if="buyOnly">
            <view class="custom-single-btn">
                <view 
                    class="custom-btn custom-single-buy-btn" 
                    :class="disabled || isProcessing ? 'disabled' : ''"
                    @click="handleBuyNow"
                >
                    <text v-if="isProcessing">处理中...</text>
                    <text v-else>{{ $t("立即购买") }}</text>
                </view>
            </view>
        </template>
        <!-- 显示两个按钮 -->
        <template v-else>
            <view class="custom-buttons">
                <view
                    class="custom-btn custom-cart-btn"
                    :class="disabled || isProcessing ? 'disabled' : ''"
                    @click="handleAddToCart"
                >
                    <text v-if="isProcessing">处理中...</text>
                    <text v-else>{{ $t("加入购物车") }}</text>
                </view>
                <view
                    class="custom-btn custom-buy-btn"
                    :class="disabled || isProcessing ? 'disabled' : ''"
                    @click="handleBuyNow"
                >
                    <text v-if="isProcessing">处理中...</text>
                    <text v-else>{{ $t("立即购买") }}</text>
                </view>
            </view>
        </template>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { addToCart } from "@/api/product/product";
import { getCart } from "@/api/cart/cart";
import type { CartResponse } from "@/types/cart/cart";
import { useConfigStore } from "@/store/config";

const { t } = useI18n();
const configStore = useConfigStore();

const props = defineProps({
    id: {
        type: Number,
        required: true
    },
    skuId: {
        type: Number,
        default: null
    },
    number: {
        type: Number,
        default: 1
    },
    extraAttrIds: {
        type: String,
        default: ""
    },
    disabled: {
        type: Boolean,
        default: false
    },
    buyOnly: {
        type: Boolean,
        default: false
    },
    skuItem: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(["addToCartSuccess", "buyNowSuccess"]);

// 防重复提交标记
const isProcessing = ref(false);

// 获取销售员ID
const getSalemanId = (id: number) => {
    const salesmanProducts = uni.getStorageSync("salesmanProducts") || [];
    if (!salesmanProducts.length) return 0;
    const salesman = salesmanProducts.find((item: any) => item.productId == id);
    return Number(salesman?.salesmanId) || 0;
};

// 创建一个统一的API调用函数，包含更强的错误处理
const callAddToCartAPI = async (filterParams: any, retryCount = 0): Promise<any> => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒
    
    try {
        console.log(`API Call attempt ${retryCount + 1}/${maxRetries + 1}:`, filterParams);
        
        const result = await addToCart(filterParams);
        console.log('API Call successful:', result);
        return result;
        
    } catch (error: any) {
        console.error(`API Call failed (attempt ${retryCount + 1}):`, error);
        
        // 如果是1001错误（重复记录错误）
        if (error.code === 1001 && error.message.includes('Expected one result')) {
            if (retryCount < maxRetries) {
                console.log(`Retrying after ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})...`);
                
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                
                // 递归重试
                return callAddToCartAPI(filterParams, retryCount + 1);
            } else {
                // 重试次数用完，显示特殊错误处理
                throw new Error(`RETRY_EXHAUSTED:${error.message}`);
            }
        }
        
        // 其他错误直接抛出
        throw error;
    }
};

// 处理加入购物车
const handleAddToCart = async () => {
    if (props.disabled || isProcessing.value) return;
    
    isProcessing.value = true;
    
    try {
        const salesmanId = getSalemanId(props.id);
        const filterParams: any = {
            id: props.id,
            number: props.number,
            skuId: props.skuId,
            isQuick: 0 // 0 表示加入购物车
        };
        
        if (props.extraAttrIds) {
            filterParams.extraAttrIds = props.extraAttrIds;
        }
        
        if (salesmanId > 0) {
            filterParams.salesmanId = salesmanId;
        }
        
        console.log('Adding to cart:', filterParams);
        
        const result = await callAddToCartAPI(filterParams);
        
        emit("addToCartSuccess", result);
        
        uni.showToast({ 
            title: t("加入购物车成功"), 
            icon: 'success',
            duration: 1500 
        });
        
    } catch (error: any) {
        console.error('Add to cart error:', error);
        handleAddToCartError(error);
    } finally {
        isProcessing.value = false;
    }
};

// 处理立即购买
const handleBuyNow = async () => {
    if (props.disabled || isProcessing.value) return;
    
    isProcessing.value = true;
    
    try {
        if (configStore.closeOrder === 1) {
            return uni.showToast({ 
                title: t("商城已关闭下单"), 
                icon: "none", 
                duration: 1500 
            });
        }
        
        const salesmanId = getSalemanId(props.id);
        const filterParams: any = {
            id: props.id,
            number: props.number,
            skuId: props.skuId || null,
            isQuick: 1 // 1 表示立即购买
        };
        
        if (props.extraAttrIds) {
            filterParams.extraAttrIds = props.extraAttrIds;
        }
        
        if (salesmanId > 0) {
            filterParams.salesmanId = salesmanId;
        }
        
        console.log('Buy now:', filterParams);
        
        const result = await callAddToCartAPI(filterParams);
        
        emit("buyNowSuccess", result);
        
        uni.navigateTo({ 
            url: `/pages/order/check?flowType=${result.flowType}` 
        });
        
    } catch (error: any) {
        console.error('Buy now error:', error);
        handleBuyNowError(error);
    } finally {
        isProcessing.value = false;
    }
};

// 处理加入购物车错误
const handleAddToCartError = (error: any) => {
    if (error.message?.startsWith('RETRY_EXHAUSTED:')) {
        // 重试用完的情况
        uni.showModal({
            title: t('系统繁忙'),
            content: t('购物车系统暂时繁忙，请稍后再试或联系客服'),
            showCancel: true,
            cancelText: t('取消'),
            confirmText: t('重新尝试'),
            success: (res) => {
                if (res.confirm) {
                    // 用户选择重新尝试
                    setTimeout(() => {
                        handleAddToCart();
                    }, 1000);
                }
            }
        });
    } else if (error.code === 1001 && error.message.includes('Expected one result')) {
        // 单次1001错误
        uni.showModal({
            title: t('提示'),
            content: t('购物车中可能已有类似商品，是否前往查看？'),
            showCancel: true,
            cancelText: t('取消'),
            confirmText: t('去购物车'),
            success: (res) => {
                if (res.confirm) {
                    uni.navigateTo({ url: '/pages/cart/cartJump' });
                }
            }
        });
    } else {
        uni.showToast({ 
            title: error.message || '加入购物车失败', 
            icon: "none", 
            duration: 2000 
        });
    }
};

// 处理立即购买错误
const handleBuyNowError = (error: any) => {
    if (error.message?.startsWith('RETRY_EXHAUSTED:')) {
        // 重试用完的情况
        uni.showModal({
            title: t('系统繁忙'),
            content: t('订单系统暂时繁忙，请选择加入购物车或稍后再试'),
            showCancel: true,
            cancelText: t('加入购物车'),
            confirmText: t('稍后再试'),
            success: (res) => {
                if (res.confirm) {
                    // 稍后再试
                    setTimeout(() => {
                        handleBuyNow();
                    }, 2000);
                } else {
                    // 降级为加入购物车
                    handleAddToCart();
                }
            }
        });
    } else if (error.code === 1001 && error.message.includes('Expected one result')) {
        // 单次1001错误
        uni.showModal({
            title: t('提示'),
            content: t('购物车中已有相同商品，请先去购物车页面处理后再试，或选择加入购物车'),
            showCancel: true,
            cancelText: t('加入购物车'),
            confirmText: t('去购物车'),
            success: (res) => {
                if (res.confirm) {
                    uni.navigateTo({ url: '/pages/cart/cartJump' });
                } else {
                    handleAddToCart();
                }
            }
        });
    } else {
        uni.showToast({ 
            title: error.message || '立即购买失败', 
            icon: "none", 
            duration: 1500 
        });
    }
};
</script>

<style lang="scss" scoped>
.buy-buttons-container {
    width: 100%;
}

.custom-single-btn {
    display: flex;
    padding: 0 30rpx;
    
    .custom-single-buy-btn {
        flex: 1;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        border-radius: 50rpx;
    }
}

.custom-buttons {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx;
    
    .custom-cart-btn {
        flex: 1;
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
    }
    
    .custom-buy-btn {
        flex: 1;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: #fff;
    }
}

.custom-btn {
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    
    &:active {
        transform: scale(0.98);
        opacity: 0.8;
    }
    
    &.disabled {
        opacity: 0.6;
        background: #ccc !important;
        color: #999 !important;
        cursor: not-allowed;
        
        &:active {
            transform: none;
            opacity: 0.6;
        }
    }
}
</style>