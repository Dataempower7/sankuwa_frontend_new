<template>
    <view class="ai-page">
        <!-- 顶部导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="nav-left" @click="goBack">
                    <text class=" iconfont icon-houtui" />
                </view>
                <view class="nav-center">
                    <text class="nav-title">AI助手</text>
                </view>
                <view class="nav-right">
                    <view class="icon-btn" @click="createNew">
                       <image  src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/1763362524U3y9AXUdzfFxmAoL7U.jpeg" style="width: 100%; height: 100%;" />
                    </view>
                    <!--查看历史记录  -->
                    <view class="icon-btn" @click="refresh">
                        <image  src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/1763362541etj8PgrcrWguXxLPiL.jpeg" style="width: 100%; height: 100%;" />
                    </view>
                </view>
            </view>
        </view>

        <!-- 历史记录弹窗 -->
        <view v-if="showHistoryPopup" class="history-popup" @click="closeHistoryPopup">
            <view class="popup-content" @click.stop>
                <view class="popup-header">
                    <text class="popup-title">对话历史</text>
                    <text class="popup-close iconfont icon-guanbi" @click="closeHistoryPopup"></text>
                </view>
                <scroll-view class="popup-body" scroll-y>
                    <view v-if="historyList.length === 0" class="empty-history">
                        <text>暂无历史记录</text>
                    </view>
                    <view v-else class="history-list">
                        <view 
                            v-for="(session, index) in historyList" 
                            :key="index" 
                            class="history-item"
                            @click="loadHistorySession(session)"
                        >
                            <view class="history-role">{{ session.role === 'user' ? '我' : 'AI' }}</view>
                            <view class="history-content">{{ session.content }}</view>
                            <view class="history-divider"></view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- AI对话容器 -->
        <view class="chat-container">
            <scroll-view 
                class="chat-messages" 
                scroll-y 
                :scroll-top="scrollTop"
                scroll-with-animation
            >
                <!-- 欢迎界面 -->
                <view v-if="messageList.length === 0" class="welcome-section">
                    <view class="welcome-content">
                        <!-- <view class="welcome-title">
                            <image class="ai-logo" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758687963AJS969IKrvfTozW23Q.jpeg" mode="aspectFit" />
                        </view> -->
                        <view class="welcome-subtitle">SANKUWA AI 助手</view>
                        <view class="welcome-desc">我可以帮您解答问题、提供建议</view>
                        <view class="welcome-desc">让我们开始对话吧！</view>
                    </view>
                </view>

                <!-- 消息列表 -->
                <view v-for="(message, index) in messageList" :key="index" class="message-item">
                    <!-- 用户消息 -->
                    <view v-if="message.role === 'user'" class="message user-message">
                        <view class="message-content">
                            <text>{{ message.content }}</text>
                        </view>
                    </view>

                    <!-- AI消息 -->
                    <view v-else class="message ai-message">
                        <image class="avatar" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/17633605914a9ybDSUc9ZjgiCO1i.jpeg" mode="aspectFit" />
                        <view class="message-content">
                            <text>{{ message.content }}</text>
                        </view>
                    </view>
                </view>

                <!-- 加载中 -->
                <view v-if="isLoading" class="message ai-message">
                    <image class="avatar" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/17633605914a9ybDSUc9ZjgiCO1i.jpeg" mode="aspectFit" />
                    <view class="message-content loading">
                        <view class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 底部输入区域 -->
        <view class="bottom-container">
            <!-- 模型信息 -->
            <view class="model-info">
                <image class="model-icon" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/17633605914a9ybDSUc9ZjgiCO1i.jpeg" mode="aspectFit" />
                <text class="model-name">DeepSeek-V3.2</text>
            </view>
            
            <!-- 输入框区域 -->
            <view class="input-container">
                <view class="input-wrapper">
                    <input 
                        v-model="inputText" 
                        class="input-box" 
                        type="text" 
                        placeholder="从这里开始写"
                        @confirm="sendMessage"
                        confirm-type="send"
                    />
                    <view class="send-button" :class="{ 'active': inputText.trim() }" @click="sendMessage">
                        <text class="send-text">发送</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TigLayout from '@/components/tig/tig-layout/tig-layout.vue';
