<template>
    <tig-popup v-model:show="show" :z-index="1000" @close="close">
        <template v-if="show">
            <view class="wechart-login-content">
                <view class="popup-logo">
                    <image class="logo-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758687963AJS969IKrvfTozW23Q.jpeg" mode="aspectFit" />
                </view>
                <view class="wechart-login-box">
                    <!-- #ifdef MP-WEIXIN -->
                    <template v-if="isChecked">
                        <tig-button
                            :custom-style="{ 
                                'border-radius': '50rpx', 
                                height: '96rpx',
                                'background-color': '#3544BA',
                                'border': 'none',
                                'color': '#fff',
                                'font-size': '32rpx',
                                'font-weight': '500'
                            }"
                            open-type="getPhoneNumber"
                            shape="square"
                            :loading="loginLoading"
                            @get-phone-number="getPhoneNumber"
                            >{{ $t("手机号快捷登录") }}</tig-button
                        >
                    </template>
                    <template v-else>
                        <tig-button 
                            :custom-style="{ 
                                'border-radius': '50rpx', 
                                height: '96rpx',
                                'background-color': '#3544BA',
                                'border': 'none',
                                'color': '#fff',
                                'font-size': '32rpx',
                                'font-weight': '500'
                            }" 
                            shape="square" 
                            @click="mobileLogin"
                            >{{ $t("手机号快捷登录") }}</tig-button
                        >
                    </template>
                    <!-- #endif -->
                    <!-- #ifndef MP-WEIXIN -->
                    <template v-if="isChecked">
                        <tig-button 
                            :custom-style="{ 
                                'border-radius': '50rpx', 
                                height: '96rpx',
                                'background-color': '#3544BA',
                                'border': 'none',
                                'color': '#fff',
                                'font-size': '32rpx',
                                'font-weight': '500'
                            }" 
                            shape="square" 
                            :loading="loginLoading" 
                            @click="wechatLogin">{{
                            $t("微信授权")
                        }}</tig-button>
                    </template>
                    <template v-else>
                        <tig-button 
                            :custom-style="{ 
                                'border-radius': '50rpx', 
                                height: '96rpx',
                                'background-color': '#3544BA',
                                'border': 'none',
                                'color': '#fff',
                                'font-size': '32rpx',
                                'font-weight': '500'
                            }" 
                            shape="square" 
                            @click="mobileLogin">{{
                            $t("微信授权")
                        }}</tig-button>
                    </template>
                    <!-- #endif -->

                    <view class="rule-text" :class="{ 'shake-animation': showShake }">
                        <tig-checkbox v-model:checked="isChecked" :custom-style="{'transform': 'scale(0.8)'}"/>
                        <view class="rule-xieyi">
                            <text class="agreement-text" @click="isChecked = !isChecked">{{ $t("登录即为同意") }}</text>
                            <text class="special-color" @click="showAgreement('yszc')">{{ $t("《隐私政策》") }}</text>
                            <text>{{ $t("、") }}</text>
                            <text class="special-color" @click="showAgreement('fwxy')">{{ $t("《服务协议》") }}</text>
                            <text>{{ $t("、") }}</text>
                            <text class="special-color" @click="showAgreement('sqgy')">{{ $t("《社区公约》") }}</text>
                        </view>
                    </view>

                    <view class="other-login">
                        <view class="login-option" @click="handleLink('mobile')">{{ $t("手机登录") }}</view>
                        <view class="divider"></view>
                        <view class="login-option" @click="handleLink('password')">{{ $t("账号登录") }}</view>
                    </view>
                </view>
            </view>
        </template>
    </tig-popup>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getOauthInfo, getOauthUrl, getWechartMobile, setMiniProgramOpenid } from "@/api/login/login";
import { useUserStore } from "@/store/user";
import { useConfigStore } from "@/store/config";
import { onShow } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emit = defineEmits(["loginSuccess"]);

const userStore = useUserStore();
const configStore = useConfigStore();

const show = computed({
    get() {
        return !!userStore.authType;
    },
    set(val) {
        userStore.setAuthType("");
    }
});

