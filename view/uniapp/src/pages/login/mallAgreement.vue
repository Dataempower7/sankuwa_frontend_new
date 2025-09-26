<template>
    <tig-layout :title="titleMap[articleSn as keyof typeof titleMap]">
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-container">
            <text>正在加载...</text>
        </view>
        
        <!-- 错误状态 -->
        <view v-else-if="hasError" class="error-container">
            <text>加载失败，请重试</text>
            <button @click="getArticleData" class="retry-btn">重新加载</button>
        </view>
        
        <!-- 内容为空状态 -->
        <view v-else-if="!articleData.content" class="empty-container">
            <text>暂无内容</text>
        </view>
        
        <!-- 正常内容 -->
        <view v-else class="rich-box">
            <rich-text class="rich-text" :nodes="articleData.content" />
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { getArticle } from "@/api/article/article";

// 响应式状态
const articleSn = ref<"fwxy" | "yszc" | "sqgy">("fwxy");
const isLoading = ref(false);
const hasError = ref(false);
const articleData = ref({
    content: ""
});

const titleMap = {
    fwxy: "服务协议",
    yszc: "隐私政策",
    sqgy: "社区公约"
};

onLoad((options) => {
    console.log("页面加载，接收到的参数:", options);
    
    if (options && options.articleSn) {
        articleSn.value = options.articleSn as "fwxy" | "yszc" | "sqgy";
        console.log("设置articleSn为:", articleSn.value);
        getArticleData();
    } else {
        console.log("未接收到articleSn参数，使用默认值:", articleSn.value);
        getArticleData();
    }
});

const getArticleData = async () => {
    console.log("开始获取文章数据，articleSn:", articleSn.value);
    
    isLoading.value = true;
    hasError.value = false;
    
    try {
        const params = { articleSn: articleSn.value };
        console.log("API调用参数:", params);
        
        const result = await getArticle(params, "issueInfo");
        console.log("API调用结果:", result);
        
        if (result && (result as any).item) {
            articleData.value = (result as any).item;
            console.log("文章内容设置成功，内容长度:", articleData.value.content?.length || 0);
        } else {
            console.log("API返回数据格式异常:", result);
            hasError.value = true;
        }
    } catch (error) {
        console.error("获取文章失败:", error);
        hasError.value = true;
        
        // 显示错误提示
        uni.showToast({
            title: "加载失败，请重试",
            icon: "none",
            duration: 2000
        });
    } finally {
        isLoading.value = false;
    }
};
</script>

<style>
page {
    background-color: #fff;
}
</style>

<style lang="scss" scoped>
.rich-box {
    padding: 24rpx 24rpx;

    .rich-text {
        overflow: hidden;
        :deep(p) {
            font-size: 24rpx;
            line-height: 2;
        }
        :deep(img) {
            max-width: 100%;
            width: 100%;
            display: block;
        }
    }
}

.loading-container, .error-container, .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 40rpx;
    text-align: center;
    
    text {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
    }
}

.retry-btn {
    background-color: #3544BA;
    color: white;
    border: none;
    border-radius: 20rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    margin-top: 20rpx;
}

.retry-btn:active {
    opacity: 0.8;
}
</style>
