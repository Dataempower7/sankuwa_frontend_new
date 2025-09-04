<template>
    <tig-layout title="申请开票" :need-safe-top="false" >
        <view class="invoice-apply-page">
        <view class="order-info">
            <view class="order-title">订单信息</view>
            <view class="order-content">
                <view class="order-item">
                    <text class="label">订单编号：</text>
                    <text class="value">{{ orderInfo.orderSn }}</text>
                </view>
                <view class="order-item">
                    <text class="label">订单金额：</text>
                    <text class="value price">¥{{ formatPrice(orderInfo.totalAmount) }}</text>
                </view>
                <view class="order-item">
                    <text class="label">下单时间：</text>
                    <text class="value">{{ formatTime(orderInfo.payTime) }}</text>
                </view>
            </view>
        </view>

        <view class="invoice-form">
            <view class="form-title">发票信息</view>
            <view class="invoice-typemenu">
                <view class="invoice-typemenu-item ordinary-invoice" :class="{ active: formState.invoiceType === 1 }" @click="handleInvoiceType(1)">普通发票</view>
                <!-- <view
                    v-if="configStore.invoiceAdded == 1"
                    class="invoice-typemenu-item"
                    :class="{ active: formState.invoiceType === 2 }"
                    @click="handleInvoiceType(2)"
                    >增值税专用发票</view
                > -->
                <view class="invoice-explain">
                    我公司依法开具发票，请您按照税法规定使用发票。根据现行税收政策，部分公司提供数电票,
                    数电（专用发票）法律效力与现有增值税专用发票相同;如商品由第三方卖家销售，发票类型和内容将由该卖家决定，发票由卖家开具并提供。如您为企业采购，需要多单合并开具或批量提交发票可注册企业用户；<text
                        class="special-text"
                        >使用礼品卡支付部分的金额，不支持开发票</text
                    >
                </view>
            </view>

            <uni-forms ref="formRef" :model-value="formState" :rules="rules" label-width="170rpx">
                <block v-if="formState.invoiceType === 1">
                    <uni-forms-item label="发票抬头" name="name">
                        <view class="item-layout">
                            <up-radio-group v-model="formState.titleType" placement="row" @change="radioChange">
                                <up-radio :custom-style="{ marginRight: '22rpx' }" :name="1" active-color="#3345B9" label="个人" />
                                <up-radio :name="2" active-color="#3345B9" label="企业" />
                            </up-radio-group>
                        </view>
                    </uni-forms-item>
                    <block v-if="formState.titleType == 1">
                        <uni-forms-item
                            label="个人名称"
                            name="companyName"
                            :rules="[{ required: true, errorMessage: '个人名称不能为空' }]"
                        >
                            <uni-easyinput
                                v-model="formState.companyName"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入个人名称"
                            />
                        </uni-forms-item>
                    </block>
                    <block v-else>
                        <uni-forms-item
                            label="企业名称"
                            name="companyName"
                            :rules="[{ required: true, errorMessage: '企业名称不能为空' }]"
                        >
                            <uni-easyinput
                                v-model="formState.companyName"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入企业名称"
                            />
                        </uni-forms-item>
                        <uni-forms-item label="纳税人识号" name="companyCode">
                            <uni-easyinput
                                v-model="formState.companyCode"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入纳税人识号"
                            />
                        </uni-forms-item>
                        <uni-forms-item label="单位地址" name="companyAddress">
                            <uni-easyinput
                                v-model="formState.companyAddress"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入单位地址"
                            />
                        </uni-forms-item>
                        <uni-forms-item label="单位电话" name="companyPhone">
                            <uni-easyinput
                                v-model="formState.companyPhone"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入单位电话"
                            />
                        </uni-forms-item>
                        <uni-forms-item label="开户银行" name="companyBank">
                            <uni-easyinput
                                v-model="formState.companyBank"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入开户银行"
                            />
                        </uni-forms-item>
                        <uni-forms-item label="银行账户" name="companyAccount">
                            <uni-easyinput
                                v-model="formState.companyAccount"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                placeholder="请输入银行账户"
                            />
                        </uni-forms-item>
                    </block>
                    <uni-forms-item label="收票人手机" name="mobile">
                        <uni-easyinput
                            v-model="formState.mobile"
                            primary-color="rgb(192, 196, 204)"
                            :input-border="false"
                            placeholder="请输入收票人手机"
                        />
                    </uni-forms-item>
                    <uni-forms-item label="收票人邮箱" name="email">
                        <uni-easyinput
                            v-model="formState.email"
                            primary-color="rgb(192, 196, 204)"
                            :input-border="false"
                            placeholder="请输入收票人邮箱"
                        />
                    </uni-forms-item>
                </block>
                <!-- <block v-else-if="formState.invoiceType === 2 && invoiceStatus">
                    <view class="invoiceInfo-content-item">
                        <view class="item-label">纳税人识号</view>
                        <view class="item-value">{{ formState.companyCode }}</view>
                    </view>
                    <view class="invoiceInfo-content-item">
                        <view class="item-label">单位地址</view>
                        <view class="item-value">{{ formState.companyAddress }}</view>
                    </view>
                    <view class="invoiceInfo-content-item">
                        <view class="item-label">单位电话</view>
                        <view class="item-value">{{ formState.companyPhone }}</view>
                    </view>
                    <view class="invoiceInfo-content-item">
                        <view class="item-label">开户银行</view>
                        <view class="item-value">{{ formState.companyBank }}</view>
                    </view>
                    <view class="invoiceInfo-content-item">
                        <view class="item-label">银行账户</view>
                        <view class="item-value">{{ formState.companyAccount }}</view>
                    </view>
                    <uni-forms-item label="收票人手机" name="mobile">
                        <uni-easyinput
                            v-model="formState.mobile"
                            primary-color="rgb(192, 196, 204)"
                            :input-border="false"
                            placeholder="请输入收票人手机"
                        />
                    </uni-forms-item>
                    <uni-forms-item label="收票人邮箱" name="email">
                        <uni-easyinput
                            v-model="formState.email"
                            primary-color="rgb(192, 196, 204)"
                            :input-border="false"
                            placeholder="请输入收票人邮箱"
                        />
                    </uni-forms-item>
                </block>
                <block v-else>
                    <view class="notPass">
                        <view>您还未通过增票资质申请，暂时无法开具增值税专用发票
                            <text class="notPassBtn" @click="handleApply">去申请</text>
                        </view>
                    </view>
                </block> -->
            </uni-forms>
        </view>

        <tig-fixed-placeholder background-color="#fff">
            <view class="btn-box">
                <view
                    class="custom-btn cancel-btn"
                    @click="onCancel"
                >
                    {{ $t("取消") }}
                </view>
                <view
                    class="custom-btn submit-btn"
                    :class="{ 'disabled': formState.invoiceType === 2 && !invoiceStatus }"
                    @click="handleSubmitClick"
                >
                    {{ $t("提交申请") }}
                </view>
            </view>
        </tig-fixed-placeholder>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getInvoiceStatus, getCheckInvoice } from "@/api/order/invoice";
