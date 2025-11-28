<template>
    <view class="upload-media">
        <view class="media-preview" :style="{ 'grid-template-columns': `repeat(${props.cols}, 1fr)` }">
            <view v-for="(item, index) in mediaList" :key="index" class="media-item">
                <tig-image v-if="item.type === 'image'" preview :src="item.url" class="media-preview-image" />
                <!--                <view v-if="item.type === 'image'" class="media-preview-image" :style="['background-image: url(' + item.url + ')']" />-->
                <video
                    v-else-if="item.type === 'video'"
                    :id="'video-' + index"
                    :src="item.url"
                    :controls="true"
                    class="media-preview-video"
                    @click.stop="playVideoInFullScreen(index)"
                    @play="playVideoInFullScreen(index)"
                    @fullscreenchange="onFullScreenChange"
                />
                <view v-if="item.progress" class="progress">
                    <up-loading-icon />
                    <view class="progressText">上传中...</view>
                </view>
                <uni-icons class="delete-btn" type="clear" size="25" color="#cccccc" @click="removeMedia(index)" />
            </view>
            <template v-if="mediaList.length < props.maxCount">
                <view class="fileBox" @click="chooseMedia">
                    <view class="iconfont-h5 icon-8tupian-1 icon" />
                    <!--                <uni-icons class="icon" type="clear" size="25" color="#cccccc" />-->
                    <view class="tip">上传图片/视频最多上传{{ props.maxCount }}张</view>
                </view>
            </template>
        </view>
    </view>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { baseUrl, getSecret } from "@/utils/request";
import { imageFormat } from "@/utils/format";
import { useI18n } from "vue-i18n";
import { requestPhotosPermission } from "@/utils/appPermission";
import TigImage from "@/components/tig/tig-image/tig-image.vue";
const { t } = useI18n();

interface MediaItem {
    type: "image" | "video";
    videoUrl?: string;
    videoCover?: string;
    picUrl?: string;
    picId?: number;
    url?: string;
    progress?: number;
}

const props = withDefaults(
    defineProps<{
        multiple?: boolean;
        maxCount?: number;
        cols?: number;
        imgApiUrl?: string;
        videoApiUrl?: string;
    }>(),
    {
        multiple: true,
        maxCount: 9,
        cols: 3,
        imgApiUrl: "user/user/uploadImg",
        videoApiUrl: "user/user/uploadVideo"
    }
);

const mediaList = defineModel<MediaItem[]>("mediaList", { default: [] });
const currentVideoIndex = ref<number | null>(null);
const videoContexts = ref<Record<number, any>>({});

// 选择媒体文件的主方法
const chooseMedia = async () => {
    // #ifdef APP-PLUS
    try {
        // 请求相册权限
        const hasPhotosPermission = await requestPhotosPermission();
        if (!hasPhotosPermission) {
            uni.showToast({
                title: t("需要相册权限才能选择图片"),
                icon: "none"
            });
        }
    } catch (error) {
        console.error("权限请求失败:", error);
        uni.showToast({
            title: t("权限请求失败，请重试"),
            icon: "none"
        });
    }
    // #endif
    // #ifdef H5
    // H5 平台使用动态创建 input 的方式
    createFileInput();
    // #endif

    // #ifndef H5
    // 非 H5 平台使用 uni.chooseMedia
    uniChooseMedia();
    // #endif
};

// H5 平台通过动态创建 input 实现文件选择
const createFileInput = () => {
    // #ifdef H5
    // 创建 input 元素
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*"; // 限制文件类型为图片和视频
    input.multiple = Boolean(props.multiple);

    // 设置样式（隐藏 input）
    input.style.display = "none";

    // 监听文件选择事件
    input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const files = Array.from(target.files);
            processH5Files(files);
        }
        // 清理 DOM 中的 input 元素
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    };
    // 将 input 添加到 DOM 中并触发点击
    document.body.appendChild(input);
    input.click();
    // #endif
};

