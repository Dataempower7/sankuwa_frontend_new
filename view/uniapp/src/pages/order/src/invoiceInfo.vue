<template>
    <view class="invoice-info">
        <view class="invoice">
            <view class="invoice-title">{{ $t("发票信息") }}</view>
            <view class="invoice-content" @click="handleInvoice">
                <view class="invoice-text">{{ $t(typeCodeText || "") }}</view>
                <image src="/static/images/common/right.png" style="    width: 15px;  height: 15px;  margin-left: 5px;  opacity: 0.6;" />
            </view>
        </view>
        <tig-popup v-model:show="show">
            <scroll-view scroll-y="true" class="invoice-popup-content" :style="{ height: popupHeight }">
                <view class="invoice-popup-box">
                    <view class="popup-title-center">{{ $t("发票") }}</view>
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

                    <view class="invoice-formState">
                        <uni-forms ref="formRef" :model-value="formState" :rules="rules" label-width="170rpx">
                            <block v-if="formState.invoiceType === 1">
                                <view class="invoice-header">
                                    <view class="header-title">{{ $t('发票抬头') }}</view>
                                    <view class="header-options">
                                        <up-radio-group v-model="formState.titleType" placement="row" @change="radioChange">
                                            <up-radio :custom-style="{ marginRight: '22rpx' }" :name="1" active-color="#3345B9" :label="$t('个人')" />
                                            <up-radio :name="2" active-color="#3345B9" :label="$t('企业')" />
                                        </up-radio-group>
                                    </view>
                                </view>
                                <block v-if="formState.titleType == 1">
                                    <view class="form-item-input" :class="{ 'has-error': formErrors.companyName }">
                                        <view class="form-label">{{ $t('个人名称') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyName"
                                            :placeholder="$t('请输入个人名称')"
                                            placeholder-class="input-placeholder"
                                            @blur="handleBlur('companyName', formState.companyName)"
                                        />
                                    </view>
                                    <view v-if="formErrors.companyName" class="error-message">{{ formErrors.companyName }}</view>
                                </block>
                                <block v-else>
                                    <view class="form-item-input" :class="{ 'has-error': formErrors.companyName }">
                                        <view class="form-label">{{ $t('企业名称') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyName"
                                            :placeholder="$t('请输入企业名称')"
                                            placeholder-class="input-placeholder"
                                            @blur="handleBlur('companyName', formState.companyName)"
                                        />
                                    </view>
                                    <view v-if="formErrors.companyName" class="error-message">{{ formErrors.companyName }}</view>
                                    <view class="form-item-input" :class="{ 'has-error': formErrors.companyCode }">
                                        <view class="form-label">{{ $t('纳税人识号') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyCode"
                                            :placeholder="$t('请输入纳税人识号')"
                                            placeholder-class="input-placeholder"
                                            @blur="handleBlur('companyCode', formState.companyCode)"
                                        />
                                    </view>
                                    <view v-if="formErrors.companyCode" class="error-message">{{ formErrors.companyCode }}</view>
                                    <view class="form-item-input">
                                        <view class="form-label">{{ $t('单位地址') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyAddress"
                                            :placeholder="$t('请输入单位地址')"
                                            placeholder-class="input-placeholder"
                                        />
                                    </view>
                                    <view class="form-item-input">
                                        <view class="form-label">{{ $t('单位电话') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyPhone"
                                            :placeholder="$t('请输入单位电话')"
                                            placeholder-class="input-placeholder"
                                        />
                                    </view>
                                    <view class="form-item-input">
                                        <view class="form-label">{{ $t('开户银行') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyBank"
                                            :placeholder="$t('请输入开户银行')"
                                            placeholder-class="input-placeholder"
                                        />
                                    </view>
                                    <view class="form-item-input">
                                        <view class="form-label">{{ $t('银行账户') }}</view>
                                        <input
                                            class="form-input"
                                            v-model="formState.companyAccount"
                                            :placeholder="$t('请输入银行账户')"
                                            placeholder-class="input-placeholder"
                                        />
                                    </view>
                                </block>
                                <view class="form-item-input" :class="{ 'has-error': formErrors.mobile }">
                                    <view class="form-label">{{ $t('收票人手机') }}</view>
                                    <input
                                        class="form-input"
                                        v-model="formState.mobile"
                                        :placeholder="$t('请输入收票人手机')"
                                        placeholder-class="input-placeholder"
                                        type="number"
                                        @blur="handleBlur('mobile', formState.mobile)"
                                    />
                                </view>
                                <view v-if="formErrors.mobile" class="error-message">{{ formErrors.mobile }}</view>
                                <view class="form-item-input" :class="{ 'has-error': formErrors.email }">
                                    <view class="form-label">{{ $t('收票人邮箱') }}</view>
                                    <input
                                        class="form-input"
                                        v-model="formState.email"
                                        :placeholder="$t('请输入收票人邮箱')"
                                        placeholder-class="input-placeholder"
                                        type="email"
                                        @blur="handleBlur('email', formState.email)"
                                    />
                                </view>
                                <view v-if="formErrors.email" class="error-message">{{ formErrors.email }}</view>
                            </block>
                            <block v-else-if="formState.invoiceType === 2 && invoiceStatus">
                                <view class="invoiceInfo-content-item">
                                    <view class="item-label">{{ $t("纳税人识号") }}</view>
                                    <view class="item-value">{{ formState.companyCode }}</view>
                                </view>
                                <view class="invoiceInfo-content-item">
                                    <view class="item-label">{{ $t("单位地址") }}</view>
                                    <view class="item-value">{{ formState.companyAddress }}</view>
                                </view>
                                <view class="invoiceInfo-content-item">
                                    <view class="item-label">{{ $t("单位电话") }}</view>
                                    <view class="item-value">{{ formState.companyPhone }}</view>
                                </view>
                                <view class="invoiceInfo-content-item">
                                    <view class="item-label">{{ $t("开户银行") }}</view>
                                    <view class="item-value">{{ formState.companyBank }}</view>
                                </view>
                                <view class="invoiceInfo-content-item">
                                    <view class="item-label">{{ $t("银行账户") }}</view>
                                    <view class="item-value">{{ formState.companyAccount }}</view>
                                </view>
                                <uni-forms-item :label="$t('收票人手机')" name="mobile">
                                    <uni-easyinput
                                        v-model="formState.mobile"
                                        primary-color="rgb(192, 196, 204)"
                                        :input-border="false"
                                        :placeholder="$t('请输入收票人手机')"
                                    />
                                </uni-forms-item>
                                <uni-forms-item :label="$t('收票人邮箱')" name="email">
                                    <uni-easyinput
                                        v-model="formState.email"
                                        primary-color="rgb(192, 196, 204)"
                                        :input-border="false"
                                        :placeholder="$t('请输入收票人邮箱')"
                                    />
                                </uni-forms-item>
                            </block>
                            <block v-else>
                                <view class="notPass">
                                    <view
                                        >{{ $t("您还未通过增票资质申请，暂时无法开具增值税专用发票") }}
                                        <text class="notPassBtn" @click="handleApply">{{ $t("去申请") }}</text></view
                                    >
                                </view>
                            </block>
                        </uni-forms>
                    </view>
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="btn-box">
                            <view
                                class="custom-btn cancel-btn"
                                :class="{ 'disabled': formState.invoiceType === 2 && !invoiceStatus }"
                                @click="handleCancelClick"
                            >
                                {{ $t("暂不开票") }}
                            </view>
                            <view
                                class="custom-btn submit-btn"
                                :class="{ 'disabled': formState.invoiceType === 2 && !invoiceStatus }"
                                @click="handleSubmitClick"
                            >
                                {{ $t("提交") }}
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </view>
            </scroll-view>
        </tig-popup>
    </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { getInvoiceStatus, getCheckInvoice } from "@/api/order/invoice";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
    getAddressInfo: {
        type: Object,
        default: () => {}
    },
    invoiceInfo: {
        type: Object,
        default: () => {}
    }
});
const emit = defineEmits(["update:invoiceInfo", "change"]);
const typeCodeText = computed(() => {
    switch (props.invoiceInfo.invoiceType) {
        case 1:
            return "普通发票";
        case 2:
            return "增值税专用发票";
        default:
            return "不开发票";
    }
});

const rules: any = {
    companyCode: {
        rules: [{ required: true, errorMessage: t("纳税人识号不能为空!") }]
    },
    companyAddress: {
        rules: [{ required: true, errorMessage: t("单位地址不能为空!") }]
    },
    companyPhone: {
        rules: [{ required: true, errorMessage: t("单位电话不能为空!") }]
    },
    companyBank: {
        rules: [{ required: true, errorMessage: t("开户银行不能为空!") }]
    },
    companyAccount: {
        rules: [{ required: true, errorMessage: t("银行账户不能为空!") }]
    },
    mobile: {
        rules: [{ required: true, errorMessage: t("手机不能为空!") }]
    }
};

const radioChange = () => {
    clearFormState();
    clearFormErrors();
    __getCheckInvoice();
};

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

const invoiceStatus = ref(false);
const show = ref(false);

// 动态计算弹窗高度
const popupHeight = computed(() => {
    // 基础高度：标题 + 发票类型选择 + 按钮区域 + 说明文字
    let baseHeight = 350; // rpx

    if (formState.invoiceType === 1) {
        // 普通发票
        if (formState.titleType === 1) {
            // 个人：发票抬头 + 个人名称 + 收票人手机 + 收票人邮箱 = 4个区域
            baseHeight += 4 * 80; // 每个输入区域约80rpx
        } else {
            // 企业：发票抬头 + 企业名称 + 纳税人识号 + 单位地址 + 单位电话 + 开户银行 + 银行账户 + 收票人手机 + 收票人邮箱 = 9个区域
            baseHeight += 9 * 80;
        }
    } else if (formState.invoiceType === 2 && invoiceStatus.value) {
        // 增值税专用发票（已认证）
        baseHeight += 8 * 80; // 显示信息项
    } else {
        // 增值税专用发票（未认证）
        baseHeight += 3 * 80; // 提示信息
    }

    // 转换为vh，限制最大高度为85vh，最小高度为60vh
    const vh = Math.min(Math.max(baseHeight / 13.34, 60), 85); // 1vh ≈ 13.34rpx (以750rpx设计稿为基准)
    return `${vh}vh`;
});

// 表单校验状态
const formErrors = reactive({
    companyName: '',
    companyCode: '',
    companyAddress: '',
    companyPhone: '',
    companyBank: '',
    companyAccount: '',
    mobile: '',
    email: ''
});
const __getInvoiceStatus = async () => {
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

const __getCheckInvoice = async () => {
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
        } else if (formState.titleType === 1) {
            formState.companyName = props.getAddressInfo.consignee;
            formState.mobile = props.getAddressInfo.mobile;
            formState.email = props.getAddressInfo.email;
        }
    } catch (error) {
        console.error(error);
    }
};

watch(show, (newVal) => {
    if (newVal) {
        __getInvoiceStatus();
        if (Object.keys(props.invoiceInfo)?.length == 0) {
            __getCheckInvoice();
        }
    }
});

const handleInvoice = () => {
    show.value = true;
};

const handleInvoiceType = (type: number) => {
    formState.invoiceType = type;
    clearFormState();
    if (type == 1) {
        __getCheckInvoice();
    } else {
        __getInvoiceStatus();
    }
};

const formRef = ref();

const onCancel = () => {
    show.value = false;
    emit("update:invoiceInfo", {});
};

const onSubmit = () => {
    formRef.value
        .validate()
        .then(() => {
            emit("update:invoiceInfo", formState);
            show.value = false;
        })
        .catch((err: any) => {
            console.log("表单错误信息：", err);
        });
};

// 表单校验函数
const validateField = (field: string, value: string) => {
    switch (field) {
        case 'companyName':
            if (!value.trim()) {
                formErrors.companyName = formState.titleType === 1 ? t('个人名称不能为空') : t('企业名称不能为空');
                return false;
            }
            if (value.length < 2) {
                formErrors.companyName = t('名称至少需要2个字符');
                return false;
            }
            formErrors.companyName = '';
            return true;

        case 'companyCode':
            if (formState.titleType === 2 && !value.trim()) {
                formErrors.companyCode = t('纳税人识号不能为空');
                return false;
            }
            if (formState.titleType === 2 && value.trim() && !/^[0-9A-Z]{15,20}$/.test(value.trim())) {
                formErrors.companyCode = t('请输入正确的纳税人识号');
                return false;
            }
            formErrors.companyCode = '';
            return true;

        case 'mobile':
            if (!value.trim()) {
                formErrors.mobile = t('收票人手机不能为空');
                return false;
            }
            if (!/^1[3-9]\d{9}$/.test(value.trim())) {
                formErrors.mobile = t('请输入正确的手机号码');
                return false;
            }
            formErrors.mobile = '';
            return true;

        case 'email':
            if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                formErrors.email = t('请输入正确的邮箱地址');
                return false;
            }
            formErrors.email = '';
            return true;

        default:
            return true;
    }
};

// 校验整个表单
const validateForm = () => {
    let isValid = true;

    // 校验必填字段
    if (!validateField('companyName', formState.companyName)) isValid = false;
    if (!validateField('mobile', formState.mobile)) isValid = false;

    // 企业类型额外校验
    if (formState.titleType === 2) {
        if (!validateField('companyCode', formState.companyCode)) isValid = false;
    }

    // 邮箱校验（非必填但格式要正确）
    if (!validateField('email', formState.email)) isValid = false;

    return isValid;
};

// 清空校验错误
const clearFormErrors = () => {
    Object.keys(formErrors).forEach((key: string) => {
        (formErrors as any)[key] = '';
    });
};

// 输入框失焦校验
const handleBlur = (field: string, value: string) => {
    validateField(field, value);
};

// 自定义按钮点击处理
const handleCancelClick = () => {
    if (formState.invoiceType === 2 && !invoiceStatus.value) return;
    onCancel();
};

const handleSubmitClick = () => {
    if (formState.invoiceType === 2 && !invoiceStatus.value) return;

    // 校验表单
    if (!validateForm()) {
        uni.showToast({
            title: t('请检查输入信息'),
            icon: 'none',
            duration: 2000
        });
        return;
    }

    onSubmit();
};

const handleApply = () => {
    uni.navigateTo({
        url: "/pages/user/invoiceManagement/index?type=invoice"
    });
};
</script>

<style lang="scss" scoped>
.invoice {
    border-radius: 18rpx;
    background: #fff;
    padding: 30rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .invoice-content {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .more-ico {
        width: 36rpx;
        height: 36rpx;
        padding-left: 10rpx;
    }
}

.invoice-popup-content {
    // 高度由动态计算决定，不再固定
    max-height: 85vh;
    min-height: 60vh;
    transition: height 0.3s ease; // 添加高度变化的过渡动画

    .invoice-popup-box {
        padding: 30rpx 30rpx 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .title {
        padding-left: 0;
        height: 90rpx;
        line-height: 50rpx;
        padding-bottom: 40rpx;
    }

    .invoice-typemenu {
        //padding-bottom: 20rpx;
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
                color: #6761D0;
            }
        }
    }
}

.item-layout {
    height: 100%;
    display: flex;
    align-items: center;
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

        // 暂不开票按钮样式
        &.cancel-btn {
            background-color: #FFFFFF;
           // color: #000000;
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

.invoiceInfo-content-item {
    display: flex;
    padding: 30rpx 0;
    font-size: 26rpx;
    /*  #ifdef MP-WEIXIN  */
    font-size: 26rpx;
    /*  #endif  */

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .item-label {
        width: 140rpx;
    }
    .item-value {
        padding-left: 48rpx;
    }
}

.notPass {
    padding: 20rpx;
    .notPassBtn {
        color: var(--general);
    }
}

// 新增样式
.popup-title-center {
    text-align: center;
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
}

.invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #ffffff;
    margin-bottom: 20rpx;

    .header-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
    }

    // 单选框样式已在全局定义
}

.form-item-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    .form-label {
        font-size: 28rpx;
        color: #333;
        font-weight: 400;
        flex-shrink: 0;
        margin-right: 20rpx;
    }

    .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
        background: transparent;
        border: none;
        outline: none;

        &::placeholder {
            color: #999;
            font-size: 28rpx;
        }
    }
}

// 占位符样式
.input-placeholder {
    color: #999 !important;
    font-size: 28rpx !important;
}

// 错误状态样式
.form-item-input.has-error {
    .form-input {
        color: #ff4757;
        border-bottom: 1rpx solid #ff4757;
    }
}

// 错误提示样式
.error-message {
    font-size: 24rpx;
    color: #ff4757;
    padding: 8rpx 0 16rpx 0;
    margin-left: 0;
}
</style>