import { getOrder } from "@/api/user/order";
import { orderInvoiceInsert } from "@/api/user/invoiceManagemen";

// 页面参数
const orderId = ref<number>(0);

// 订单信息
const orderInfo = ref<any>({});

// 发票表单状态
const formState = reactive({
    titleType: 1, // 抬头类型
    invoiceType: 1, // 发票类型
    companyName: "",
    mobile: "",
    email: "",
    companyCode: "",
    companyAddress: "",
    companyPhone: "",
    companyBank: "",
    companyAccount: ""
});

// 表单验证规则
const rules: any = {
    companyCode: {
        rules: [{ required: true, errorMessage: "纳税人识号不能为空!" }]
    },
    companyAddress: {
        rules: [{ required: true, errorMessage: "单位地址不能为空!" }]
    },
    companyPhone: {
        rules: [{ required: true, errorMessage: "单位电话不能为空!" }]
    },
    companyBank: {
        rules: [{ required: true, errorMessage: "开户银行不能为空!" }]
    },
    companyAccount: {
        rules: [{ required: true, errorMessage: "银行账户不能为空!" }]
    },
    mobile: {
        rules: [{ required: true, errorMessage: "手机不能为空!" }]
    }
};

const invoiceStatus = ref(false);
const formRef = ref();

