<template>
    <tig-layout ref="layoutRef" @login-success="loginSuccess">
        <view class="user">
            <!-- 用户信息头部 -->
            <view class="user-header">
                <image src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758696224vjE4aO0r88kT2FsRmK.jpeg"  class="bg-image" />

                <!-- 个人中心标题和编辑图标 -->
                <view class="header-nav">
                    <view class="nav-title">个人中心</view>
                    <image src="@/static/images/member/edit.png" class="edit-icon" @click="goPages('/pages/user/profile/index')" />
                </view>

                <!-- 用户基本信息 -->
                <view class="user-info">
                    <view class="user-avatar-section">
                        <template v-if="!hasToken">
                            <view class="avatar-wrapper" @click="handleLogin">
                                <image class="avatar" src="@/static/images/common/avatar_empty.png" />
                            </view>
                        </template>
                        <template v-else>
                            <tig-upload class="avatar-wrapper" request-url="user/user/modifyAvatar" @change="userStore.getUserInfo()">
                                <tig-image class="avatar" :src="imageFormat(member!.avatar)" />
                            </tig-upload>
                        </template>

                        <view class="user-details">
                            <template v-if="!hasToken">
                                <view class="phone-number" @click="handleLogin">{{ $t("登录/注册") }}</view>
                                <view class="welcome-text">Hi，欢迎来到森酷玩</view>
                            </template>
                            <template v-else>
                                <view class="phone-number">{{ member.nickname  }}</view>
                                <view class="welcome-text">Hi，欢迎来到森酷玩</view>
                            </template>
                        </view>
                    </view>
                </view>

                <!-- 会员等级卡片 -->
                <view class="member-card" @click="goPages('/pages/user/levelCenter/index')">
                    <image :src="getMemberCardBg(currentMemberLevel)" class="card-bg" />
                    <view class="card-content">
                        <view class="member-level" @click.stop="goPages('/pages/user/levelCenter/index')">
                            <image :src="member?.rankLogo" class="crown-icon" />
                            <text class="level-text" :style="hasToken ? getRankNameStyle(currentMemberLevel) : { color: '#8B4513' }">{{ hasToken ? currentMemberLevel : '登录立享会员权益' }}</text>
                        </view>
                        <view class="growth-value">
                            {{member?.growthPoints || "-"}} 成长值
                        </view>
                        

                        <!-- 余额、优惠券、积分 -->
                        <view class="wallet-info" >
                            <view class="wallet-item" @click="goPages('/pages/user/account/index')">
                                <view class="amount" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">{{ Number(member?.totalBalance || 0).toFixed(2) }}</view>
                                <view class="label" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">余额</view>
                            </view>
                            <view class="wallet-item" @click="goPages('/pages/coupon/index?type=2')">
                                <view class="amount" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">{{ member?.coupon || 0 }}</view>
                                <view class="label" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">优惠券</view>
                            </view>
                            <view class="wallet-item" @click="goPages('/pages/user/point/detail')">
                                <view class="amount" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">{{ member?.points || 0 }}</view>
                                <view class="label" :style="hasToken ? getRankTextStyle(currentMemberLevel) : { color: '#8B4513' }">积分</view>
                            </view>
                        </view>
                    </view>
                </view>


                <!-- 透明模块 -->
                <view class="transparent-module">
                    <image src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758698456WkjWfXKZd8ZUaugQfp.jpeg" class="transparent-module-image" />
                </view>


                <!-- 用户功能模块 -->
                <view class="user-function-module" >

                    <!-- 统计信息 -->
                    <view class="stats-section">
                        <view class="stat-item" @click="goPages('/pages/user/collectProduct/index')">
                            <view class="stat-label">商品收藏</view>
                            <view class="stat-value">{{ orderNum.productCollect >= 0 ? orderNum.productCollect : "-" }}</view>
                        </view>
                        <view class="stat-item" @click="goPages('/pages/user/collectionShop/index')" v-if="isMerchant()">
                            <view class="stat-label">店铺关注</view>
                            <view class="stat-value">{{ orderNum.shopCollect >= 0 ? orderNum.shopCollect : "-" }}</view>
                        </view>
                        <view class="stat-item" @click="goPages('/pages/user/historyProduct/index')">
                            <view class="stat-label">浏览记录</view>
                            <view class="stat-value">{{ historyCount >= 0 ? historyCount : "-" }}</view>
                        </view>
                    </view> 

                    <!-- 分割线 -->
                    <view class="divider"></view>

                    <!-- 订单状态 -->
                    <view class="order-section">
                        <view class="order-main-items">
                            <view class="order-item" @click="goPages('/pages/user/order/list?type=awaitPay')">
                                <view class="order-icon-wrapper">
                                    <image src="@/static/images/member/pending_payment.png" class="order-icon" />
                                    <view v-if="orderNum.awaitPay > 0" class="order-badge">{{ orderNum.awaitPay }}</view>
                                </view>
                                <view class="order-label">待付款</view>
                            </view>
                            <view class="order-item" @click="goPages('/pages/user/order/list?type=awaitReceived')">
                                <view class="order-icon-wrapper">
                                    <image src="@/static/images/member/pending_receipt.png" class="order-icon" />
                                    <view v-if="orderNum.awaitReceived > 0" class="order-badge">{{ orderNum.awaitReceived }}</view>
                                </view>
                                <view class="order-label">待收货</view>
                            </view>
                            <view class="order-item" @click="goPages('/pages/user/order/list?type=awaitComment')">
                                <view class="order-icon-wrapper">
                                    <image src="@/static/images/member/pending_comments.png" class="order-icon" />
                                    <view v-if="orderNum.awaitComment > 0" class="order-badge">{{ orderNum.awaitComment }}</view>
                                </view>
                                <view class="order-label">待评价</view>
                            </view>
                            <view class="order-item" @click="goPages('/pages/user/afterSale/list')">
                                <view class="order-icon-wrapper">
                                    <image src="@/static/images/member/after-sales.png" class="order-icon" />
                                </view>
                                <view class="order-label">退款/售后</view>
                            </view>
                        </view>
                        <view class="order-all-item" @click="goPages('/pages/user/order/list')">
                            <view class="order-divider"> <image src="@/static/images/member/all.png " style="    width: 27px;    height: 89px;   position: relative;  right: 20px;  top: -23px;" /></view>
                            <view class="order-all-text">全部</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="user_wrapper">
                <decorate :modules="modules" />
            </view>
        </view>
        <recommend />
        <tig-copyright />
    </tig-layout>
    <tig-back-top :scroll-top="scrollTop" />
