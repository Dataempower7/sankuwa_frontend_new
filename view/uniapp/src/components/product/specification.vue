<template>
    <view @click="handleShowPopup">
        <slot />
    </view>
    <tig-popup v-model:show="showPopup" :z-index="999" :show-close="false" @close="handlePopupClose">
        <scroll-view scroll-y="true" class="specification">
            <view class="product-sku-box flex justify-between">
                <view class="product-info">
                    <view class="product-info-img">
                        <tig-image :src="productImage" />
                    </view>
                    <view class="info">
                        <view class="price">
                            <template v-if="type === 'exchange'">
                                <view class="exchange-box">
                                    <format-price
                                        :font-style="{ fontSize: '32rpx' }"
                                        :currency-style="{
                                            fontSize: '22rpx'
                                        }"
                                        :decimals-style="{
                                            fontSize: '25rpx'
                                        }"
                                        :price-data="productPrice"
                                    />
                                    <text class="exchange-icon">+</text>
                                    <image class="exchange-img" :src="staticResource('exchange/exchange.png')" />
                                    <text class="exchange-text">{{ exchangeDetail.exchangeIntegral }}</text>
                                </view>
                            </template>
                            <template v-else>
                                <format-price
                                    :font-style="{ fontSize: '32rpx' }"
                                    :currency-style="{
                                        fontSize: '22rpx'
                                    }"
                                    :decimals-style="{
                                        fontSize: '24rpx'
                                    }"
                                    :price-data="productPrice"
                                />
                            </template>
                        </view>
                        <template v-if="isDiscount || isSeckill">
                            <view class="ticket">
                                <view class="ticket-content">{{ isSeckill ? $t("秒杀价") : $t("限时折扣") }}</view>
                            </view>
                        </template>
                        <template v-if="productOriginPrice && Number(productOriginPrice) > Number(productPrice)">
                            <view class="del-box">
                                <format-price :is-bottom="false" :price-data="productOriginPrice" :font-style="{ 'text-decoration': 'line-through' }" />
                            </view>
                        </template>
                        <view class="name line2">
                            {{ productName }}
                        </view>
                    </view>
                    <view class="stock-info">
                        {{ $t("库存") }}：<text v-if="productStock > 50" style="color: #5A62AE">{{ $t("充足") }}</text>
                        <text v-else-if="productStock === 0" style="color: red">{{ $t("缺货") }}</text>
                        <text v-else style="color: #FF6B35">{{ $t("仅剩") }}{{ productStock }}件</text>
                    </view>
                </view>
                <view class="popup-close" @click="closePopup">
                    <uni-icons type="closeempty" size="24" style="color: #c8c9cc" />
                </view>
            </view>
            <template v-if="isB2B() && skuList.length > 1">
                <view class="placeholder" />
                <view class="tab">
                    <view class="tab-item" :class="{ active: tabIndex === 0 }" @click="handleTabChange(0)">
                        {{ $t("单品采购") }}
                        <image v-show="tabIndex === 1" class="image" style="right: 0" :src="staticResource('product/shadow-right.png')" />
                    </view>
                    <view class="tab-item" :class="{ active: tabIndex === 1 }" @click="handleTabChange(1)">
                        {{ $t("批量采购") }}
                        <image v-show="tabIndex === 0" class="image" style="left: 0" :src="staticResource('product/shadow-left.png')" />
                    </view>
                    <view class="line" :style="`${tabIndex === 0 ? 'left: 0' : 'right: 0'}`" />
                    <view class="subline" :style="`${tabIndex === 0 ? 'right: 0' : 'left: 0'}`" />
                </view>
            </template>

            <view v-show="tabIndex !== 1">
                <view v-if="specificationList.length > 0" class="product-sku-info">
                    <view v-for="(item, index) in specificationList" :key="index" class="sku-item">
                        <view class="tit">
                            {{ item.attrName }}
                        </view>
                        <view class="sku-tag flex">
                            <template v-for="(value, subIdx) in item.attrList" :key="subIdx">
                                <view
                                    :class="'tag ' + (value.checked ? 'checked ' : '' + (value.skuStock == 0 ? 'disabled' : ''))"
                                    @click="handleChecked(index, subIdx)"
                                >
                                    <view v-if="value.attrPicThumb && index === 0" class="tag-img"><tig-image :src="value.attrPicThumb" /></view>
                                    <view class="tag-text">{{ value.attrValue }}</view>
                                </view>
                            </template>
                        </view>
                    </view>
                </view>
                <view class="product-sku-info">
                    <view class="num-item">
                        <view class="tit">{{ $t("购买数量") }}</view>
                        <view class="sku-num flex align-center">
                            <template v-if="isSeckill && maxProductNumber > 0">
                                <uni-number-box v-model="productNumber" :min="1" :max="maxProductNumber" :width="60" />
                                <view class="stock"
                                    >{{ $t("限购") }}：<text style="color: var(--general)">{{ maxProductNumber }}{{ $t("件") }}</text>
                                </view>
                            </template>
                            <template v-else>
                                <tig-number-box v-model="productNumber" :min="1" :max="productStock" @overlimit="handleOverlimit" />
                                <!-- <view class="stock"
                                    >{{ $t("库存") }}：<text v-if="productStock > 50" style="color: var(--general)">{{ $t("充足") }}</text>
                                    <text v-else-if="productStock === 0" style="color: var(--general)">{{ $t("缺货") }}</text>
                                    <text v-else style="color: var(--general)">{{ $t("仅剩") }}{{ productStock }}件</text>
                                </view> -->
                            </template>
                        </view>
                    </view>
                </view>
            </view>

            <view v-show="isBatch">
                <template v-if="skuList.length > 1">
                    <view class="allskulist">
                        <template v-for="(item, index) in b2bSkuList" :key="item.skuId">
                            <view class="allskulist-item">
                                <view class="left">
                                    <view class="title line2">{{ item.title }}</view>
                                    <!-- <view class="title line2">{{ item.skuValue }}</view> -->
                                    <view class="desc">
                                        <view class="price">
                                            <format-price :price-data="item.price" />
                                        </view>
                                        <view class="line" />
                                        <view class="stock">库存：{{ item.stock }}</view>
                                    </view>
                                </view>
                                <view class="right">
                                    <tig-number-box v-model="item.num" :button-width="30" :min="0" :max="item.skuStock" @change="handleNumberChange()" />
                                </view>
                            </view>
                        </template>
                    </view>
                </template>
            </view>

            <template v-if="additionAttribute.length > 0">
                <view class="product-sku-info attribute">
                    <template v-for="(item, index) in additionAttribute" :key="index">
                        <view class="attribute-item">
                            <view class="item-title">{{ item.attrName }}</view>
                            <view class="item-content">
                                <template v-for="subItem in item.attrList" :key="subItem.attributesId">
                                    <view
                                        class="item-attr"
                                        :class="{ checked: checkedAttrs[index] === subItem.attributesId }"
                                        @click.stop="handleAttrClick(index, subItem.attributesId)"
                                    >
                                        <view class="label">
                                            {{ subItem.attrValue }}
                                        </view>
                                        <format-price class="value" :price-data="subItem.attrPrice" />
                                    </view>
                                </template>
                            </view>
                        </view>
                    </template>
                </view>
            </template>
        </scroll-view>

        <template v-if="!(productType === 4 && productIsBuy === 1)">
            <view class="footer" :class="{ shadow: isBatch }">
                <template v-if="isBatch">
                    <view class="b2b-btn">
                        <view class="desc">
                            <view
                                >已选<text class="num">{{ productAmount.count }}</text
                                >件</view
                            >
                            <view class="price">
                                <view>商品金额：</view>
                                <format-price
                                    :font-style="{ fontSize: '32rpx', color: 'var(--general)' }"
                                    :currency-style="{
                                        fontSize: '22rpx',
                                        color: 'var(--general)'
                                    }"
                                    :decimals-style="{
                                        fontSize: '25rpx',
                                        color: 'var(--general)'
                                    }"
                                    :price-data="productAmount.total"
                                />
                            </view>
                        </view>
                        <view class="add_cart">
                            <buy
                                :id="Number(modelValue)"
                                :disabled="skuItem.length === 0"
                                :sku-item="skuItem"
                                :extra-attr-ids="filterParams.extraAttrIds"
                                @callback="addCard"
                            >
                                <view class="btn cart" :class="skuItem.length === 0 ? 'disabled-div' : ''">{{ $t("批量加入购物车") }}</view>
                            </buy>
                            <buy
                                :id="Number(modelValue)"
                                :sku-item="skuItem"
                                :disabled="skuItem.length === 0"
                                :extra-attr-ids="filterParams.extraAttrIds"
                                :is-quick="true"
                                @callback="closePopup"
                            >
                                <view class="btn buy-right" :class="skuItem.length === 0 ? 'disabled-div' : ''">{{ $t("立即购买") }}</view>
                            </buy>
                        </view>
                    </view>
                </template>
                <template v-else>
                    <template v-if="type === 'exchange'">
                        <view class="exchange-btn">
                            <buy
                                :id="exchangeDetail.id"
                                :sku-id="currentSku.skuId"
                                :disabled="productStock == 0"
                                :extra-attr-ids="filterParams.extraAttrIds"
                                :number="productNumber"
                                :is-quick="true"
                                :type="type"
                                @callback="closePopup"
                            >
                                <view class="btn" :class="productStock === 0 ? 'disabled-div' : ''">{{ $t("立即兑换") }}</view>
                            </buy>
                        </view>
                    </template>
                    <template v-else>
                        <template v-if="productType === 1">
                            <!-- 只显示立即购买 -->
                            <template v-if="buyOnly">
                                <view class="custom-single-btn">
                                    <view 
                                        class="custom-btn custom-single-buy-btn" 
                                        :class="productStock === 0 ? 'disabled' : ''"
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
                                        :class="productStock === 0 ? 'disabled' : ''"
                                        @click="handleAddToCart"
                                    >
                                        {{ $t("加入购物车") }}
                                    </view>
                                    <view 
                                        class="custom-btn custom-buy-btn" 
                                        :class="productStock === 0 ? 'disabled' : ''"
                                        @click="handleBuyNow"
                                    >
                                        {{ $t("立即购买") }}
                                    </view>
                                </view>
                            </template>
                        </template>
                        <template v-else>
                            <view class="exchange-btn">
                                <buy
                                    :id="modelValue"
                                    :sku-id="currentSku.skuId"
                                    :disabled="productStock == 0"
                                    :extra-attr-ids="filterParams.extraAttrIds"
                                    :number="productNumber"
                                    :is-quick="true"
                                    :type="type"
                                    @callback="closePopup"
                                >
                                    <view class="btn" :class="productStock === 0 ? 'disabled-div' : ''">{{ $t("立即购买") }}</view>
                                </buy>
                            </view>
                        </template>
                    </template>
                </template>
            </view>
        </template>
    </tig-popup>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { SkuList, SkuPromotion, ProductAmountItem } from "@/types/product/product";
