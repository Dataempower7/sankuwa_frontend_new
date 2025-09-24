<template>
    <tig-layout title="个人资料" :border-bottom="true">
        <view class="profile-container">
            <!-- 基本信息模块 -->
            <view class="profile-module">
                <!-- 头像区域 -->
                <view class="profile-item">
                    <view class="profile-label">头像</view>
                    <view class="profile-value">
                        <tig-upload class="avatar-upload-wrapper" request-url="user/user/modifyAvatar" @change="handleAvatarChange">
                            <image class="avatar-image" :src="imageFormat(form.avatar) || 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758697604fT1jxhpvcaA5co3s0x.jpeg'" mode="aspectFill" />
                        </tig-upload>
                        <view class="iconfont icon-xiangyou profile-arrow" />
                    </view>
                </view>

                <!-- 用户ID -->
                <view class="profile-item">
                    <view class="profile-label">用户ID</view>
                    <view class="profile-value profile-disabled">
                        {{ form.dimUsername  }}
                    </view>
                </view>

                <!-- 昵称 -->
                <view class="profile-item">
                    <view class="profile-label">昵称</view>
                    <view class="profile-value">
                        <input
                            class="nickname-input"
                            v-model="form.nickname"
                            placeholder="请输入昵称"
                            maxlength="20"
                        />
                    </view>
                </view>

                <!-- 出生日期 -->
                <view class="profile-item profile-item-last" @click="handleShowDatetime">
                    <view class="profile-label">出生日期</view>
                    <view class="profile-value">
                        <text class="profile-placeholder">{{ form.birthday === "" ? "请选择出生日期" : form.birthday }}</text>
                        <view class="iconfont icon-xiangyou profile-arrow" />
                    </view>
                </view>
            </view>

            <!-- 安全设置模块 -->
            <view class="profile-module">
                <!-- 登录密码 -->
                <view class="profile-item" @click="goPages('/pages/user/security/password' + '?mobile=' + form.mobile, 'password')">
                    <view class="profile-label">登录密码</view>
                    <view class="profile-value">
                        <text class="profile-action">修改</text>
                        <view class="iconfont icon-xiangyou profile-arrow" />
                    </view>
                </view>

                <!-- 手机号码 -->
                <view class="profile-item profile-item-last" @click="goPages('/pages/user/security/phone' + '?mobile=' + form.mobile)">
                    <view class="profile-label">手机号码</view>
                    <view class="profile-value">
                        <text>{{ form.showMobile  }}</text>
                        <view class="iconfont icon-xiangyou profile-arrow" />
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部按钮 -->
        <tig-fixed-placeholder >
            <view class="bottom-buttons">
                <tig-button class="logout-btn" plain @click="onLogout">退出登录</tig-button>
                <tig-button class="save-btn" style="border-color: #3544ba;" @click="onSubmit">保存修改</tig-button>
            </view>
        </tig-fixed-placeholder>
        <up-datetime-picker
            ref="datetimePickerRef"
            :cancel-text="$t('取消')"
            :confirm-text="$t('确定')"
            :show="showDatetime"
            :model-value="Date.now()"
            mode="date"
            :formatter="formatter"
            format="YYYY-MM-DD"
            confirm-color="#00C853"
            cancel-color="#999"
            :min-date="1"
            @cancel="showDatetime = false"
            @confirm="getBirthday"
        />
    </tig-layout>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getProfile, updateProfile } from "@/api/user/profile";
import { useUserStore } from "@/store/user";
import { getOauthUrl, bindWechat, unbindWechat } from "@/api/login/login";
import { userClose } from "@/api/user/user";
import { useConfigStore } from "@/store/config";
import { useI18n } from "vue-i18n";
import { redirect } from "@/utils";
import { imageFormat } from "@/utils/format";

const { t } = useI18n();

const userStore = useUserStore();

const configStore = useConfigStore();

const form = reactive<any>({
    nickname: "",
    birthday: "",
    mobile: ""
});

const goPages = (url: string, type?: string) => {
    if (type == "password" && form.mobile == "") {
        uni.showToast({
            title: t("未绑定手机号，请先绑定手机号再修改密码"),
            icon: "none"
        });
        return;
    }
    uni.navigateTo({
        url
    });
};

const handleUerClose = async () => {
    try {
        await userClose();
        uni.showToast({
            title: t("账号已注销"),
            icon: "none",
            duration: 1000
        });
        setTimeout(() => {
            userStore.logout();
        }, 500);
    } catch (error) {
        console.error(error);
    }
};

const handleWriteOff = () => {
    uni.showModal({
        title: t("温馨提示"),
        content: t("注销账号后会删除相关账号数据，您是否要确认注销?"),
        success: (res) => {
            if (res.confirm) {
                handleUerClose();
            }
        }
    });
};

