<template>
    <view class="empty-cart-container">
        <view class="empty-content">
            <image class="empty-image" src="/static/images/missing_page/missing_cart.png" mode="aspectFit" />

            <template v-if="isLoggedIn">  
                <text class="empty-text">{{ $t("购物车空空如也～") }}</text>
                <text class="empty-desc">{{ $t("快去挑选心仪的商品吧") }}</text>
            </template>


            <template v-else> 
                <text class="empty-text">{{ $t("快去登录～") }}</text>
                <text class="empty-desc">{{ $t("登录后可同步购物车中的商品") }}</text>
            </template>

                
            <!-- 操作按钮 -->
            <view class="action-buttons" style="display: flex;
            gap: 40rpx; 
            width: 140%;
            max-width: 500rpx;
            margin-top: -10px;">
                <template v-if="isLoggedIn">
                    <!-- 已登录状态：显示去逛逛和查看收藏 -->
                    <view class="btn-primary" @click="goToHome">
                        <text class="btn-text">{{ $t("去逛逛") }}</text>
                    </view>
                    <view class="btn-secondary" @click="goToCollect">
                        <text class="btn-text">{{ $t("查看收藏") }}</text>
                    </view>
                </template>
                <template v-else>
                    <!-- 未登录状态：显示去登录按钮 -->
                    <view class="btn-login" @click="handleLogin">
                        <text class="btn-text">{{ $t("去登录") }}</text>
                    </view>
                </template>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { handleLogin } from "@/utils/request";

const { t } = useI18n();

// 定义 props
const props = defineProps({
    isLoggedIn: {
        type: Boolean,
        default: false
    }
});

// 跳转到首页
const goToHome = () => {
    uni.switchTab({
        url: '/pages/index/index'
    });
};

// 跳转到收藏页面
const goToCollect = () => {
    uni.navigateTo({
        url: '/pages/user/collectProduct/index'
    });
};

</script>

<style lang="scss" scoped>
.empty-cart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 40rpx;
    background-color: #fff;
    border-radius: 0 0 18rpx 18rpx;

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .empty-image {
            width: 300rpx;
            height: 300rpx;
            margin-bottom: 40rpx;
        }

        .empty-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 16rpx;
        }

        .empty-desc {
            font-size: 28rpx;
            color: #999;
            line-height: 1.5;
            margin-bottom: 60rpx;
        }

        .action-buttons {
            display: flex;
            gap: 40rpx; 
            width: 140%;
            max-width: 500rpx;
            margin-top: -10px;

            .btn-primary,
            .btn-secondary,
            .btn-login {
                flex: 1;
                height: 88rpx;
                border-radius: 44rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;

                .btn-text {
                    font-size: 30rpx;
                    font-weight: 500;
                }

                &:active {
                    transform: scale(0.98);
                    opacity: 0.8;
                }
            }

            .btn-primary {
                background: linear-gradient(135deg, #3744B2, #4A56C4);
                box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

                .btn-text {
                    color: #fff;
                }
            }

            .btn-secondary {
                background: #fff;
                border: 2rpx solid #3744B2;

                .btn-text {
                    color: #3744B2;
                }
            }

            .btn-login {
                background: linear-gradient(135deg, #3744B2, #4A56C4);
                box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

                .btn-text {
                    color: #fff;
                }
            }
        }
    }
}
</style>