import { getProductDetail, getProductSkuDetail, getProductAmount, getBatchProductAvailability, addToCart } from "@/api/product/product";
import { getExchangeDetail, addExchangeToCart } from "@/api/exchange/exchange";
import { getCart } from "@/api/cart/cart";
import type { CartResponse } from "@/types/cart/cart";
import buy from "@/components/product/buy.vue";
import { staticResource, isB2B } from "@/utils";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "@/store/config";

const props = defineProps({
    modelValue: {
        type: [Number],
        default: 0
    },
    skuId: {
        type: [Number],
        default: 0
    },
    type: {
        type: [String],
        default: ""
    },
    buyOnly: {
        type: [Boolean],
        default: false
    }
});

const emit = defineEmits(["sendValue", "addCardSucceed", "update:skuId", "loadEnd", "close"]);

const { t } = useI18n();

const showPopup = ref(false);
const closePopup = () => {
    emit("close");
    sendValue();
    showPopup.value = false;
};
const handleShowPopup = () => {
    showPopup.value = true;
};
const specificationList = ref<any[]>([]);
const skuList = ref<SkuList[]>([]);
const b2bSkuList = ref<SkuList[]>([]);
const currentSku = ref<SkuList>({} as SkuList);
const productPrice = ref("0");
const productOriginPrice = ref("0");
const productImage = ref("");
const productStock = ref(0);
const productName = ref("");
const productNumber = ref(1);
const maxProductNumber = ref(0);
const checkedValue = ref<any[]>([]);
const exchangeDetail = ref<any>({});
const productType = ref(1);
const productIsBuy = ref(0);
const additionAttribute = ref<any[]>([]);
const checkedAttrs = ref<any[]>([]);