// 移除了表单验证规则和引用，因为我们现在使用简单的手动验证

const onSubmit = () => {
    // 简单验证
    if (!form.nickname || form.nickname.trim() === '') {
        uni.showToast({
            title: t("请填写昵称"),
            icon: "none"
        });
        return;
    }

    edit();
};

const onLogout = () => {
    uni.showModal({
        title: t("退出登录"),
        content: t("确定要退出登录吗？"),
        success: (res) => {
            if (res.confirm) {
                userStore.logout();
            }
        }
    });
};

const edit = async () => {
    try {
        await updateProfile({ ...form });

        uni.showToast({
            title: t("修改成功"),
            icon: "none",
            duration: 1000
        });

        setTimeout(() => {
            uni.navigateBack({
                success: function () {
                    uni.$emit("refreshData");
                }
            });
        }, 1000);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1000
        });
    }
};

onShow(() => {
    nextTick(() => {
        // 微信小程序需要用此写法
        datetimePickerRef.value.setFormatter(formatter);
    });
    if (configStore.XClientType === "wechat" && uni.getStorageSync("token")) {
        const params = getUlParams(location.href);
        if (params.code && params.code.length > 12) {
            //授权
            bindWechatAct(params.code);
        }
    }
});

//绑定微信
const bindWechatAct = async (code: string) => {
    uni.showLoading({
        title: t("授权中") + "..."
    });
    try {
        await bindWechat({ code: code });
        uni.showToast({
            title: t("授权成功"),
            icon: "none",
            duration: 1000
        });

        let url = "/pages/user/profile/index";

        if (flowType.value) {
            url = `/pages/order/check?flowType=${flowType.value}`;
        }

        setTimeout(() => {
            redirect({
                url,
                mode: "redirectTo",
                success: () => {
                    if (flowType.value) {
                        uni.removeStorageSync("bindWechatFlowType");
                    }
                }
            });
        }, 1000);
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1000
        });
    } finally {
        uni.hideLoading();
    }
};
//解绑
const unbindWechatAct = async () => {
    uni.showModal({
        title: t("提示"),
        content: t("确定取消绑定吗？"),
        success: async (res) => {
            if (res.confirm) {
                uni.showLoading({
                    title: t("正在解绑...")
                });
                try {
                    await unbindWechat();
                    uni.hideLoading();
                    uni.showToast({
                        title: t("解绑成功"),
                        icon: "none",
                        duration: 1000
                    });
                    setTimeout(() => {
                        __getProfile();
                    }, 500);
                } catch (error: any) {
                    console.error(error);
                    uni.showToast({
                        title: error.message,
                        icon: "none",
                        duration: 1000
                    });
                } finally {
                    uni.hideLoading();
                }
            }
        }
    });
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

const flowType = ref(uni.getStorageSync("bindWechatFlowType") || null);

onLoad(async (options) => {
    if (options && options.bindWechat) {
        await wechatLogin();
    }
    __getProfile();
});

const __getProfile = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        const result = await getProfile();
        let temp: any = result.mobile;
        result.showMobile = temp.replace(/(\d{2})\d*(\d{4})$/, "$1*****$2");
        Object.assign(form, result);
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
    }
};

const formatter = (type: string, value: string) => {
    if (type === "year") {
        return `${value}${t("年")}`;
    }
    if (type === "month") {
        return `${value}${t("月")}`;
    }
    if (type === "day") {
        return `${value}${t("日")}`;
    }
    return value;
};

const datetimePickerRef = ref();
const showDatetime = ref(false);
const handleShowDatetime = () => {
    showDatetime.value = true;
};
const getBirthday = (val?: any) => {
    if (val && val.value) {
        form.birthday = uni.$u.timeFormat(val.value, "yyyy-mm-dd");
    }
    showDatetime.value = false;
};

// 头像上传成功后的回调
const handleAvatarChange = () => {
    // 重新获取用户信息以更新头像
    __getProfile();
    uni.showToast({
        title: "头像更新成功",
        icon: "success"
    });
};

// 移除了昵称编辑弹窗，现在直接在输入框中编辑

//微信授权登录
const wechatLogin = async () => {
    const result = await getOauthUrl({ url: location.origin + location.pathname });
    window.location.href = result.url;
};
</script>

<style lang="scss" scoped>
.profile-container {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 30rpx;
}

.profile-module {
    background-color: #fff;
    border-radius: 40rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
}

.profile-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &.profile-item-last {
        border-bottom: none;
    }
}

.profile-label {
    font-size: 32rpx;
    color: #333;
    font-weight: 400;
}

.profile-value {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    color: #333;

    &.profile-disabled {
        color: #999;
    }
}

.profile-placeholder {
    color: #ccc;
}

.profile-action {
    color: #999;
}