const isChecked = ref(false);
const loginLoading = ref(false);
const showShake = ref(false);
const showAgreement = (articleSn: string) => {
    // 先关闭弹窗
    userStore.setAuthType("");
    // 然后跳转到协议页面
    uni.navigateTo({
        url: `/pages/login/mallAgreement?articleSn=${articleSn}`
    });
};
const mobileLogin = () => {
    if (!isChecked.value) {
        showShake.value = true;
        setTimeout(() => {
            showShake.value = false;
        }, 500);
        return uni.showToast({
            title: t("请先同意用户协议"),
            duration: 1500,
            icon: "none"
        });
    }
};

//微信授权登录
const wechatLogin = async () => {
    const result = await getOauthUrl({ url: location.origin + location.pathname });
    window.location.href = result.url;
};

//获取用户信息
const getWechatInfo = async (code: string) => {
    const result = await getOauthInfo({ code: code });
    if (result.type == 1) {
        //已注册过，直接登录
        userStore.setToken(result.token);
        await userStore.getUserInfo();
        emit("loginSuccess");
        userStore.setAuthType("");
    }
    if (result.type == 2 && configStore.wechatRegisterBindPhone === 1) {
        //跳转绑定手机页面
        uni.setStorageSync("openData", result.openData);
        uni.navigateTo({
            url: "/pages/user/bindMobilePhone/index"
        });
    }
};

const handleLink = (type: string) => {
    userStore.setAuthType("");
    uni.navigateTo({
        url: `/pages/login/index?loginType=${type}`
    });
};

const getPhoneNumber = async (e: any) => {
    if (!isChecked.value) {
        showShake.value = true;
        setTimeout(() => {
            showShake.value = false;
        }, 500);
        return uni.showToast({
            title: t("请先同意用户协议"),
            duration: 1500,
            icon: "none"
        });
    }
    try {
        const result = await getWechartMobile({ code: e.detail.code });
        userStore.setToken(result);
        userStore.getUserInfo();
        emit("loginSuccess");
        userStore.setAuthType("");
        // #ifdef MP-WEIXIN
        updateUserOpenId();
        // #endif
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
        userStore.setAuthType("");
    }
};
const updateUserOpenId = async () => {
    wx.login({
        success: async (res: any) => {
            await setMiniProgramOpenid({
                code: res.code
            });
        },
        fail: (err: any) => {
            console.log(err);
        }
    });
};

const close = () => {
    userStore.setAuthType("");
};

const getUlParams = (url: string) => {
    const params: Record<string, string> = {};
    const urlParams = url.split("?")[1];
    if (urlParams) {
        urlParams.split("&").forEach((item: string) => {
            const [key, value] = item.split("=");
            params[key] = value;
        });
    }
    return params;
};

onShow(() => {
    if (configStore.XClientType === "wechat" && !uni.getStorageSync("token")) {
        const params = getUlParams(location.href);
        if (params.code && params.code.length > 12) {
            //授权
            getWechatInfo(params.code);
        }
    }
});
</script>

<style lang="scss" scoped>
.wechart-login-content {
    height: auto;
    box-sizing: border-box;
    padding: 0;
    background: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    
    .popup-logo {
        padding: 0rpx 0 40rpx;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .logo-image {
            width: 300rpx;
            height: 300rpx;
            margin-bottom: -75rpx;
        }
        
        .logo-text {
            font-size: 40rpx;
            font-weight: bold;
            color: #3544BA;
            letter-spacing: 2rpx;
        }
    }
    
    .wechart-login-box {
        padding: 0 40rpx 40rpx;
    }
}

.other-login {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    height: 48rpx;
    width: 100%;
    
    .login-option {
        font-size: 28rpx;
        color: #666;
        padding: 0 30rpx;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
            color: #3544BA;
        }
    }
    
    .divider {
        width: 2rpx;
        height: 28rpx;
        background: #E5E5E5;
    }
}

.rule-text {
    font-size: 24rpx;
    color: #999;
    margin-top: 25rpx;
    margin-bottom: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .agreement-text {
        color: #999;
    }
}

.rule-xieyi {
    display: flex;
    align-items: center;
    margin-left: 12rpx;
    flex-wrap: wrap;
    justify-content: center;
}

.special-color {
    color: #3544BA;
    margin-left: 4rpx;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
}

:deep(.tig-button) {
    width: 100%;
    box-shadow: 0 4rpx 16rpx rgba(53, 68, 186, 0.2);
    transition: all 0.3s;
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(53, 68, 186, 0.15);
    }
}

// 抖动动画
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
