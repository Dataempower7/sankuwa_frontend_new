<template>
    <view @click="handleShowPopup">
        <slot />
    </view>
    <tig-popup v-model:show="showPopup" :z-index="999" :show-close="false" @close="handlePopupClose">
        <scroll-view scroll-y="true" class="specification">
            <view class="product-sku-box flex justify-between">
                <view class="product-info">
                    <view class="product-info-img" @click="handlePreviewImg(productImage)">
                        <tig-image :src="productImage" />
                    </view>
                    <view class="info">
                        <view class="price">
                            <template v-if="type === 'exchange'">
                                <view class="exchange-box">
                                    <format-price :font-style="{ fontSize: '32rpx' }" :currency-style="{
                                            fontSize: '22rpx'
                                    }" :decimals-style="{
                                            fontSize: '25rpx'
                                    }" :price-data="productPrice" />
                                    <text class="exchange-icon">+</text>
                                    <image class="exchange-img" :src="staticResource('exchange/exchange.png')" />
                                    <text class="exchange-text">{{ exchangeDetail.exchangeIntegral }}</text>
                                </view>
                            </template>
                            <template v-else>
                                <format-price :font-style="{ fontSize: '32rpx' }" :currency-style="{
                                        fontSize: '22rpx'
                                }" :decimals-style="{
                                        fontSize: '24rpx'
                                }" :price-data="productPrice" />
                            </template>
                        </view>
                        <template v-if="isDiscount || isSeckill">
                            <view class="ticket">
                                <view class="ticket-content">{{ isSeckill ? $t("秒杀价") : $t("限时折扣") }}</view>
                            </view>
                        </template>
                        <template v-if="productOriginPrice && Number(productOriginPrice) > Number(productPrice)">
                            <view class="del-box">
                                <format-price :is-bottom="false" :price-data="productOriginPrice"
                                    :font-style="{ 'text-decoration': 'line-through' }" />
                            </view>
                        </template>
                        <view class="name line2">
                            {{ productName }}
                        </view>
                    </view>
                </view>
                <view class="popup-close" @click="closePopup">
                    <uni-icons type="closeempty" size="24" style="color: #c8c9cc" />
                </view>
            </view>
            <template v-if="isB2B() && skuList.length > 1 && configStore.bulkPurchase === 1 && productType !== 4">
                <view class="placeholder" />
                <view class="tab">
                    <view class="tab-item" :class="{ active: tabIndex === 0 }" @click="handleTabChange(0)">
                        {{ $t("单品采购") }}
                        <image v-show="tabIndex === 1" class="image" style="right: 0"
                            :src="staticResource('product/shadow-right.png')" />
                    </view>
                    <view class="tab-item" :class="{ active: tabIndex === 1 }" @click="handleTabChange(1)">
                        {{ $t("批量采购") }}
                        <image v-show="tabIndex === 0" class="image" style="left: 0"
                            :src="staticResource('product/shadow-left.png')" />
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
                                <!-- v-if="getSkuItemVisible(value.attrName, value.attrValue)" -->
                                <view
                                    :class="'tag ' + (value.checked ? 'checked ' : '' + (value.skuStock == 0 ? 'disabled' : ''))"
                                    @click="handleChecked(index, subIdx)">
                                    <view v-if="value.attrPicThumb && index === 0" class="tag-img"><tig-image
                                            :src="value.attrPicThumb" /></view>
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
                                <view class="stock">{{ $t("限购") }}：<text style="color: var(--general)">{{
                                    maxProductNumber }}{{ $t("件") }}</text>
                                </view>
                            </template>
                            <!-- 如果有拼团信息，且拼团限购了 -->
                            <template v-else-if="isGroupon && grouponEnable && maxProductNumber > 0">
                                <tig-number-box v-model="productNumber" :min="1" :max="maxProductNumber"
                                    @overlimit="handleOverlimit" />
                                <view class="stock">{{ $t("限购") }}：<text style="color: var(--general)">{{
                                    maxProductNumber }}{{ $t("件") }}</text>
                                </view>
                            </template>
                            <template v-else>
                                <tig-number-box v-model="productNumber" :min="1" :max="productStock"
                                    @overlimit="handleOverlimit" />
                                <view class="stock">{{ $t("库存") }}：<text v-if="productStock > 50"
                                        style="color: #3544BA">{{ $t("充足") }}</text>
                                    <text v-else-if="productStock === 0" style="color: var(--general)">{{ $t("缺货")
                                        }}</text>
                                    <text v-else style="color: #ff4c4c">{{ $t("仅剩") }}{{ productStock }}件</text>
                                </view>
                            </template>
                        </view>
                    </view>
                </view>
            </view>
            <view v-show="isBatch">
                <template v-if="skuList.length > 1">
                    <view class="allskulist">
                        <template v-for="item in b2bSkuList" :key="item.skuId">
                            <view class="allskulist-item">
                                <view class="left">
                                    <view class="title line2">{{ item.title }}</view>
                                    <view class="desc">
                                        <view class="price">
                                            <format-price :price-data="item.price" />
                                        </view>
                                        <view class="line" />
                                        <view class="stock">库存：{{ item.stock }}</view>
                                    </view>
                                </view>
                                <view class="right">
                                    <tig-number-box v-model="item.num" :button-width="30" :min="0" :max="item.skuStock"
                                        @change="handleNumberChange()" />
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
                                    <view class="item-attr"
                                        :class="{ checked: checkedAttrs[index] === subItem.attributesId }"
                                        @click.stop="handleAttrClick(index, subItem.attributesId)">
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
            <!-- 开团阶梯 如果是阶梯团渲染出来 -->
            <view v-if="isGroupon && grouponEnable && grouponInfo.groupType === 2
                && currentSkuGrouponLaders.length" class="product-sku-info">
                <view class="sku-item">
                    <view class="tit">{{ $t('阶梯') }}</view>
                    <view class="sku-tag flex">
                        <view v-for="lader in currentSkuGrouponLaders" class="tag"
                            :class="{ 'checked': currentGroupNumKey === lader.grouponNumKey }"
                            @click="handleSkuLaderChange(lader)">
                            <text class="tag-text">{{ lader.grouponNum }}{{ $t('人团') }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <template v-if="!(productType === 4 && productIsBuy === 1)">
            <view class="footer" :class="{ shadow: isBatch }">
                <template v-if="isBatch">
                    <view class="b2b-btn">
                        <view class="desc">
                            <view>已选<text class="num">{{ productAmount.count }}</text>件</view>
                            <view class="price">
                                <view>商品金额：</view>
                                <format-price :font-style="{ fontSize: '32rpx', color: 'var(--general)' }"
                                    :currency-style="{
                                        fontSize: '22rpx',
                                        color: 'var(--general)'
                                    }" :decimals-style="{
                                        fontSize: '25rpx',
                                        color: 'var(--general)'
                                    }" :price-data="productAmount.total" />
                            </view>
                        </view>
                        <view class="add_cart">
                            <buy :id="Number(modelValue)" :disabled="skuItem.length === 0" :sku-item="skuItem"
                                :extra-attr-ids="filterParams.extraAttrIds" @callback="addCard">
                                <view class="btn cart" :class="skuItem.length === 0 ? 'disabled-div' : ''">{{
                                    $t("批量加入购物车") }}</view>
                            </buy>
                            <buy :id="Number(modelValue)" :sku-item="skuItem" :disabled="skuItem.length === 0"
                                :extra-attr-ids="filterParams.extraAttrIds" :is-quick="true" @callback="closePopup">
                                <view class="btn buy-right" :class="skuItem.length === 0 ? 'disabled-div' : ''">{{
                                    $t("立即购买") }}</view>
                            </buy>
                        </view>
                    </view>
                </template>
                <template v-else>
                    <template v-if="type === 'exchange'">
                        <view class="exchange-btn">
                            <buy :id="exchangeDetail.id" :sku-id="currentSku.skuId" :disabled="productStock == 0"
                                :extra-attr-ids="filterParams.extraAttrIds" :number="productNumber" :is-quick="true"
                                :type="type" @callback="closePopup">
                                <view class="btn" :class="productStock === 0 ? 'disabled-div' : ''">{{ $t("立即兑换") }}
                                </view>
                            </buy>
                        </view>
                    </template>
                    <template v-else>
                        <template v-if="productType === 1">
                            <view v-if="grouponEnable && isGroupon" class="groupon-btn">
                                <buy :id="Number(modelValue)" :sku-id="currentSku.skuId" :disabled="productStock == 0"
                                    :extra-attr-ids="filterParams.extraAttrIds" :number="productNumber"
                                    :groupon-data="grouponBuyData" :is-quick="true" @callback="handleGrouponBuyCallback">
                                    <view class="btn" :class="productStock === 0 ? 'disabled-div' : ''">{{
                                        $t("确定") }}</view>
                                </buy>
                                    </view>
                            <view v-else class="add_cart">
                                <buy :id="Number(modelValue)" :sku-id="currentSku.skuId" :disabled="productStock == 0"
                                    :extra-attr-ids="filterParams.extraAttrIds" :number="productNumber"
                                    @callback="addCard">
                                    <view class="btn cart" :class="productStock === 0 ? 'disabled-div' : ''">{{
                                        $t("加入购物车") }}</view>
                                </buy>
                                <buy :id="Number(modelValue)" :sku-id="currentSku.skuId" :disabled="productStock == 0"
                                    :extra-attr-ids="filterParams.extraAttrIds" :number="productNumber" :is-quick="true"
                                    @callback="closePopup">
                                    <view class="btn buy-right" :class="productStock === 0 ? 'disabled-div' : ''">{{
                                        $t("立即购买") }}</view>
                                </buy>
                                </view>
                        </template>
                        <template v-else>
                            <view class="exchange-btn">
                                <buy :id="modelValue" :sku-id="currentSku.skuId" :disabled="productStock == 0"
                                    :extra-attr-ids="filterParams.extraAttrIds" :number="productNumber" :is-quick="true"
                                    :type="type" @callback="closePopup">
                                    <view class="btn" :class="productStock === 0 ? 'disabled-div' : ''">{{ $t("立即购买") }}
                                    </view>
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
import { useConfigStore } from "@/store/config";
import type { SkuList, SkuPromotion, ProductAmountItem, GrouponDetail, GrouponPromotionItem } from "@/types/product/product";
import type { GrouponBuyData, GrouponLaderItem, GrouponSkuItem } from "@/types/groupon/groupon";
import { getProductDetail, getProductSkuDetail, getProductAmount, getBatchProductAvailability } from "@/api/product/product";
import { getExchangeDetail } from "@/api/exchange/exchange";
import buy from "@/components/product/buy.vue";
import { staticResource, isB2B } from "@/utils";
import { imageFormat } from "@/utils/format";
import { useI18n } from "vue-i18n";

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
    grouponEnable: { // 默认不传的情况是根据当前的产品是否有拼团活动来展示，如果传了false，则走默认的流程
        type: [Boolean],
        default: true
    },
    grouponRecordInfo: { // 拼团记录信息
        type: [Object],
        default: {
            grouponPromotionRecordId: 0,
            minGroupNum: 0
        }
    },
});

