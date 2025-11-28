<template>
    <view class="sold-out-box">
        <view v-if="showOutsale" class="outsale">{{ $t("已售罄") }}</view>
        <slot name="default" />
    </view>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps({
    showOutsale: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped lang="scss">
.sold-out-box {
    position: relative;
    .outsale {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 70%;
        height: 70%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.4);
        font-size: 24rpx;
        color: #ffffff;
        letter-spacing: 0;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9;
    }
}
</style>