const handleAttrClick = (index: number, id: number) => {
    if (checkedAttrs.value[index] && checkedAttrs.value[index] === id) {
        checkedAttrs.value[index] = null;
    } else {
        checkedAttrs.value[index] = id;
    }
    loadSkuPrice();
};

// 防止重复点击的loading状态
const isAddingToCart = ref(false);

// 本地购物车缓存，用于避免并发问题
const localCartCache = ref<{productId: number, skuId: number | null}[]>([]);

// 清理本地缓存（在页面初始化或成功后一段时间后清理）
const clearLocalCache = () => {
    localCartCache.value = [];
};

// 自定义按钮点击事件
const handleAddToCart = async () => {
    if (productStock.value === 0) {
        uni.showToast({ title: t("商品已售罄"), icon: "none", duration: 1500 });
        return;
    }
    
    // 防止重复点击
    if (isAddingToCart.value) {
        console.log('Already adding to cart, ignoring click');
        return;
    }
    
    isAddingToCart.value = true;
    
    try {
        // 确俚SKU信息正确获取
        let skuIdToCheck = null;
        
        console.log('Product info check:', {
            productId: props.modelValue,
            hasSpecs: specificationList.value.length > 0,
            currentSku: currentSku.value,
            skuListLength: skuList.value.length
        });
        
        // 对于有规格的商品，确保已选择规格
        if (specificationList.value.length > 0) {
            if (!currentSku.value?.skuId) {
                console.log('Specification required but not selected');
                uni.showToast({ title: t("请选择商品规格"), icon: "none", duration: 1500 });
                isAddingToCart.value = false;
                return;
            }
            skuIdToCheck = currentSku.value.skuId;
            console.log('Using selected SKU ID:', skuIdToCheck);
        } else {
            // 没有规格的商品，使用默认SKU或null
            if (skuList.value.length > 0 && skuList.value[0].skuId) {
                skuIdToCheck = skuList.value[0].skuId;
                console.log('Using default SKU ID:', skuIdToCheck);
            } else {
                skuIdToCheck = null;
                console.log('No SKU available, using null');
            }
        }
        
        // 先检查本地缓存（快速检查并发问题）
        console.log('Local cache before check:', localCartCache.value);
        const localDuplicate = localCartCache.value.some(item => {
            const cacheSkuId = item.skuId === null ? 0 : item.skuId;
            const checkSkuId = skuIdToCheck === null ? 0 : skuIdToCheck;
            const isDuplicate = item.productId === props.modelValue && cacheSkuId === checkSkuId;
            console.log(`Local cache comparison: cache(productId=${item.productId}, skuId=${item.skuId}) vs current(productId=${props.modelValue}, skuId=${skuIdToCheck}) = ${isDuplicate}`);
            return isDuplicate;
        });
        
        if (localDuplicate) {
            console.log('Found duplicate in local cache, preventing duplicate request');
            isAddingToCart.value = false;
            uni.showToast({ 
                title: t('请勿重复点击'), 
                icon: "none", 
                duration: 1500 
            });
            return;
        }
        
        // 检查远程购物车中是否已存在相同的商品和SKU组合
        console.log('Checking for duplicates - productId:', props.modelValue, 'skuId:', skuIdToCheck);
        const isDuplicate = await checkDuplicateInCart(props.modelValue, skuIdToCheck);
        console.log('Duplicate check result:', isDuplicate);
        
        if (isDuplicate) {
            isAddingToCart.value = false; // 重置加载状态
            uni.showModal({
                title: t('提示'),
                content: t('购物车中已有相同商品，是否前往购物车查看或继续添加？'),
                showCancel: true,
                cancelText: t('去购物车'),
                confirmText: t('继续添加'),
                success: (res) => {
                    if (res.confirm) {
                        // 用户选择继续添加，执行添加操作
                        performAddToCart(skuIdToCheck);
                    } else {
                        // 用户选择去购物车
                        closePopup();
                        uni.navigateTo({ url: '/pages/cart/cartJump' });
                    }
                }
            });
            return;
        }
        
        // 如果不重复，直接添加
        await performAddToCart(skuIdToCheck);
        
    } catch (error: any) {
        console.error('handleAddToCart error:', error);
        uni.showToast({ title: error.message || '操作失败', icon: "none", duration: 1500 });
    } finally {
        isAddingToCart.value = false; // 确保始终重置加载状态
    }
};

