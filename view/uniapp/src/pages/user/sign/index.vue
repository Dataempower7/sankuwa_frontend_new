<!-- 签到 -->
<template>
    <tig-layout title="签到">
        <div class="qiandaoBox">
            <div class="title">{{ $t("每日打卡领积分") }}</div>
            <div class="wrap">
                <div class="samll-title">
                    {{ $t("今天打卡得") }}<span>{{ signInfo.signPoints }}</span
                    >{{ $t("积分") }}
                </div>
                <div class="selectedBox">
                    <div class="line" />
                    <div v-for="(day, index) in signInfo.days" :key="index" class="item" :class="{ selected: signInfo.record >= day.dayNum }">
                        <div class="item-content">
                            <div v-if="signInfo.record < day.dayNum" class="num">{{ day.points }}</div>
                            <div v-else class="num" />
                            <div class="date">{{ day.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="qiandaoBtnBox">
                    <div class="qdBtn">
                        <div v-if="signInfo.isSign" class="dk-now">
                            <span>{{ $t("今日已打卡") }}</span>
                        </div>
                        <div v-else class="dk-now" @click="sign">
                            <span>{{ $t("立即打卡") }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if="signInfo.recommendGoods">
            <!-- 商品推荐区域 - 搜索页样式 -->
            <view class="product-recommend-section">
                <view class="recommend-header">
                    <view class="recommend-title">{{ $t("推荐好物") }}</view>
                    <navigator url="/pages/search/result?intro=hot">
                        <view class="recommend-more">{{ $t("查看更多") }} <span class="iconfont icon-xiangyou" /></view>
                    </navigator>
                </view>
                <scroll-view class="product-scroll" scroll-x="true" show-scrollbar="false">
                    <view class="product-list">
                        <view 
                            class="product-item" 
                            v-for="(item, index) in signInfo.recommendGoods" 
                            :key="index" 
                            @click="toProductPage(item)"
                        >
                            <view class="product-image-wrapper">
                                <image 
                                    lazy-load 
                                    :src="imageFormat(item.picThumb)" 
                                    mode="aspectFill" 
                                    class="product-image" 
                                    :alt="item.productName"
                                />
                            </view>
                            <view class="product-info">
                                <text class="product-name">{{ item.productName }}</text>
                                <view class="product-price">
                                    <text class="price-symbol">¥</text>
                                    <text class="price-value">{{ item.productPrice || '0.00' }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </template>
    </tig-layout>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { staticResource } from "@/utils";
import { imageFormat } from "@/utils/format";
import { getSignList, signIn } from "@/api/user/sign";
import type { SignInfo } from "@/types/user/sign";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const signInfo = ref<SignInfo>({
    signPoints: 0,
    record: 0,
    isSign: 0,
    days: [],
    recommendGoods: []
});

const __getSignList = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        const result = await getSignList("user/sign/index");
        Object.assign(signInfo.value, result);
    } catch (error) {
        console.error(error);
    } finally {
        uni.hideLoading();
    }
};

const sign = async () => {
    uni.showLoading({
        title: t("加载中")
    });
    try {
        await signIn();
        uni.showToast({
            title: t("打卡成功"),
            duration: 1000,
            icon: "none"
        });
        setTimeout(function () {
            __getSignList();
        }, 1000);
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            duration: 1500,
            icon: "none"
        });
    } finally {
        uni.hideLoading();
    }
};

const toProductPage = (params: any) => {
    uni.navigateTo({ url: "/pages/product/index?id=" + params.productId });
};

const qiandaoBg = computed(() => {
    return `url(${staticResource("qiandao/bg.png")})`;
});

const hotBg = computed(() => {
    return `url(${staticResource("qiandao/hot_bg.png")})`;
});

onLoad(() => {
    __getSignList();
});
</script>