</template>

<script lang="ts" setup>
import recommend from "@/components/recommend/index.vue";
import decorate from "./src/decorate/index.vue";
import { useUserStore } from "@/store/user";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import type { UserItem } from "@/types/user/user";
import type { OrderNumItem } from "@/types/user/order";
import { getOrderNum } from "@/api/user/order";
import { getMemberDecorate } from "@/api/home/home";
import { historyProductList } from "@/api/user/historyProduct";
import { isMerchant } from "@/utils";
import { handleLogin } from "@/utils/request";
import { useScrollTop } from "@/hooks";
import { imageFormat } from "@/utils/format";

const { scrollTop } = useScrollTop();

const userStore = useUserStore();

const layoutRef = ref();

const member = computed({
    get() {
        return userStore.userInfo;
    },
    set(val) {
        return userStore.setUserInfo(val);
    }
});

const count = ref({
    collectCount: 0,
    collectStoreCount: 0,
    stayCommentOrder: 0,
    rePay: 0,
    reReceive: 0,
    returnCount: 0,
    bonus: 0
});

const orderNum = ref<OrderNumItem>({} as OrderNumItem);
const historyCount = ref(0);

const __getOrderNum = async () => {
    try {
        const result = await getOrderNum();
        orderNum.value = result;
    } catch (error) {
        console.error(error);
    }
};

const __getHistoryCount = async () => {
    try {
        const result = await historyProductList();
        historyCount.value = result.length;
    } catch (error) {
        console.error(error);
        historyCount.value = 0;
    }
};

const goPages = (url: string) => {
    uni.navigateTo({
        url
    });
};

