<template>
        <view class="register-container">
            <!-- 返回按钮 -->
            <view class="back-button" @click="goBack">
                <image src="/static/images/common/trolley_icon_back@3x.png" class="back-icon" />
            </view>
            
            <!-- 品牌标识区域 -->
            <view class="brand-section">
                <view class="brand-logo">SANKUWA</view>
                <view class="brand-subtitle">森酷玩电商商户平台</view>
            </view>
            
            <!-- 注册表单卡片 -->
            <view class="register-card">
                <uni-forms ref="formRef" :model-value="formState" :rules="formRules" label-align="right">
                    <!-- 手机号输入 -->
                    <uni-forms-item label="" name="mobile">
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
                            <uni-easyinput
                                v-model="formState.mobile"
                                :input-border="false"
                                type="number"
                                maxlength="11"
                                class="uni-input custom-input"
                                placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                                placeholder-class="custom-placeholder"
                                :placeholder="$t('请输入手机号')"
                                primary-color="#409eff"
                                @input="onMobileInput"
                            />
                        </view>
                    </uni-forms-item>

                    <!-- 密码设置 -->
                    <uni-forms-item label="" name="password">
                        <view class="input-group">
                            <view class="input-label">设置密码</view>
                            <view class="divider">|</view>
                            <uni-easyinput
                                v-model="formState.password"
                                :clearable="false"
                                :input-border="false"
                                :trim="true"
                                type="password"
                                maxlength="20"
                                class="uni-input custom-input"
                                placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                                placeholder-class="custom-placeholder"
                                :placeholder="$t('请设置密码')"
                                primary-color="#409eff"
                                @input="onPasswordInput"
                            />
                        </view>
                    </uni-forms-item>

                    <!-- 验证码 -->
                    <uni-forms-item label="" name="mobile_code">
                        <view class="input-group verification-group">
                            <view class="input-label">验证码</view>
                            <view class="divider">|</view>
                            <uni-easyinput
                                v-model="formState.mobileCode"
                                :input-border="false"
                                type="number"
                                maxlength="6"
                                class="uni-input custom-input verification-input"
                                placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                                placeholder-class="custom-placeholder"
                                :placeholder="$t('请输入验证码')"
                                primary-color="#409eff"
                                @input="onCodeInput"
                            />
                            <VerificationCode
                                v-model:is-checked="isChecked"
                                v-model:verify-token-data="verifyToken"
                                class="verification-btn"
                                btn-type="text"
                                :mobile="configStore.isOpenMobileAreaCode ? mobileAreaCode + formState.mobile : formState.mobile"
                                :request-api="sendMobileCode"
                                @mobile-error-callback="mobileErrorCallback"
                            />
                        </view>
                    </uni-forms-item>
                </uni-forms>

                <!-- 协议和登录链接 -->
                <view class="bottom-section">
                    <view class="agreement-section">
                        <tig-checkbox v-model:checked="isChecked" color="#2F3B50" />
                        <text class="agreement-text">同意</text>
                        <text class="agreement-link" @click.stop="handleLink('/pages/register/agreement')">《注册协议》</text>
                    </view>
                    <view class="login-link" @click.stop="handleLink('/pages/login/index')">
                        已有账号?
                    </view>
                </view>

                <!-- 注册按钮 -->
                <tig-button 
                    :disabled="isRegisterDisabled" 
                    :loading="loginLoading" 
                    class="register-button"
                    color="#2F3C51"
                    @click="onRegister"
                    style="border-radius: 8px; height: 45px;"
                > 
                    {{ $t("注册账号") }} 
                </tig-button>
            </view>
        </view>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef, nextTick } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { sendMobileCode } from "@/api/login/login";
import VerificationCode from "@/components/verificationCode/index.vue";
import { userRegist } from "@/api/user/regist";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "@/store/config";
import { useResettableRef } from "@/hooks";

const configStore = useConfigStore();

const mobileAreaCode = ref("86");

const [formState, reset] = useResettableRef({
    mobile: "",
    mobileCode: "",
    password: ""
});

const { t } = useI18n();

const isChecked = ref(false);
const verifyToken = ref("");
const loginLoading = ref(false);
const isRegisterDisabled = computed(() => {
    return !formState.value.mobile || !formState.value.mobileCode || !formState.value.password || !verifyToken.value || !isChecked.value;
});

const validateMobile = (rule: any, value: any, data: any, callback: any) => {
    if (!value) {
        return callback(t("手机号不能为空"));
    }
    
    // 中国大陆手机号校验：11位数字，1开头，第二位为3-9
    const chinaPattern = /^1[3-9]\d{9}$/;
    
    if (!chinaPattern.test(value)) {
        return callback(t("请输入正确的11位手机号"));
    }
    
    callback();
};
const validateCode = (rule: any, value: any, data: any, callback: any) => {
    if (!value) {
        return callback(t("验证码不能为空"));
    } else if (value.length != 6) {
        return callback(t("请输入6位验证码"));
    } else {
        callback();
    }
};