// 页面加载
onLoad((options: any) => {
    if (options.orderId) {
        orderId.value = parseInt(options.orderId);
        getOrderDetail();
    }
});

// 获取订单详情
const getOrderDetail = async () => {
    try {
        const result = await getOrder({ id: orderId.value });
        orderInfo.value = result;
    } catch (error) {
        console.error('获取订单详情失败:', error);
        uni.showToast({
            title: '获取订单信息失败',
            icon: 'error'
        });
    }
};

// 格式化价格
const formatPrice = (price: number) => {
    return (price || 0).toFixed(2);
};

// 格式化时间
const formatTime = (time: string) => {
    if (!time) return '';
    return new Date(time).toLocaleString();
};

// 获取增票资质状态
const getInvoiceStatusInfo = async () => {
    try {
        const result = await getInvoiceStatus();
        if (result && Object.keys(result).length > 0) {
            invoiceStatus.value = true;
            if (formState.invoiceType === 2) {
                formState.companyCode = result.companyCode;
                formState.companyAddress = result.companyAddress;
                formState.companyPhone = result.companyPhone;
                formState.companyBank = result.companyBank;
                formState.companyAccount = result.companyAccount;
            }
        } else {
            invoiceStatus.value = false;
        }
    } catch (error) {
        console.error(error);
    }
};

// 获取发票信息
const getCheckInvoiceInfo = async () => {
    try {
        const result = await getCheckInvoice({
            invoiceType: formState.invoiceType,
            titleType: formState.titleType
        });
        if (result) {
            if (formState.invoiceType === 1 && formState.titleType === 1) {
                formState.companyName = result.companyName;
                formState.mobile = result.mobile;
                formState.email = result.email;
            } else {
                formState.companyCode = result.companyCode;
                formState.companyName = result.companyName;
                formState.companyAddress = result.companyAddress;
                formState.companyPhone = result.companyPhone;
                formState.companyBank = result.companyBank;
                formState.companyAccount = result.companyAccount;
            }
            formState.mobile = result.mobile;
            formState.email = result.email;
        }
    } catch (error) {
        console.error(error);
    }
};

// 清空表单
const clearFormState = () => {
    formState.companyName = "";
    formState.mobile = "";
    formState.email = "";
    formState.companyCode = "";
    formState.companyAddress = "";
    formState.companyPhone = "";
    formState.companyBank = "";
    formState.companyAccount = "";
};

// 发票类型切换
const handleInvoiceType = (type: number) => {
    formState.invoiceType = type;
    clearFormState();
    if (type == 1) {
        getCheckInvoiceInfo();
    } else {
        getInvoiceStatusInfo();
    }
};

// 抬头类型切换
const radioChange = () => {
    clearFormState();
    getCheckInvoiceInfo();
};



// 取消
const onCancel = () => {
    uni.navigateBack();
};

// 自定义按钮点击处理
const handleSubmitClick = () => {
    if (formState.invoiceType === 2 && !invoiceStatus.value) return;
    onSubmit();
};

// 提交申请
const onSubmit = () => {
    formRef.value
        .validate()
        .then(async () => {
            try {
                // 显示加载提示
                uni.showLoading({
                    title: '提交中...'
                });

                // 准备提交数据
                const submitData = {
                    orderId: orderId.value,
                    invoiceType: formState.invoiceType,
                    titleType: formState.titleType,
                    companyName: formState.companyName,
                    mobile: formState.mobile,
                    email: formState.email,
                    companyCode: formState.companyCode,
                    companyAddress: formState.companyAddress,
                    companyPhone: formState.companyPhone,
                    companyBank: formState.companyBank,
                    companyAccount: formState.companyAccount
                };

                // 调用申请发票的API
                await orderInvoiceInsert(submitData);

                uni.hideLoading();
                uni.showToast({
                    title: '申请提交成功',
                    icon: 'success'
                });

                // 成功后返回上一页
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } catch (error: any) {
                uni.hideLoading();
                console.error('申请发票失败:', error);

                // 根据错误信息显示不同的提示
                let errorMessage = '申请失败，请重试';
                if (error?.message) {
                    errorMessage = error.message;
                } else if (error?.data?.message) {
                    errorMessage = error.data.message;
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 2000
                });
            }
        })
        .catch((err: any) => {
            console.log("表单错误信息：", err);
        });
};
</script>

