<template>
    <tig-layout title="申请售后" :need-safe-top="true">
        <view v-if="Object.keys(infoData).length" class="after-sale" >
            <!-- 商品列表模块 -->
            <view class="after-sale-product module-card module-margin">
                <template v-for="item in infoData.list" :key="item.itemId">
                    <view class="product-card-item">
                        <view class="product-card-item-left">
                            <view class="left-img">
                                <tig-image :src="item.picThumb" />
                            </view>
                        </view>
                        <view class="product-card-item-right">
                            <view class="right-title line2">
                                {{ item.productName }}
                            </view>
                            <view class="right-price">
                                <format-price
                                    :show-text="false"
                                    :decimals-style="{
                                        fontSize: '24rpx',
                                        fontWeight: 'bold'
                                    }"
                                    :currency-style="{
                                        fontSize: '22rpx',
                                        fontWeight: 'bold'
                                    }"
                                    class="right-price-pricenum"
                                    :price-data="item.price"
                                />
                                <view class="right-price-quantity">x {{ item.quantity }}</view>
                            </view>
                        </view>
                        <view class="btn-box">
                            <view class="btn-box-content">
                                <text class="btn-box-content-text">{{ $t("可退换数量") }}{{ item.quantity }}</text>
                                <uni-number-box v-model="item.number" :max="item.quantity" />
                            </view>
                        </view>
                    </view>
                </template>
            </view>

            <!-- 退款方式和退款原因问题描述上传凭证模块 -->
            <view class="after-sale-form module-card module-margin">
                <uni-forms ref="formRef" :model-value="form" label-width="170rpx">
                    <uni-forms-item :label="$t('退款方式')" name="aftersaleType">
                        <picker style="height: 100%" :value="aftersaleTypeIndex" range-key="label" :range="aftersaleTypeList" @change="getAftersaleType">
                            <view class="form-item-content">
                                <view>
                                    <text v-if="aftersaleTypeIndex !== null" class="form-item-value">{{ aftersaleTypeList[aftersaleTypeIndex!].label }}</text>
                                    <text v-else class="form-item-text">{{ $t("请选择") }}</text>
                                </view>
                                <view class="form-item-icon">
                                    <uni-icons type="arrowright" size="16" color="#999" />
                                </view>
                            </view>
                        </picker>
                    </uni-forms-item>
                    <uni-forms-item :label="$t('退款原因')" name="aftersaleReason">
                        <picker :value="aftersaleReasonIndex" :range="aftersaleReasonList" @change="getAftersaleReason">
                            <view class="form-item-content">
                                <view>
                                    <text v-if="form.aftersaleReason" class="form-item-value">{{ form.aftersaleReason }}</text>
                                    <text v-else class="form-item-text">{{ $t("请选择") }}</text>
                                </view>
                                <view class="form-item-icon">
                                    <uni-icons type="arrowright" size="16" color="#999" />
                                </view>
                            </view>
                        </picker>
                    </uni-forms-item>
                    <!-- 问题描述 -->
                    <view class="form-section">
                        <view class="section-label">问题描述</view>
                        <view class="description-input-box">
                            <textarea
                                v-model="form.description"
                                class="description-textarea"
                                placeholder="最多100字"
                                maxlength="100"
                                auto-height
                            />
                        </view>
                    </view>

                    <!-- 上传凭证 -->
                    <view class="form-section">
                        <view class="section-label">上传凭证 ({{ fileLists.length }}张)</view>

                        <view class="upload-container">
                            <!-- 上传按钮 -->
                            <view v-if="fileLists.length < 5" class="upload-btn" @click="chooseImage">
                                <image src="/static/images/common/camera.png" class="camera-icon" />
                                <text class="upload-text">选择图片</text>
                                <text class="upload-count">({{ fileLists.length }}/5)</text>
                            </view>

                            <!-- 已上传的图片 -->
                            <view v-for="(item, index) in fileLists" :key="index" class="upload-item">
                                <image :src="item.url" class="upload-image" mode="aspectFill" />
                                <view class="delete-btn" @click="removeImage(index)">
                                    <text class="delete-icon">×</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </uni-forms>
            </view>
            <tig-fixed-placeholder background-color="#fff">
                <view class="after-sale-btn-box">
                    <tig-button color="#3544BA" @click="handleSave"> {{ $t("提交") }} </tig-button>
                </view>
            </tig-fixed-placeholder>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref, reactive } from "vue";
