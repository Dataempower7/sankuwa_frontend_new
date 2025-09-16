<template>
    <view class="buy-buttons-container">
        <!-- 只显示立即购买 -->
        <template v-if="buyOnly">
            <view class="custom-single-btn">
                <view 
                    class="custom-btn custom-single-buy-btn" 
                    :class="disabled ? 'disabled' : ''"
                    @click="handleBuyNow"
                >
                    {{ $t("立即购买") }}
                </view>
            </view>
        </template>
        <!-- 显示两个按钮 -->
        <template v-else>
            <view class="custom-buttons">
                <view
                    class="custom-btn custom-cart-btn"
                    :class="disabled ? 'disabled' : ''"
                    @click="handleAddToCart"
                >
                    {{ $t("加入购物车") }}
                </view>
                <view
                    class="custom-btn custom-buy-btn"
                    :class="disabled ? 'disabled' : ''"
                    @click="handleBuyNow"
                >
                    {{ $t("立即购买") }}
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

// 检查购物车中是否已存在相同的商品和SKU组合
const checkDuplicateInCart = async (productId: number, skuId: number | null): Promise<boolean> => {
    try {
        console.log('BuyButtons - checking for duplicates:', { productId, skuId });
        const cartResponse: CartResponse = await getCart();
        
        console.log('BuyButtons - cart response:', cartResponse);
        
        // 检查响应结构
        if (!cartResponse || !cartResponse.data) {
            console.log('BuyButtons - no cart data available');
            return false;
        }
        
        const cartData = cartResponse.data;
        
        if (!cartData.cartList || !Array.isArray(cartData.cartList)) {
            console.log('BuyButtons - cart list is empty or invalid');
            return false;
        }
        
        console.log(`BuyButtons - checking for duplicates: productId=${productId}, skuId=${skuId}`);
        console.log('BuyButtons - cart data structure:', JSON.stringify(cartData, null, 2));
        
        // 检查所有购物车商店中的商品
        for (const shop of cartData.cartList) {
            console.log('BuyButtons - checking shop:', shop);
            
            if (!shop.carts || !Array.isArray(shop.carts)) {
                console.log('BuyButtons - shop has no carts or carts is not array');
                continue;
            }
            
            console.log(`BuyButtons - shop has ${shop.carts.length} items`);
            
            for (const cartItem of shop.carts) {
                // 处理SKU ID的比較，保持与本地缓存检查一致的逻辑
                const cartSkuId = cartItem.skuId === null ? 0 : cartItem.skuId;
                const checkSkuId = skuId === null ? 0 : skuId;
                
                console.log(`BuyButtons - comparing: cart item (productId=${cartItem.productId}, skuId=${cartItem.skuId}->${cartSkuId}) vs checking (productId=${productId}, skuId=${skuId}->${checkSkuId})`);
                
                if (cartItem.productId === productId && cartSkuId === checkSkuId) {
                    console.log('BuyButtons - duplicate found in remote cart!');
                    return true;
                }
            }
        }
        
        console.log('BuyButtons - no duplicates found');
        return false;
    } catch (error) {
        console.error('BuyButtons - duplicate check error:', error);
        // 如果检查失败，为了安全起见，返回false允许继续添加
        return false;
    }
};

// 获取销售员ID
const getSalemanId = (id: number) => {
    const salesmanProducts = uni.getStorageSync("salesmanProducts") || [];
    if (!salesmanProducts.length) return 0;
    const salesman = salesmanProducts.find((item: any) => item.productId == id);
    return Number(salesman?.salesmanId) || 0;
};

