<!-- CommentList.vue -->
<template>
    <view class="comment-list">
        <!-- 评论列表 -->
        <template v-for="(comment, index) in comments" :key="index">
            <view class="comment-item">
                <!-- 主评论 -->
                <view class="comment-main">
                    <!-- 用户头像 -->
                    <view class="user-userPhoto">
                        <tig-image :src="comment.userPhoto" class="userPhoto-img" mode="aspectFill" />
                    </view>

                    <!-- 评论内容区 -->
                    <view class="comment-content">
                        <!-- 用户信息 -->
                        <view class="user-info">
                            <view class="user-info-content">
                                <text class="userName">{{ comment.userName }}</text>
                                <template v-if="comment.isAuthor === 1">
                                    <text class="writer-tag">作者</text>
                                </template>
                                <template v-else-if="comment.isMe === 1">
                                    <text class="writer-tag">我</text>
                                </template>
                            </view>
                            <view class="action-item" @click="likeComment(comment)">
                                <text class="iconfont-h5" :class="comment.isLike ? 'icon-yiguanzhu' : 'icon-guanzhu'" />
                                <text class="like-count" :class="{ liked: comment.isLike }">
                                    {{ comment.likeCount > 0 ? comment.likeCount : "" }}
                                </text>
                            </view>
                        </view>

                        <!-- 评论文本 -->
                        <view class="comment-text">
                            <text
                                :class="{ 'text-collapse': !comment.expanded && comment.isLong }"
                                :style="{
                                    '-webkit-line-clamp': comment.expanded ? 'unset' : maxLines
                                }"
                            >
                                {{ comment.content }}
                            </text>
                            <!-- 展开/收起按钮 -->
                            <text v-if="comment.isLong" class="toggle-btn" @click="toggleComment(comment)">
                                {{ comment.expanded ? "收起" : "展开" }}
                            </text>
                        </view>

                        <!-- 评论操作 -->
                        <view class="comment-actions">
                            <view class="action-item">
                                <text class="time">{{ comment.addTime }}</text>
                                <text class="replyText" @click="toggleReplyInput(comment)">回复</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 回复列表 -->
                <view v-if="comment.replies && comment.replies.length > 0 && comment.showAllReplies" class="replies-list">
                    <!-- 使用计算后的回复列表 -->
                    <template v-for="(reply, replyIndex) in comment.replies" :key="replyIndex">
                        <view class="reply-item">
                            <view class="reply-main">
                                <view class="user-userPhoto">
                                    <tig-image :src="reply.userPhoto" class="userPhoto-img small" mode="aspectFill" />
                                </view>

                                <view class="reply-content">
                                    <view class="user-info">
                                        <view class="user-info-content">
                                            <text class="userName">{{ reply.userName }}</text>
                                            <template v-if="comment.isAuthor === 1">
                                                <text class="writer-tag">作者</text>
                                            </template>
                                            <template v-else-if="comment.isMe === 1">
                                                <text class="writer-tag">我</text>
                                            </template>
                                        </view>
                                        <view class="action-item" @click="likeReply(comment, reply)">
                                            <text class="iconfont-h5" :class="reply.isLike ? 'icon-yiguanzhu' : 'icon-guanzhu'" />
                                            <text class="like-count" :class="{ liked: reply.isLike }">
                                                {{ reply.likeCount > 0 ? reply.likeCount : "" }}
                                            </text>
                                        </view>
                                    </view>

                                    <view class="reply-text">
                                        <!--                                        <text v-if="reply.replyTo" class="reply-to"> 回复 @{{ reply.replyTo }}： </text>-->
                                        <text>{{ reply.content }}</text>
                                    </view>
                                    <view>
                                        <text class="time">{{ reply.addTime }}</text>
                                        <text class="replyText" @click="showReplyTo(comment, reply)">回复</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </template>
                </view>
                <!-- 仅在有回复时才显示查看更多按钮 -->
                <view v-if="shouldShowViewMore(comment)" class="view-more-replies" @click="toggleReplies(comment, index)">
                    <text>
                        {{ comment.toggleText || (comment.showAllReplies ? "收起回复" : `展开${comment.replyCount}条回复`) }}
                    </text>
                    <!--                    <text class="iconfont icon-arrow-down" :class="{ rotate: comment.showAllReplies }" />-->
                </view>
            </view>
        </template>
        <!-- 加载更多 -->
        <view v-if="loading" class="loading-more">
            <text>加载中...</text>
        </view>
        <view v-if="noMore && comments.length > 0" class="no-more">
            <text>没有更多评论了</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import TigImage from "@/components/tig/tig-image/tig-image.vue";

