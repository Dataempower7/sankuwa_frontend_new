<template>
    <view class="emoji-picker" @touchstart.stop @touchmove.stop>
        <scroll-view scroll-x="true" class="emoji-picker-box">
            <view class="emoji-content">
                <text 
                    v-for="(emoji, index) in emojis" 
                    :key="index" 
                    class="emoji-item" 
                    @tap.stop="insertEmoji(emoji)"
                    @touchend.stop="insertEmoji(emoji)"
                >{{ emoji }}</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["insertEmoji"]);

const emojis = ref<string[]>([]);

const generateEmojis = () => {
    const emojiArray = [];
    const start = 0x1f600;

    for (let i = 0; i < 80; i++) {
        emojiArray.push(String.fromCodePoint(start + i));
    }

    emojis.value = emojiArray;
};

generateEmojis();

// 插入表情到输入框
const insertEmoji = (emoji: string) => {
    console.log("emojiPicker - 点击表情:", emoji);
    emit("insertEmoji", emoji);
};
</script>

<style lang="scss" scoped>
.emoji-picker {
    width: 100%;
    background: #f5f5f5;
    padding: 20rpx 0;
    border-top: 1px solid #e5e5e5;
}

.emoji-picker-box {
    width: 100%;
    height: 120rpx;
    white-space: nowrap;
    
    .emoji-content {
        display: inline-flex;
        align-items: center;
        padding: 0 20rpx;
        
        .emoji-item {
            font-size: 50rpx;
            width: 80rpx;
            height: 80rpx;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 10rpx;
            border-radius: 10rpx;
            flex-shrink: 0;
            transition: all 0.2s ease;
            
            &:active {
                background-color: #e0e0e0;
                transform: scale(0.9);
            }
        }
    }
}
</style>
