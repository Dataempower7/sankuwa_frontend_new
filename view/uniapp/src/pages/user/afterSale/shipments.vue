<template>
    <view>
        <tig-layout>
            <view class="shipments-container">
                <view class="returnaddress">
                    <view class="header-row">
                        <view class="title">{{ $t("回寄信息") }}</view>
                        <view class="copy-btn" @click="handleCopy">
                            <text class="copy-text">复制</text>
                        </view>
                    </view>
                    <view class="returnaddress-content">{{ returnAddress }}</view>
                </view>
                <view class="leave-message">
                    <uni-forms ref="formRef" :model-value="form" label-width="170rpx" :rules="rules">
                        <uni-forms-item :label="$t('快递公司')" name="logisticsName">
                            <uni-easyinput
                                v-model="form.logisticsName"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                :placeholder="$t('请您填写快递公司')"
                            />
                        </uni-forms-item>
                        <uni-forms-item :label="$t('快递单号')" name="trackingNo">
                            <uni-easyinput
                                v-model="form.trackingNo"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                :placeholder="$t('请您填写快递单号')"
                            />
                        </uni-forms-item>
                    </uni-forms>
                </view>
                <view class="leave-message-btn">
                    <view class="btn-box" @click="handleSubmit">{{ $t("提交") }}</view>
                </view>
            </view>
        </tig-layout>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { aftersalesFeedback } from "@/api/user/afterSale";
import { onLoad } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const form = reactive({
    logisticsName: "",
    trackingNo: "",
    id: 0
});
const returnAddress = ref("");

const rules = {
    logisticsName: {
        rules: [{ required: true, errorMessage: t("快递公司不能为空") }]
    },
    trackingNo: {
        rules: [{ required: true, errorMessage: t("快递单号不能为空") }]
    }
};

onLoad((options) => {
    if (options) {
        if (options.id) {
            form.id = options.id;
        }
        if (options.returnAddress) {
            returnAddress.value = options.returnAddress;
        }
    }
});

const formRef = ref();
const handleSubmit = () => {
    formRef.value
        .validate()
        .then(() => {
            __aftersalesFeedback();
        })
        .catch((err: any) => {
            console.log("表单错误信息：", err);
        });
};

const __aftersalesFeedback = async () => {
    try {
        const result = await aftersalesFeedback(form);

        uni.redirectTo({
            url: "/pages/user/afterSale/info",
            success: () => {
                uni.$emit("refreshInfo", form.id);
            }
        });
    } catch (error) {
        console.error(error);
    }
};

// 复制回寄信息
const handleCopy = () => {
    if (!returnAddress.value) {
        uni.showToast({
            title: t("暂无回寄信息"),
            icon: 'none',
            duration: 1500
        });
        return;
    }
    
    uni.setClipboardData({
        data: returnAddress.value,
        success: () => {
            uni.showToast({
                title: t("复制成功"),
                icon: 'success',
                duration: 1500
            });
        },
        fail: () => {
            uni.showToast({
                title: t("复制失败"),
                icon: 'none',
                duration: 1500
            });
        }
    });
};
</script>

<style lang="scss" scoped>
// 整体容器 - 添加上下左右间隙，实现往下移动效果
.shipments-container {
    padding: 180rpx 20rpx;
}

.returnaddress {
    background-color: #fff;
    padding: 30rpx 25rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .header-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15rpx;
    }

    .title {
        color: #000;
        font-weight: 500;
        font-size: 30rpx;
        flex: 1;
    }

    .copy-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10rpx 24rpx;
        background-color: #f5f6fa;
        border-radius: 30rpx;
        border: 1rpx solid #e5e7eb;
        transition: all 0.3s;
        position: relative;
        top: 25rpx;

        .copy-text {
            font-size: 26rpx;
            color: #3544BA;
            font-weight: 500;
        }

        &:active {
            background-color: #e8eaf0;
            transform: scale(0.95);
        }
    }

    .returnaddress-content {
        width: 100%;
        font-size: 26rpx;
        line-height: 40rpx;
        color: #666;
    }
}

.leave-message {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 10rpx 0;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

:deep(.special-item) {
    &.uni-forms-item {
        border-bottom: none;
        margin-bottom: 0;
    }
}

.uni-forms-item {
    margin: 10rpx 25rpx 10rpx 25rpx;
    padding: 20rpx 0;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
        padding-bottom: 20rpx;
    }
}

.leave-message-btn {
    padding: 0;

    .btn-box {
        width: 100%;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #3544BA;
        color: #fff;
        border-radius: 20rpx;
        font-size: 32rpx;
        font-weight: 500;
        box-shadow: 0 4rpx 16rpx rgba(53, 68, 186, 0.3);
        margin-top: 80rpx;
        &:active {
            opacity: 0.8;
            transform: scale(0.98);
        }
    }
}

:deep(.uni-forms-item__error) {
    top: 70%;
    left: 3.5%;
}
</style>