interface CommentUser {
    id: string | number;
    userName: string;
    userPhoto?: string;
    isMe?: number;
    isAuthor?: number;
}

interface CommentReply extends CommentUser {
    id: string | number;
    content: string;
    addTime: string | number;
    likeCount: number;
    isLike?: boolean;
    replyTo?: string; // 回复的对象用户名
}

interface CommentItem extends CommentUser {
    id: string | number;
    content: string;
    addTime: string | number;
    likeCount: number;
    isLike?: boolean;
    replies?: CommentReply[];
    // 用于控制展开收起
    isLong?: boolean;
    expanded?: boolean;
    showReplyInput?: boolean;
    replyContent?: string;
    // 用于控制回复显示
    showAllReplies?: boolean;
    replyCount?: number;
    userName?: string;
    userPhoto?: string;
    toggleText?: string;
    page?: number;
}

const comments = defineModel<CommentItem[]>("comments", {
    default: () => []
});

interface Props {
    loading?: boolean;
    hasMore?: boolean;
    maxLines?: number; // 最大显示行数
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    hasMore: true,
    maxLines: 3
});

const emit = defineEmits<{
    (
        e: string,
        comment: {
            isLong?: boolean;
            userPhoto?: string;
            addTime: string | number;
            isLike?: boolean;
            index: number;
            likeCount: number;
            userName?: string;
            content: string;
            showAllReplies?: boolean;
            toggleText?: string;
            expanded?: boolean;
            showReplyInput?: boolean;
            replyCount?: number;
            isMe?: number;
            replies?: CommentReply[];
            id: string | number;
            replyContent?: string;
            page?: number;
        }
    ): void;
    (e: "like-reply", comment: CommentItem, reply: CommentReply): void;
    (e: "submit-reply", comment: CommentItem, content: string): void;
    (e: "submit-reply-to", comment: CommentItem, reply: CommentReply, content: string): void;
    (e: "load-more"): void;
    (e: "showReplyInput"): void;
    (e: "getReplyList"): void;
}>();

const noMore = computed(() => !props.hasMore && !props.loading);

// 切换评论展开收起
const toggleComment = (comment: CommentItem) => {
    comment.expanded = !comment.expanded;
};

// 显示/隐藏回复输入框
const toggleReplyInput = (comment: CommentItem) => {
    emit("showReplyInput", comment);
};

// 点赞评论
const likeComment = (comment: CommentItem) => {
    // comment.isLike = !comment.isLike;
    emit("like-comment", comment);
};

// 点赞回复
const likeReply = (comment: CommentItem, reply: CommentReply) => {
    // reply.isLike = !reply.isLike;
    emit("like-reply", reply);
};

// 回复某条回复
const showReplyTo = (comment: any, reply: CommentReply) => {
    // comment.showReplyInput = true;
    // comment.replyContent = `@${reply.userName} `;
    emit("showReplyInput", comment);
};

// 修改 toggleReplies 方法
const toggleReplies = (comment: CommentItem, index: number) => {
    comment.showAllReplies = comment.toggleText !== "收起";
    if (comment.showAllReplies) {
        // 获取展开的数据
        emit("getReplyList", { ...comment, index });
    } else {
        comment.toggleText = `展开${comment.replyCount}条回复`;
        comment.page = 1;
        comment.replies = [];
    }
};

// 添加一个计算属性判断是否需要显示"查看更多回复"按钮
const shouldShowViewMore = (comment: CommentItem) => {
    return Number(comment.replyCount) > 0;
};

// 初始化评论数据
onMounted(() => {
    // 为每条评论添加默认状态
    comments.value.forEach((comment) => {
        // 判断是否为长文本（超过指定行数）
        comment.isLong = (comment.content?.match(/\n/g) || []).length >= props.maxLines || comment.content.length > 100;
        comment.expanded = false;
        comment.showReplyInput = false;
        comment.replyContent = "";
        comment.showAllReplies = false;

        // 初始化回复
        if (comment.replies) {
            comment.replies.forEach((reply: any) => {
                reply.isLike = reply.isLike || false;
            });
        }
    });
});
</script>

