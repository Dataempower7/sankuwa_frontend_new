<!-- 国内登录 -->
<template>
    <!-- 返回按钮 -->
    <view class="back-button" @click="goBack">
        <image src="/static/images/common/trolley_icon_back@3x.png" class="back-icon" />
    </view>

    <view class="login-container">
        <!-- 品牌标识 -->
        <view class="brand-section">
            <view class="brand-logo">SANKUWA</view>
            <view class="brand-subtitle">森酷玩电商商户平台</view>
        </view>

        <!-- 表单内容卡片 -->
        <view class="login-card">
            <view class="form">
                <template v-if="loginType === 'mobile'">
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
                        <uni-easyinput
                            v-model="mobile"
                            :input-border="false"
                            type="number"
                            maxlength="11"
                            background-color="#f5f7fa"
                            class="uni-input custom-input"
                            placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                            placeholder-class="custom-placeholder"
                            :placeholder="$t('请输入手机号')"
                            primary-color="#409eff"
                            @input="onMobileInput"
                        />
                    </view>

                    <!-- 验证码输入 -->
                    <view class="input-group verification-group">
                        <view class="input-label">验证码</view>
                        <view class="divider">|</view>
                        <uni-easyinput
                            v-model="mobileCode"
                            :input-border="false"
                            type="number"
                            maxlength="6"
                            background-color="#f5f7fa"
                            class="uni-input custom-input verification-input"
                            placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                            placeholder-class="custom-placeholder"
                            :placeholder="$t('请输入验证码')"
                            primary-color="#409eff"
                            @input="onCodeInput"
                        />
                        <verificationCode
                            v-model:is-checked="isChecked"
                            v-model:verify-token-data="verifyToken"
                            class="verification-btn"
                            btn-type="text"
                            :mobile="configStore.isOpenMobileAreaCode ? mobileAreaCode + mobile : mobile"
                            :request-api="sendMobileCode"
                            @mobile-error-callback="mobileErrorCallback"
                        />
                    </view>
                </template>

                <template v-if="loginType === 'password'">
                    <!-- 用户名输入 -->
                    <view class="input-group">
                        <view class="input-label">用户账号</view>
                        <view class="divider">|</view>
                        <uni-easyinput
                            v-model="username"
                            :input-border="false"
                            maxlength="20"
                            background-color="#f5f7fa"
                            class="uni-input custom-input"
                            placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                            placeholder-class="custom-placeholder"
                            :placeholder="$t('用户名/手机号')"
                            primary-color="#409eff"
                            @input="onUsernameInput"
                        />
                    </view>

                    <!-- 密码输入 -->
                    <view class="input-group">
                        <view class="input-label">登录密码</view>
                        <view class="divider">|</view>
                        <uni-easyinput
                            v-model="password"
                            :clearable="false"
                            :input-border="false"
                            :trim="true"
                            :type="passwordType"
                            maxlength="20"
                            background-color="#f5f7fa"
                            class="uni-input custom-input"
                            placeholder-style="color: #c0c4cc; font-size: 28rpx;"
                            placeholder-class="custom-placeholder"
                            :placeholder="$t('请输入密码')"
                            primary-color="#409eff"
                            @input="onPasswordInput"
                        />
                        <view v-if="passwordType == 'text'" class="password_show_hide iconfont icon-xianshi" @click="passwordTypeChange" />
                    </view>
                </template>

                <!-- 底部区域 -->
                <view class="bottom-section" :class="{ flex: loginType === 'password' }">
                    <view class="agreement-section" :class="{ 'shake-animation': showShake }">
                        <tig-checkbox v-model:checked="isChecked" color="#2F3B50" />
                        <text class="agreement-text">登录即为同意</text>
                        <text class="agreement-link" @click.stop="showAgreement">《商城用户服务协议》</text>
                    </view>
                    <block v-if="loginType === 'password'">
                        <view class="forgot-password" @click="handleReset">{{ $t("忘记密码") }}</view>
                    </block>
                </view>

                <!-- 登录按钮 -->
                <tig-button 
                    :loading-text="$t('登录中')" 
                    :loading="loginLoading" 
                    :disabled="isloginDisabled"
                    class="login-button"
                    color=" #2F3C51"
                    style="border-radius: 8px; height: 45px;"
                    @click="mobileLogin"
                >
                    {{ $t("登录") }}
                </tig-button>



                <!-- 其他登录方式 - 重新设计 -->
                <view class="other-login">
                    <view class="other-login-divider">
                        <view class="divider-line"></view>
                        <text class="divider-text">{{ $t("其他登录方式") }}</text>
                        <view class="divider-line"></view>
                    </view>
                    <view class="login-methods">
                        <view class="method-item" @click="handleLoginType">
                            <view v-if="loginType === 'password'" class="method-content">
                                <image class="method-icon-img" src="/static/images/common/icon_phone@3x.png" />
                                <text class="method-text">{{ $t("手机号登录") }}</text>
                            </view>
                            <view v-if="loginType === 'mobile'" class="method-content">
                                <image class="method-icon-img" src="/static/images/common/icon_account@3x.png" />
                                <text class="method-text">{{ $t("账号登入") }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        
        <!-- 注册区域 - 简单文字设计 -->
        <template v-if="configStore.shopRegClosed === 0">
            <view class="register-area">
                <text>{{ $t("没有账号") }}? </text>
                <navigator open-type="redirect" url="/pages/register/index" class="register-link">{{ $t("立即注册") }}</navigator>
            </view>
        </template>
    </view>
    <Verify ref="verifyRef" mode="pop" captcha-type="blockPuzzle" :img-size="{ width: '310px', height: '155px' }" @ok-callback="okCallback" />
</template>

<script lang="ts" setup>
import verificationCode from "@/components/verificationCode/index.vue";
import Verify from "@/components/verifition/Verify.vue";
import { ref, computed } from "vue";
import { sendMobileCode, userSignin } from "@/api/login/login";
import { useUserStore } from "@/store/user";
import { redirect } from "@/utils";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "@/store/config";


const { t } = useI18n();

const configStore = useConfigStore();

const userStore = useUserStore();

const loginType = defineModel("loginType");

const mobile = ref("");
const mobileCode = ref("");
const username = ref(import.meta.env.VITE_DEFAULT_USER_NAME || "");
const password = ref(import.meta.env.VITE_DEFAULT_USER_PASSWORD || "");
const isChecked = ref(false);
const verifyToken = ref("");
const loginLoading = ref(false);
const verifyRef = ref();
const mobileAreaCode = ref("86");
const showShake = ref(false);

const isloginDisabled = computed(() => {
    if (loginType.value === "password") {
        return !username.value || !password.value;
    } else {
        return !mobile.value || !mobileCode.value || !verifyToken.value;
    }
});


const mobileErrorCallback = (msg: string) => {
    uni.showToast({
        title: msg,
        duration: 1500,
        icon: "none"
    });
};
const mobileLogin = () => {
    if (!isChecked.value) {
        showShake.value = true;
        setTimeout(() => {
            showShake.value = false;
        }, 500);
        return;
    }

    signin();
};

const handleLoginType = () => {
    loginType.value = loginType.value === "mobile" ? "password" : "mobile";
    username.value = import.meta.env.VITE_DEFAULT_USER_NAME || "";
    password.value = import.meta.env.VITE_DEFAULT_USER_PASSWORD || "";
    mobile.value = "";
    mobileCode.value = "";
    verifyToken.value = "";
    isChecked.value = false;
};

const signin = async () => {
    try {
        loginLoading.value = true;
        const data = {
            loginType: loginType.value,
            username: username.value,
            password: password.value,
            mobile: "",
            mobileCode: "",
            verifyToken: verifyToken.value
        };
        if (loginType.value === "mobile") {
            data.mobile = configStore.isOpenMobileAreaCode ? mobileAreaCode.value + mobile.value : mobile.value;
            data.mobileCode = mobileCode.value;
        }
        const result = await userSignin(data);
        userStore.setToken(result.token);
        userStore.getUserInfo();
        uni.showToast({
            title: t("登录成功"),
            duration: 1000
        });
     
        const backUrl = uni.getStorageSync("URL");
        setTimeout(() => {
            if (backUrl) {
                redirect({
                    url: backUrl,
                    success: () => {
                        uni.removeStorageSync("URL");
                    }
                });
            } else {
                uni.reLaunch({
                    url: "/pages/index/index"
                });
            }
        }, 800);
    } catch (error: any) {
        if (error.code == 1002 && verifyRef.value) {
            verifyRef.value.show();
        } else if (error.code > 0) {
            uni.showToast({
                title: error.message,
                duration: 1500,
                icon: "none"
            });
            mobileCode.value = "";
        }
    } finally {
        loginLoading.value = false;
    }
};

const okCallback = (e: any) => {
    verifyToken.value = e.verifyToken;
    signin();
};
const passwordType = ref("password");
const passwordTypeChange = () => {
    passwordType.value = passwordType.value === "password" ? "text" : "password";
};

// 返回函数
const goBack = () => {
    uni.navigateBack();
};

// 手机号输入限制
const onMobileInput = (value: string) => {
    // 只允许输入数字，最多11位
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    mobile.value = numericValue;
};

// 用户名输入限制
const onUsernameInput = (value: string) => {
    // 去除空格，限制长度20位
    const filteredValue = value.replace(/\s/g, '').slice(0, 20);
    username.value = filteredValue;
};

// 密码输入限制
const onPasswordInput = (value: string) => {
    // 去除空格，限制长度20位
    const filteredValue = value.replace(/\s/g, '').slice(0, 20);
    password.value = filteredValue;
};

// 验证码输入限制
const onCodeInput = (value: string) => {
    // 只允许输入数字，最多6位
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    mobileCode.value = numericValue;
};


const showAgreement = () => {
    uni.redirectTo({
        url: "/pages/login/mallAgreement?articleSn=fwxy"
    });
};

const handleReset = () => {
    uni.navigateTo({
        url: "/pages/reset/index"
    });
};


</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 300rpx 10rpx 40rpx;
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
    margin-top: 70rpx;
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

/* 登录卡片 */
.login-card {
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

.verification-btn {
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
    line-height: 70rpx;
}

.verify-btn {
    background: transparent;
    color: #c0c4cc;
    border: none;
    font-size: 28rpx;
    line-height: 70rpx;
}

/* 密码显示隐藏按钮 */
.password_show_hide {
    position: absolute;
    color: #666;
    right: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40rpx;
    padding: 10rpx;
    z-index: 88;
}

/* 底部区域 */
.bottom-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 110rpx 0 25rpx;
}

.bottom-section.flex {
    justify-content: space-between;
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

.forgot-password {
    font-size: 26rpx;
    color: #272727;
}

/* 登录按钮 */
.login-button {
    width: 100%;
    height: 85rpx;
    background: #2F3C51;
    color: #fff;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-button.disabled {
    background: #c0c4cc;
    color: #fff;
}

.login-button::after {
    border: none;
}

/* 其他登录方式 */
.other-login {
    margin-top: 100rpx;
}

.other-login-divider {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
}

.divider-line {
    flex: 1;
    height: 1rpx;
    background-color: #e5e5e5;
}

.divider-text {
    font-size: 24rpx;
    color: #999;
    padding: 0 24rpx;
    white-space: nowrap;
}

.login-methods {
    display: flex;
    justify-content: center;
}

.method-item {
    padding: 16rpx 32rpx;
    border-radius: 24rpx;
}

.method-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.method-icon-img {
    width: 100rpx;
    height: 100rpx;
    margin-bottom: 8rpx;
}

.method-text {
    font-size: 24rpx;
    color: #666;
    text-align: center;
}

/* 注册区域 */
.register-area {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
}

.register-link {
    color: #5C7EB7;
    text-decoration: none;
}

/* 复选框样式调整 */
checkbox {
    transform: scale(0.8);
}


/* 响应式调整 */
@media screen and (max-width: 750rpx) {
    .login-card {
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

/* 其他登录方式样式 */
.other-login {
    margin-top: 100rpx;
}

.other-login-divider {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
}

.divider-line {
    flex: 1;
    height: 1rpx;
    background-color: #e5e5e5;
}

.divider-text {
    font-size: 24rpx;
    color: #999;
    padding: 0 24rpx;
    white-space: nowrap;
}

.login-methods {
    display: flex;
    justify-content: center;
}

.method-item {
    padding: 16rpx 32rpx;
    border-radius: 24rpx;
    transition: all 0.3s ease;
}



.method-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}

.method-icon {
    font-size: 32rpx;
    line-height: 1;
}

.method-icon-img {
    width: 100rpx;
    height: 100rpx;
    object-fit: contain;
}

.method-text {
    font-size: 24rpx;
    color: #666;
    text-align: center;
    position: relative;
    top: 10px;
}

/* 输入框背景颜色样式优化 */
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

/* 抖动动画 */
@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10rpx);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(10rpx);
    }
}

.shake-animation {
    animation: shake 0.5s ease-in-out;
}
</style>