// 会员等级配置（根据成长值区间和背景图片定义）
const memberLevelConfig = [
    { name: '黄金会员', minGrowth: 0, maxGrowth: 99, bgImage: 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/17586828917dIwqRbVebvgolp790.jpeg' },
    { name: '铂金会员', minGrowth: 100, maxGrowth: 299, bgImage: 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758682890oGpbHG3nBjNolO2P84.jpeg' },
    { name: '黑金会员', minGrowth: 300, maxGrowth: 499, bgImage: 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758682890mL1YNY9vedfigP6aRC.jpeg' },
    { name: '钻石会员', minGrowth: 500, maxGrowth: 699, bgImage: 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758682890oGpbHG3nBjNolO2P84.jpeg' },
    { name: '至尊会员', minGrowth: 700, maxGrowth: Infinity, bgImage: 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/17586828911EQZ1ObF5rGMxVsEz9.jpeg' }
];

// 根据成长值获取对应的会员等级名称（仅用于验证和备用）
const getExpectedLevelByGrowth = (growthPoints: number): string => {
    if (growthPoints === null || growthPoints === undefined || growthPoints < 0) {
        return '黄金会员';
    }
    
    const level = memberLevelConfig.find(config => 
        growthPoints >= config.minGrowth && growthPoints <= config.maxGrowth
    );
    
    return level ? level.name : '黄金会员';
};

// 根据等级名称获取对应的背景图片
const getMemberCardBg = (rankName?: string): string => {
    if (!rankName) {
        return memberLevelConfig[0].bgImage; // 默认黄金会员背景
    }
    
    const levelConfig = memberLevelConfig.find(config => config.name === rankName);
    return levelConfig ? levelConfig.bgImage : memberLevelConfig[0].bgImage;
};

// 根据会员等级名称获取对应的文字颜色样式
const getRankTextStyle = (rankName: string) => {
    const rankStyleMap: { [key: string]: any } = {
        '黄金会员': { color: '#91583E' },
        '铂金会员': { color: '#2A426C' },
        '黑金会员': { color: '#ffffff' },
        '钻石会员': { color: '#2E236C' },
        '至尊会员': { color: '#9D87F4' }
    };
    return rankStyleMap[rankName] || { color: '#8B4513' }; // 默认颜色
};

// 专门为至尊会员等级名称获取渐变样式
const getRankNameStyle = (rankName: string) => {
    if (rankName === '至尊会员') {
        return {
            background: 'linear-gradient(135deg, #CED2FC 0%, #9D87F4 100%)',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            'background-clip': 'text'
        };
    }
    return getRankTextStyle(rankName);
};

const resetUser = () => {
    member.value = {} as UserItem;
    count.value = {
        collectCount: 0,
        collectStoreCount: 0,
        stayCommentOrder: 0,
        rePay: 0,
        reReceive: 0,
        returnCount: 0,
        bonus: 0
    };
    orderNum.value = {} as OrderNumItem;
};

const loginSuccess = () => {
    __getMemberDecorate();
    __getOrderNum();
};

const hasToken = computed(() => {
    return userStore.token || uni.getStorageSync("token");
});

// 智能获取当前用户的会员等级
const currentMemberLevel = computed(() => {
    const userData = member.value;
    if (!userData) return '黄金会员';
    
    // 优先使用接口返回的 rankName
    if (userData.rankName) {
        // 如果同时有 growthPoints，验证一致性
        if (userData.growthPoints !== null && userData.growthPoints !== undefined) {
            const expectedLevel = getExpectedLevelByGrowth(userData.growthPoints);
        }
        return userData.rankName;
    }
    
    // 如果没有 rankName 但有 growthPoints，根据成长值计算
    if (userData.growthPoints !== null && userData.growthPoints !== undefined) {
        return getExpectedLevelByGrowth(userData.growthPoints);
    }
    
    // 都没有的情况下返回默认等级
    return '黄金会员';
});



const modules = ref<any[]>([]);

const __getMemberDecorate = async () => {
    try {
        const result = await getMemberDecorate();
        modules.value = result.data;
    } catch (error) {
        console.error(error);
    }
};

onLoad(() => {
    __getMemberDecorate();
});

onShow(() => {
    if (!hasToken.value) {
        resetUser();
        return;
    }
    userStore.getUserInfo();
    __getOrderNum();
    __getHistoryCount();
});
</script>
<style>
page {
    /* #ifdef MP-WEIXIN */
    background: linear-gradient(90deg, #fcf6fc, #f3f3fe);
    /* #endif */
}
</style>
<style scoped lang="scss">
page {
    background: #f5f5f5;
}

.user {
    position: relative;
    background-color: #f5f5f5;
    min-height: 100vh;

    /* 个人中心标题和编辑图标 */
    .header-nav {
        position: absolute;
        top: var(--status-bar-height, 44rpx);
        left: 0;
        right: 0;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        padding: 0 30rpx;

        .nav-title {
            font-size: 40rpx;
            font-weight: 500;
            color: #fff;
            text-align: center;
            flex: 1;
            margin-top: 50px;
        }

        .edit-icon {
            position: absolute;
            right: 45rpx;
            width: 45rpx;
            height: 45rpx;
            margin-top: 210px;
        }
    }
}



/* 用户头部区域 */
.user-header {
    position: relative;
    padding-top: calc(var(--status-bar-height) + 110rpx);

    .bg-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 70%;
        z-index: 1;
    }

    /* 用户信息区域 */
    .user-info {
        position: relative;
        padding: 60rpx 30rpx 40rpx;
        z-index: 2;

        .user-avatar-section {
            display: flex;
            align-items: center;

            .avatar-wrapper {
                width: 120rpx;
                height: 120rpx;
                border-radius: 50%;
                overflow: hidden;

                .avatar {
                    width: 100%;
                    height: 100%;
                }
            }

            .user-details {
                margin-left: 30rpx;
                flex: 1;

                .phone-number {
                    font-size: 36rpx;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 10rpx;
                }

                .welcome-text {
                    font-size: 28rpx;
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }
    }

    /* 会员等级卡片 */
    .member-card {
        position: relative;
        margin: 0 30rpx 40rpx;
        border-radius: 24rpx;
        overflow: hidden;

        .card-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .card-content {
            position: relative;
            padding: 30rpx 0rpx 55rpx 30rpx;
            z-index: 2;

            .member-level {
                display: flex;
                align-items: center;
                margin-bottom: 20rpx;

                .crown-icon {
                    width: 45rpx;
                    height: 40rpx;
                    margin-right: 16rpx;
                    margin-top: -10rpx;
                }

                .level-text {
                    font-size: 32rpx;
                    font-weight: bold;
                    /* color 将由动态样式控制 */
                }
            }

            .growth-value {
                position: absolute;
                top: 0rpx;
                right: 11rpx;
                font-size: 22rpx;
                color: #ffffff;
                padding: 8rpx 16rpx;
                border-radius: 20rpx;
                font-weight: 500;
            }

            .wallet-info {
                display: flex;
                justify-content: space-between;
                margin-top: 40rpx;

                .wallet-item {
                    flex: 1;
                    text-align: center;

                    .amount {
                        font-size: 40rpx;
                        font-weight: bold;
                        /* color 将由动态样式控制 */
                        margin-bottom: 10rpx;
                    }

                    .label {
                        font-size: 24rpx;
                        /* color 将由动态样式控制 */
                    }
                }
            }
        }
    }

    /* 透明模块 */
    .transparent-module {
        position: relative;
        height: 80rpx;
        z-index: 2;
        margin-top: -35px;
        border-radius: 25rpx;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8rpx);
        

        .transparent-module-image {
            width: 100%;
            height: 100%;
            // object-fit: cover;
            // opacity: 0.9;
            // mix-blend-mode: overlay;
        }

        /* 添加渐变叠加效果 */
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg,
                rgba(255, 255, 255, 0.2) 0%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0.1) 100%);
            z-index: 1;
            pointer-events: none;
        }

        /* 图片层级调整 */
        .transparent-module-image {
            position: relative;
            z-index: 0;
        }
    }

    /* 用户功能模块 */
    .user-function-module {
        position: relative;
        background: rgba(255, 255, 255, 0.95);
        margin: 0 20rpx;
        border-radius: 40rpx;
        z-index: 2;
        overflow: hidden;
        margin-top: -31px;

        /* 统计信息 */
        .stats-section {
            display: flex;
            justify-content: space-around;
            padding: 40rpx 30rpx 22rpx 35rpx;
            margin-left: 21px;

            .stat-item {
                display: flex;
                align-items: center;
                flex: 1;
                text-align: center;

                .stat-label {
                    font-size: 28rpx;
                    color: #666;
                    margin-right: 15rpx;
                }

                .stat-value {
                    font-size: 28rpx;
                    color: #333;
                }
            }
        }

        /* 分割线 */
        .divider {
            height: 1rpx;
            background: #f1eded;
            margin: 0px 85rpx 0px 40px;
        }

        /* 订单状态 */
        .order-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 30rpx 30rpx 43rpx;

            .order-main-items {
                display: flex;
                justify-content: space-around;
                flex: 1;
            }

            .order-item {
                display: flex;
                flex-direction: column;
                align-items: center;

                .order-icon-wrapper {
                    position: relative;
                   // margin-bottom: 16rpx;

                    .order-icon {
                        width: 70rpx;
                        height: 70rpx;
                    }

                    .order-all-icon {
                        width: 50rpx;
                        height: 50rpx;
                    }

                    .order-badge {
                        position: absolute;
                        top: -8rpx;
                        right: -8rpx;
                        background: #ff4757;
                        color: #fff;
                        font-size: 20rpx;
                        min-width: 32rpx;
                        height: 32rpx;
                        border-radius: 16rpx;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 8rpx;
                        box-sizing: border-box;
                    }
                }

                .order-label {
                    font-size: 24rpx;
                    font-weight: 400;
                    color: #666;
                }
            }

            .order-all-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-left: 30rpx;
                position: relative;

                .order-divider {
                    position: absolute;
                    left: -25rpx;
                    top: 67%;
                    transform: translateY(-50%);
                    width: 2rpx;
                    height: 80rpx;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        rgba(0, 0, 0, 0.1) 20%,
                        rgba(0, 0, 0, 0.2) 50%,
                        rgba(0, 0, 0, 0.1) 80%,
                        transparent 100%);

                    &::after {
                        content: '';
                        position: absolute;
                        left: -1rpx;
                        top: 0;
                        width: 4rpx;
                        height: 80rpx;
                        background: linear-gradient(180deg,
                            transparent 0%,
                            rgba(255, 255, 255, 0.3) 20%,
                            rgba(255, 255, 255, 0.5) 50%,
                            rgba(255, 255, 255, 0.3) 80%,
                            transparent 100%);
                        filter: blur(1rpx);
                        z-index: -1;
                    }
                }

                .order-all-text {
                    font-size: 32rpx;
                    color: #000;
                    text-align: center;
                    margin-top: 35rpx;
                    font-weight: 400;
                }
            }
        }
    }
}

