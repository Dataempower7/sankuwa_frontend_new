<template>
    <!-- 新密码输入 -->
    <view class="input-group">
        <view class="input-label">新密码</view>
        <view class="divider">|</view>
        <input
            :type="passwordType[0]"
            :placeholder="$t('请输入新密码')"
            placeholder-class="custom-placeholder"
            class="custom-input"
            :value="fristPassword"
            maxlength="20"
            @input="changeFristPassword"
        />
        <view :class="'password-toggle iconfont ' + (passwordType[0] == 'text' ? 'icon-xianshi' : 'icon-yincang')" @click="passwordTypeChange(0)" />
    </view>

    <!-- 确认密码输入 -->
    <view class="input-group">
        <view class="input-label">确认密码</view>
        <view class="divider">|</view>
        <input
            :type="passwordType[1]"
            :placeholder="$t('请再次确认新密码')"
            placeholder-class="custom-placeholder"
            class="custom-input"
            :value="secondPassword"
            maxlength="20"
            @input="changeSecondPassword"
        />
        <view :class="'password-toggle iconfont ' + (passwordType[1] == 'text' ? 'icon-xianshi' : 'icon-yincang')" @click="passwordTypeChange(1)" />
    </view>

    <!-- 确认按钮 -->
    <tig-button 
        :loading-text="$t('确 认')" 
        :loading="isLoading" 
        :disabled="isDisabled" 
        class="confirm-button"
        color="#2F3C51" 
        style="border-radius: 8px; height: 45px;"
        @click="handleResetPassword"
    >
        {{ $t("确 认") }}
    </tig-button>

    <!-- 登录链接 -->
    <view class="login-link" @click="handleToLogin">
        {{ $t("立即登录") }}
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { forgetPassword } from "@/api/reset/reset";
const { t } = useI18n();

const mobileKey = defineModel("mobileKey");
const step = defineModel("step");

const passwordType = ref(["password", "password"]);
const passwordTypeChange = (index: number) => {
    passwordType.value[index] = passwordType.value[index] == "password" ? "text" : "password";
};

const fristPassword = ref("");
const changeFristPassword = (e: any) => {
    // 去除空格，限制长度20位
    const filteredValue = e.detail.value.replace(/\s/g, '').slice(0, 20);
    fristPassword.value = filteredValue;
};

const secondPassword = ref("");
const changeSecondPassword = (e: any) => {
    // 去除空格，限制长度20位
    const filteredValue = e.detail.value.replace(/\s/g, '').slice(0, 20);
    secondPassword.value = filteredValue;
};

const isLoading = ref(false);
const isDisabled = computed(() => {
    return !fristPassword.value || !secondPassword.value || isLoading.value;
});
const validatePassword = (value: string) => {
    if (!value) {
        return t("密码不能为空");
    } else if (value.length > 20 || value.length < 6) {
        return t("密码应为6-20位字符");
    } else if (/\s/.test(value)) {
        return t("密码中不允许有空格");
    } else if (/^\d+$/.test(value)) {
        return t("密码不能全为数字");
    } else if (!/^(?=.*[\d\W]).+$/.test(value)) {
        return t("密码不能全为字母");
    } else if (!/^(?=.*[a-zA-Z0-9]).+$/.test(value)) {
        return t("密码不能全为符号");
    } else if (!/^(?!([a-zA-Z0-9])\1*$).+$/.test(value)) {
        return t("密码不能全为相同字符或数字");
    }
};
const handleResetPassword = async () => {
    if (validatePassword(fristPassword.value)) {
        return uni.showToast({
            title: validatePassword(fristPassword.value),
            duration: 1500,
            icon: "none"
        });
    }
    if (fristPassword.value != secondPassword.value) {
        return uni.showToast({
            title: t("两次密码输入不一致"),
            duration: 1500,
            icon: "none"
        });
    }
    try {
        isLoading.value = true;
        const result = await forgetPassword({
            mobileKey: mobileKey.value,
            password: fristPassword.value //新密码
        });
        uni.showToast({
            title: t("重置密码成功"),
            duration: 1500,
            icon: "none"
        });
        setTimeout(() => {
            uni.navigateTo({
                url: "/pages/login/index?loginType=password"
            });
        }, 1500);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            duration: 1500,
            icon: "none"
        });
        step.value = 1;
        mobileKey.value = "";
        fristPassword.value = "";
        secondPassword.value = "";
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
    position: relative;
}

.input-label {
    width: 120rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-left: 10rpx;
    white-space: nowrap;
}

.divider {
    color: #5776B6;
    margin: 0 50rpx;
    font-size: 30rpx;
}

.custom-input {
    flex: 1;
    background: transparent;
    font-size: 28rpx;
    color: #333;
    border: none;
    outline: none;
    padding-right: 60rpx;
}

.custom-placeholder {
    color: #c0c4cc;
    font-size: 28rpx;
}

/* 密码显示/隐藏按钮 */
.password-toggle {
    position: absolute;
    right: 24rpx;
    color: #666;
    font-size: 32rpx;
    padding: 8rpx;
    z-index: 10;
    cursor: pointer;
}

/* 按钮样式 */
.confirm-button {
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