// 处理 H5 平台选择的文件
const processH5Files = (files: File[]) => {
    // #ifdef H5
    // 限制总数
    const remainingSlots = props.maxCount - mediaList.value.length;
    if (remainingSlots <= 0) {
        uni.showToast({
            title: `限制上传${props.maxCount}个数`,
            icon: "none"
        });
        return;
    }
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
        // 验证文件类型
        const fileType = validateFileType(file.type);
        if (fileType === "unknown") {
            console.warn("不支持的文件类型:", file.type);
            uni.showToast({
                title: "不支持的文件类型",
                icon: "none"
            });
            return;
        }
        // 生成预览 URL
        const previewUrl = URL.createObjectURL(file);
        console.log(previewUrl, 8888);
        uploadFile(previewUrl, fileType, file);
    });
    // #endif
};

// 验证文件类型
const validateFileType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) {
        return "image";
    } else if (mimeType.startsWith("video/")) {
        return "video";
    } else {
        return "unknown";
    }
};

// 非 H5 平台使用 uni.chooseMedia
const uniChooseMedia = () => {
    if (mediaList.value.length > props.maxCount) {
        uni.showToast({
            title: `限制上传${props.maxCount}个数`,
            icon: "none"
        });
        return;
    }
    // #ifndef H5
    uni.chooseMedia({
        count: props.maxCount - mediaList.value.length,
        mediaType: ["image", "video"],
        sourceType: ["album", "camera"],
        maxDuration: 60,
        camera: "back",
        success: (res) => {
            const tempFiles = res.tempFiles;
            tempFiles.forEach((file: any) => {
                uploadFile(file.tempFilePath, file.fileType, file);
            });
        },
        fail: (err) => {
            if (err.errMsg.includes("cancel")) return;
            // 降级处理
            uni.showActionSheet({
                itemList: ["选择图片", "选择视频"],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        chooseImage();
                    } else {
                        chooseVideo();
                    }
                }
            });
        }
    });
    // #endif
};

// 降级处理 - 选择图片
const chooseImage = () => {
    // #ifndef H5
    uni.chooseImage({
        count: 9 - mediaList.value.length,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res: any) => {
            res.tempFilePaths.forEach((path: string, index: number) => {
                uploadFile(path, "image", res.tempFiles[index]);
            });
        }
    });
    // #endif
};

// 降级处理 - 选择视频
const chooseVideo = () => {
    // #ifndef H5
    uni.chooseVideo({
        sourceType: ["album", "camera"],
        compressed: true,
        maxDuration: 60,
        camera: "back",
        success: (res) => {
            uploadFile(res.tempFilePath, "video", res.tempFile);
        }
    });
    // #endif
};

// 删除媒体文件
const removeMedia = (index: number) => {
    // H5 平台需要释放预览 URL
    // #ifdef H5
    // if (item.path.startsWith("blob:")) {
    //     URL.revokeObjectURL(item.path);
    // }
    // #endif

    mediaList.value.splice(index, 1);
};