/* 用户包装器 */
.user_wrapper {
    padding: 30rpx;
}
.user .user_header .icon-shezhi {
    flex: 1;
    display: inline-flex;
    justify-content: flex-end;
    margin-left: 10rpx;
    font-size: 36rpx;
    color: #333;
}

.user .user_header .qiandao {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    // margin-left: 10rpx;
    margin-left: 20px;
}
.user .user_header .icon-qiandao {
    font-size: 24rpx;
    color: #333;
    padding-top: 3rpx;
    margin-right: 6rpx;
}

.user_top_group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 30rpx;
}
.user_top_group .item {
    text-align: center;
    flex: 1;
    position: relative;
}
.user_top_group .item::after {
    content: "";
    position: absolute;
    top: 4rpx;
    right: 0;
    width: 2rpx;
    height: 26rpx;
    background: #dbd1dc;
}
.user_top_group .item:last-child::after {
    width: 0;
}
.user_top_group .item .tit {
    font-size: 24rpx;
}
.user_top_group .item .tit .txt {
    margin-left: 6rpx;
}

.member-info__level-wrapper {
    padding: 0 10px;
}
.member-info__level-wrapper .member-info__level-1 {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    width: 100%;
    height: 100rpx;
    color: #fff;
    background-image: url(data:image/png;base64,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);
    background-size: cover;
    border-top-left-radius: 15rpx;
    border-top-right-radius: 15rpx;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-radius: 15rpx;
    box-shadow: rgba(0, 0, 0, 0.2) 0 -4rpx 16rpx 0;
}
.member-info__level-wrapper .member-info__level-1 .name {
    display: block;
    -webkit-box-flex: 1;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    align-self: flex-start;
    padding-left: 20rpx;
    overflow-x: hidden;
    overflow-y: hidden;
    line-height: 100rpx;
    white-space: nowrap;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    color: #ffdea0;
}
.member-info__level-wrapper .member-info__level-1 .name {
    font-size: 24rpx;
}
.member-info__level-wrapper .member-info__level-1 .name::before {
    display: inline-block;
    width: 36rpx;
    height: 36rpx;
    margin-right: 10rpx;
    vertical-align: -10rpx;
    background-size: cover;
    content: " ";
}
.member-info__level-wrapper .member-info__level-1 .name::before {
    background-image: url(data:image/png;base64,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);
}
.member-info__level-wrapper .member-info__level-1 .level {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    margin-right: 20rpx;
    font-size: 24rpx;
    line-height: 24rpx;
}
.member-info__level-wrapper .member-info__level-1 .level .iconfont {
    color: #ffdea0;
}

