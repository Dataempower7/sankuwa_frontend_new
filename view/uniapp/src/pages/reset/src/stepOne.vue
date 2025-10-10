<template>
    <!-- 手机号输入 -->
    <view class="input-group">
        <template v-if="configStore.isOpenMobileAreaCode">
            <view class="country-code">
                <tig-mobile-areacode
                    v-model="mobileAreaCode"
                    :label-style="{ fontSize: '28rpx' }"
                    :name-style="{ fontSize: '24rpx', padding: '0 2rpx 0 10rpx' }"
                    :box-style="{ paddingRight: '0' }"
                    :icon-style="{ fontSize: '22rpx' }"
                />
            </view>
            <view class="divider">|</view>
        </template>
        <template v-else>
            <view class="input-label">手机号</view>
            <view class="divider">|</view>
        </template>
        <input 
            type="number" 
            :value="mobile" 
            :placeholder="$t('请输入手机号')" 
            placeholder-class="custom-placeholder" 
            class="custom-input"
            maxlength="11"
            @input="mobileInput" 
        />
    </view>

    <!-- 验证码输入 -->
    <view class="input-group verification-group">
        <view class="input-label">验证码</view>
        <view class="divider">|</view>
        <input
            type="number"
            :placeholder="$t('手机短信验证码')"
            placeholder-class="custom-placeholder"
            :value="mobileCode"
            name="mobile_code"
            class="verification-input"
            maxlength="6"
            @input="mobileCodeInput"
        />
        <verificationCode
            v-model:is-checked="isChecked"
            v-model:verify-token-data="verifyToken"
            class="verification-btn"
            btn-type="text"
            :mobile="configStore.isOpenMobileAreaCode ? mobileAreaCode + mobile : mobile"
            event="forgetPassword"
            :request-api="sendMobileCode"
            @mobile-error-callback="mobileErrorCallback"
        />
    </view>

    <!-- 下一步按钮 -->
    <tig-button 
        :loading-text="$t('下 一 步')" 
        :loading="isLoading" 
        :disabled="isDisabled" 
        class="next-button"
        color="#2F3C51"
        style="border-radius: 8px; height: 45px; "
        :custom-style="{ marginTop: '50px' }"
        @click="handleNext"
    >
        {{ $t("下 一 步") }}
    </tig-button>

    <!-- 登录链接 -->
    <view class="login-link" @click="handleToLogin">
        {{ $t("立即登录") }}
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "@/store/config";
import { sendMobileCode, checkMobile } from "@/api/login/login";
import VerificationCode from "@/components/verificationCode/index.vue";

const mobileKey = defineModel("mobileKey");
const step = defineModel("step");
const mobileModel = defineModel("mobile");
const configStore = useConfigStore();
const { t } = useI18n();

const mobileAreaCode = ref("86");
const isChecked = ref(true);
const verifyToken = ref("");

const mobile = ref("");
const mobileInput = (e: any) => {
    // 只允许输入数字，最多11位
    const numericValue = e.detail.value.replace(/\D/g, '').slice(0, 11);
    mobile.value = numericValue;
};

const mobileCode = ref("");
const mobileCodeInput = (e: any) => {
    // 只允许输入数字，最多6位
    const numericValue = e.detail.value.replace(/\D/g, '').slice(0, 6);
    mobileCode.value = numericValue;
};
const mobileErrorCallback = (msg: string) => {
    uni.showToast({
        title: msg,
        duration: 1500,
        icon: "none"
    });
};

const isLoading = ref(false);
const isDisabled = computed(() => {
    return !mobile.value || !mobileCode.value || isLoading.value;
});

// 手机号校验函数
const validateMobile = (value: string) => {
    if (!value) {
        return t("手机号不能为空");
    }
    
    // 中国大陆手机号校验：11位数字，1开头，第二位为3-9
    const chinaPattern = /^1[3-9]\d{9}$/;
    
    if (!chinaPattern.test(value)) {
        return t("请输入正确的11位手机号");
    }
    
    return null;
};

// 验证码校验函数
const validateCode = (value: string) => {
    if (!value) {
        return t("验证码不能为空");
    } else if (value.length !== 6) {
        return t("请输入6位验证码");
    }
    
    return null;
};

const handleNext = async () => {
    // 手机号校验
    const mobileError = validateMobile(mobile.value);
    if (mobileError) {
        return uni.showToast({
            title: mobileError,
            duration: 1500,
            icon: "none"
        });
    }
    
    // 校验是否点击了获取验证码按钮
    if (!verifyToken.value) {
        return uni.showToast({
            title: t("请先点击获取验证码"),
            duration: 1500,
            icon: "none"
        });
    }
    
    // 验证码校验
    const codeError = validateCode(mobileCode.value);
    if (codeError) {
        return uni.showToast({
            title: codeError,
            duration: 1500,
            icon: "none"
        });
    }
    isLoading.value = true;
    try {
        const fullMobile = configStore.isOpenMobileAreaCode ? mobileAreaCode.value + mobile.value : mobile.value;
        const result = await checkMobile({
            mobile: fullMobile,
            code: mobileCode.value
        });
        // checkMobile 直接返回 mobileKey 字符串，而不是对象
        mobileKey.value = result;
        mobileModel.value = fullMobile;
        step.value = 2;
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            duration: 1500,
            icon: "none"
        });
    } finally {
        isLoading.value = false;
    }
};

const handleToLogin = () => {
    uni.navigateTo({
        url: "/pages/login/index"
    });
};
</script>   

<style lang="scss" scoped>
/* 输入框组样式 */
.input-group {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 8rpx;
    padding: 0 20rpx;
    height: 100rpx;
    margin: 0 -20rpx 32rpx -20rpx;
}

.country-code {
    width: 100rpx;
    margin-left: 10rpx;
}

.input-label {
    width: 100rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-left: 10rpx;
}

.divider {
    color: #5776B6;
    margin: 0 20rpx;
    font-size: 30rpx;
}

.custom-input {
    flex: 1;
    background: transparent;
    font-size: 28rpx;
    color: #333;
    border: none;
    outline: none;
}

.custom-placeholder {
    color: #c0c4cc;
    font-size: 28rpx;
}

/* 验证码相关样式 */
.verification-group {
    position: relative;
    overflow: visible;
}

.verification-input {
    flex: 1;
    background: transparent;
    font-size: 28rpx;
    color: #333;
    border: none;
    outline: none;
    margin-right: 20rpx;
    z-index: 1;
}

.verification-btn {
    min-width: 160rpx;
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 10;
    position: relative;
}

/* 覆盖验证码组件样式 */
:deep(.verify-btn) {
    color: #5A7BB3 !important;
    font-size: 28rpx !important;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
}

:deep(.box) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 按钮样式 */
.next-button {
    width: 100%;
    height: 85rpx;
    margin: 80rpx 0 24rpx 0;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 500;
}

/* 登录链接样式 */
.login-link {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    color: #6B81B6;
    font-size: 28rpx;
}
</style>