const uploadFile = (filePath: any, fileType: string, file?: File) => {
    // 支持png、jpeg、jpg、gif、webp、tiff格式
    // 注意：小程序环境下 file.type 可能不存在，只在 H5 环境检查
    // #ifdef H5
    if (fileType === "image" && file?.type && !file.type.match(/\/(png|jpe?g|gif|webp|tiff)$/i)) {
        uni.showToast({
            title: "不支持上传此文件格式",
            icon: "none"
        });
        return;
    }
    // #endif
    // 初始化文件上传进度
    // mediaList.value.push({
    //     type: fileType,
    //     progress: 0
    // });
    const uploadTask = uni.uploadFile({
        url: baseUrl + import.meta.env.VITE_API_PREFIX + (fileType === "image" ? props.imgApiUrl : props.videoApiUrl),
        filePath: filePath,
        name: "file",
        header: {
            Authorization: "Bearer " + uni.getStorageSync("token"),
            Secret: getSecret()
        },
        // 视频需要此操作
        formData: {
            file
        },
        success: (uploadFileRes: any) => {
            uni.hideLoading();
            const { data, message } = JSON.parse(uploadFileRes.data);
            if (!data && message) {
                mediaList.value.pop();
                uni.showToast({
                    title: message,
                    icon: "none"
                });
                return;
            }
            mediaList.value.push({
                ...data,
                url: fileType === "image" ? imageFormat(data.picThumb) : data.videoUrl,
                type: fileType
            });
            // mediaList.value[mediaList.value.length - 1] = {
            //     ...mediaList.value[mediaList.value.length - 1],
            //     ...data,
            //     url: fileType === "image" ? imageFormat(data.picThumb) : data.videoUrl,
            //     type: fileType
            // };
        },
        fail: (error) => {
            uni.showToast({
                title: error.errMsg || "上传失败",
                icon: "none"
            });
            mediaList.value.pop();
            uni.hideLoading();
        }
    });
    // 获取上传百分比
    // uploadTask.onProgressUpdate((progressEvent) => {
    //     if (progressEvent.progress < 100) {
    //         mediaList.value[mediaList.value.length - 1] = {
    //             ...mediaList.value[mediaList.value.length - 1],
    //             progress: Number(progressEvent.progress)
    //         };
    //     } else {
    //         mediaList.value[mediaList.value.length - 1] = {
    //             ...mediaList.value[mediaList.value.length - 1],
    //             progress: 0
    //         };
    //     }
    // });
};

const onFullScreenChange = (e: any) => {
    // 当退出全屏时重置当前视频索引
    if (!e.detail.fullScreen) {
        currentVideoIndex.value = null;
    }
};

const playVideoInFullScreen = (index: number) => {
    // 创建视频上下文（如果尚未创建）
    if (!videoContexts.value[index]) {
        videoContexts.value[index] = uni.createVideoContext(`video-${index}`);
    }

    // 设置当前视频索引
    currentVideoIndex.value = index;

    // 播放并进入全屏
    videoContexts.value[index].requestFullScreen();
    videoContexts.value[index].play();
};
</script>

<style scoped lang="scss">
:deep(.u-form-item__body__right__content) {
    width: 100%;
}

.upload-media {
    width: calc(100vw - 80rpx);
}

.fileBox {
    background: #fafafa;
    border-radius: 4rpx;
    border: 1px dashed #9f9f9e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 30rpx;
    aspect-ratio: 1;
    .icon {
        font-size: 32rpx;
    }
    .tip {
        font-weight: 500;
        font-size: 22rpx;
        color: #9a9a9a;
        line-height: 30rpx;
        margin-top: 26rpx;
    }
}

/* 根据不同列数设置网格布局 */

.media-preview {
    gap: 20rpx;
    display: grid;
}

.media-item {
    position: relative;
    width: calc((100vw - 120rpx) / 3);
    height: 100%;
    border: 1rpx solid #eee;
    border-radius: 10rpx;
    //overflow: hidden;
    aspect-ratio: 1;
    .progress {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 100;
        color: #fff;
        gap: 10rpx;
    }
}

.media-preview-image,
.media-preview-video {
    width: 100%;
    height: 100%;
}

.media-preview-image {
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    object-fit: cover;
}

.media-info {
    padding: 10rpx;
    font-size: 20rpx;
    color: #666;
}

.file-type {
    display: block;
    font-weight: bold;
}

.delete-btn {
    position: absolute;
    top: -25rpx;
    right: -25rpx;
    font-size: 30rpx;
    padding: 5rpx;
    z-index: 10;
}

button {
    margin: 10rpx 0;
}

:deep(.u-form-item__body__right__content__slot) {
    width: 100%;
}
</style>