.user .user_wrapper {
    padding: 0 10px;
}
.user .user_wrapper .title {
    height: 88rpx;
    padding: 0 30rpx;
    font-size: 26rpx;
    font-weight: bold;
}
.user .user_wrapper .title .more {
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #999999;
    font-weight: normal;
}
.user .user_wrapper .title .more .iconfont {
    font-size: 24rpx;
    padding-top: 4rpx;
}
.user .list-group {
    background: #fff;
    margin: 20rpx 0;
    border-radius: 18rpx;
    overflow: hidden;
}
.user .list-group .wrap .iconfont {
    font-size: 60rpx;
}
.user .list-group .wrap {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    position: relative;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row nowrap;
    flex-flow: row nowrap;
    padding-bottom: 30rpx;
}
.user .list-group .wrap .li {
    position: relative;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    text-align: center;
}
.user .list-group .wrap .li .txt {
    color: #333;
    font-size: 24rpx;
    position: relative;
    padding: 0 20rpx;
}
.user .list-group.my-wallet .wrap {
    height: 120rpx;
}
.user .list-group.my-wallet .wrap .li .txt {
    top: 12rpx;
}
.user .list-group.my-wallet .wrap .li .num {
    font-weight: 700;
}
.user .list-group.my-order {
    position: relative;
}
.user .list-group.my-order .counts {
    border-radius: 20rpx;
    font-size: 20rpx;
    line-height: 27rpx;
    min-width: 28rpx;
    height: 28rpx;
    position: absolute;
    text-align: center;
    top: 30rpx;
    color: #f15353;
    border: 1rpx solid;
    padding: 0 3rpx;
    right: 55rpx;
    background: #fff;
}