import { useUserStore } from '@/store/user';
import { imageFormat } from '@/utils/format';
import { sendMessage as sendMessageApi, getHistory } from '@/api/ai/ai';

const userStore = useUserStore();

// 格式化用户头像
const userAvatar = computed(() => {
    if (!userStore.token || !userStore.userInfo.avatar) {
        return 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/176173034416OBe7LxG3pY6RU3XK.jpeg';
    }
    const formattedAvatar = imageFormat(userStore.userInfo.avatar);
    return formattedAvatar || 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/176173034416OBe7LxG3pY6RU3XK.jpeg';
});

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const messageList = ref<Message[]>([]);
const inputText = ref('');
const isLoading = ref(false);
const scrollTop = ref(0);

// 历史记录弹窗相关
const showHistoryPopup = ref(false);
const historyList = ref<Message[]>([]);

// 发送消息（非流式）
const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text) return;

    // 添加用户消息
    messageList.value.push({
        role: 'user',
        content: text
    });

    inputText.value = '';
    scrollToBottom();

    // 显示加载状态
    isLoading.value = true;
    
    try {
        const response: any = await sendMessageApi(text);
        
        // 兼容多种响应格式
        let aiContent = '';
        if (typeof response === 'string') {
            aiContent = response;
        } else if (response.message) {
            aiContent = response.message;
        } else if (response.data) {
            aiContent = response.data;
        } else {
            aiContent = '抱歉，AI服务暂时不可用。';
        }
        
        messageList.value.push({
            role: 'ai',
            content: aiContent
        });
        
    } catch (error: any) {
        console.error('AI调用失败', error);
        
        messageList.value.push({
            role: 'ai',
            content: '抱歉，AI服务暂时不可用，请稍后再试。'
        });
    } finally {
        isLoading.value = false;
        scrollToBottom();
    }
};

// 滚动到底部
const scrollToBottom = () => {
    setTimeout(() => {
        scrollTop.value = 999999;
    }, 100);
};

// 返回到首页
const goBack = () => {
    uni.switchTab({
        url: '/pages/index/index'
    });
};

// 创建新对话
const createNew = () => {
    messageList.value = [];
    inputText.value = '';
};

// 查看历史记录 - 打开弹窗
const refresh = async () => {
    try {
        const response: any = await getHistory();
        
        // 兼容不同的响应格式
        let historyData = null;
        if (Array.isArray(response)) {
            // request工具直接返回数组
            historyData = response;
        } else if (response && Array.isArray(response.data)) {
            // 完整的响应对象
            historyData = response.data;
        }
        
        if (historyData) {
            historyList.value = historyData.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content
            }));
        } else {
            historyList.value = [];
        }
        
        // 显示弹窗
        showHistoryPopup.value = true;
        
    } catch (error) {
        console.error('获取历史记录失败', error);
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        });
    }
};

// 关闭历史记录弹窗
const closeHistoryPopup = () => {
    showHistoryPopup.value = false;
};

// 加载历史会话（点击某条历史记录时）
const loadHistorySession = (session: Message) => {
    // 将完整历史记录加载到当前对话
    messageList.value = [...historyList.value];
    
    // 关闭弹窗
    showHistoryPopup.value = false;
    
    // 滚动到底部
    scrollToBottom();
    
    uni.showToast({
        title: '历史记录已加载',
        icon: 'success'
    });
};
</script>

<style scoped lang="scss">
// 历史记录弹窗
.history-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .popup-content {
        width: 80%;
        max-width: 600rpx;
        height: 70%;
        background-color: #fff;
        border-radius: 20rpx;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .popup-header {
        padding: 30rpx;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .popup-title {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
        }
        
        .popup-close {
            font-size: 40rpx;
            color: #999;
            cursor: pointer;
        }
    }
    
    .popup-body {
        flex: 1;
        height: 0; /* 关键：配合flex使用，确保scroll-view有确定高度 */
        overflow-y: auto;
        -webkit-overflow-scrolling: touch; /* iOS滚动优化 */
    }
    
    .empty-history {
        padding: 100rpx 0;
        text-align: center;
        color: #999;
        font-size: 28rpx;
    }
    
    .history-list {
        padding: 20rpx;
    }
    
    .history-item {
        padding: 24rpx;
        margin-bottom: 20rpx;
        background-color: #f7f7f7;
        border-radius: 12rpx;
        cursor: pointer;
        transition: all 0.3s;
        
        &:active {
            background-color: #ececec;
        }
        
        .history-role {
            font-size: 24rpx;
            color: #666;
            margin-bottom: 8rpx;
        }
        
        .history-content {
            font-size: 28rpx;
            color: #333;
            line-height: 1.5;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .history-divider {
            margin-top: 12rpx;
            border-bottom: 1px solid #e6e6e6;
        }
    }
}

.ai-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f7f7f7;
}