import { getAftersalesEdit, updateAfterSales, getAftersalesConfig, aftersalesViewRecord, aftersalesUpdate } from "@/api/user/afterSale";
import { useI18n } from "vue-i18n";
import { baseUrl, getSecret } from "@/utils/request";

const { t } = useI18n();

const orderId = ref<number | null>();
const itemId = ref<number | null>();
const aftersaleId = ref<number | null>();

onLoad(async (options) => {
    if (options) {
        if (options.orderId) {
            orderId.value = options.orderId;
            itemId.value = options.itemId;
            await __getAftersalesEdit();
        }
        if (options.aftersaleId) {
            aftersaleId.value = options.aftersaleId;
            await __getAftersalesDetail();
        }
        await __getAftersalesConfig();
    }
});

const infoData = ref<{ list: any; order: any }>({
    list: [],
    order: {}
});
const aftersaleTypeList = ref<any[]>([]);
const __getAftersalesEdit = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        if (orderId.value) {
            const result = await getAftersalesEdit({
                itemId: itemId.value,
                orderId: orderId.value
            });
            infoData.value.list = result.list;
            infoData.value.order = result.order;
            infoData.value.list.forEach((item: any) => {
                item.number = item.quantity;
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
    }
};

const aftersaleReasonList = ref<any[]>([]);
const __getAftersalesConfig = async () => {
    try {
        const result = await getAftersalesConfig();
        aftersaleReasonList.value = result.aftersaleReason;
        Object.keys(result.aftersaleType).forEach((key) => {
            if (Number(infoData.value?.order?.orderStatus) === 1 && Number(key) === 1) {
                return;
            } else {
                aftersaleTypeList.value.push({
                    value: Number(key),
                    label: result.aftersaleType[key]
                });
            }
        });

        if (aftersaleId.value) {
            aftersaleTypeIndex.value = aftersaleTypeList.value.findIndex((item: any) => item.value === form.aftersaleType);
            aftersaleReasonIndex.value = aftersaleReasonList.value.findIndex((item: any) => item === form.aftersaleReason);
        }
    } catch (error) {
        console.error(error);
    }
};

const __getAftersalesDetail = async () => {
    try {
        const result = await aftersalesViewRecord(aftersaleId.value!);
        // 处理商品数据，确保字段匹配
        infoData.value.list = result.aftersalesItems.map((item: any) => ({
            ...item,
            itemId: item.aftersalesItemId || item.itemId,
            quantity: item.number || item.quantity,
            number: item.number || item.quantity
        }));
        infoData.value.order = result.orders || result;
        form.aftersaleId = result.aftersaleId;
        form.description = result.description;
        // 处理图片数据，确保数据结构匹配
        if (result.pics && Array.isArray(result.pics)) {
            fileLists.value = result.pics.map((pic: any) => {
                if (typeof pic === 'string') {
                    // 如果是字符串URL，转换为对象格式
                    return {
                        name: '',
                        extname: '',
                        url: pic,
                        picName: '',
                        picThumb: pic,
                        picUrl: pic
                    };
                } else if (pic && (pic.picThumb || pic.picUrl || pic.url)) {
                    // 如果是数据库格式的对象 {picName, picThumb, picUrl}
                    return {
                        name: pic.picName || '',
                        extname: pic.picUrl ? pic.picUrl.split(".").pop() || '' : '',
                        url: pic.picThumb || pic.picUrl || pic.url,
                        picName: pic.picName,
                        picThumb: pic.picThumb,
                        picUrl: pic.picUrl
                    };
                } else {
                    // 兜底处理
                    return {
                        name: '',
                        extname: '',
                        url: typeof pic === 'string' ? pic : pic.url || pic,
                        picName: pic.picName || '',
                        picThumb: pic.picThumb || pic.url || pic,
                        picUrl: pic.picUrl || pic.url || pic
                    };
                }
            });
        } else {
            fileLists.value = [];
        }
        form.aftersaleReason = result.aftersaleReason;
        form.aftersaleType = result.aftersaleType;
    } catch (error) {
        console.error(error);
    }
};

interface Iform {
    items: Item[];
    pics: any[];
    orderId: number;
    aftersaleType: number;
    aftersaleReason: string;
    description: string;
    aftersaleId?: number;
}

interface Item {
    orderItemId: number;
    number: number;
}
const form = reactive<Iform>({
    items: [],
    pics: [],
    orderId: 0,
    aftersaleType: 0,
    aftersaleReason: "",
    description: ""
});

interface FileLists {
    name: string;
    extname: string;
    url: string;
    picName?: string;
    picThumb?: string;
    picUrl?: string;
}
const fileLists = ref<FileLists[]>([]);
const aftersaleTypeIndex = ref<null | number>(null);

const getAftersaleType = (e: any) => {
    aftersaleTypeIndex.value = e.detail.value;
    form.aftersaleType = aftersaleTypeList.value[aftersaleTypeIndex.value!].value;
};

const aftersaleReasonIndex = ref<null | number>(null);
const getAftersaleReason = (e: any) => {
    aftersaleReasonIndex.value = e.detail.value;
    form.aftersaleReason = aftersaleReasonList.value[aftersaleReasonIndex.value!];
};

const handleSave = async () => {
    if (form.aftersaleType === 0)
        return uni.showToast({
            title: t("请选择退款方式"),
            icon: "none"
        });
    if (form.aftersaleReason === "")
        return uni.showToast({
            title: t("请选择退款原因"),
            icon: "none"
        });
    if (form.description === "")
        return uni.showToast({
            title: t("请填写问题描述"),
            icon: "none"
        });
    // 将fileLists转换为服务器期望的格式
    form.pics = fileLists.value.map(item => ({
        picName: item.picName || item.name,
        picThumb: item.picThumb || item.url,
        picUrl: item.picUrl || item.url
    }));
    form.orderId = infoData.value.order.orderId;
    if (form.aftersaleId) {
        infoData.value.list.forEach((item: any) => {
            form.items.push({ orderItemId: item.orderItemId, number: item.number });
        });
        edit();
    } else {
        infoData.value.list.forEach((item: any) => {
            form.items.push({ orderItemId: item.itemId, number: item.number });
        });
        add();
    }
};

// 选择图片
const chooseImage = () => {
    uni.chooseImage({
        count: 5 - fileLists.value.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths];
            // 立即上传每个选择的图片
            paths.forEach((path: string) => {
                uploadImage(path);
            });
        }
    });
};