const validatePassword = (rule: any, value: any, data: any, callback: any) => {
    if (!value) {
        return callback(t("密码不能为空"));
    }
    
    // 密码长度检查
    if (value.length < 6 || value.length > 20) {
        return callback(t("密码应为6-20位字符"));
    }
    
    // 不允许空格
    if (/\s/.test(value)) {
        return callback(t("密码中不允许有空格"));
    }
    
    // 不能全为数字
    if (/^\d+$/.test(value)) {
        return callback(t("密码不能全为数字"));
    }
    
    // 不能全为字母
    if (/^[a-zA-Z]+$/.test(value)) {
        return callback(t("密码不能全为字母"));
    }
    
    // 不能全为符号
    if (/^[^\w\s]+$/.test(value)) {
        return callback(t("密码不能全为符号"));
    }
    
    // 不能全为相同字符
    if (/^(.)\1*$/.test(value)) {
        return callback(t("密码不能全为相同字符"));
    }
    
    // 密码强度检查：至少包含数字、字母、符号中的两种
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSymbol = /[^\w\s]/.test(value);
    
    const validCombinations = [hasNumber, hasLetter, hasSymbol].filter(Boolean).length;
    
    if (validCombinations < 2) {
        return callback(t("密码必须包含数字、字母、符号中的至少两种"));
    }
    
    callback();
};
const formRules = {
    mobile: {
        rules: [
            { required: true, errorMessage: t("请输入手机号") },
            {
                validateFunction: validateMobile
            }
        ]
    },
    mobileCode: {
        rules: [
            { required: true, errorMessage: t("请输入验证码") },
            {
                validateFunction: validateCode
            }
        ]
    },
    password: {
        rules: [
            { required: true, errorMessage: t("请输入密码") },
            {
                validateFunction: validatePassword
            }
        ]
    }
};
const formRef = shallowRef();
const onRegister = async () => {
    formRef.value
        .validate()
        .then(async () => {
            const bindSalesmanId = uni.getStorageSync("bindSalesmanId");
            try {
                loginLoading.value = true;
                formState.value.mobile = configStore.isOpenMobileAreaCode ? mobileAreaCode.value + formState.value.mobile : formState.value.mobile;
                await userRegist({ ...formState.value, salesmanId: bindSalesmanId });
                uni.showToast({
                    title: t("注册成功"),
                    duration: 1500,
                    icon: "none"
                });
                setTimeout(() => {
                    // 一秒后执行这里的代码
                    uni.redirectTo({
                        url: "/pages/login/index"
                    });
                }, 1000);
            } catch (error: any) {
                reset();
                uni.showToast({
                    title: error.message,
                    duration: 1500,
                    icon: "none"
                });
            } finally {
                loginLoading.value = false;
            }
        })
        .catch((err: any) => {
            console.error("表单错误信息：", err);
        });
};
onShow(() => {
    if (uni.getStorageSync("token")) {
        uni.reLaunch({
            url: "/pages/index/index"
        });
    }
    nextTick(() => {
        formRef.value.setRules(formRules);
    });
});

const mobileErrorCallback = (msg: string) => {
    uni.showToast({
        title: msg,
        duration: 1500,
        icon: "none"
    });
};

const handleLink = (url: string) => {
    uni.navigateTo({
        url
    });
};

const goBack = () => {
    // 返回到用户登录页面
    uni.navigateTo({
        url: '/pages/login/index'
    });
};

// 手机号输入限制
const onMobileInput = (value: string) => {
    // 只允许输入数字，最多11位
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    formState.value.mobile = numericValue;
};

// 密码输入限制
const onPasswordInput = (value: string) => {
    // 去除空格，限制长度20位
    const filteredValue = value.replace(/\s/g, '').slice(0, 20);
    formState.value.password = filteredValue;
};

// 验证码输入限制
const onCodeInput = (value: string) => {
    // 只允许输入数字，最多6位
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    formState.value.mobileCode = numericValue;
};
</script>
<style>
page {
    background: #fff !important;
    --general: #2F3B50 !important;
    --main-bg: #5A7BB3 !important;
}
</style>
<style lang="scss" scoped>

.register-container {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 280rpx 10rpx 40rpx;
}