.profile-arrow {
    margin-left: 16rpx;
    font-size: 28rpx;
    color: #ccc;
}

.avatar-upload-wrapper {
    display: inline-block;
    margin-right: 16rpx;
}

.avatar-image {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    display: block;
}

.nickname-input {
    flex: 1;
    text-align: right;
    font-size: 32rpx;
    color: #333;
    border: none;
    outline: none;
    background: transparent;

    &::placeholder {
        color: #ccc;
    }
}

.bottom-buttons {
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f5f5f5;
    gap: 30rpx;
}

.logout-btn {
    flex: 1;
    height: 88rpx;
    border: 2rpx solid #ddd;
    background-color: #fff;
    color: #333;
    font-size: 32rpx;
    border-radius: 44rpx;
}

.save-btn {
    flex: 1;
    height: 88rpx;
    background: #3544BA !important;
    background-color: #3544BA !important;
    color: #fff !important;
    font-size: 32rpx;
    border-radius: 44rpx;
    border: none;
}

:deep(.save-btn) {
    background: #3544BA !important;
    background-color: #3544BA !important;
}

/* 日期选择器样式 */
:deep(.uni-calendar-item__weeks-box .uni-calendar-item--checked) {
    background-color: var(--general);
}

/* 日期选择器按钮容器样式 */
:deep(.u-datetime-picker__footer) {
    padding: 30rpx !important;
    background-color: #fff !important;
    display: flex !important;
    justify-content: space-between !important;
    gap: 30rpx !important;
}

/* 确定按钮样式 */
:deep(.u-datetime-picker__confirm) {
    flex: 1 !important;
    background-color: #00C853 !important;
    color: #fff !important;
    border-radius: 16rpx !important;
    font-weight: 500 !important;
    font-size: 32rpx !important;
    height: 88rpx !important;
    line-height: 88rpx !important;
    text-align: center !important;
    border: none !important;
    box-shadow: none !important;
}

/* 取消按钮样式 */
:deep(.u-datetime-picker__cancel) {
    flex: 1 !important;
    background-color: #f0f0f0 !important;
    color: #00C853 !important;
    border-radius: 16rpx !important;
    font-weight: 500 !important;
    font-size: 32rpx !important;
    height: 88rpx !important;
    line-height: 88rpx !important;
    text-align: center !important;
    border: none !important;
    box-shadow: none !important;
}

/* 日期选择器滚轮样式 */
:deep(.u-picker-view__mask) {
    background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.6) 50%,
        rgba(255, 255, 255, 0.95) 100%) !important;
}

/* 选中项样式 */
:deep(.u-picker-view__indicator) {
    border-top: 1rpx solid #e0e0e0 !important;
    border-bottom: 1rpx solid #e0e0e0 !important;
    background-color: rgba(0, 0, 0, 0.02) !important;
}

/* 选中文字样式 */
:deep(.u-picker-view-column) {
    font-size: 32rpx !important;
    color: #333 !important;
}

/* 未选中文字样式 */
:deep(.u-picker-view-column .u-picker-view-item) {
    color: #999 !important;
    font-weight: 400 !important;
}

/* 选中行文字样式 */
:deep(.u-picker-view-column .u-picker-view-item.u-picker-view-item--active) {
    color: #000 !important;
    font-weight: 600 !important;
    font-size: 36rpx !important;
}

/* 兼容不同版本的按钮样式 */
:deep(.up-datetime-picker__footer) {
    padding: 30rpx !important;
    background-color: #fff !important;
    display: flex !important;
    justify-content: space-between !important;
    gap: 30rpx !important;
}

:deep(.up-datetime-picker__confirm) {
    flex: 1 !important;
    background-color: #00C853 !important;
    color: #fff !important;
    border-radius: 16rpx !important;
    font-weight: 500 !important;
    font-size: 32rpx !important;
    height: 88rpx !important;
    line-height: 88rpx !important;
    text-align: center !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.up-datetime-picker__cancel) {
    flex: 1 !important;
    background-color: #f0f0f0 !important;
    color: #00C853 !important;
    border-radius: 16rpx !important;
    font-weight: 500 !important;
    font-size: 32rpx !important;
    height: 88rpx !important;
    line-height: 88rpx !important;
    text-align: center !important;
    border: none !important;
    box-shadow: none !important;
}

/* 通用按钮样式 */
:deep(.u-btn) {
    border-radius: 16rpx !important;
    height: 88rpx !important;
    line-height: 88rpx !important;
    font-size: 32rpx !important;
    font-weight: 500 !important;
}

:deep(.u-btn--primary) {
    background-color: #00C853 !important;
    color: #fff !important;
}

:deep(.u-btn--default) {
    background-color: #f0f0f0 !important;
    color: #00C853 !important;
}
</style>