<style lang="scss" scoped>
.invoice-apply-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 0 20rpx 160rpx 20rpx; // 移除顶部内边距，只保留左右和底部
}

.order-info {
    background: #fff;
    border-radius: 18rpx;
    padding: 30rpx;
    margin: 20rpx 0 20rpx 0; // 添加顶部间距

    .order-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 20rpx;
    }

    .order-content {
        .order-item {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            padding: 15rpx 0;
            border-bottom: 1rpx solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }

            .label {
                font-size: 28rpx;
                color: #666;
                min-width: 160rpx;
                flex-shrink: 0;
                text-align: left;
            }

            .value {
                font-size: 28rpx;
                color: #333;
                flex: 1;
                text-align: left;

                &.price {
                    color: #000000;
                    font-weight: 600;
                }
            }
        }
    }
}

.invoice-form {
    background: #fff;
    border-radius: 18rpx;
    padding: 30rpx;

    .form-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 30rpx;
    }

    .invoice-typemenu {
        margin-bottom: 30rpx;
        padding-bottom: 20rpx;
        border-bottom: 1rpx solid #ffffff;

        .invoice-typemenu-item {
            background: #f2f2f2;
            color: #282828;
            padding: 13rpx 36rpx;
            border-radius: 50rpx;
            font-size: 25rpx;
            display: inline-block;
            margin-right: 28rpx;
            margin-bottom: 10rpx;

            &.active {
                color: #fff;
                background-color: var(--general);
            }

            // 普通发票按钮特殊样式
            &.ordinary-invoice {
                background: #EDEEFF;
                color: #3345B9;
                border: 1rpx solid #9495C6;

                &.active {
                    background: #EDEEFF;
                    color: #3345B9;
                    border: 1rpx solid #9495C6;
                }
            }
        }

        .invoice-explain {
            padding: 10rpx 0;
            font-size: 25rpx;
            color: #999;

            .special-text {
                color: #4A50A7;
            }
        }
    }
}

.item-layout {
    height: 100%;
    display: flex;
    align-items: center;
}

.invoiceInfo-content-item {
    display: flex;
    padding: 30rpx 0;
    font-size: 26rpx;

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .item-label {
        width: 140rpx;
        color: #666;
    }
    .item-value {
        padding-left: 48rpx;
        color: #333;
    }
}

.notPass {
    padding: 20rpx;
    font-size: 26rpx;
    color: #666;

    .notPassBtn {
        color: var(--general);
    }
}

// 底部固定按钮容器
:deep(.tig-fixed-placeholder) {
    position: fixed;
    bottom: 100rpx; // 往上移动更多，距离底部100rpx
    left: 0;
    right: 0;
    z-index: 998;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1); // 添加阴影效果
}

.btn-box {
    height: 100%;
    width: 100%;
    padding: 25rpx;
    display: flex;
    gap: 20rpx; // 添加按钮间隙

    .custom-btn {
        flex: 1; // 使用flex布局替代固定宽度
        height: 88rpx;
        line-height: 88rpx;
        text-align: center;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        // 取消按钮样式
        &.cancel-btn {
            background-color: #FFFFFF;
            color: #000000;
            border: 1rpx solid #000000;
        }

        // 提交按钮样式
        &.submit-btn {
            background-color: #3544BA;
            color: #FFFFFF;
            border: 1rpx solid #3544BA;
        }

        // 禁用状态
        &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        // 点击效果
        &:active:not(.disabled) {
            transform: scale(0.98);
        }
    }
}

:deep(.uni-forms-item) {
    margin-bottom: 30rpx;
}

:deep(.uni-forms-item__error) {
    top: 90%;
    left: 18rpx;
}

:deep(.uni-easyinput__placeholder-class) {
    font-size: 26rpx;
}

:deep(.uni-forms-item__label) {
    font-size: 26rpx;
}
</style>
