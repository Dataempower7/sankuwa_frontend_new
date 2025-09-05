<template>
    <view class="container">
        <template v-if="loaded">
            <tig-layout title="商家入驻" :border-bottom="true">
                <view class="type-title">{{ $t("选择主体类型和经营类目") }}</view>
                <view class="type-container">
                    <view class="type-box" :class="{ active: type === 1 }" @click="type = 1">
                        <view class="type-content">
                            <view class="type-image">
                                <image src="/static/images/merchanEnter/personal.png" mode="aspectFit" />
                            </view>
                            <view class="type-text">个人</view>
                        </view>
                        <view v-if="type === 1" class="check-icon">
                            <image src="/static/images/common/dagou.png" mode="aspectFit" />
                        </view>
                    </view>
                    <view class="type-box" :class="{ active: type === 2 }" @click="type = 2">
                        <view class="type-content">
                            <view class="type-image">
                                <image src="/static/images/merchanEnter/business.png" mode="aspectFit" />
                            </view>
                            <view class="type-text">企业</view>
                        </view>
                        <view v-if="type === 2" class="check-icon">
                            <image src="/static/images/common/dagou.png" mode="aspectFit" />
                        </view>
                    </view>
                </view>

                <tig-fixed-placeholder :border="false" background-color="#fff">
                    <view class="btn-box">
                        <view
                            ref="confirmBtn"
                            class="custom-btn"
                            :class="{
                                'btn-active': isChecked
                            }"
                            @click="handleAffirm"
                        >
                            {{ $t("确认") }}
                        </view>
                        <view class="agreement" :class="{ 'agreement-shake': isShaking }">
                            <tig-checkbox v-model:checked="isChecked" />
                            <text class="agreement-text" @click="isChecked = !isChecked">{{ $t("我已阅读并同意") }}</text>
                            <text class="agreement-link" @click="handleLink">《{{ $t("商户入驻协议") }}》</text>
                        </view>
                    </view>
                </tig-fixed-placeholder>
            </tig-layout>
        </template>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getMyMerchant } from "@/api/user/merchantEnter";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const type = ref(1);
const isReapply = ref(false);
const id = ref(0);
const isChecked = ref(false);
const isShaking = ref(false);
const handleAffirm = () => {
    if (!isChecked.value) {
        // 触发抖动效果
        isShaking.value = true;
        setTimeout(() => {
            isShaking.value = false;
        }, 600);

        uni.showToast({
            title: t("请先阅读并同意协议"),
            icon: "none"
        });
        return;
    }

    // 检查是否选择了个人类型
    if (type.value === 1) {
        uni.showModal({
            title: t("温馨提示"),
            content: t("很抱歉，平台暂不支持个体户入驻。我们正在努力完善相关功能，敬请期待！如有疑问，请联系客服咨询。"),
            showCancel: false,
            confirmText: t("我知道了"),
            confirmColor: "#3544BA"
        });
        return;
    }

    if (id.value > 0 && isReapply.value) {
        uni.navigateTo({
            url: `/pages/user/merchantEnter/index?id=${id.value}&type=${type.value}&isReapply=${isReapply.value}`
        });
        return;
    }
    uni.navigateTo({
        url: `/pages/user/merchantEnter/index?type=${type.value}`
    });
};
const loaded = ref(false);
const _getMyMerchant = async () => {
    try {
        const result = await getMyMerchant();
        if (result && Object.keys(result).length > 0) {
            if (!isReapply.value) {
                uni.redirectTo({
                    url: `/pages/user/merchantEnter/index?id=${result.merchantApplyId}&type=${result.type}`
                });
            } else {
                id.value = result.merchantApplyId;
            }
        }
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    } finally {
        loaded.value = true;
    }
};

const handleLink = () => {
    uni.navigateTo({
        url: "/pages/user/merchantEnter/agreement"
    });
};

onLoad(async (options) => {
    if (options && options.type) {
        isReapply.value = true;
    }
});

onShow(async () => {
    _getMyMerchant();
});
</script>
<style lang="scss" scoped>
.container {
    padding: 50rpx;
}
.type-title {
    padding-top: 100rpx;
    font-weight: 600;
    font-size: 42rpx;
    line-height: 56rpx;
    display: block;
    padding-bottom: 63rpx;
    color: var(--general);
    text-align: center;
}
.type-container {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
  //  padding: 0 20rpx;
     margin-top: 90rpx;
}

.type-box {
    flex: 1;
    height: 320rpx;
    background-color: #ffffff;
    border: 5rpx solid #e9ecef;
    border-radius: 20rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
        background-color: #fff;
        border-color: #3743B5;
        box-shadow: 0 4rpx 12rpx rgba(55, 67, 181, 0.15);
    }

    .type-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .type-image {
            width: 120rpx;
            height: 120rpx;
            margin-bottom: 20rpx;

            image {
                width: 100%;
                height: 100%;
            }
        }

        .type-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
        }
    }

    .check-icon {
        position: absolute;
        top: -4rpx;
        right: -4rpx;
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;

       
    }
}



.btn-box {
    padding: 25rpx;
    position: relative;

    .btn {
        font-size: 28rpx;
    }

    .custom-btn {
        width: 100%;
        height: 88rpx;
        background-color: #9AA0DC;
        border-radius: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;

        &.btn-active {
            background-color: #3544BA;
        }

        &:active {
            transform: scale(0.98);
        }
    }
}

    .agreement {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        width: 100%;
        top: -100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .agreement-link {
            color: #6161BE;
        }

        &.agreement-shake {
            animation: shake 0.6s ease-in-out;
        }
    }


/* 抖动动画 */
@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-8rpx);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(8rpx);
    }
}
</style>