// 执行添加到购物车的实际操作
const performAddToCart = async (skuId: number | null = null) => {
    // 先在函数开始处定义finalSkuId，确保在所有作用域中可用
    const finalSkuId = skuId !== null ? skuId : (currentSku.value?.skuId || null);
    
    try {
        const configStore = useConfigStore();
        const salesmanId = getSalemanId(props.modelValue);
        let result: any = {};
        
        // 立即添加到本地缓存，防止并发问题
        localCartCache.value.push({ productId: props.modelValue, skuId: finalSkuId });
        
        const filterParams: any = {
            id: props.modelValue,
            number: productNumber.value,
            skuId: finalSkuId,
            isQuick: 0 // 加入购物车不是快速购买
        };
        
        console.log('performAddToCart - API params:', filterParams);
        console.log('performAddToCart - currentSku details:', currentSku.value);
        
        // 对于有规格的商品，确保 skuId 不为 null
        if (specificationList.value.length > 0 && !filterParams.skuId) {
            uni.showToast({ title: t("请选择商品规格"), icon: "none", duration: 1500 });
            return;
        }
        
        if (checkedAttrs.value.length > 0) {
            filterParams.extraAttrIds = checkedAttrs.value.filter((item) => !!item).join(",");
        }
        
        switch (props.type) {
            case "exchange":
                result = await addExchangeToCart(filterParams);
                break;
            default:
                filterParams.salesmanId = salesmanId > 0 ? salesmanId : undefined;
                result = await addToCart(filterParams);
        }
        
        // 触发加入购物车成功事件
        addCard();
        uni.showToast({ 
            title: t("加入购物车成功"), 
            icon: 'success',
            duration: 1500 
        });
        
        // 5秒后清理缓存，给后端时间处理
        const cacheItem = { productId: props.modelValue, skuId: finalSkuId };
        setTimeout(() => {
            const index = localCartCache.value.findIndex(item => {
                const cacheSkuId = item.skuId === null ? 0 : item.skuId;
                const finalSkuIdNormalized = finalSkuId === null ? 0 : finalSkuId;
                return item.productId === cacheItem.productId && cacheSkuId === finalSkuIdNormalized;
            });
            if (index > -1) {
                console.log('Cleaning cache item:', localCartCache.value[index]);
                localCartCache.value.splice(index, 1);
            } else {
                console.log('Cache item not found for cleanup:', cacheItem);
            }
        }, 5000);
        
    } catch (error: any) {
        console.error('performAddToCart error:', error);
        
        // 出错时从本地缓存中移除
        const index = localCartCache.value.findIndex(item => {
            const cacheSkuId = item.skuId === null ? 0 : item.skuId;
            const finalSkuIdNormalized = finalSkuId === null ? 0 : finalSkuId;
            return item.productId === props.modelValue && cacheSkuId === finalSkuIdNormalized;
        });
        if (index > -1) {
            console.log('Removing cache item due to error:', localCartCache.value[index]);
            localCartCache.value.splice(index, 1);
        } else {
            console.log('Cache item not found for error removal, clearing all cache');
            // 如果找不到对应的缓存项，为了安全起见，清空所有缓存
            localCartCache.value = [];
        }
        
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
                        closePopup();
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
    }
};

const handleBuyNow = async () => {
    if (productStock.value === 0) {
        uni.showToast({ title: t("商品已售罄"), icon: "none", duration: 1500 });
        return;
    }
    
    
    
    try {
        const configStore = useConfigStore();
        
        if (configStore.closeOrder === 1) {
            uni.showToast({ title: t("商城已关闭下单"), icon: "none", duration: 1500 });
            return;
        }
        
        const salesmanId = getSalemanId(props.modelValue);
        let result: any = {};
        const filterParams: any = {
            id: props.modelValue,
            number: productNumber.value,
            skuId: currentSku.value?.skuId || null,
            isQuick: 1 // 立即购买是快速购买
        };
        
        console.log('handleBuyNow - API params:', filterParams);
        console.log('handleBuyNow - currentSku details:', currentSku.value);
        
        // 对于有规格的商品，确保 skuId 不为 null
        if (specificationList.value.length > 0 && !filterParams.skuId) {
            uni.showToast({ title: t("请选择商品规格"), icon: "none", duration: 1500 });
            return;
        }
        
        if (checkedAttrs.value.length > 0) {
            filterParams.extraAttrIds = checkedAttrs.value.filter((item) => !!item).join(",");
        }
        
        switch (props.type) {
            case "exchange":
                result = await addExchangeToCart(filterParams);
                break;
            default:
                filterParams.salesmanId = salesmanId > 0 ? salesmanId : undefined;
                result = await addToCart(filterParams);
        }
        
        // 关闭弹窗
        closePopup();
        
        // 跳转到订单确认页面
        uni.navigateTo({ url: `/pages/order/check?flowType=${result.flowType}` });
        
    } catch (error: any) {
        console.error('handleBuyNow error:', error);
        
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
                        closePopup();
                        uni.navigateTo({ url: '/pages/cart/cartJump' });
                    } else {
                        // 用户选择加入购物车，执行添加操作
                        const skuIdForAdd = currentSku.value?.skuId || null;
                        performAddToCart(skuIdForAdd);
                    }
                }
            });
        } else {
            uni.showToast({ title: error.message, icon: "none", duration: 1500 });
        }
    }
};