// 处理加入购物车
const handleAddToCart = async () => {
    if (props.disabled) return;
    
    // 防止重复点击
    if (isProcessing.value) {
        console.log('BuyButtons - already processing add to cart, ignoring click');
        return;
    }
    
    isProcessing.value = true;
    
    try {
        const productId = props.id;
        const skuId = props.skuId || null;
        
        console.log('BuyButtons - adding to cart:', { productId, skuId });
        
        // 检查是否已有重复商品
        const isDuplicate = await checkDuplicateInCart(productId, skuId);
        
        if (isDuplicate) {
            console.log('BuyButtons - duplicate detected, showing options');
            uni.showModal({
                title: t('提示'),
                content: t('购物车中已有相同商品，是否前往购物车查看或继续添加？'),
                showCancel: true,
                cancelText: t('去购物车'),
                confirmText: t('继续添加'),
                success: (res) => {
                    if (res.confirm) {
                        // 用户选择继续添加，执行添加操作
                        performAddToCart();
                    } else {
                        // 用户选择去购物车
                        uni.navigateTo({ url: '/pages/cart/cartJump' });
                    }
                }
            });
            return;
        }
        
        // 如果不重复，直接执行添加
        await performAddToCart();
        
    } catch (error: any) {
        console.error('BuyButtons - add to cart error:', error);
        handleError(error);
    } finally {
        isProcessing.value = false;
    }
};

// 执行加入购物车操作（带重试机制）
const performAddToCart = async (retryCount = 0) => {
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
        
        console.log(`BuyButtons - add to cart API params (attempt ${retryCount + 1}):`, filterParams);
        
        const result = await addToCart(filterParams);
        
        emit("addToCartSuccess", result);
        
        uni.showToast({ 
            title: t("加入购物车成功"), 
            icon: 'success',
            duration: 1500 
        });
        
    } catch (error: any) {
        console.error(`BuyButtons - perform add to cart error (attempt ${retryCount + 1}):`, error);
        
        // 如果是1001错误且是第一次尝试，等待500ms后重试
        if (error.code === 1001 && error.message.includes('Expected one result') && retryCount < 2) {
            console.log(`BuyButtons - retrying add to cart after 500ms (attempt ${retryCount + 1}/2)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            return performAddToCart(retryCount + 1);
        }
        
        handleError(error);
        throw error; // 重新抛出错误，让调用者知道失败
    }
};

// 处理立即购买
const handleBuyNow = async () => {
    if (props.disabled) {
        uni.showToast({ title: t("商品已售罄"), icon: "none", duration: 1500 });
        return;
    }
    
    // 防止重复点击
    if (isProcessing.value) {
        console.log('BuyButtons - already processing buy now, ignoring click');
        return;
    }
    
    isProcessing.value = true;
    
    try {
        if (configStore.closeOrder === 1) {
            return uni.showToast({ 
                title: t("商城已关闭下单"), 
                icon: "none", 
                duration: 1500 
            });
        }
        
        await performBuyNow();
        
    } catch (error: any) {
        console.error('BuyButtons - buy now error:', error);
        handleBuyNowError(error);
    } finally {
        isProcessing.value = false;
    }
};

// 执行立即购买操作（带重试机制）
const performBuyNow = async (retryCount = 0) => {
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
    
    console.log(`BuyButtons - buy now API params (attempt ${retryCount + 1}):`, filterParams);
    
    try {
        const result = await addToCart(filterParams);
        
        emit("buyNowSuccess", result);
        
        uni.navigateTo({ 
            url: `/pages/order/check?flowType=${result.flowType}` 
        });
        
    } catch (error: any) {
        console.error(`BuyButtons - perform buy now error (attempt ${retryCount + 1}):`, error);
        
        // 如果是1001错误且是第一次尝试，等待500ms后重试
        if (error.code === 1001 && error.message.includes('Expected one result') && retryCount < 2) {
            console.log(`BuyButtons - retrying buy now after 500ms (attempt ${retryCount + 1}/2)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            return performBuyNow(retryCount + 1);
        }
        
        throw error; // 重新抛出错误
    }
};

// 处理加入购物车错误
const handleError = (error: any) => {
    // 特殊处理重复记录错误
    if (error.code === 1001 && error.message && error.message.includes('Expected one result')) {
        uni.showModal({
            title: t('提示'),
            content: t('购物车中已有重复记录，请先去购物车页面清理后再试'),
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
    // 如果是重复记录错误，提供解决方案
    if (error.code === 1001 && error.message.includes('Expected one result')) {
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
                    // 用户选择加入购物车，执行添加操作
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
    
    &:active {
        transform: scale(0.98);
        opacity: 0.8;
    }
    
    &.disabled {
        opacity: 0.5;
        background: #ccc !important;
        color: #999 !important;
        cursor: not-allowed;
        
        &:active {
            transform: none;
        }
    }
}
</style>