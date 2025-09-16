<template>
    <view class="shop-info-box">
        <view class="shop-info-title" @click="handleToShop">
            <view class="shop-info-title-left">
                <tig-image :src="shopInfo.shopLogo" />
            </view>
            <view class="shop-info-title-right">{{ shopInfo.shopTitle }}</view>
        </view>
        <view class="shop-follow-btn" :class="{ followed: shopInfo.collectShop }" @click="handleShopCollection">
            <text class="follow-btn-text">{{ collectText }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import type { ShopDetailItem } from "@/types/shop/shop";
import { shopCollection } from "@/api/shop/shop";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
    shopInfo: ShopDetailItem;
}
const props = defineProps<Props>();
const emit = defineEmits(["refreshShopDetail"]);

const collectText = computed(() => {
    return props.shopInfo.collectShop ? t("已关注") : t("+ 关注");
});

const handleShopCollection = () => {
    if (props.shopInfo.collectShop) {
        cancelCollect();
    } else {
        collect();
    }
};
const collect = async () => {
    try {
        const result = await shopCollection({ shopId: props.shopInfo.shopId });
        uni.showToast({
            title: t("关注成功")
        });
        emit("refreshShopDetail", props.shopInfo.shopId);
    } catch (error) {
        console.error(error);
    }
};
const cancelCollect = async () => {
    uni.showModal({
        title: t("提示"),
        content: t("确认要取消关注店铺吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    const result = await shopCollection({ shopId: props.shopInfo.shopId });
                    uni.showToast({
                        title: t("操作成功")
                    });
                    emit("refreshShopDetail", props.shopInfo.shopId);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    });
};
const handleToShop = () => {
    uni.navigateTo({
        url: `/pages/shop/index?shopId=${props.shopInfo.shopId}`
    });
};
</script>

<style lang="scss" scoped>
.shop-info-box {
    background-color: #fff;
    padding: 30rpx;
    border-radius: 25rpx;
    margin-top: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .shop-info-title {
        display: flex;
        align-items: center;
        flex: 1;
        cursor: pointer;

        .shop-info-title-left {
            width: 80rpx;
            height: 80rpx;
            overflow: hidden;
            border-radius: 50%;
            margin-right: 20rpx;
        }

        .shop-info-title-right {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
        }
    }

    .shop-follow-btn {
        position: relative;
        display: block;
        background: #3544BA;
        border: 2rpx solid #3544BA;
        border-radius: 30rpx;
        overflow: hidden;
        box-sizing: border-box;
        height: 60rpx;
        line-height: 60rpx;
        padding: 0 24rpx;
        white-space: nowrap;
        font-size: 26rpx;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        cursor: pointer;
        
        .follow-btn-text {
            font-size: 26rpx;
            color: #fff;
        }
        
        // 已关注状态的样式
        &.followed {
            background: rgba(53, 68, 186, 0.1);
               background: #D6D6D6;
                border-color: #D6D6D6;
                color: #D6D6D6;
            
            .follow-btn-text {
                color: #ffffff;
            }
        }
    }
}
</style>
