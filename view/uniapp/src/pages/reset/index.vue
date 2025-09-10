<template>
    <view>
        <tig-layout>
            <!-- 返回按钮 -->
            <view class="back-button" @click="goBack">
                <image src="/static/images/common/trolley_icon_back@3x.png" class="back-icon" />
            </view>
            
            <view class="reset-container">
                <!-- 品牌标识区域 -->
                <view class="brand-section">
                    <view class="brand-logo">SANKUWA</view>
                    <view class="brand-subtitle">森酷玩电商商户平台</view>
                </view>
                
                <!-- 找回密码表单卡片 -->
                <view class="reset-card">
                    <view class="reset-title">{{ $t("找回密码") }}</view>
                    
                    <block v-if="step === 1">
                        <stepOne v-model:step="step" v-model:mobile-key="mobileKey" />
                    </block>
                    <up-transition :show="step === 2" :mode="'fade-left'">
                        <stepTow v-model:step="step" v-model:mobile-key="mobileKey" />
                    </up-transition>
                </view>
            </view>
        </tig-layout>
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import stepOne from "./src/stepOne.vue";
import stepTow from "./src/stepTow..vue";

const step = ref(1);
const mobileKey = ref("");

const goBack = () => {
    uni.navigateBack();
};
</script>

<style>
page {
    background: #fff;
    min-height: 100vh;
}
</style>

<style lang="scss" scoped>
/* 返回按钮样式 */
.back-button {
    position: absolute;
    top: 60rpx;
    left: 40rpx;
    width: 60rpx;
    height: 60rpx;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-icon {
    width: 40rpx;
    height: 40rpx;
}

/* 重置密码容器 */
.reset-container {
    padding: 0 40rpx;
    min-height: 100vh;
    background: #ffffff;
}

/* 品牌标识区域 */
.brand-section {
    text-align: center;
    margin-top: 180rpx;
    margin-bottom: 80rpx;
    background: transparent;
}

.brand-logo {
    font-size: 57rpx;
    font-weight: bold;
    color: #232323;
    letter-spacing: 2rpx;
    margin-bottom: 20rpx;
    background: transparent;
}

.brand-subtitle {
    font-size: 32rpx;
    color: #232323;
    letter-spacing: 5rpx;
    background: transparent;
}

/* 找回密码表单卡片 */
.reset-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 60rpx 20rpx;
    margin-bottom: 40rpx;
}

.reset-title {
    font-size: 38rpx;
    font-weight: bold;
    color: #232323;
    text-align: center;
    margin-bottom: 40rpx;
    position: relative;
    top: -30px;
    background: transparent;
}

/* 继承原有样式 */  
.btn2-css3 {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    padding: 0;
    font-size: 36rpx;
    font-weight: normal;
}

.placeholder {
    font-size: 28rpx;
    font-weight: normal;
}
</style>