/* 返回按钮 */
.back-button {
    position: absolute;
    top: 60rpx;
    left: 40rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.back-icon {
    width: 50rpx;
    height: 50rpx;
    margin-top: 45px;
}

/* 品牌标识区域 */
.brand-section {
    text-align: center;
    margin-bottom: 60rpx;
}

.brand-logo {
    font-size: 57rpx;
    font-weight: bold;
    color: #232323;
    letter-spacing: 2rpx;
    margin-bottom: 20rpx;
}

.brand-subtitle {
    font-size: 32rpx;
    color: #232323;
    letter-spacing: 5rpx;
}

/* 注册卡片 */
.register-card {
    width: 100%;
    max-width: 800rpx;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 40rpx;
}

/* 输入框组 */
.input-group {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 12rpx;
    padding: 0 20rpx;
    height: 100rpx;
    margin-bottom: 32rpx;
    position: relative;
}

.country-code {
    width: 140rpx;
    margin-left: 10rpx;
}

.input-label {
    width: 140rpx;
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
    border: none;
    outline: none;
    font-size: 28rpx;
    color: #333;
}

.custom-placeholder {
    color: #c0c4cc;
    font-size: 28rpx;
}

/* 验证码输入组 */
.verification-group .verification-input {
    flex: 1;
    margin-right: 20rpx;
}

.verification-group .verification-btn {
    min-width: 160rpx;
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-verify {
    background: transparent;
    color: #5A7BB3;
    border: none;
    font-size: 28rpx;
    height: 70rpx;
    line-height: 70rpx;
    min-width: 160rpx;
    padding: 0;
}

.btn-verify[disabled] {
    background: transparent;
    color: #c0c4cc;
}

.verify-btn {
    background: transparent;
    color: #C0C0C0;
    border: none;
    font-size: 28rpx;
    height: 70rpx;
    line-height: 70rpx;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 160rpx;
}

.verify-btn[disabled] {
    background: transparent;
    color: #c0c4cc;
}

/* 底部区域 */
.bottom-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 50rpx 0 25rpx;
}

.agreement-section {
    display: flex;
    align-items: center;
}

.agreement-text {
    font-size: 26rpx;
    color: #232323;
    margin-left: 10rpx;
}

.agreement-link {
    font-size: 26rpx;
    color: #5A7BB3;
}

.login-link {
    font-size: 26rpx;
    color: #272727;
}

/* 注册按钮 */
.register-button {
    width: 100%;
    height: 85rpx;
    background: #2F3C51;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.register-button[disabled] {
    background: #c0c4cc;
    color: #fff;
}

.register-button::after {
    border: none;
}

/* 复选框样式调整 */
checkbox {
    transform: scale(0.8);
}

/* 表单项样式重置 */
.uni-forms-item {
    margin-bottom: 0;
}

.uni-forms-item .uni-forms-item__label {
    display: none;
}

.uni-forms-item .uni-forms-item__content {
    flex: 1;
}

/* 区号选择器样式优化 */
.areacode-box {
    border-right: none;
}

.areacode-box .icon-xiajiantou,
.areacode-box .uni-icon-clear,
.areacode-box .clear-icon,
.areacode-box .close-icon,
.areacode-box .u-icon--right,
.areacode-box .u-picker__view__column__item__icon {
    display: none;
}

.up-picker .u-icon,
.up-picker .uni-icon {
    display: none;
}

/* 输入框内容样式 */
:deep(.uni-easyinput) {
    background-color: #f5f7fa !important;
}

:deep(.uni-easyinput__content) {
    background-color: #f5f7fa !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
}

:deep(.uni-easyinput__content-input) {
    background-color: #f5f7fa !important;
    border: none !important;
    font-size: 28rpx;
    color: #333;
}

/* 输入框聚焦状态 */
:deep(.uni-easyinput__content-focus) {
    background-color: #f5f7fa !important;
    border: none !important;
    box-shadow: none !important;
}

/* 直接针对input元素 */
:deep(input) {
    background-color: #f5f7fa !important;
    border: none !important;
}

/* 确保输入框内部背景一致 */
.input-group :deep(.uni-easyinput__content) {
    background-color: #f5f7fa !important;
    border: none !important;
}

.custom-input :deep(.uni-easyinput__content) {
    background-color: #f5f7fa !important;
    border: none !important;
}

/* 复选框组件样式 */
.tig-checkbox .checkbox-icon {
    width: 32rpx;
    height: 32rpx;
    border-radius: 4rpx;
    border: 2rpx solid #d0d7de;
}

.tig-checkbox .checkbox-icon.checked {
    background: #2F3B50;
    border-color: #2F3B50;
}

/* 隐藏废弃的样式类 */
.mobileareacode-box,
.profile-edit-content,
.btn2-css3,
.special-color,
.placeholder,
.agreement-btn {
    display: none;
}

/* 响应式调整 */
@media screen and (max-width: 750rpx) {
    .register-card {
        margin: 0 20rpx;
    }
    
    .input-label {
        width: 120rpx;
        font-size: 26rpx;
    }
    
    .brand-logo {
        font-size: 48rpx;
    }
    
    .brand-subtitle {
        font-size: 28rpx;
    }
}

/* 通用工具类 */
.text-center {
    text-align: center;
}

.flex {
    display: flex;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.mb-20 {
    margin-bottom: 20rpx;
}

.mb-32 {
    margin-bottom: 32rpx;
}

.mt-60 {
    margin-top: 60rpx;
}

/* 加载状态 */
.loading {
    opacity: 0.7;
    pointer-events: none;
}

/* 错误提示 */
.error-tip {
    color: #ff4757;
    font-size: 24rpx;
    margin-top: 10rpx;
    margin-left: 20rpx;
}

/* 成功提示 */
.success-tip {
    color: #2ed573;
    font-size: 24rpx;
    margin-top: 10rpx;
    margin-left: 20rpx;
}
</style>