// 上传图片到服务器
const uploadImage = (filePath: string) => {
    uni.showLoading({
        title: t("上传中...")
    });

    uni.uploadFile({
        url: baseUrl + import.meta.env.VITE_API_PREFIX + "user/user/uploadImg",
        filePath,
        name: "file",
        header: {
            Authorization: uni.getStorageSync("token"),
            Secret: getSecret()
        },
        success: (uploadFileRes: any) => {
            uni.hideLoading();
            const { data } = JSON.parse(uploadFileRes.data);

            // 添加到fileLists中，使用服务器返回的URL
            fileLists.value.push({
                name: data.picName || '',
                extname: data.picUrl ? data.picUrl.split(".").pop() || '' : '',
                url: data.picThumb || data.picUrl,
                picName: data.picName,
                picThumb: data.picThumb,
                picUrl: data.picUrl
            });

            uni.showToast({
                title: t("图片上传成功")
            });
        },
        fail: (error) => {
            uni.hideLoading();
            console.error('图片上传失败:', error);
            uni.showToast({
                title: t("图片上传失败"),
                icon: "none"
            });
        }
    });
};

// 删除图片
const removeImage = (index: number) => {
    fileLists.value.splice(index, 1);
};

const add = async () => {
    try {
        await updateAfterSales(form);
        uni.showToast({
            title: t("提交成功")
        });
        setTimeout(() => {
            uni.redirectTo({
                url: "/pages/user/afterSale/list"
            });
        }, 1500);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

const edit = async () => {
    try {
        await aftersalesUpdate(form);
        uni.showToast({
            title: t("修改成功")
        });
        setTimeout(() => {
            uni.redirectTo({
                url: "/pages/user/afterSale/list"
            });
        }, 1500);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};
</script>

<style lang="scss" scoped>
// 模块卡片样式
.module-card {
    background-color: #fff;
    border-radius: 40rpx;
    margin-bottom: 20rpx;
}

// 模块左右间隙
.module-margin {
    margin-left: 20rpx;
    margin-right: 20rpx;
}

.after-sale {
    margin-top: -140rpx;

    .after-sale-product {
        padding: 20rpx;

        .product-card-item {
            display: flex;
            position: relative;
            margin-bottom: 25rpx;
            &:last-child {
                margin-bottom: 0;
            }

            .product-card-item-left {
                .left-img {
                    width: 160rpx;
                    height: 160rpx;
                    border-radius: 10rpx;
                    overflow: hidden;
                    margin-right: 20rpx;
                    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.04);
                }
            }

            .product-card-item-right {
                font-size: 27rpx;

                .right-title {
                    font-weight: bold;
                }

                .right-price {
                    display: flex;
                    font-size: 28rpx;
                    padding-top: 78rpx;
                    
                    .right-price-pricenum {
                        font-weight: bold;
                        color: var(--general);
                        padding-right: 10rpx;
                    }

                    .right-price-quantity {
                        color: #999;
                    }
                }
            }

            .btn-box {
                position: absolute;
                right: 0;
                bottom: 0;

                .btn-box-content {
                    display: flex;
                    // align-items: center;
                    .btn-box-content-text {
                        font-size: 24rpx;
                        color: #999;
                        display: flex;
                        align-items: end;
                        padding-right: 20rpx;
                        padding-top: 8rpx;
                    }
                }
            }
        }
    }

    .after-sale-form {
        padding: 20rpx;

        // 表单区块
        .form-section {
            margin-bottom: 40rpx;

            .section-label {
                font-size: 27rpx;
                color: #606266;
                margin-bottom: 30rpx;
                margin-left: 26rpx;
                margin-top: 20rpx;
            }
        }

        // 问题描述输入框
        .description-input-box {
            background-color: #f8f8f8;
            border-radius: 12rpx;
            padding: 20rpx;
            min-height: 200rpx;
            margin-left: 15rpx;

            .description-textarea {
                width: 100%;
                min-height: 160rpx;
                font-size: 28rpx;
                color: #333;
                background: transparent;
                border: none;
                outline: none;
                resize: none;

                &::placeholder {
                    color: #999;
                    font-size: 28rpx;
                }
            }
        }

        // 上传凭证
        .upload-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20rpx;

            .upload-btn {
                width: 160rpx;
                height: 160rpx;
                background-color: #f8f8f8;
                border-radius: 12rpx;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border: 2rpx dashed #ddd;
                margin-left: 15rpx;

                .camera-icon {
                    width: 48rpx;
                    height: 48rpx;
                    margin-bottom: 8rpx;
                }

                .upload-text {
                    font-size: 24rpx;
                    color: #666;
                    margin-bottom: 4rpx;
                }

                .upload-count {
                    font-size: 20rpx;
                    color: #999;
                }
            }

            .upload-item {
                position: relative;
                width: 160rpx;
                height: 160rpx;
                border-radius: 12rpx;
                overflow: hidden;

                .upload-image {
                    width: 100%;
                    height: 100%;
                }

                .delete-btn {
                    position: absolute;
                    top: -10rpx;
                    right: -10rpx;
                    width: 40rpx;
                    height: 40rpx;
                    background-color: #ff4757;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .delete-icon {
                        color: #fff;
                        font-size: 24rpx;
                        font-weight: bold;
                    }
                }
            }
        }
        .form-item-content {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            height: 72rpx;

            .form-item-icon {
                padding-left: 15rpx;
            }

            .form-item-text {
                color: #969799;
            }
        }

        :deep(.uni-easyinput__content-textarea) {
            min-height: 50rpx;
            height: 50rpx;
        }

        :deep(.uni-input-input) {
            text-align: end;
        }

        .hint {
            background-color: #f5f5f5;
            padding: 10rpx 25rpx;
            color: #9c9c9c;
            font-size: 25rpx;
        }

        :deep(.uni-file-picker__header) {
            padding-top: 17rpx;

            .file-title {
                color: #9c9c9c;
            }
        }
    }
    :deep(.special-item) {
        &.uni-forms-item {
            border-bottom: none;
            margin-bottom: 0;
        }
    }
    :deep(.uni-forms-item) {
        margin: 10rpx 25rpx 10rpx 25rpx;
        &:last-child {
            padding-bottom: 20rpx;
        }
    }

    :deep(.file-picker__box) {
        padding-top: 30%;
    }
    :deep(.file-picker__progress) {
        display: none;
    }

    :deep(.icon-del-box) {
        width: 40rpx;
        height: 40rpx;
    }

    .after-sale-btn-box {
        padding: 25rpx;
    }
    :deep(.uni-file-picker__header) {
        padding-right: 15rpx;
    }
}
.upload-box {
    padding-top: 55rpx;
    position: relative;

    .upload-text {
        position: absolute;
        top: 10rpx;
        font-size: 22rpx;
        color: #969799;
    }
}
</style>
