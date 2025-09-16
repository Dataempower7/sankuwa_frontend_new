<template>
    <view class="buy" @click.stop="handleBuy">
        <slot />
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { addToCart } from "@/api/product/product";
import { addExchangeToCart } from "@/api/exchange/exchange";
import { getCart } from "@/api/cart/cart";
import type { CartResponse } from "@/types/cart/cart";
import { useI18n } from "vue-i18n";
import { isB2B } from "@/utils";
import { useConfigStore } from "@/store/config";

const { t } = useI18n();
const configStore = useConfigStore();
const props = defineProps({
    id: Number,
    number: {
        type: Number
    },
    skuId: {
        type: Number
    },
    extraAttrIds: {
        type: String,
        default: ""
    },
    disabled: {
        type: Boolean,
        default: false
    },
    isQuick: {
        type: Boolean,
        default: false
    },
    type: {
        type: String
    },
    skuItem: {
        type: Array
    }
});
const emit = defineEmits(["callback"]);
const loading = ref(false);

// 检查购物车中是否已存在相同的商品和SKU组合
const checkDuplicateInCart = async (productId: number, skuId: number | null): Promise<boolean> => {
    try {
        console.log('Buy component - checking for duplicates:', { productId, skuId });
        const cartResponse: CartResponse = await getCart();
        
        if (!cartResponse || !cartResponse.data || !cartResponse.data.cartList) {
            return false;
        }
        
        const cartData = cartResponse.data;
        
        // 检查所有购物车商店中的商品
        for (const shop of cartData.cartList) {
            if (!shop.carts || !Array.isArray(shop.carts)) {
                continue;
            }
            
            for (const cartItem of shop.carts) {
                const cartSkuId = cartItem.skuId === null ? 0 : cartItem.skuId;
                const checkSkuId = skuId === null ? 0 : skuId;
                
                if (cartItem.productId === productId && cartSkuId === checkSkuId) {
                    console.log('Buy component - duplicate found!');
                    return true;
                }
            }
        }
        
        console.log('Buy component - no duplicates found');
        return false;
    } catch (error) {
        console.error('Buy component - duplicate check error:', error);
        return false;
    }
};
const handleBuy = async () => {
    if (props.disabled) return;

    // 防止重复点击
    if (loading.value) {
        console.log('Buy component - already processing, ignoring click');
        return;
    }

    loading.value = true;

    try {
        const productId = props.id ?? 0;
        const skuId = props.skuId || null;
        
        console.log('Buy component - processing:', { productId, skuId, isQuick: props.isQuick });
        
        // 只对非快速购买（加入购物车）进行重复检查
        if (!props.isQuick) {
            const isDuplicate = await checkDuplicateInCart(productId, skuId);
            
            if (isDuplicate) {
                console.log('Buy component - duplicate detected, showing options');
                uni.showModal({
                    title: t('提示'),
                    content: t('购物车中已有相同商品，是否前往购物车查看或继续添加？'),
                    showCancel: true,
                    cancelText: t('去购物车'),
                    confirmText: t('继续添加'),
                    success: (res) => {
                        if (res.confirm) {
                            // 用户选择继续添加，执行添加操作
                            performBuy();
                        } else {
                            // 用户选择去购物车
                            uni.navigateTo({ url: '/pages/cart/cartJump' });
                        }
                    }
                });
                return;
            }
        }
        
        // 如果不重复或是快速购买，直接执行
        await performBuy();
        
    } catch (error: any) {
        console.error('Buy component - error:', error);
        handleBuyError(error);
    } finally {
        loading.value = false;
    }
};

// 执行购买操作
const performBuy = async () => {
    const salesmanId = getSalemanId(props.id!);
    let result: AnyObject = {};
    const filterParams: AnyObject = {
        id: props.id ?? 0,
        number: props.number,
        skuId: props.skuId,
        isQuick: props.isQuick ? 1 : 0
    };
    
    if (props.extraAttrIds) {
        filterParams.extraAttrIds = props.extraAttrIds;
    }
    if (isB2B()) {
        filterParams.skuItem = props.skuItem;
    }
    
    console.log('Buy component - API params:', filterParams);
    
    switch (props.type) {
        case "exchange":
            result = await addExchangeToCart(filterParams);
            break;
        default:
            filterParams.salesmanId = salesmanId > 0 ? salesmanId : undefined;
            result = await addToCart(filterParams);
    }
    
    emit("callback");
    
    if (props.isQuick == true) {
        if (configStore.closeOrder === 1) {
            return uni.showToast({ title: t("商城已关闭下单"), icon: "none", duration: 1500 });
        }
        uni.navigateTo({ url: `/pages/order/check?flowType=${result.flowType}` });
    } else {
        uni.showToast({ 
            title: t("加入购物车成功"), 
            icon: 'success',
            duration: 1500 
        });
    }
};

// 处理购买错误
const handleBuyError = (error: any) => {
    // 特殊处理重复记录错误
    if (error.code === 1001 && error.message && error.message.includes('Expected one result')) {
        uni.showModal({
            title: t('提示'),
            content: props.isQuick 
                ? t('购物车中已有重复记录，请先去购物车页面清理后再试') 
                : t('购物车中已有重复记录，请先去购物车页面清理后再试'),
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
            title: error.message || '操作失败', 
            icon: "none", 
            duration: 2000 
        });
    }
};

const getSalemanId = (id: number) => {
    const salesmanProducts = uni.getStorageSync("salesmanProducts") || [];
    if (!salesmanProducts.length) return 0;
    const salesman = salesmanProducts.find((item: any) => item.productId == id);
    return Number(salesman?.salesmanId) || 0;
};
</script>

<style lang="scss" scoped></style>