/*商户中心*/
.user .merchant_header {
    background: linear-gradient(90deg, #dd9b4c, #ffd787);
    border-radius: 0 0 300px 300px/0 0 20px 20px;
    box-shadow: 0 2px 5px #f8e3c6;
    height: 190rpx;
}
.user .merchant_header .picTxt .text .shanghu-info .notice {
    font-size: 20rpx;
    color: #fff;
    background: #c8483f;
    border-radius: 20rpx;
    text-align: center;
    height: 32rpx;
    line-height: 32rpx;
    padding: 0 16rpx;
    max-width: 300rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.user .merchant_header .picTxt .text .shanghu-info .goto_arrow::after {
    display: block;
    content: "";
    width: 8rpx;
    height: 8rpx;
    border-top: 2rpx solid hsla(0, 0%, 100%, 0.7);
    border-left: 2rpx solid hsla(0, 0%, 100%, 0.7);
    -webkit-transform-origin: 50%;
    transform-origin: 50%;
    -webkit-transform: rotate(135deg);
    transform: rotate(135deg);
    position: absolute;
    right: 12rpx;
    top: 10rpx;
}
.user .merchant_header .picTxt .text .shanghu-info .goto_arrow {
    position: relative;
    padding-right: 28rpx;
    background-color: rgba(180, 116, 15, 0.3);
    display: inline-block;
    margin-right: 20rpx;
    vertical-align: middle;
}

.user .merchant_header .picTxt .text .member image {
    width: 28rpx;
    height: 28rpx;
    font-size: 20rpx;
    margin-right: 8rpx;
}
.user .merchant_header .picTxt .text .shanghu {
    display: inline-block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 20rpx;
    font-weight: normal;
}

.badgecolor {
    :deep(.uni-badge--error) {
        background-color: var(--general);
    }
}

.wrap {
    :deep(.uni-badge) {
        z-index: 50;
    }
}
</style>
