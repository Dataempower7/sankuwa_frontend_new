<template>
    <view class="buyerShow-buyerShowItem">
        <view :class="{ 'video-icon': buyerShowItem.videoList.length > 0 }" />
        <tig-lazy-image v-if="getImg(buyerShowItem)" :shimmer="true" :src="getImg(buyerShowItem)" class="product-image" mode="widthFix" />
        <view class="buyerShow-info">
            <view class="content">{{ buyerShowItem.content }}</view>
            <view class="buyerUser">
                <view class="imgBox">
                    <tig-lazy-image :src="buyerShowItem.buyerPhoto" class="user-image" mode="aspectFit" />
                    <text class="userName">{{ buyerShowItem.buyerName }}</text>
                </view>
                <view class="likeBox">
                    <view class="action-buyerShowItem" @click.stop="likeComment(buyerShowItem, buyerShowIndex)">
                        <image 
                            class="like-icon" 
                            :src="buyerShowItem.isLike ? 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ydrbAz3k2yeFUQ2ocC.jpeg' : 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778574ZVxAud1Q4FLWOU6E3o.jpeg'" 
                            mode="aspectFit"
                        />
                        <text class="like-count" :class="{ liked: buyerShowItem.isLike }">
                            {{ buyerShowItem.likeCount > 0 ? buyerShowItem.likeCount : "" }}
                        </text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { buyerShowLike } from "@/api/buyerShow/buyerShow";
import { useI18n } from "vue-i18n";
import TigLazyImage from "@/components/tig/tig-lazy-image/tig-lazy-image.vue";
const { t } = useI18n();

const buyerShowItem = defineModel<any>("buyerShowItem");
const buyerShowIndex = defineModel<any>("buyerShowIndex");
const buyerShowListData = defineModel<any>("buyerShowListData");
const getImg = (buyerShowItem: any) => {
    const list = [...buyerShowItem.videoList, ...buyerShowItem.imgList].filter(Boolean);
    return list[0]?.videoCover || list[0]?.picThumb;
};

const likeComment = async (item: any, index: number) => {
    // 处理评论点赞
    try {
        await buyerShowLike({
            buyerShowId: item.buyerShowId,
            isLike: !item.isLike ? 1 : 0
        });
        uni.showToast({
            title: t(!item.isLike ? "点赞成功" : "取消点赞"),
            icon: "none"
        });
        buyerShowListData.value[index].isLike = !item.isLike;
        buyerShowListData.value[index].likeCount = !item.isLike ? item.likeCount - 1 : item.likeCount + 1;
    } catch (error: any) {
        uni.showToast({
            title: error?.message
        });
    }
};
</script>

<style scoped lang="scss">
.buyerShow-info {
    padding: 20rpx;
    .content {
        font-weight: bold;
        font-size: 28rpx;
        color: #333333;
        line-height: 42rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        display: -moz-box;
        -webkit-line-clamp: 3;
        -moz-line-clamp: 3;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        word-break: break-all;
    }
}
.buyerShow-item {
    position: relative;
    .video-icon {
        position: absolute;
        top: 22rpx;
        right: 22rpx;
        width: 40rpx;
        height: 40rpx;
        background-image: url("@/static/images/product/video-playing.png");
        background-size: cover;
        z-index: 1;
    }
}
.buyerUser {
    display: flex;
    justify-content: space-between;
    margin-top: 25rpx;
    .imgBox {
        display: flex;
        align-items: center;
    }
    .user-image {
        width: 38rpx;
        height: 38rpx;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }
    .userName {
        font-weight: 400;
        font-size: 20rpx;
        color: #333333;
        margin-left: 18rpx;
        flex-shrink: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        display: -moz-box;
        -webkit-line-clamp: 1;
        -moz-line-clamp: 1;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        word-break: break-all;
        flex: 1;
    }
}
.likeBox {
    flex-shrink: 0;
    .action-buyerShowItem {
        display: flex;
        align-items: center;
        .like-icon {
            width: 32rpx;
            height: 32rpx;
            display: block;
        }
        .like-count {
            font-weight: 400;
            font-size: 24rpx;
            color: #333333;
            margin-left: 10rpx;
        }
    }
}
.content {
    font-weight: bold;
    font-size: 28rpx;
    color: #333333;
    line-height: 42rpx;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