// 检查购物车中是否已存在相同的商品和SKU组合
const checkDuplicateInCart = async (productId: number, skuId: number | null): Promise<boolean> => {
    try {
        console.log('Fetching cart data for duplicate check...');
        const cartResponse: CartResponse = await getCart();
        
        console.log('Cart response:', cartResponse);
        
        // 检查响应结构
        if (!cartResponse || !cartResponse.data) {
            console.log('No cart data available');
            return false;
        }
        
        const cartData = cartResponse.data;
        
        if (!cartData.cartList || !Array.isArray(cartData.cartList)) {
            console.log('Cart list is empty or invalid');
            return false;
        }
        
        console.log(`Checking for duplicates: productId=${productId}, skuId=${skuId}`);
        
        // 检查所有购物车商店中的商品
        for (const shop of cartData.cartList) {
            if (!shop.carts || !Array.isArray(shop.carts)) {
                continue;
            }
            
            for (const cartItem of shop.carts) {
                // 处理SKU ID的比較，保持与本地缓存检查一致的逻辑
                const cartSkuId = cartItem.skuId === null ? 0 : cartItem.skuId;
                const checkSkuId = skuId === null ? 0 : skuId;
                
                console.log(`Comparing: cart item (productId=${cartItem.productId}, skuId=${cartItem.skuId}->${cartSkuId}) vs checking (productId=${productId}, skuId=${skuId}->${checkSkuId})`);
                
                if (cartItem.productId === productId && cartSkuId === checkSkuId) {
                    console.log('Duplicate found in remote cart!');
                    return true;
                }
            }
        }
        
        console.log('No duplicates found');
        return false;
    } catch (error) {
        console.error('检查购物车重复项时出错:', error);
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

const __getProductDetail = async () => {
    try {
        let result: any = {};
        switch (props.type) {
            case "exchange":
                result = await getExchangeDetail(props.modelValue);
                exchangeDetail.value = result.exchangeInfo;
                productStock.value = result.exchangeInfo.productStock;
                productPrice.value = exchangeDetail.value.discountsPrice || "0";
                productImage.value = exchangeDetail.value.picUrl || "";
                break;
            default:
                result = await getProductDetail(props.modelValue);
                productStock.value = result.item.productStock;
                productPrice.value = result.item.productPrice || "0";
                productImage.value = result.item.picUrl || "";
        }
        productType.value = result.item.productType;
        productIsBuy.value = result.item.isBuy;
        productName.value = result.item.productName || "";
        specificationList.value = result.attrList.spe;
        additionAttribute.value = result.attrList.extra;
        skuList.value = result.skuList;

        if (isB2B() && skuList.value.length > 1) {
            getBatchProductAvailabilityList();
        }

        setDefaultValue();
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
        emit("loadEnd");
    }
};

const reset = () => {
    productNumber.value = 1;
    checkedValue.value = [];
    currentSku.value = {} as SkuList;
    checkedAttrs.value = [];
    tabIndex.value = 0;
    // 清理本地缓存，防止不同商品间的干扰
    localCartCache.value = [];
    // 重置加载状态
    isAddingToCart.value = false;
};

const firstLoad = ref(false);

watch(
    () => props.modelValue,
    (newValue) => {
        // console.log("newValue", newValue);
        if (newValue && newValue > 0) {
            reset();
            firstLoad.value = true;
            __getProductDetail();
        }
    },
    {
        immediate: true
    }
);

const setDefaultValue = () => {
    if (specificationList.value.length > 0 && skuList.value.length > 0) {
        if (props.skuId > 0) {
            // 如果有指定的skuId，设置为默认选中
            const skuItem = skuList.value.find((item: SkuList) => item.skuId === props.skuId);
            if (skuItem) {
                const skuAttrs = skuItem.skuValue.split(":");
                checkedValue.value = [...skuAttrs];
                
                // 更新界面选中状态
                specificationList.value.forEach((item: any, index) => {
                    item.attrList.forEach((subItem: any) => {
                        subItem.checked = false;
                        const attrValue = `${subItem.attrName}:${subItem.attrValue}`;
                        if (skuAttrs[index] === attrValue) {
                            subItem.checked = true;
                            if (index === 0) {
                                productImage.value = subItem.attrPic || productImage.value;
                            }
                        }
                    });
                });
                
                currentSku.value = skuItem;
                console.log('setDefaultValue - set currentSku from props.skuId:', currentSku.value);
            }
        } else {
            // 有规格但没有指定skuId，不自动选择，等待用户手动选择
            specificationList.value.forEach((item: any) => {
                item.attrList.forEach((subItem: any) => {
                    subItem.checked = false;
                });
            });
            checkedValue.value = [];
            currentSku.value = {} as SkuList;
            console.log('setDefaultValue - waiting for user to select specifications');
        }
    } else if (skuList.value.length > 0) {
        // 没有规格但有SKU的情况
        currentSku.value = skuList.value[0];
        console.log('setDefaultValue - no specs, set currentSku to first SKU:', currentSku.value);
    }
    loadSkuPrice();
};
const handleChecked = (index: number, subIdx: number) => {
    const checkedItem = specificationList.value[index].attrList[subIdx];
    if (index === 0) {
        productImage.value = checkedItem.attrPic;
    }
    
    // 根据当前选择构建完整的SKU值
    const newSkuParts: string[] = [];
    
    specificationList.value.forEach((spec: any, specIndex: number) => {
        if (specIndex === index) {
            // 当前点击的属性
            newSkuParts.push(`${checkedItem.attrName}:${checkedItem.attrValue}`);
        } else {
            // 其他已选择的属性
            const selectedItem = spec.attrList.find((item: any) => item.checked);
            if (selectedItem) {
                newSkuParts.push(`${selectedItem.attrName}:${selectedItem.attrValue}`);
            } else {
                // 如果没有选择，使用第一个
                const firstItem = spec.attrList[0];
                newSkuParts.push(`${firstItem.attrName}:${firstItem.attrValue}`);
            }
        }
    });
    
    checkedValue.value = newSkuParts;
    updateValue();
    loadSkuPrice();
};

const updateValue = () => {
    
    specificationList.value.forEach((item: any, index: number) => {
        const checkedItem = checkedValue.value[index];
        item.attrList.forEach((value: any) => {
            const attrNameValue = `${value.attrName}:${value.attrValue}`;

            value.checked = checkedItem === attrNameValue;

            const skuValue = [...checkedValue.value];

            skuValue[index] = attrNameValue;

            const result = skuList.value.find((item: any) => item.skuValue === skuValue.join("|"));

            value.skuStock = result ? result.skuStock : 0;
        });
    });

    const searchKey = checkedValue.value.join(":");
    const selectedItem: any = skuList.value.find((item: any) => item.skuValue == searchKey);
    
    if (selectedItem) {
        currentSku.value = selectedItem;
    }
};

interface FilterParams {
    id: number;
    skuId?: number | null;
    extraAttrIds?: string;
}
const filterParams = reactive<FilterParams>({
    id: 0
});

const skuStr = ref("");
const isSeckill = ref(0);
const promotionList = ref<SkuPromotion[]>([]);

const isDiscount = ref(0);

const loadSkuPrice = async () => {
    if (props.type) {
        firstLoad.value = false;
        emit("loadEnd");
        return;
    }

    if (props.modelValue) {
        filterParams.id = props.modelValue;
        filterParams.skuId = currentSku.value.skuId || null;
        filterParams.extraAttrIds = checkedAttrs.value.length > 0 ? checkedAttrs.value.filter((item) => !!item).join(",") : "";
        try {
            const result = await getProductSkuDetail(filterParams);
            productPrice.value = result.price;
            if (result.originPrice) {
                productOriginPrice.value = result.originPrice;
            }
            productStock.value = result.stock;
            if (checkedValue.value.length > 0) {
                skuStr.value = checkedValue.value.map((item: any) => item.split(":")[1]).join(" ");
            }

            // 是否存在营销活动
            if (result.promotion.length > 0) {
                promotionManage(result.promotion);
            }

            if (isSeckill.value && maxProductNumber.value > 0) {
                productNumber.value = productNumber.value > maxProductNumber.value ? maxProductNumber.value : productNumber.value;
            } else if (productStock.value === 0) {
                productNumber.value = 1;
            } else {
                productNumber.value = productNumber.value > productStock.value ? productStock.value : productNumber.value;
            }

            if (firstLoad.value) {
                sendValue();
            }
        } catch (error: any) {
            uni.showToast({
                title: error.message,
                icon: "none"
            });
        } finally {
            firstLoad.value = false;
            emit("loadEnd");
        }
    }
};

const seckillValue = ref({
    seckillEndTime: "",
    seckillSales: 0,
    seckillStock: 0
});
const discountValue = ref({
    discountEndTime: "",
    discountPrice: 0
});

// 营销活动管理
const promotionManage = (promotion: SkuPromotion[]) => {
    // 排除秒杀 & 限时折扣
    promotionList.value = promotion.filter((item: any) => item.type !== 1 && item.type !== 6);

    const seckillData = promotion.find((item: any) => item.type === 1);
    const discountData = promotion.find((item: any) => item.type === 6);

    // 判断限时折扣存在
    if (discountData) {
        isDiscount.value = 1;
        discountValue.value.discountEndTime = discountData.data.item.endTime!;
        discountValue.value.discountPrice = discountData.data.item.discountPrice!;
    } else {
        isDiscount.value = 0;
        discountValue.value = {
            discountEndTime: "",
            discountPrice: 0
        };
    }
    // 判断秒杀存在
    if (seckillData) {
        isSeckill.value = 1;
        seckillValue.value.seckillEndTime = seckillData.data.seckillEndTime!;
        seckillValue.value.seckillSales = seckillData.data.item.seckillSales!;
        seckillValue.value.seckillStock = seckillData.data.item.seckillStock!;
        maxProductNumber.value = seckillData.data.seckillLimitNum!;
        productStock.value = seckillData.data.item.seckillStock;
    } else {
        isSeckill.value = 0;
        seckillValue.value = {
            seckillEndTime: "",
            seckillSales: 0,
            seckillStock: 0
        };
    }
};

const sendValue = () => {
    emit("sendValue", {
        productOriginPrice: productOriginPrice.value,
        productPrice: productPrice.value,
        productStock: productStock.value,
        productNumber: productNumber.value,
        productSkuId: currentSku.value.skuId,
        skuStr: skuStr.value,
        isSeckill: isSeckill.value,
        seckillValue: seckillValue.value,
        promotionList: promotionList.value,
        isDiscount: isDiscount.value,
        discountValue: discountValue.value
    });
};

const handlePopupClose = () => {
    closePopup();
};

const addCard = () => {
    closePopup();
    setTimeout(() => {
        emit("addCardSucceed", true);
    }, 500);
};

const handleOverlimit = (event: string) => {
    if (event === "minus") {
        uni.$u.toast(t("商品数量不能小于1"));
    }
    if (event === "plus") {
        uni.$u.toast(t("库存不足"));
    }
};

// b2b
const getBatchProductAvailabilityList = async () => {
    try {
        const skuIds = skuList.value.map((item: SkuList) => item.skuId).join(",");
        const result = await getBatchProductAvailability({ skuIds });
        b2bSkuList.value = skuList.value.map((sku: SkuList) => {
            const newSku = {
                ...sku,
                num: 0,
                title: sku.skuValue.replace(/\|/g, ",")
            };

            const skuId = sku.skuId.toString();
            if (result[skuId]) {
                Object.assign(newSku, {
                    price: result[skuId].price,
                    stock: result[skuId].stock
                });
            }

            return newSku;
        });
    } catch (error) {
        console.error(error);
    }
};

const isBatch = computed(() => {
    return isB2B() && tabIndex.value === 1;
});
const tabIndex = ref(0);
const handleTabChange = (index: number) => {
    tabIndex.value = index;
};
const skuItem = ref<any>([]);
let delayTimer: number | null = null;
const handleNumberChange = () => {
    if (delayTimer) {
        clearTimeout(delayTimer);
    }
    delayTimer = setTimeout(() => {
        const skus = b2bSkuList.value.filter((item: any) => item.num);
        skuItem.value = skus.map((item: any) => {
            return {
                skuId: item.skuId,
                num: item.num
            };
        });
        __getProductAmount();
    }, 300);
};
const productAmount = ref<ProductAmountItem>({
    count: 0,
    total: "0"
} as ProductAmountItem);
const __getProductAmount = async () => {
    try {
        const result = await getProductAmount({
            id: props.modelValue,
            skuItem: skuItem.value
        });
        productAmount.value = result;
    } catch (error) {
        console.error(error);
    }
};

const height = computed(() => {
    return isB2B() ? "75vh" : "65vh";
});
const paddingBottom = computed(() => {
    return `calc(${isB2B() && tabIndex.value === 1 ? "150rpx" : "100rpx"} + 15px + var(--safe-bottom))`;
});

defineExpose({
    handleShowPopup
});
</script>

<style lang="scss" scoped>
.placeholder {
    background-color: #f7f8fa;
    padding: 10rpx;
}

.tab {
    width: 100%;
    display: flex;
    position: relative;
    .line,
    .subline {
        position: absolute;
        width: 50%;
        height: 2px;
        background-color: var(--general);
    }
    .line {
        top: 0;
    }
    .subline {
        bottom: 0;
        height: 1px;
        background-color: #eee;
    }

    .tab-item {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        font-size: 26rpx;
        font-weight: 500;
        position: relative;

        .image {
            width: 20rpx;
            height: 100%;
            position: absolute;
            top: 0;
        }
        &.active {
            color: var(--general);
        }
    }
}

.allskulist {
    padding: 0 20rpx;

    .allskulist-item {
        display: flex;
        align-items: center;
        padding-bottom: 25rpx;
        &:first-child {
            padding-top: 20rpx;
        }

        .left {
            font-size: 24rpx;
            flex: 1;
            .title {
                padding-bottom: 6rpx;
                padding-right: 40rpx;
            }

            .desc {
                display: flex;
                font-size: 22rpx;
                color: #c1c1c1;
                align-items: center;
                height: 35rpx;
                .line {
                    width: 1px;
                    height: 100%;
                    background-color: #dadada;
                    margin: 0 12rpx;
                    height: 16rpx;
                }
            }
        }
    }
}

.attribute {
    color: #333;
    .attribute-item {
        margin-bottom: 30rpx;
        .item-title {
            font-size: 28rpx;
            font-weight: 600;
            margin-bottom: 20rpx;
        }
        .item-content {
            display: flex;
            flex-wrap: wrap;
            font-size: 26rpx;
            gap: 20rpx;
            .item-attr {
                background-color: #f7f8fa;
                border-radius: 10rpx;
                overflow: hidden;
                padding: 10rpx 20rpx;
                line-height: 42rpx;
                &:first-child {
                    margin-left: 0;
                }
                &.checked {
                    color: #5F679A;
                    background-color: #EDEEFF;
                    border: 2rpx solid #5F679A;
                }
            }
        }
    }
}

.specification {
    //height: v-bind(height);
    height: 500px;
    padding-bottom: v-bind(paddingBottom);
    box-sizing: border-box;
}

.product-sku-box {
    padding: 30rpx 20rpx;
    .product-info {
        display: flex;
        width: 100%;
        .product-info-img {
            width: 180rpx;
            height: 180rpx;
            border-radius: 20rpx;
            overflow: hidden;
        }
        .info {
            margin-left: 20rpx;
            padding-top: 20rpx;
            width: calc(100% - 180rpx);
            position: relative;

            .ticket {
                background-color: var(--tag-bg);
                color: var(--tag-text);
                border-radius: 5rpx;
                white-space: nowrap;
                width: fit-content;
                padding: 5rpx;
                margin: 10rpx 0;
                .ticket-content {
                    font-size: 20rpx;
                }
            }

            .del-box {
                padding: 5rpx 0;
                display: template;
                font-size: 12px;
                color: #969799;
                text-decoration: line-through;
            }

            .price {
                color: var(--general);
                font-weight: bold;
                font-size: 36rpx;
                margin-bottom: 10rpx;
            }
            .name {
                color: $tig-color-grey;
                font-size: 24rpx;
            }
        }
        
        .stock-info {
            position: absolute;
            top: 180rpx;
            left: 212rpx;
            right: 0;
            font-size: 24rpx;
            color: #666666;
        }
    }
}

.product-sku-info {
    padding: 20rpx 20rpx 0 20rpx;
    box-sizing: border-box;
    .sku-item {
        margin-bottom: 30rpx;
        display: flex;
        flex-direction: column;
        gap: 20rpx;
        .tit {
            color: #1d1d1d;
            height: 33rpx;
            line-height: 32rpx;
            font-size: 27rpx;
        }
        .sku-tag {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            .tag {
                margin: 10rpx 20rpx 10rpx 0;
                background-color: #f7f8fa;
                color: #333;
                height: 55rpx;
                cursor: pointer;
                min-width: 60rpx;
                text-align: center;
                position: relative;
                border-radius: 10rpx;
                font-size: 24rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 10rpx;
                .tag-img {
                    width: 45rpx;
                    height: 45rpx;
                    box-sizing: content-box;
                    border-radius: 5rpx;
                    overflow: hidden;
                }

                .tag-text {
                    padding: 10rpx;
                }
            }
            .checked {
                color: #5F679A;
                background-color: #EDEEFF;
                border: 2rpx solid #5F679A;
            }
            .disabled {
                border: 1px dashed #eee;
                color: #000000;
                cursor: not-allowed;
                background-color: #f7f8fa;
            }
        }
    }

    .num-item {
        display: flex;

        align-items: center;
        justify-content: space-between;
        .tit {
            color: #1d1d1d;
            height: 33rpx;
            line-height: 32rpx;
            font-size: 27rpx;
        }

        .sku-num {
            :deep(.uni-numbox) {
                border: 1rpx solid $tig-color-grey;
                border-radius: 10rpx;
            }
            :deep(.uni-numbox-btns) {
                background-color: #fff !important;
                color: #333;
                border-radius: 10rpx;
            }
            :deep(.uni-numbox--text) {
                font-weight: 500 !important;
            }
            :deep(.uni-numbox__value) {
                background-color: #fff !important;
                color: #333;
                border-left: 1rpx solid $tig-color-grey;
                border-right: 1rpx solid $tig-color-grey;
            }
            .stock {
                font-size: 22rpx;
                margin-left: 30rpx;
                color: $tig-color-grey;
            }
            .green-txt {
                color: var(--general);
            }
            .red-txt {
                color: $tig-color-error;
            }
        }
    }
}

.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 88;
    background-color: #ffffff;
    width: 100%;
    padding-bottom: calc(var(--safe-bottom) + 15px);

    &.shadow {
        box-shadow: 0 0 10px rgba(125, 126, 128, 0.16);
    }

    .b2b-btn {
        .desc {
            padding: 0 20rpx;
            display: flex;
            height: 70rpx;
            justify-content: space-between;
            align-items: center;
            font-size: 26rpx;
            .num {
                color: var(--general);
                padding: 5rpx;
            }
            .price {
                display: flex;
                align-items: center;
            }
        }
    }

    .exchange-btn {
        width: 100%;
        padding: 0 20rpx;
        .btn {
            height: 80rpx;
            width: 100%;
            background: var(--general);
            border-radius: 100rpx;
            color: var(--main-text);
            line-height: 80rpx;
            text-align: center;
            color: #fff;
            font-size: 30rpx;
            font-weight: 500;
        }
    }

    .add_cart {
        width: 100%;
        display: flex;
        height: 80rpx;
        justify-content: center;
        .btn {
            flex: 1;
            text-align: center;
            line-height: 80rpx;
            height: 80rpx;
            color: #fff;
            font-size: 24rpx;
        }
        .cart {
            background: var(--vice-bg);
            border-radius: 100rpx 0 0 100rpx;
            color: var(--vice-text);
        }
        .buy {
            background: var(--general);
            border-radius: 0 100rpx 100rpx 0;
            color: var(--main-text);
        }
    }
    .custom-buttons {
        width: 100%;
        display: flex;
        height: 80rpx;
        justify-content: center;
        gap: 20rpx;
        padding: 0 20rpx;
    }
    
    .custom-single-btn {
        width: 100%;
        padding: 0 10rpx;
    }
    
    .custom-btn {
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        font-size: 30rpx;
        font-weight: 500;
        border-radius: 40rpx;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.disabled {
            background-color: #ddd;
            color: #aaa;
            opacity: 0.6;
            pointer-events: none;
        }
    }
    
    .custom-cart-btn {
        flex: 1;
        background: #FFFFFF;
        border: 2rpx solid #000000;
        color: #000000;
        
        &:active {
            opacity: 0.8;
            transform: scale(0.98);
        }
    }
    
    .custom-buy-btn,
    .custom-single-buy-btn {
        flex: 1;
        background: #3544BA;
        border: 2rpx solid #3544BA;
        color: #FFFFFF;
        
        &:active {
            opacity: 0.8;
            transform: scale(0.98);
        }
    }
    
    .custom-single-buy-btn {
        width: 100%;
        flex: none;
    }
}

.disabled-div {
    background-color: #ddd; // 灰色背景
    color: #aaa; // 灰色字体
    opacity: 0.6; // 降低透明度
    pointer-events: none;
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
</style>
