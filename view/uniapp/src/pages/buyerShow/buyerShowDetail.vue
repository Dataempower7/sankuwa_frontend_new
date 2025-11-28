<template>
    <template v-if="buyerShowEnabled === 1">
        <tig-layout title="详情">
            <view class="product-pic-con" @click="handleContainerClick">
                <swiper 
                    class="product-swiper" 
                    :indicator-dots="false"
                    :circular="true"
                    :autoplay="false"
                    @change="swiperChange"
                >
                    <swiper-item v-for="(item, index) in swiperList" :key="index">
                        <template v-if="item.type === 'image'">
                            <image 
                                :src="item.image" 
                                class="slide-image" 
                                @click.stop="swiperImagePreview(index)"
                            />
                        </template>
                        <template v-else-if="item.type === 'video'">
                            <view class="video-box">
                                <view v-show="!showVideo" class="cover-box" @click.stop="handlePlayVideo">
                                    <image :src="item.poster" class="slide-image" />
                                    <view class="video-icon" />
                                </view>
                                <video
                                    v-show="showVideo"
                                    id="buyerShowVideo"
                                    class="product-video"
                                    :src="item.image"
                                    :autoplay="false"
                                    controls
                                    :loop="false"
                                    @pause="handlevideoPause"
                                    @ended="handlevideoEnded"
                                />
                            </view>
                        </template>
                    </swiper-item>
                </swiper>
                <view v-show="swiperList.length > 1 && !showVideo" class="pages">
                    <text>{{ currentPic }}</text>
                    /{{ swiperList.length }}
                </view>
            </view>
            <view class="container" @click="handleContainerClick">
                <view class="userBox">
                    <view class="photo">
                        <tig-image :src="buyerShowDetailData.buyerPhoto" class="content-image" mode="wid" />
                    </view>
                    <view class="userName">{{ buyerShowDetailData.buyerName }}</view>
                </view>
                <view class="content">{{ buyerShowDetailData.content }}</view>
                <view class="addTime">发布于{{ buyerShowDetailData.addTime }}</view>
                <scroll-view :scroll-x="true">
                    <view class="productListBox">
                        <template v-for="(item, index) in buyerShowDetailData.productList" :key="index">
                            <view class="productList" @click.stop="toProductDetail(item)">
                                <view class="productListInfo">
                                    <view class="productImg">
                                        <view v-if="item.storeProductStock === 0" class="outsale">{{ $t("已售罄") }}</view>
                                        <up-image :src="item.picUrl" width="200rpx" height="200rpx" />
                                    </view>
                                    <view class="productRight">
                                        <view class="title">{{ item.productName }}</view>
                                        <view v-if="item.productPrice" class="price">¥{{ item.productPrice }}</view>
                                    </view>
                                </view>
                            </view>
                        </template>
                    </view>
                </scroll-view>
                <up-divider text="" />
                <view class="comments" @click.stop>
                    <comments ref="commentsRef" v-model:buyer-show-id="buyerShowId" @show-reply-input="showReplyInput" />
                </view>
            </view>
            <tig-fixed-placeholder :height="isFocus ? '250rpx' : '100rpx'" background-color="#fff">
                <view class="footer">
                    <input
                        ref="inputRef"
                        v-model="content"
                        class="custom-input"
                        type="text"
                        placeholder="说点什么..."
                        :focus="isFocus"
                        :adjust-position="false"
                        :cursor-spacing="60"
                        :hold-keyboard="true"
                        confirm-type="send"
                        @focus="inputFocus"
                        @confirm="confirm"
                        @blur="inputBlur"
                    />
                    <view class="countBox">
                        <view class="LikeBox" @click.stop="likeComment">
                            <image 
                                class="like-icon" 
                                :src="buyerShowDetailData.isLike ? 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ydrbAz3k2yeFUQ2ocC.jpeg' : 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ZVxAud1Q4FLWOU6E3o.jpeg'" 
                                mode="aspectFit"
                            />
                            <text class="likes" :class="{ liked: buyerShowDetailData.isLike }">
                                {{ Number(buyerShowDetailData.likeCount) > 0 ? buyerShowDetailData.likeCount : 0 }}
                            </text>
                        </view>
                        <view class="LikeBox">
                            <image 
                                class="comment-icon" 
                                src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/1761214111kCo1Xwe4lxJAnZWXQf.jpeg" 
                                mode="aspectFit"
                            />
                            <text class="numberOfMessages">{{ buyerShowDetailData.commentCount || 0 }}</text>
                        </view>
                    </view>
                </view>
                <view v-if="isFocus">
                    <emojiPicker @insert-emoji="insertEmoji" />
                </view>
            </tig-fixed-placeholder>
            <tig-loadingpage v-model="isLoading" />
        </tig-layout>
    </template>
    <template v-else>
        <tig-layout :title="'详情'" :show-left="false" style="height: 100vh">
            <buyerShowCloseTip v-model:buyer-show-enabled="buyerShowEnabled" />
        </tig-layout>
    </template>
</template>