const emit = defineEmits(["sendValue", "addCardSucceed", "update:skuId", "loadEnd", "close"]);

const { t } = useI18n();

const configStore = useConfigStore();

const showPopup = ref(false);

const closePopup = () => {
    emit("close");
    sendValue();
    showPopup.value = false;
};

const handleGrouponBuyCallback = () => {
    closePopup();
};

const handleShowPopup = () => {
    showPopup.value = true;
};

const handlePreviewImg = (image: string) => {
    if (!image) return;

    let img = imageFormat(image);

        uni.previewImage({
        urls: [img],
        current: img
    });
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
const tabIndex = ref(0);
const isGroupon = ref(0);
const currentGroupNumKey = ref(0);

// 拼团活动详细信息
const grouponInfo = ref<GrouponDetail>({
    productId: 0,// 商品ID
    grouponPromotionId: 0,// 拼团活动 ID
    grouponPromotionItemId: 0,// 拼团活动商品 ID
    grouponDetailId: 0,
});
const grouponBuyData = ref<GrouponBuyData>({
    grouponPromotionId: 0,
    grouponPromotionItemId: 0,
    groupNumKey: 0,
    grouponDetailId: 0,
    price: 0,
    grouponPromotionRecordId: 0
});
// 拼团阶梯信息
const grouponSkus = ref<GrouponSkuItem[]>([]);
// 当前sku的拼团信息
const currentSkuGroupon = computed<GrouponSkuItem | undefined>(() => {
    if (!isGroupon.value) {
        return undefined;
    }
    if (!grouponSkus.value) {
        return undefined;
    }
    const currentSkuId = currentSku.value?.skuId || 0;
    const res = grouponSkus.value.find(item => item.skuId === currentSkuId);
    grouponBuyData.value.grouponDetailId = res?.grouponDetailId || 0;
    return res || undefined;
});
// 当前sku的拼团阶梯信息
const currentSkuGrouponLaders = computed<GrouponLaderItem[]>(() => {
    if (!isGroupon.value) {
        return [];
    }
    if (!currentSkuGroupon.value) {
        return [];
    }
    // 设置当前库存
    productStock.value = currentSkuGroupon.value.limitNum || 0;
    // 拿到当前阶梯
    const currentLader = currentSkuGroupon.value.laders.find(x => x.grouponNumKey === currentGroupNumKey.value);
    productPrice.value = currentLader?.price as string;
    // 设置当前拼团活动详情id
    grouponBuyData.value.grouponDetailId = currentSkuGroupon.value.grouponDetailId;
    // 如果传入的拼团记录id，则不显示拼团阶梯
    if (props.grouponRecordInfo.grouponPromotionRecordId) {
        return currentLader ? [currentLader] : [];
    }
    else {
        return currentSkuGroupon.value.laders || [];
    }
});

const handleAttrClick = (index: number, id: number) => {
    if (checkedAttrs.value[index] && checkedAttrs.value[index] === id) {
        checkedAttrs.value[index] = null;
            } else {
        checkedAttrs.value[index] = id;
    }
    loadSkuPrice();
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
                console.log('getProductDetail', result)
                productStock.value = result.item.productStock;
                productPrice.value = result.item.productPrice || "0";
                productImage.value = result.item.picUrl || "";
                grouponInfo.value = result.grouponDetail;
        }
        productType.value = result.item.productType;
        productIsBuy.value = result.item.isBuy;
        productName.value = result.item.productName || "";
        specificationList.value = result.attrList.spe;
        additionAttribute.value = result.attrList.extra;
        skuList.value = result.skuList;

        if (isB2B() && skuList.value.length > 1 && configStore.bulkPurchase === 1) {
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
};

const firstLoad = ref(false);
// 加载拼团信息
const loadGrouponInfo = () => {
    if (props.type) {
        firstLoad.value = false;
        emit("loadEnd");
        return;
    }

    if (!props.modelValue) {
        return;
    }

    // 如果产品库存为0
    if (productStock.value === 0) {
        return;
    }

    try {
        if (firstLoad.value) {
            // 拼团的产品价格就是原价
            productOriginPrice.value = productPrice.value;
            // 看是否有拼团价格
            if (grouponInfo.value.grouponPromotionDetails) {
                grouponBuyData.value.grouponPromotionId = grouponInfo.value.grouponPromotionId;
                grouponBuyData.value.grouponPromotionItemId = grouponInfo.value.grouponPromotionItemId;
                grouponSkus.value = grouponInfo.value.grouponPromotionDetails.map((skuItem: GrouponPromotionItem) => {
                    let skuGroupPrice;
                    // 拼团的阶梯信息
                    const grouponSkuItem: GrouponSkuItem = {
                        skuId: skuItem.skuId,
                        limitNum: skuItem.limitNum,
                        grouponDetailId: skuItem.grouponDetailId,
                        isJoin: skuItem.isJoin,
                        laders: []
                    }
                    // 拿到拼团价
                    if (skuItem.groupPrice) {
                        skuGroupPrice = JSON.parse(skuItem.groupPrice);
                    }
                    if (skuGroupPrice && skuGroupPrice.length) {
                        //  循环处理阶梯价格
                        grouponSkuItem.laders = skuGroupPrice.map((skuGroupPriceItem: AnyObject) => {
                            // 根据grouponNumKey找到拼团人数
                            const laderGrouponNum = grouponInfo.value.groupNums?.find((item: any) =>
                                item.groupNumKey === skuGroupPriceItem.groupNumKey
                            );
                            return {
                                grouponNumKey: skuGroupPriceItem.groupNumKey,
                                grouponNum: laderGrouponNum?.groupNum,
                                price: skuGroupPriceItem.price
                            };
                        })
                    }
                    return grouponSkuItem;
                });
            }
        }

        // 如果当前商品有参加拼团活动，则修改价格和库存
        if (grouponSkus.value && grouponSkus.value.length) {
            // 判断是否有参加拼团的信息
            const hasJoinGroupInfo = grouponSkus.value.some(item => item.isJoin);
            if (!hasJoinGroupInfo) {
                // 没有参加拼团，则走默认的sku价格
                isGroupon.value = 0;
                loadSkuPrice();
                return;
            }
            const currentSkuId = currentSku.value?.skuId || 0;
            // 拿到当前sku的拼团的库存
            const currentGrouponSku = grouponSkus.value.filter((item: any) => item.skuId === currentSkuId)[0];
            // 有当前sku的拼团信息，且当前sku有参团
            if (currentGrouponSku && currentGrouponSku.isJoin === 1) {
                // 如果库存小于产品库存，则修改库存
                if (currentGrouponSku.limitNum < productStock.value) {
                    productStock.value = currentGrouponSku.limitNum;
                }
                // 如果有传递拼团的信息进来
                let currentLader;
                if (props.grouponRecordInfo.minGroupNum) {
                    currentLader = currentGrouponSku.laders.find(x => x.grouponNum === props.grouponRecordInfo.minGroupNum);
                }
                else {
                    // 默认选中第一个lader的价格
                    currentLader = currentGrouponSku.laders[0];
                }
                // 有拿到阶梯信息
                if (currentLader) {
                    isGroupon.value = 1;
                    currentGroupNumKey.value = currentLader.grouponNumKey;
                    productPrice.value = currentLader.price as string;
                    grouponBuyData.value.groupNumKey = currentGroupNumKey.value;
                    grouponBuyData.value.price = currentLader.price as number;
                    grouponBuyData.value.grouponDetailId = currentGrouponSku.grouponDetailId;
                    grouponInfo.value.currentGroupNum = currentLader.grouponNum;
                    // 如果当前传了拼团的值
                    if (props.grouponRecordInfo.grouponPromotionRecordId) {
                        grouponBuyData.value.grouponPromotionRecordId = props.grouponRecordInfo.grouponPromotionRecordId;
                    }
                    // 如果有设置限购            
                    if (grouponInfo.value.orderLimitNum && grouponInfo.value.orderLimitNum > 0) {
                        maxProductNumber.value = grouponInfo.value.orderLimitNum > productStock.value ? productStock.value : grouponInfo.value.orderLimitNum;
                    }
                    if (checkedValue.value.length > 0) {
                        skuStr.value = checkedValue.value.map((item: any) => item.split(":")[1]).join(" ");
                    }
                }
                else {
                    // 没有参加拼团，则走默认的sku价格
                    isGroupon.value = 0;
                    loadSkuPrice();
                }
            }
            else {
                // 没有参加拼团，则走默认的sku价格
                isGroupon.value = 0;
                loadSkuPrice();
            }
            if (firstLoad.value) {
                sendValue();
            }
        }
        else {
            // 没有参加拼团，则走默认的sku价格
            isGroupon.value = 0;
            loadSkuPrice();
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
};

// 处理拼团阶梯变更事件
const handleSkuLaderChange = (lader: GrouponLaderItem) => {
    currentGroupNumKey.value = lader.grouponNumKey;
    productPrice.value = lader.price as string;
    // 设置拼团下单信息
    grouponBuyData.value.groupNumKey = currentGroupNumKey.value;
    grouponBuyData.value.price = lader.price as number;
    grouponInfo.value.currentGroupNum = lader.grouponNum;
    sendValue();
}

const setDefaultValue = () => {
    if (specificationList.value.length > 0) {
        if (props.skuId > 0) {
            const skuItem = skuList.value.find((item: SkuList) => item.skuId === props.skuId);
            if (skuItem) {
                const skuAttr = skuItem.skuValue.split("|");
                skuAttr.forEach((item: string, index: number) => {
                    checkedValue.value[index] = item;
                });
            }
        }
        if (checkedValue.value.length === 0) {
            // 设置默认选中值
            specificationList.value.forEach((item: any, index) => {
                item.attrList.forEach((subItem: any) => {
                    subItem.checked = false;
                });
                checkedValue.value[index] = item.attrList[0].attrName + ":" + item.attrList[0].attrValue;
                item.attrList[0].checked = true;
            });
            productImage.value = specificationList.value[0].attrList[0].attrPic;
        }
        updateValue();
    } else if (skuList.value.length > 0) {
        currentSku.value = skuList.value[0];
    }

    // 启用了拼团且有拼团活动
    if (props.grouponEnable && grouponInfo.value && grouponInfo.value.grouponPromotionItemId) {
        loadGrouponInfo();
    }
    else {
    loadSkuPrice();
    }
};

const getSkuItemVisible = (attrName: string, attrValue: string) => {
    // 不启用拼团，没有拼团活动，没有设置拼团信息不做处理,
    if (!props.grouponEnable || !isGroupon.value || !props.grouponRecordInfo?.grouponPromotionRecordId) {
        return true;
    }
    console.log('getSkuItemVisible')
    const skuValue = attrName + ':' + attrValue;
    const skus = currentSku.value.skuValue.split('|');
    return skus.some(item => item === skuValue);
};

const handleChecked = (index: number, subIdx: number) => {
    const checkedItem = specificationList.value[index].attrList[subIdx];
    if (index === 0) {
        productImage.value = checkedItem.attrPic;
    }
    checkedValue.value[index] = checkedItem.attrName + ":" + checkedItem.attrValue;
    updateValue();

    // 不启用拼团走默认逻辑
    if (!props.grouponEnable) {
        loadSkuPrice();
    }
    else {
        loadGrouponInfo();
    }
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

    const selectedItem: any = skuList.value.find((item: any) => item.skuValue == checkedValue.value.join("|"));
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

    if (!props.modelValue) {
        return;
    }

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
    // 排除秒杀 & 限时折扣 & 拼团
    promotionList.value = promotion.filter((item: any) => item.type !== 1 && item.type !== 6 && item.type !== 7);

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
        discountValue: discountValue.value,
        grouponValue: grouponInfo.value,
        isGroupon: isGroupon.value
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
    return isB2B() && tabIndex.value === 1 && productType.value !== 4;
});

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

watch(
    () => props.modelValue,
    (newValue) => {
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

watch(() => props.grouponEnable, (newValue) => {
    setDefaultValue();
})

watch(() => props.grouponRecordInfo.grouponPromotionRecordId, (newValue) => {
    setDefaultValue();
})

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
                    color: var(--general);
                    background-color: var(--vice-bg);
                }
            }
        }
    }
}

