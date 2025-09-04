<template>
    <view class="remark">
        <view class="remark-title">{{ $t("备注") }}</view>
        <view class="remark-content">
            <up-input
                v-model="remark"
                :placeholder="$t('填写订单备注(选填)')"
                border="none"
                input-align="right"
                maxlength="250"
                :clearable="true"
                @input="handleInput"
                @blur="handleBlur"
            />
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    }
});

const emit = defineEmits(["update:modelValue"]);

const remark = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        // 前端校验：限制250个字符
        if (val && val.length > 250) {
            val = val.substring(0, 250);
            uni.showToast({
                title: "备注不能超过250个字符",
                icon: "none",
                duration: 2000
            });
        }
        emit("update:modelValue", val);
    }
});

// 计算当前字符长度
const currentLength = computed(() => {
    return props.modelValue ? props.modelValue.length : 0;
});

// 判断是否接近字符限制（超过200字符时显示警告样式）
const isNearLimit = computed(() => {
    return currentLength.value > 200;
});

// 输入事件处理
const handleInput = (value: string) => {
    // 实时校验字符长度
    if (value.length > 250) {
        uni.showToast({
            title: "备注不能超过250个字符",
            icon: "none",
            duration: 1500
        });
    }
};

// 失焦事件处理
const handleBlur = () => {
    // 可以在这里添加额外的校验逻辑
    if (props.modelValue && props.modelValue.length > 250) {
        uni.showToast({
            title: "备注已超出字符限制，已自动截取",
            icon: "none",
            duration: 2000
        });
    }
};
</script>

<style lang="scss" scoped>
.remark {
    border-radius: 18rpx;
    background: #fff;
    padding: 30rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .remark-content {
        width: 550rpx;
        position: relative;

        .char-count {
            font-size: 24rpx;
            color: #999;
            text-align: right;
            margin-top: 10rpx;
            transition: color 0.3s ease;

            &.char-count-warning {
                color: #ff6b35;
                font-weight: 500;
            }
        }
    }
}
</style>
