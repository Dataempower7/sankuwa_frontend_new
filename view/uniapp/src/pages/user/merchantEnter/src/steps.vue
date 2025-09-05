<template>
    <view class="custom-steps">
        <view class="steps-container">
            <view
                v-for="(item, index) in props.stepList"
                :key="index"
                class="step-item"
                :class="{
                    'step-active': index === props.currentStep,
                    'step-completed': index < props.currentStep
                }"
            >
                <view class="step-circle"></view>
                <view class="step-title">{{ t(item) }}</view>

                <!-- 连接线：只在不是最后一个步骤时显示 -->
                <view
                    v-if="index < props.stepList.length - 1"
                    class="step-line"
                    :class="{
                        'line-completed': index < props.currentStep
                    }"
                ></view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
    currentStep: number;
    stepList: string[];
}

const props = withDefaults(defineProps<Props>(), {
    currentStep: 1,
    stepList: () => []
});
</script>

<style lang="scss" scoped>
.custom-steps {
    background-color: #fff;
    padding: 30rpx 20rpx;
    overflow: hidden;
}

.steps-container {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    padding: 0 20rpx;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
}

/* 连接线样式 - 统一高度 */
.step-line {
    position: absolute;
    top: 12rpx; /* 固定高度，所有连接线都在这个位置 */
    left: calc(50% + 14rpx); /* 从圆圈右边开始 */
    width: calc(100% - 28rpx); /* 连接到下一个圆圈左边 */
    height: 4rpx;
    background-color: #d1d5db; /* 默认灰色 */
    z-index: 1;
    transition: background-color 0.3s ease;
}

/* 已完成步骤的连接线为蓝色 */
.step-line.line-completed {
    background-color: #3544BA;
}

.step-circle {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    border: 0;
    background-color: #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 3;
    transition: all 0.3s ease;
    /* 确保所有圆圈中心都在同一水平线上 */
    margin-top: 2rpx;
}

.step-title {
    font-size: 24rpx;
    color: #999;
    text-align: center;
    line-height: 1.2;
    transition: all 0.3s ease;
}



/* 激活状态 - 空心圆圈 */
.step-item.step-active {
    .step-circle {
        width: 28rpx;
        height: 28rpx;
        border: 4rpx solid #3544BA;
        background-color: #fff;
        /* 调整位置确保中心对齐 */
        margin-top: 0rpx;
    }

    .step-title {
        color: #3544BA;
        font-weight: 500;
    }
}

/* 已完成状态 - 实心圆点 */
.step-item.step-completed {
    .step-circle {
        width: 20rpx;
        height: 20rpx;
        border: 0;
        background-color: #3544BA;
        /* 调整位置确保中心对齐 */
        margin-top: 4rpx;
    }

    .step-title {
        color: #3544BA;
        font-weight: 500;
    }
}


</style>