.specification {
    height: v-bind(height);
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

            .ticket {
                background: linear-gradient(130deg,#ff8853,#f52828);
                color: #fff;
                font-weight: 500;
                border-radius: 5rpx;
                white-space: nowrap;
                width: -moz-fit-content;
                width: fit-content;
                padding: 5rpx;
                margin: 10rpx 0 ;

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
                color: #c3c0c0;
                font-size: 24rpx;
            }
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
            color: #999;
            height: 33rpx;
            line-height: 32rpx;
            font-size: 24rpx;
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
                color: #5f679a;
                background-color: #edeeff;
                border: 2rpx solid #5F679A;
            }

            .disabled {
                border: 1px dashed #eee;
                color: #c8c9cc;
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
            color: #999;
            height: 33rpx;
            line-height: 32rpx;
            font-size: 24rpx;
        }

        .sku-num {
            :deep(.uni-numbox) {
                border: 1rpx solid #c3c0c0;
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
                border-left: 1rpx solid #c3c0c0;
                border-right: 1rpx solid #c3c0c0;
            }

            .stock {
                font-size: 22rpx;
                margin-left: 30rpx;
                color: #c3c0c0;
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

    .exchange-btn,
    .groupon-btn {
        width: 100%;
        padding: 0 20rpx;

        .btn {
            height: 80rpx;
            width: 100%;
            background: #3544BA;
            border-radius: 100rpx;
            color: white;
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
            width: 47vw;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
            color: #fff;
        font-size: 30rpx;
        font-weight: 500;
        }

        .cart {
            background: #fff;
            border-radius: 35rpx 0 0 35rpx;
            color: var(--vice-text);
            box-shadow: 0 2rpx 8rpx rgba(0,0,0,.25) ;
        }

        .buy-right {
            background: #3544ba;
            border-radius: 0 35rpx 35rpx 0;
            color: var(--main-text);
            box-shadow: 0 2rpx 8rpx rgba(0,0,0,.25);
        }
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