<script setup lang="ts">
import TigLayout from "@/components/tig/tig-layout/tig-layout.vue";
import { ref, onMounted, computed, shallowRef, watch, getCurrentInstance, nextTick } from "vue";
import TigImage from "@/components/tig/tig-image/tig-image.vue";
import TigFixedPlaceholder from "@/components/tig/tig-fixed-placeholder/tig-fixed-placeholder.vue";
import buyerShowCloseTip from "./src/buyerShowCloseTip.vue";
import comments from "./comments.vue";
import { onLoad } from "@dcloudio/uni-app";
import { buyerShowDetail, buyerShowComment, buyerShowLike } from "@/api/buyerShow/buyerShow";
import type { BuyerShowDetailState } from "@/types/buyerShow/buyerShow";
import emojiPicker from "@/components/buyerShow/emojiPicker.vue";
import { useConfigStore } from "@/store/config";
import { redirect } from "@/utils";
import { imageFormat } from "@/utils/format";

const configStore = useConfigStore();
const instance = getCurrentInstance();

const buyerShowEnabled = ref<number | undefined>(1);
watch(
    () => configStore,
    (val) => {
        if (val.initLoading) {
            buyerShowEnabled.value = val.buyerShowEnabled;
        }
    },
    { deep: true, immediate: true }
);

const commentsRef = shallowRef();
const inputRef = shallowRef();
const buyerShowId = ref(null);
const buyerShowDetailData = ref<BuyerShowDetailState>({
    videoList: [],
    imgList: []
});
const isLoading = ref(false);
const swiperList = computed(() => {
    const list = [...(buyerShowDetailData.value?.videoList ?? []), ...(buyerShowDetailData.value?.imgList ?? [])].filter(Boolean);
    list.forEach((item: any) => {
        if (item.videoCover) {
            item.type = "video";
            item.image = imageFormat(item.videoUrl);
            item.poster = imageFormat(item.videoCover);
        } else {
            item.type = "image";
            item.image = imageFormat(item.picUrl);
        }
    });
    return list || [];
});

const toProductDetail = (item: any) => {
    redirect({
        url: "/pages/product/index",
        param: {
            id: item.productId
        }
    });
};

const currentPic = ref(1);
let videoContext: any;
const showVideo = ref(false);

const content = ref("");

const getBuyerShowDetail = () => {
    isLoading.value = true;
    buyerShowDetail({ buyerShowId: buyerShowId.value })
        .then((res: any) => {
            buyerShowDetailData.value = res;
            isLoading.value = false;
        })
        .catch((error) => {
            isLoading.value = false;
            uni.showToast({
                title: error.message,
                icon: "error"
            });
        });
};

const confirm = async () => {
    if (!content.value) {
        uni.showToast({
            title: "评论不能为空",
            icon: "none"
        });
        return;
    }
    buyerShowComment({ buyerShowId: buyerShowId.value, content: content.value, parentId: replyData.value.buyerShowCommentId || 0 })
        .then(() => {
            content.value = "";
            uni.showToast({
                title: "评论成功"
            });
            commentsRef.value.getList({ buyerShowId: buyerShowId.value });
            buyerShowDetailData.value.commentCount = buyerShowDetailData.value.commentCount + 1;
            // 清除回复数据
            replyData.value = {};
        })
        .catch((error: any) => {
            uni.showToast({
                title: error.message,
                icon: "error"
            });
        });
};

const isFocus = ref(false);
const isSelectingEmoji = ref(false);

// 输入框聚焦
const inputFocus = () => {
    isFocus.value = true;
};

// 输入框失去焦点
const inputBlur = () => {
    // 如果正在选择表情，不关闭
    if (isSelectingEmoji.value) {
        return;
    }
    // 延迟失焦，以便表情点击能够正常触发
    setTimeout(() => {
        if (!isSelectingEmoji.value) {
            isFocus.value = false;
        }
    }, 200);
};

// 点击内容区域，关闭输入框
const handleContainerClick = () => {
    if (isFocus.value) {
        isSelectingEmoji.value = false;
        isFocus.value = false;
    }
};

// 获取输入表情
const insertEmoji = (emoji: string) => {
    console.log("插入表情:", emoji);
    // 标记正在选择表情，防止输入框失焦
    isSelectingEmoji.value = true;
    
    // 添加表情到输入内容
    content.value += emoji;
    
    // 保持输入框聚焦状态
    isFocus.value = true;
    
    // 延迟重置选择状态
    setTimeout(() => {
        isSelectingEmoji.value = false;
    }, 500);
};

const likeComment = async () => {
    // 处理评论点赞
    try {
        await buyerShowLike({
            buyerShowId: buyerShowDetailData.value.buyerShowId,
            isLike: !buyerShowDetailData.value.isLike ? 1 : 0
        });
        uni.showToast({
            title: !buyerShowDetailData.value.isLike ? "点赞成功" : "取消点赞",
            icon: "none"
        });
        buyerShowDetailData.value.isLike = !buyerShowDetailData.value.isLike;
        const currentLikeCount = buyerShowDetailData.value.likeCount || 0;
        buyerShowDetailData.value.likeCount = currentLikeCount + (buyerShowDetailData.value.isLike ? 1 : -1);

        // getBuyerShowDetail();
    } catch (error: any) {
        uni.showToast({
            title: error?.message
        });
    }
};
// 轮播切换
const swiperChange = (e: any) => {
    currentPic.value = e.detail.current + 1;
    showVideo.value = false;
    videoContext?.pause();
};