<style scoped lang="scss">
.comment-list {
    padding: 40rpx 0;
}

.comment-item {
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    .time {
        font-weight: 500;
        font-size: 24rpx;
        color: #9a9a9a;
        line-height: 42rpx;
    }
}

.comment-main {
    display: flex;
    gap: 20rpx;
}

.user-userPhoto {
    flex-shrink: 0;

    .userPhoto-img {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
        overflow: hidden;

        &.small {
            width: 50rpx;
            height: 50rpx;
        }
    }
}

.comment-content {
    flex: 1;
    min-width: 0;
    .user-info {
        display: flex;
        justify-content: space-between;
    }
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 15rpx;

    .userName {
        font-weight: 500;
        font-size: 28rpx;
        color: #9a9a9a;
    }

    .writer-tag {
        font-size: 22rpx;
        color: #ff0037;
        background-color: #feecf0;
        padding: 5rpx 10rpx;
        border-radius: 14rpx;
        margin-left: 14rpx;
    }
    .like-count {
        font-weight: 500;
        font-size: 28rpx;
        color: #2a2a2a;
        line-height: 42rpx;
        margin-left: 10rpx;
    }
}

.comment-text {
    margin-bottom: 20rpx;
    word-break: break-all;

    text {
        font-weight: 500;
        font-size: 28rpx;
        color: #2a2a2a;
        line-height: 42rpx;

        &.text-collapse {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .toggle-btn {
        color: #ff6b35;
        margin-left: 10rpx;
    }
}

.comment-actions {
    display: flex;
    gap: 40rpx;

    .action-item {
        display: flex;
        align-items: center;
        gap: 10rpx;
        font-size: 24rpx;
        color: #999;

        .iconfont {
            font-size: 32rpx;
        }

        .like-count {
            font-weight: 500;
            font-size: 28rpx;
            color: #2a2a2a;
            line-height: 42rpx;
            margin-left: 10rpx;
            &.liked {
                color: #ff6b35;
            }
        }
    }
}

.reply-input {
    margin-top: 20rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 10rpx;

    .reply-input-field {
        width: 100%;
        height: 70rpx;
        padding: 0 20rpx;
        background-color: #fff;
        border-radius: 8rpx;
        font-size: 26rpx;
        margin-bottom: 20rpx;
        box-sizing: border-box;
    }

    .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 30rpx;

        .cancel-btn,
        .submit-btn {
            font-size: 26rpx;
            padding: 10rpx 20rpx;
            border-radius: 6rpx;
        }

        .cancel-btn {
            color: #999;
            background-color: #eee;
        }

        .submit-btn {
            color: #fff;
            background-color: #ff6b35;

            &.disabled {
                background-color: #ccc;
            }
        }
    }
}

.replies-list {
    margin-top: 30rpx;
    padding-left: 90rpx;
    .user-info {
        display: flex;
        justify-content: space-between;
    }
}

.reply-item {
    margin-bottom: 30rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.reply-main {
    display: flex;
    gap: 15rpx;
}

.reply-content {
    flex: 1;
    min-width: 0;
}

.reply-text {
    margin-bottom: 15rpx;
    word-break: break-all;

    .reply-to {
        color: #ff6b35;
        margin-right: 10rpx;
    }

    text {
        font-weight: 500;
        font-size: 28rpx;
        color: #2a2a2a;
        line-height: 42rpx;
    }
}

.reply-actions {
    display: flex;
    gap: 30rpx;

    .action-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 22rpx;
        color: #999;

        .iconfont {
            font-size: 32rpx;
        }
    }
}

.loading-more,
.no-more {
    text-align: center;
    padding: 30rpx;
    font-size: 24rpx;
    color: #999;
}

.view-more-replies {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    padding: 20rpx 0;
    cursor: pointer;
    font-weight: 500;
    font-size: 28rpx;
    color: #2a2a2a;
    line-height: 42rpx;

    .iconfont {
        font-size: 20rpx;
        transition: transform 0.3s ease;

        &.rotate {
            transform: rotate(180deg);
        }
    }
}

.replyText {
    font-weight: 500;
    font-size: 24rpx;
    color: #2a2a2a;
    margin-left: 10rpx;
}

.icon-yiguanzhu {
    color: var(--general) !important;
}
</style>
