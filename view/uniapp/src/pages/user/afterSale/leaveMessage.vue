<template>
    <tig-layout title="留言反馈" :need-safe-top="true">
        <view class="leave-message">
            <!-- 表单模块 -->
            <view class="leave-message-form module-card module-margin">
                <uni-forms ref="formRef" :model-value="form" label-width="170rpx" :rules="rules">
                    <!-- 问题描述 -->
                    <view class="form-section">
                        <view class="section-label">问题描述</view>
                        <view class="form-item-content">
                            <uni-easyinput
                                v-model="form.logInfo"
                                type="textarea"
                                primary-color="rgb(192, 196, 204)"
                                maxlength="200"
                                :input-border="false"
                                auto-height
                                :placeholder="$t('为保障你的权益，请尽可能详细的描述，最多200字')"
                                placeholder-style="font-size: 26rpx;"
                                @input="handleLogInfoInput"
                            />
                            <view class="char-count" :class="{ 'char-count-warning': isLogInfoNearLimit }">
                                {{ logInfoLength }}/200
                            </view>
                        </view>
                    </view>

                    <!-- 上传凭证 -->
                    <view class="form-section">
                        <view class="section-label">上传凭证 ({{ fileLists.length }}/3张)</view>
                        <view class="upload-container">
                            <!-- 上传按钮 -->
                            <view v-if="fileLists.length < 3" class="upload-btn" @click="chooseImage">
                                <image src="/static/images/common/camera.png" class="camera-icon" />
                                <text class="upload-text">选择图片</text>
                                <text class="upload-count">({{ fileLists.length }}/3)</text>
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
                <view class="leave-message-btn-box">
                    <tig-button color="#3544BA" @click="handleSubmit">{{ $t("提交") }}</tig-button>
                </view>
            </tig-fixed-placeholder>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { getSecret, baseUrl } from "@/utils/request";
import { aftersalesFeedback } from "@/api/user/afterSale";
import { onLoad } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ReturnPic {
    picName: string;
    picThumb: string;
    picUrl: string;
}

const form = reactive({
    logInfo: "",
    returnPic: [] as ReturnPic[],
    id: 0
});
const rules = {
    logInfo: {
        rules: [{ required: true, errorMessage: t("留言不能为空") }]
    }
};

interface FileLists {
    name: string;
    extname: string;
    url: string;
}
const fileLists = ref<FileLists[]>([]);

// 计算留言字数
const logInfoLength = computed(() => {
    return form.logInfo ? form.logInfo.length : 0;
});

// 判断是否接近字符限制（超过160字符时显示警告样式）
const isLogInfoNearLimit = computed(() => {
    return logInfoLength.value > 160;
});

// 处理留言输入
const handleLogInfoInput = (value: string) => {
    // 实时校验字符长度
    if (value.length > 200) {
        uni.showToast({
            title: "问题描述不能超过200个字符",
            icon: "none",
            duration: 1500
        });
        // 自动截取到200字符
        form.logInfo = value.substring(0, 200);
    }
};

onLoad((options) => {
    if (options && options.id) {
        form.id = options.id;
    }
});

// 选择图片
const chooseImage = () => {
    uni.chooseImage({
        count: 3 - fileLists.value.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths];
            // 立即上传每个选择的图片
            paths.forEach((path: string) => {
                uploadFile(path);
            });
        }
    });
};

// 删除图片
const removeImage = (index: number) => {
    fileLists.value.splice(index, 1);
    form.returnPic.splice(index, 1);
};

const handlePicSelect = (e: any) => {
    // 兼容多端
    if (e.tempFilePaths.length === 1) {
        uploadFile(e.tempFilePaths[0]);
    } else {
        e.tempFilePaths.forEach((item: string) => {
            uploadFile(item);
        });
    }
};

const handlePicDelete = (e: any) => {
    fileLists.value.splice(e.index, 1);
    form.returnPic.splice(e.index, 1);
};

const uploadFile = (filePath: any) => {
    let name, extname, url;
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
            name = data.picName;
            extname = data.picUrl.split(".")[1];
            url = data.picThumb;
            fileLists.value.push({
                name,
                extname,
                url
            });
            form.returnPic.push({
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

            uni.showToast({
                title: t("图片上传失败"),
                icon: "none"
            });
        }
    });
};
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
            url: "/pages/user/afterSale/negotiate",
            success: () => {
                uni.$emit("refreshNegotiate", form.id);
            }
        });
    } catch (error) {
        console.error(error);
    }
};
</script>
<style>
page {
    background-color: #f5f5f5;
}
</style>
<style lang="scss" scoped>
.leave-message {
    background-color: #f5f5f5;
    margin-top: -150rpx;
}

// 通用模块样式
.module-card {
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
}

.module-margin {
    margin: 20rpx;
}

// 表单模块
.leave-message-form {
    padding: 30rpx;

    .form-section {
        margin-bottom: 40rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .section-label {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 20rpx;
        }

        .form-item-content {
            .uni-easyinput {
                background-color: #f8f8f8;
                border-radius: 12rpx;
                padding: 20rpx;

                :deep(.uni-easyinput__content) {
                    background-color: transparent;
                }

                :deep(.uni-easyinput__content.is-textarea) {
                    background-color: transparent !important;
                }

                :deep(.uni-easyinput__content-textarea) {
                    font-size: 28rpx;
                    color: #333;
                    min-height: 120rpx;
                    background-color: transparent !important;
                }
            }

            .char-count {
                font-size: 24rpx;
                color: #999;
                text-align: right;
                margin-top: 10rpx;
                transition: color 0.3s ease;

                &.char-count-warning {
                    color: #ff6b35;
                    font-weight: 500;
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
    }
}

// 提交按钮
.leave-message-btn-box {
    padding: 25rpx;
}

// 隐藏原有的uni-forms样式
:deep(.uni-forms-item) {
    border: none;
    margin: 0;
    padding: 0;
}

:deep(.uni-forms-item__label) {
    display: none;
}

:deep(.uni-forms-item__content) {
    padding: 0;
}

:deep(.uni-forms-item__error) {
    position: static;
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #ff4757;
}

:deep(.uni-progress-bar) {
    display: none;
}

:deep(.uni-file-picker) {
    display: none;
}
</style>