// 预览图片
const swiperImagePreview = (index: number) => {
    const images = swiperList.value.filter((item: any) => item.type === "image").map((item: any) => item.image);
    uni.previewImage({
        current: images[index],
        urls: images,
        indicator: "number",
        loop: true
    });
};

// 视频播放控制
const handlePlayVideo = () => {
    showVideo.value = true;
    videoContext?.play();
};

const handlevideoEnded = () => {
    showVideo.value = false;
};

const handlevideoPause = () => {
    // #ifdef APP-PLUS
    showVideo.value = false;
    // #endif
};

// 上级回复的信息
const replyData = ref<any>({});

// 点击回复
const showReplyInput = (data: any) => {
    replyData.value = data;
    isFocus.value = true;
};

onMounted(() => {
    videoContext = uni.createVideoContext("buyerShowVideo", instance);
});

onLoad((options: any) => {
    buyerShowId.value = options.buyerShowId;
    if (buyerShowId.value) {
        getBuyerShowDetail();
    }
});
</script>

<style scoped lang="scss">
.product-pic-con {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 750rpx;
    background: #000;
}

.product-swiper {
    width: 100%;
    height: 100%;
}

.slide-image {
    width: 100%;
    height: 100%;
}

.video-box {
    width: 100%;
    height: 100%;

    .product-video {
        width: 100%;
        height: 100%;
    }

    .cover-box {
        width: 100%;
        height: 100%;
        position: relative;

        .video-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 110rpx;
            height: 110rpx;
            transform: translate(-50%, -50%);
            background-image: url("@/static/images/product/video-playing.png");
            background-size: cover;
        }
    }
}

.pages {
    visibility: visible;
    transition: all 500ms ease-in-out 0s;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.5);
    height: 40rpx;
    padding: 0 20rpx;
    border-radius: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20rpx;
    line-height: 40rpx;
    font-size: 20rpx;
    color: #fff;
    text-align: center;

    text {
        font-weight: bold;
        font-size: 30rpx;
    }
}
.container {
    position: relative;
    z-index: 1;
    padding: 20rpx;
    box-sizing: border-box;
    background: #fff;
    .content {
        font-weight: 500;
        font-size: 28rpx;
        color: #2a2a2a;
        line-height: 42rpx;
        margin-bottom: 44rpx;
        word-break: break-all;
    }
    .addTime {
        font-weight: 500;
        font-size: 24rpx;
        color: #9a9a9a;
        line-height: 42rpx;
        margin-bottom: 44rpx;
    }
}
.userBox {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-top: 40rpx;
    margin-bottom: 50rpx;
    .content-image {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        overflow: hidden;
    }
    .userName {
        font-weight: bold;
        font-size: 32rpx;
        color: #000000;
    }
}

.productListBox {
    display: flex;
    flex-wrap: nowrap;
    gap: 30rpx;
    .productListInfo {
        display: flex;
        width: 600rpx;
        flex-shrink: 0;
        gap: 10rpx;
        background: #fafafa;
        padding: 20rpx 17rpx;
        .productImg {
            position: relative;
            .outsale {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 70%;
                height: 70%;
                //line-height: 180rpx;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.4);
                font-size: 24rpx;
                color: #ffffff;
                letter-spacing: 0;
                border-radius: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9;
            }
        }
        .productRight {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .title {
                font-weight: bold;
                font-size: 32rpx;
                color: #000000;
                // 添加以下样式实现两行省略号
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                text-overflow: ellipsis;
                word-wrap: break-word;
                word-break: break-all;
            }
            .price {
                font-size: 32rpx;
                color: var(--price);
            }
        }
    }
}

.footer {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 15rpx 25rpx;
    box-sizing: border-box;
    gap: 20rpx;
    background-color: #fff;
    
    .custom-input {
        flex: 1;
        background: #f5f5f5;
        border-radius: 40rpx;
        padding: 15rpx 30rpx;
        font-size: 28rpx;
        color: #333;
        border: none;
        outline: none;
    }
    
    .countBox {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 30rpx;
        .LikeBox {
            display: flex;
            align-items: center;
            gap: 20rpx;
            
            .iconfont-h5 {
                font-size: 40rpx;
                color: #666;
            }
            
            .like-icon {
                width: 40rpx;
                height: 40rpx;
                display: block;
            }
            
            .comment-icon {
                width: 40rpx;
                height: 40rpx;
                display: block;
            }
        }

        .likes,
        .numberOfMessages {
            font-size: 28rpx;
            color: #666;
        }
        
        .likes.liked {
            color: var(--general);
        }
    }
}

.icon-yishoucang {
    color: var(--general) !important;
}

.icon-shoucang,
.icon-yishoucang {
    font-size: 40rpx !important;
}
</style>