// 自定义导航栏
.custom-navbar {
    padding-top: calc(var(--status-bar-height) + 10rpx);

    .navbar-content {
        height: 90rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;

        .nav-left {
            width: 80rpx;
            .iconfont-h5,
            .iconfont {
                font-size: 48rpx;
                color: #333;
            }
        }

        .nav-center {
            flex: 1;
            text-align: center;

            .nav-title {
                font-size: 40rpx;
                font-weight: 500;
                color: #333;
            }
        }

        .nav-right {
            width: 120rpx;
            display: flex;
            gap: 20rpx;
            justify-content: flex-end;

            .icon-btn {
                width: 44rpx;
                height: 44rpx;
                display: flex;
                align-items: center;
                justify-content: center;

                .iconfont-h5 {
                    font-size: 36rpx;
                    color: #333;
                }
            }
        }
    }
}

.chat-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex: 1;
    height: 0; /* 关键：配合flex使用，确保scroll-view有确定高度 */
    padding: 30rpx 20rpx;
    box-sizing: border-box;
}

// 欢迎界面
.welcome-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 300rpx);
    padding: 0 60rpx;

    .welcome-content {
        text-align: center;

        .welcome-title {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: -30rpx;

            .ai-logo {
                width: 200rpx;
                height: 200rpx;
                border-radius: 50%;
            }
        }

        .welcome-subtitle {
            font-size: 48rpx;
            font-weight: 600;
            color: #333;
            margin-bottom: 30rpx;
        }

        .welcome-desc {
            font-size: 28rpx;
            color: #666;
            line-height: 1.8;
            margin-bottom: 10rpx;
        }
    }
}

.message-item {
    margin-bottom: 30rpx;
}

.message {
    display: flex;
    align-items: flex-start;
    gap: 20rpx;

    .avatar {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .message-content {
        max-width: 560rpx;
        padding: 20rpx 25rpx;
        border-radius: 16rpx;
        font-size: 28rpx;
        line-height: 1.6;
        word-break: break-word;
        box-sizing: border-box;
    }
}

.user-message {
    flex-direction: row-reverse;

    .message-content {
       background: #fff;
        color: #333;
        position: relative;
        right: 25px;
    }
}

.ai-message {
    .message-content {
        background: #fff;
        color: #333;

        &.loading {
            padding: 30rpx 40rpx;
        }
    }
}

.typing-indicator {
    display: flex;
    gap: 8rpx;

    span {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite;

        &:nth-child(2) {
            animation-delay: 0.2s;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.3;
    }
    30% {
        transform: translateY(-10rpx);
        opacity: 1;
    }
}

// 底部容器
.bottom-container {
    padding: 20rpx 30rpx;
    padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
}

// 模型信息
.model-info {
    display: inline-flex;
    align-items: center;
    padding: 12rpx 20rpx;
    margin-bottom: 16rpx;
    border-radius: 20rpx;
    
    .model-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 12rpx;
        border-radius: 6rpx;
    }
    
    .model-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
        letter-spacing: 0.5rpx;
    }
}


// 输入区域
.input-container {
    .input-wrapper {
        display: flex;
        align-items: center;
        gap: 15rpx;
        background: rgb(255, 255, 255);
        border-radius: 20rpx;
        padding: 0 8rpx 0 30rpx;
        min-height: 80rpx;
        box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
    }

    .input-box {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        background: transparent;
    }

    .send-button {
        padding: 12rpx 24rpx;
        border-radius: 18rpx;
        background: #f7f7f7;
        transition: all 0.3s;

        &.active {
            background: #eaeaea;

            .send-text {
                color: #0c0c0c;
            }
        }

        .send-text {
            font-size: 28rpx;
            color: #d0d0d0;  /* 更浅的灰色，模仿图片中的未激活状态 */
        }
    }
}
</style>