<style lang="scss" scoped>
.qiandaoBox {
    position: relative;

    .title {
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        color: #fff;
        height: 50px;
        line-height: 50px;
        background: #e45363;
    }

    .wrap {
        background-image: v-bind(qiandaoBg);
        background-repeat: no-repeat;
        background-size: 100% 280px;
        min-height: 300px;
        padding: 40px 30px;
        box-sizing: border-box;

        .samll-title {
            padding-left: 3%;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .samll-title span {
            color: #dd9260;
            margin: 0 3px;
        }
    }

    .selectedBox {
        position: relative;
        display: flex;
        flex-wrap: nowrap;

        .line {
            position: absolute;
            top: 18px;
            left: 10%;
            width: 80%;
            height: 1px;
            background: #d8d9d8;
            z-index: 1;
        }

        .item {
            flex: 1;
            text-align: center;
            position: relative;
            height: 80px;

            .item-content {
                width: 100%;
                height: 50px;
                color: #dd9260;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                font-size: 12px;

                .num {
                    margin: 0 auto;
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    background-image: url("https://demo.tigshop.cn/static/mini/images/user/qiandao/2.png");
                    background-repeat: no-repeat;
                    background-size: 100%;
                    border-radius: 50%;
                    margin-bottom: 10px;
                }
            }

            &.selected .item-content .num {
                background-image: url("https://demo.tigshop.cn/static/mini/images/user/qiandao/1.png");
            }
        }
    }

    .qiandaoBtnBox {
        padding: 0 10px;
        padding-top: 25px;

        .qdBtn {
            position: relative;
            width: 100%;
            max-width: 375px;
            height: 40px;
            line-height: 40px;
            margin: 0 auto;
            text-align: center;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            background-image: url("https://demo.tigshop.cn/static/mini/images/user/qiandao/btn-def.png");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        .dk-now::after {
            content: "";
            position: absolute;
            top: 14px;
            margin-left: 5px;
            width: 12px;
            height: 12px;
            background-image: url("https://demo.tigshop.cn/static/mini/images/user/qiandao/gif-icon.png");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }
    }
}

/* 商品推荐区域样式 - 与搜索页保持一致 */
.product-recommend-section {
    margin: 20rpx 5rpx 5rpx 5rpx;
    padding: 30rpx;
    position: relative;
    z-index: 1;
}

.recommend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
}

.recommend-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 600;
    position: relative;
    top: -10rpx;
    
    &::before {
        content: '';
        position: absolute;
        left: -16rpx;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 24rpx;
        border-radius: 4rpx;
    }
}

.recommend-more {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #999;
    
    .iconfont {
        font-size: 20rpx;
        margin-left: 8rpx;
    }
}

.product-scroll {
    white-space: nowrap;
}

.product-list {
    display: inline-flex;
    gap: 24rpx;
    padding: 10rpx 0;
    
    .product-item {
        display: inline-flex;
        flex-direction: column;
        width: 240rpx;
        transition: transform 0.2s ease;
        
        &:active {
            transform: scale(0.98);
            
            .product-image-wrapper {
                box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.18), 
                            0 6rpx 16rpx rgba(0, 0, 0, 0.12),
                            0 3rpx 8rpx rgba(0, 0, 0, 0.08);
                transform: translateY(-2rpx);
            }
        }
    
        .product-image-wrapper {
            position: relative;
            width: 100%;
            height: 280rpx;
            background-color: #fff;
            overflow: hidden;
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12), 
                        0 4rpx 12rpx rgba(0, 0, 0, 0.08),
                        0 2rpx 6rpx rgba(0, 0, 0, 0.06);
            margin-bottom: 16rpx;
            transition: all 0.3s ease;
            border-radius: 25rpx;
            
            .product-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    
        .product-info {
            padding: 0;
            text-align: left;
            
            .product-name {
                font-size: 26rpx;
                color: #333;
                font-weight: 500;
                margin-bottom: 12rpx;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                line-height: 1.4;
            }
            
            .product-price {
                display: flex;
                align-items: baseline;
                color: #D1A671;
                font-weight: 600;
                
                .price-symbol {
                    font-size: 21rpx;
                    margin-right: 4rpx;
                }
                
                .price-value {
                    font-size: 28rpx;
                }
            }
        }
    }
}
</style>
