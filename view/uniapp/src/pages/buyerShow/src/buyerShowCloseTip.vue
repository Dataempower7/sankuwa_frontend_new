<template>
    <uni-popup ref="popupRef" type="center" :animation="false" :mask-click="false">
        <view class="popupBox">
            <view class="title">提醒</view>
            <view class="tip">买家秀功能已暂停使用，您仍可通过商品评价功能查看真实反馈</view>
            <view class="btn" @click="handleLink('home')">{{ $t("返回首页") }}</view>
        </view>
    </uni-popup>
</template>

<script setup lang="ts">
import { redirect } from "@/utils";
import { shallowRef, defineExpose } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const buyerShowEnabled = defineModel("buyerShowEnabled", {
    type: Number,
    default: 1
})

const handleLink = (type: string) => {
    if (type === "home") {
        redirect({ url: "/pages/index/index" });
    } else {
        // #ifdef H5
        history.back();
        // #endif

        // #ifndef H5
        uni.navigateBack();
        // #endif
    }
};

const popupRef = shallowRef();
const open = () => {
    popupRef.value?.open();
};

onLoad(() => {
    if (buyerShowEnabled.value !== 1) {
        setTimeout(() => {
            open()
        }, 100);
    }
});
</script>

<style scoped lang="scss">
.popupBox {
    padding: 45rpx 80rpx;
    box-sizing: border-box;
    font-size: 32rpx;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    width: 590rpx;
    height: 340rpx;
    background: #ffffff;
    border-radius: 16rpx;
    .title {
        text-align: center;
        font-weight: bold;
        font-size: 32rpx;
        color: #262626;
        margin-bottom: 40rpx;
    }
    .tip {
        font-weight: 500;
        font-size: 28rpx;
        color: #8c8c8c;
        margin-bottom: 76rpx;
        text-align: center;
    }
    .btn {
        text-align: center;
        // 下划线
        text-decoration: underline;
        color: var(--general);
        font-weight: 500;
        font-size: 28rpx;
    }
}
</style>
