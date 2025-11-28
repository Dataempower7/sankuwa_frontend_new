<template>
    <tig-layout>
    <template v-if="state">
        <SplashAd :ad-type="adType" :ad-url="adUrl" :duration="duration" :redirect-type="redirectType" :redirect-url="redirectUrl" @close="onSplashClose" />
    </template>
    <view v-else class="index-page">
        <!-- 侧边栏遮罩 -->
        <view v-if="sidebarVisible" class="sidebar-mask" @click="closeSidebar"></view>

        <!-- 侧边栏 -->
        <view class="sidebar" :class="{ 'sidebar-open': sidebarVisible }">
            <view class="sidebar-content">
                <!-- 用户信息模块 -->
                <view class="user-section">
                    <view class="user-info" @click="handleUserNameClick">
                        <image
                            class="user-avatar"
                            :src="userAvatar"
                            mode="aspectFill"
                            @click.stop="handleAvatarClick"
                        />
                        <view class="user-details">
                            <text class="user-name">{{ userStore.token ? (userStore.userInfo.nickname || userStore.userInfo.mobile) : $t('立刻登录') }}</text>
                            <text v-if="userStore.token" class="user-phone">{{  'Hi, 欢迎来到森酷玩' }}</text>
                        </view>
                        <view class="arrow-area">
                            <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                        </view>
                    </view>
                    
                </view>

                <!-- 分类模块 -->
                <view class="menu-section">
                    <view class="menu-item" @click="goToCategory">
                        <image class="menu-icon" src="/static/images/common/icon_11.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('分类') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                </view>

                <!-- 功能模块 -->
                <view class="menu-section">
                    <view class="menu-item" @click="goToOrders">
                        <image class="menu-icon" src="/static/images/common/icon_12.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('订单') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                    <view class="menu-item" @click="goToMessages">
                        <image class="menu-icon" src="/static/images/common/icon_13.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('消息') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                    <view class="menu-item" @click="goToWishlist">
                        <image class="menu-icon" src="/static/images/common/icon_14.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('心愿单') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                    <view class="menu-item" @click="goToCoupons">
                        <image class="menu-icon" src="/static/images/common/icon_15.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('优惠券') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                    <view class="menu-item" @click="goToAddress">
                        <image class="menu-icon" src="/static/images/common/icon_16.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('地址') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                    <view class="menu-item" @click="goToSettings">
                        <image class="menu-icon" src="/static/images/common/icon_17.png" mode="aspectFit" />
                        <text class="menu-text">{{ $t('设置') }}</text>
                        <image class="arrow-icon" src="/static/images/common/right.png" mode="aspectFit" />
                    </view>
                </view>
            </view>
        </view>

        <template v-if="configStore.previewId > 0">
            <previewTip />
        </template>

        <!-- 自定义导航栏/ 列表 + logo  -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="nav-left" @click="toggleSidebar">
                  <image class="nav-icon" src="/static/images/home/list@3x.png" mode="aspectFit" /> 
                </view>
                <view class="nav-center" >
                     <image class="logo-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758687963AJS969IKrvfTozW23Q.jpeg" mode="aspectFit"  />
                </view>
            </view>
        </view>

        <template v-if="loading">
            <view class="index_empty">
                <!-- <image lazy-load src="/static/images/common/index_empty.png" mode="widthFix" /> -->
            </view>
        </template>
        
        <template v-else>
            <view class="index-content">
                <!-- 搜索框 -->
                <view class="search-container">
                    <view class="search-box" @click="search">
                        <image class="search-icon" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778963QMciIVS0zkhfhjYBdM.jpeg" mode="aspectFit" />
                        <text class="search-placeholder" >{{ $t('点击搜索商品') }}</text>
                    </view>
                </view>

                <!-- 广告轮播图 -->
                <view v-if="topAdvertisements.length > 0" class="banner-container">
                    <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#fff">
                        <swiper-item v-for="(advertisement, index) in topAdvertisements" :key="advertisement.id || index">
                            <image class="banner-image" :src="advertisement.imageUrl" mode="aspectFill" @click="handleAdClick(index)" />
                        </swiper-item>
                    </swiper>
                </view>

                <!-- 消息公告 -->
                <view class="notice-container">
                    <view 
                        class="notice-content"
                    >
                        <image class="notice-icon" src="/static/images/home/horn@3x.png" mode="aspectFit" />
                        <view class="notice-text-wrapper">
                            <view 
                                class="notice-text-slider" 
                                :style="{ transform: `translateY(-${currentNoticeIndex * 70}rpx)` }"
                            >
                                <view 
                                    v-for="(notice, index) in noticeMessages" 
                                    :key="index"
                                    class="notice-text-item"
                                    @click="goToNoticeDetail(notice)"
                                >
                                    <view class="notice-text">{{ notice.text }}</view>
                                    <image class="notice-arrow" src="/static/images/common/right.png" mode="aspectFit" @click.stop="goToNoticeDetail(notice)" />
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 营销板块 -->
                <view class="marketing-section">
                    <!-- 秒杀板块 -->
                    <view class="seckill-card" @click="goToSeckillList">
                        <image class="seckill-bg" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758694676IvkC0QflsmbZYSMbc1.jpeg" mode="aspectFill" />
                    </view>
                    
                    <!-- 右侧板块 -->
                    <view class="right-section">
                        <!-- 限时折扣 -->
                        <view class="discount-card" @click="goToDiscountPage">
                            <image class="discount-bg-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758694676EQbyc9PSiFBLGt4IVq.jpeg" mode="aspectFill" />
                        </view>
                        
                        <!-- 优惠券和签到 -->
                        <view class="bonus-container">
                            <view class="bonus-card coupon-card" @click="goToCouponPage">
                                <image class="bonus-bg-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758695555TwB1JMBGXumu0S7XZA.jpeg" mode="aspectFill" />
                            </view>
                            
                            <view class="bonus-card checkin-card" @click="goToCheckinPage">
                                <image class="bonus-bg-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758763958ffkaR6ULCE5nK8ZBNh.jpeg" mode="aspectFill" />
                            </view>
                        </view>
                    </view>
                </view>

                 <!-- AI浮动按钮 -->
                <view class="ai-float-button" @click="goToAI" style="position: fixed; right: 10rpx; top: 62%; transform: translateY(-50%); z-index: 999;">
                    <image class="ai-icon" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/17633605914a9ybDSUc9ZjgiCO1i.jpeg" style="width: 80rpx; height: 80rpx; border-radius: 50%; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);" mode="aspectFill" />
                </view>
                

                <!-- 金刚区/一级目录 -->
                <view class="nav-grid-container">
                    <scroll-view
                        scroll-x="true"
                        class="nav-scroll-view"
                        show-scrollbar="false"
                        :scroll-with-animation="true"
                        :enhanced="true"
                        :bounces="false"
                        :scroll-anchoring="true"
                        :enable-passive="true"
                        @scroll="onNavScroll"
                    >
                        <view class="nav-grid">
                            <!-- 分类视图 -->
                            <view
                                class="nav-page"
                                v-for="(pageItems, pageIndex) in navPages"
                                :key="`page-${pageIndex}`"
                                v-show="!showBrandColumn"
                            >
                                <view
                                    class="nav-grid-item"
                                    v-for="(nav, index) in pageItems"
                                    :key="nav.categoryId"
                                    @click.stop="navClick(nav, pageIndex, index)"
                                >
                                    <view class="nav-grid-icon-wrapper">
                                        <image class="nav-grid-icon" :src="nav.categoryPic" mode="aspectFit" />
                                    </view>
                                    <text class="nav-grid-text">{{ nav.categoryName }}</text>
                                </view>
                            </view>
                            
                            <!-- 品牌专栏视图 -->
                            <view
                                class="nav-page"
                                v-for="(pageItems, pageIndex) in brandPages"
                                :key="`brand-page-${pageIndex}`"
                                v-show="showBrandColumn"
                            >
                                <view
                                    class="nav-grid-item"
                                    v-for="brand in pageItems"
                                    :key="brand.id"
                                    @click.stop="brandClick(brand)"
                                >
                                    <view class="nav-grid-icon-wrapper">
                                        <image class="nav-grid-icon" :src="brand.logo" mode="aspectFit" />
                                    </view>
                                    <text class="nav-grid-text">{{ brand.name }}</text>
                                </view>
                            </view>
                        </view>
                    </scroll-view>
                    
                    <!-- 切换按钮 - 放在金刚区内部底部 -->
                    <view class="switch-toggle-wrapper">
                        <view class="switch-toggle-button" @click="toggleView">
                            <text class="toggle-text" :class="{ active: !showBrandColumn }">精选类目</text>
                            <view class="toggle-divider"></view>
                            <text class="toggle-text" :class="{ active: showBrandColumn }">精选品牌</text>
                        </view>
                    </view>
                </view>

                <!-- 商品导航栏 -->
                <view class="product-nav-container">
                    <view class="product-nav-tabs">
                        <view
                            class="nav-tab-item"
                            :class="{ active: activeTabIndex === index, loading: productLoading && activeTabIndex === index }"
                            v-for="(tab, index) in productTabs"
                            :key="index"
                            @click="switchTab(index)"
                        >
                            <view class="tab-content">
                                <!-- 加载时显示图标，不加载时显示文字 -->
                                <text v-if="!(productLoading && activeTabIndex === index)" class="tab-text">{{ tab.name }}</text>
                                <view v-else class="tab-loading-icon">
                                    <up-loading-icon mode="circle" size="32rpx" color="#000000" />
                                </view>
                            </view>
                            <!-- 分隔符 -->
                            <view v-if="index < productTabs.length - 1" class="nav-tab-divider"></view>
                        </view>
                    </view>
                </view>

                <!-- 商品展示区域 -->
                <view class="product-display-container">
                    <!-- 首次加载时显示 loading -->
                    <view v-if="productLoading && currentProducts.length === 0" class="loading-container">
                        <up-loading-icon mode="circle" />
                    </view>

                    <!-- 没有商品时显示空状态 -->
                    <view v-else-if="!productLoading && currentProducts.length === 0" style="display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 40rpx;">
                        <view style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <image style="width: 300rpx; height: 300rpx; margin-bottom: 40rpx;" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880vZYp8jdsXtbPshx9B6.jpeg" mode="aspectFit" />
                            <text style="font-size: 32rpx; color: #333; font-weight: 500; margin-bottom: 16rpx;">{{ $t("暂无商品") }}</text>
                            <text style="font-size: 28rpx; color: #999; line-height: 1.5;">{{ $t("敬请期待更多精彩商品") }}</text>
                        </view>
                    </view>

                    <!-- 有商品时显示商品列表 - 使用瀑布流 -->
                    <view v-else>
                        <view class="masonry-wrapper">
                            <masonry :commodity-list="currentProducts" :promotion-list="promotionList" />
                        </view>

                        <!-- 加载更多状态 -->
                        <view v-if="productLoading && currentProducts.length > 0" class="loading-more">
                            <up-loading-icon mode="circle" size="40rpx" />
                            <text class="loading-more-text">{{ $t('加载中...') }}</text>
                        </view>

                        <!-- 没有更多数据提示 -->
                        <view v-if="noMoreData && currentProducts.length > 0" class="no-more-data">
                            <text>{{ $t('没有更多商品了') }}</text>
                        </view>
                    </view>
                </view>  
            </view>
        </template>
       
        <tig-back-top :scrollTop="scrollTop"></tig-back-top>
        
       
    </view>
</tig-layout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad, onReachBottom, onShow, onShareAppMessage, onShareTimeline, onUnload, onPageScroll } from "@dcloudio/uni-app";
import { getIndex, getSplashAd, getCateProduct, getHomeSeckill, getTopAdvertisement } from "@/api/home/home";
import { getArticleList } from "@/api/article/article";
import { getCategoryAll } from "@/api/productCate/productCate";
import { getFeaturedBrands } from "@/api/product/brand";
import SplashAd from "@/components/modules/SplashAd/index.vue";
import masonry from "@/components/masonry/masonry.vue";
import previewTip from "./src/previewTip.vue";
import type { GetProductFilterResult, SeckillListResponse, TopAdvertisementItem, TopAdvertisementRawItem } from "@/types/home/home";
import type { ArticleFilterState } from "@/types/article/article";
import type { SeckillFilterState } from "@/types/seckill/seckill";
import type { filterSeleted } from "@/types/productCate/productCate";
import getPromotionList from "@/utils/getPromotionList";
import { useConfigStore } from "@/store/config";
import { usecatnavStore } from "@/store/catnav";
import { useUserStore } from "@/store/user";
import { staticResource } from "@/utils";
import { imageFormat } from "@/utils/format";
import checkAppUpdate from "@/utils/checkAppUpdate";
import { useScrollTop } from "@/hooks";

const { scrollTop } = useScrollTop(onPageScroll);

const configStore = useConfigStore();
const catnavStore = usecatnavStore();
const userStore = useUserStore();

// 格式化用户头像
const userAvatar = computed(() => {
    if (!userStore.token || !userStore.userInfo.avatar) {
        return 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/176173034416OBe7LxG3pY6RU3XK.jpeg';
    }
    const formattedAvatar = imageFormat(userStore.userInfo.avatar);
    return formattedAvatar || 'https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/176173034416OBe7LxG3pY6RU3XK.jpeg';
});

// 开屏广告相关
const adType = ref<"image" | "video">("image");
const adUrl = ref("");
const duration = ref(0);
const state = ref(false);
const redirectType = ref("");
const redirectUrl = ref("");

// 侧边栏状态
const sidebarVisible = ref(false);

// 页面数据
const loading = ref(false);
const currentCategoryId = ref(0);
const page = ref(1);
const loadend = ref(false);
const bottomLoading = ref(true);
const commodityList = ref<GetProductFilterResult[]>([]);

// 新增的UI数据
const noticeData = ref<ArticleFilterState | null>(null);
const navList = ref<filterSeleted[]>([]);
const seckillData = ref<SeckillFilterState[]>([]);
const topAdvertisements = ref<TopAdvertisementItem[]>([]);

// 将导航数据按每页8个进行分组
const navPages = computed(() => {
    const pages = [];
    const itemsPerPage = 8;

    for (let i = 0; i < navList.value.length; i += itemsPerPage) {
        pages.push(navList.value.slice(i, i + itemsPerPage));
    }

    return pages;
});

// 当前滚动页面索引
const currentNavPageIndex = ref(0);

// 品牌专栏相关数据
const showBrandColumn = ref(false);
const brandList = ref<any[]>([]);
const brandDataLoaded = ref(false); // 品牌数据是否已加载

// 将品牌数据按每页8个进行分组
const brandPages = computed(() => {
    const pages = [];
    const itemsPerPage = 8;

    for (let i = 0; i < brandList.value.length; i += itemsPerPage) {
        pages.push(brandList.value.slice(i, i + itemsPerPage));
    }

    return pages;
});

// 商品导航栏相关数据
const productTabs = ref([
    { name: '好物推荐', key: 'recommend', params: {} },
    { name: '新品推荐', key: 'new', params: { isNew: 1 } },
    { name: '热销产品', key: 'hot', params: { isHot: 1 } },
    { name: '赫利肯', key: 'helikon', params: { categoryId: 891 } }
]);
const activeTabIndex = ref(0);
const productLoading = ref(false);
const currentProducts = ref<GetProductFilterResult[]>([]);
const promotionList = ref<Record<string, any>>({}); // 促销信息列表
const currentPage = ref(1);
const noMoreData = ref(false);
let currentRequestId = 0; // 用于标识请求的唯一ID，解决竞态问题

// 公告消息数据
const noticeMessages = ref<any[]>([]);
const currentNoticeIndex = ref(0);
const noticeTimer = ref<ReturnType<typeof setInterval> | null>(null);

// 秒杀相关数据
const countdownTime = ref({
    hours: '02',
    minutes: '31', 
    seconds: '04'
});
const seckillTimer = ref<ReturnType<typeof setInterval> | null>(null);

// 初始化推荐商品数据
const initRecommendProducts = () => {
    currentCategoryId.value = 0; // 推荐商品分类ID，通常为0或特定ID
    page.value = 1;
    loadend.value = false;
    commodityList.value = [];
};

// 获取精选品牌数据
const getBrandData = async () => {
    try {
        const result:any = await getFeaturedBrands(); 
        if (result && Array.isArray(result)) {
            brandList.value = result.map((brand: any) => ({
                id: brand.brandId,
                name: brand.brandName,
                logo: imageFormat(brand.brandLogo), // 格式化图片路径
                categoryId: brand.categoryId || 0
            }));
            brandDataLoaded.value = true; // 标记数据已加载
        } else {
            console.warn('品牌API返回数据格式不正确或为空', result);
        }
    } catch (error) {
        console.error('❌ 获取品牌数据失败:', error);
    }
};

// 获取消息公告数据
const getNoticeData = async () => {
    try {
        // 重置索引
        currentNoticeIndex.value = 0;
        
        const result = await getArticleList({
            page: 1,
            size: 10, // 获取多条公告用于轮播
            articleCategoryId: 10 // 传入指定的分类ID
        });
        
        // 尝试多种数据结构可能性
        let records = null;
        if (result && (result as any).data && (result as any).data.records) {
            records = (result as any).data.records;
        } else if (result && (result as any).records) {
            records = (result as any).records;
        } else if (result && Array.isArray(result)) {
            records = result;
        }
        
        if (records && Array.isArray(records) && records.length > 0) {
            // 将获取的公告数据格式化为轮播数据
            const formattedMessages = records.map((item: any) => ({
                id: item.articleId || item.id,
                text: item.articleTitle || item.title,
                articleId: item.articleId || item.id
            }));
            
            // 确保数据正确赋值
            noticeMessages.value = formattedMessages;
            
            // 保留第一条作为主要公告数据
            noticeData.value = records[0];
        } else {
            // 如果没有获取到数据，使用默认公告
            noticeMessages.value = [
                { id: 1, text: "SANKUWA 恭候您的尊贵莅临，愿您在此邂逅心仪臻品", articleId: 1 }
            ];
        }
        
        // 数据加载完成后重新启动轮播
        startNoticeRotation();
    } catch (error) {
        console.error("获取公告数据失败:", error);
        // 出错时使用默认公告
        noticeMessages.value = [
            { id: 1, text: "SANKUWA 恭候您的尊贵莅临，愿您在此邂逅心仪臻品", articleId: 1 }
        ];
        
        // 出错时也启动轮播
        startNoticeRotation();
    }
};



// 获取顶部广告数据（用于轮播图）
const getTopAdvertisementData = async () => {
    try {
        const result = await getTopAdvertisement();
        
        let rawData: TopAdvertisementRawItem[] = [];
        
        // 判断数据结构
        if (result && (result as any).data && Array.isArray((result as any).data)) {
            // 如果返回的是包装过的数据结构
            rawData = (result as any).data as TopAdvertisementRawItem[];
        } else if (result && Array.isArray(result)) {
            // 如果直接返回数组
            rawData = result as TopAdvertisementRawItem[];
        }
        
        // 将原始数据转换为组件需要的格式
        if (rawData.length > 0) {
            const ads: TopAdvertisementItem[] = rawData.map((item: TopAdvertisementRawItem) => ({
                id: item.picId,
                title: item.picName || `广告 ${item.picId}`,
                imageUrl: item.picUrl,
                linkUrl: undefined, // API 没有返回链接信息，可以根据需要后续扩展
                sortOrder: item.picId,
                isActive: true // 假设所有返回的广告都是激活的
            }));
            
            topAdvertisements.value = ads;
        } else {
            console.log('未获取到有效的广告数据');
            topAdvertisements.value = [];
        }
    } catch (error) {
        console.error("获取顶部广告数据失败:", error);
        // 设置空数组，轮播图不会显示
        topAdvertisements.value = [];
    }
};

// 获取分类导航数据
const getCategoryNavData = async () => {
    try {
        const result = await getCategoryAll();
        // 判断数据结构
        let dataArray = null;
        if (result && (result as any).data && Array.isArray((result as any).data)) {
            dataArray = (result as any).data;
        } else if (result && Array.isArray(result)) {
            dataArray = result;
        } else {
            console.error("数据结构不正确:", result);
            return;
        }
        
        // 取所有一级分类，支持左右滑动查看更多
        const categories = dataArray
            .filter((item: any) => item.parentId === 0 && item.isShow === 1) // 只要一级分类且显示的
            .map((item: any, index: number) => ({
                ...item,
                categoryPic: item.categoryPic 
            }));
        navList.value = categories;
        
    } catch (error) {
        console.error("获取分类导航数据失败:", error);
    }
};


// 获取商品列表
const getProductList = async () => {
    bottomLoading.value = true;
    try {
        const result = await getCateProduct({ categoryId: currentCategoryId.value, page: page.value });
        if (result.records && result.records.length > 0) {
            commodityList.value = [...commodityList.value, ...result.records];
            loadend.value = false;
        } else {
            loadend.value = true;
        }
    } catch (error) {
        console.error(error);
    } finally {
        bottomLoading.value = false;
    }
};

const getIndexData = async () => {
    loading.value = true;
    try {
        const res = await getIndex();
        
        // 获取公告数据
        await getNoticeData();
        
        // 获取顶部广告数据（用于轮播图）
        await getTopAdvertisementData();
        
        // 获取分类导航数据
        await getCategoryNavData();
        
        // 获取推荐商品
        initRecommendProducts();
        await getProductList();
        
        configStore.pageModules = res.pageModule;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const getSplashAdData = async () => {
    try {
        const result = await getSplashAd();
        if (!result) return;
        state.value = result.state == 1 ? true : false;
        adType.value = result.materialType == 0 ? "image" : "video";
        adUrl.value = result.materialType == 0 ? result.materialImg : result.materialVideo[0].videoUrl;
        redirectType.value = String(result.redirectType);
        redirectUrl.value = result.redirectUrl;
        duration.value = result.maxWaitTime;
    } catch (error) {
        console.error("获取开屏广告失败:", error);
    }
};

const onSplashClose = () => {
    state.value = false;
};

// 搜索点击
const search = () => {
    uni.navigateTo({
        url: "/pages/search/index",
        success: () => {
            console.log('跳转搜索页面成功');
        },
        fail: (err) => {
            console.error('跳转搜索页面失败', err);
        }
    });
};


// 广告点击
const advertisementClick = (ad: TopAdvertisementItem) => {
    
    if (ad.linkUrl) {
        // 如果是外部链接，可以使用 uni.navigateTo 或 其他处理方式
        if (ad.linkUrl.startsWith('http')) {
            // 外部链接，可以使用网页组件打开
            uni.navigateTo({
                url: `/pages/webview/index?url=${encodeURIComponent(ad.linkUrl)}&title=${encodeURIComponent(ad.title)}`
            }).catch(() => {
                // 如果没有 webview 页面，就复制链接
                uni.setClipboardData({
                    data: ad.linkUrl,
                    success: () => {
                        uni.showToast({
                            title: '链接已复制',
                            icon: 'success'
                        });
                    }
                });
            });
        } else {
            // 内部链接
            uni.navigateTo({
                url: ad.linkUrl
            }).catch((error) => {
                console.error('跳转失败:', error);
                uni.showToast({
                    title: '跳转失败',
                    icon: 'none'
                });
            });
        }
    } else {
        // 当前 API 没有返回链接信息，可以显示提示或者不做任何操作
        uni.showToast({
            title: ad.title,
            icon: 'none',
            duration: 1500
        });
    }
};

// 金刚区导航点击
const navClick = (nav: filterSeleted, pageIndex?: number, itemIndex?: number) => {

    if (!nav || !nav.categoryId) {
        console.warn('分类数据无效:', nav);
        uni.showToast({
            title: '分类数据异常',
            icon: 'none'
        });
        return;
    }

    // 跳转到分类页面，传递分类ID
    uni.navigateTo({
        url: `/pages/productCate/index?categoryId=${nav.categoryId}`,
        fail: (error) => {
            console.error('跳转分类页面失败:', error);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
};

// 切换视图（分类/品牌）
const toggleView = async () => {
    showBrandColumn.value = !showBrandColumn.value;
    
    // 如果切换到品牌专栏且数据未加载，则加载品牌数据
    if (showBrandColumn.value && !brandDataLoaded.value) {
        await getBrandData();
    }
    
    
    // 显示切换提示
    const title = showBrandColumn.value ? '精选品牌' : '商品分类';
};

// 品牌点击事件
const brandClick = (brand: any) => {
    console.log('点击品牌:', brand);
    
    // 跳转到搜索页面，并将品牌名称作为搜索关键词
    uni.navigateTo({
        url: `/pages/search/index?keyword=${encodeURIComponent(brand.name)}`,
        fail: (error) => {
            console.error('跳转搜索页面失败:', error);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
};

// 金刚区滚动事件处理
const onNavScroll = (e: any) => {
    const { scrollLeft } = e.detail;
    const pageWidth = 720; // 每页宽度（690 + 30边距）
    const currentPage = Math.round(scrollLeft / pageWidth);
    currentNavPageIndex.value = Math.max(0, Math.min(currentPage, navPages.value.length - 1));
};

// 切换商品标签页
const switchTab = async (index: number) => {
    // 如果点击的是当前标签页，则刷新数据
    if (activeTabIndex.value === index) {
        // 重置loading状态，允许新请求
        productLoading.value = false;
        currentPage.value = 1; // 重置页码
        noMoreData.value = false; // 重置没有更多数据状态
        
        // 强制触发Vue响应式更新：先清空数据
        currentProducts.value = [];
        promotionList.value = {};
        
        // 等待一个微任务，确保DOM更新
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // 加载新数据
        await loadTabProducts(false);
        return;
    }

    // 切换到新的标签页
    productLoading.value = false; // 重置loading状态
    activeTabIndex.value = index;
    currentPage.value = 1; // 重置页码
    noMoreData.value = false; // 重置没有更多数据状态
    
    // 不清空商品列表，直接加载新数据替换，避免页面跳动
    await loadTabProducts(false); // false 表示不是追加，而是替换
};

// 加载当前标签页的商品
const loadTabProducts = async (append: boolean = false) => {
    if (productLoading.value) return;
    
    // 如果没有更多数据了，不再请求
    if (noMoreData.value && append) return;

    productLoading.value = true;
    
    // 生成新的请求ID并记录当前的tab索引
    currentRequestId++;
    const requestId = currentRequestId;
    const requestTabIndex = activeTabIndex.value;

    try {
        const currentTab = productTabs.value[activeTabIndex.value];
        const params = {
            page: currentPage.value,
            size: 12,
            ...currentTab.params
        };

        const result = await getCateProduct(params);

        // 检查请求返回时，是否还是同一个请求和同一个tab
        if (requestId !== currentRequestId || requestTabIndex !== activeTabIndex.value) {
            console.log('请求已过期，忽略结果');
            return;
        }

        if (result.records && result.records.length > 0) {
            if (append) {
                // 追加模式：将新数据添加到现有数据后面
                currentProducts.value = [...currentProducts.value, ...result.records];
            } else {
                // 替换模式：直接替换
                currentProducts.value = result.records;
                // 清空旧的促销信息
                promotionList.value = {};
            }
            
            // 获取促销信息
            try {
                const productIds = result.records.map((item: any) => ({
                    productId: item.productId,
                    product_id: item.productId
                }));
                const resPromotion = await getPromotionList({
                    products: productIds as any,
                    from: "list"
                });
                
                // 再次检查请求是否还有效
                if (requestId !== currentRequestId || requestTabIndex !== activeTabIndex.value) {
                    console.log('促销信息请求已过期，忽略结果');
                    return;
                }
                
                // 合并促销信息
                promotionList.value = { ...promotionList.value, ...resPromotion };
            } catch (err) {
                console.error("获取促销信息失败:", err);
            }
            
            // 如果返回的数据少于请求的数量，说明没有更多数据了
            if (result.records.length < 12) {
                noMoreData.value = true;
            }
        } else {
            // 没有返回数据
            if (append) {
                noMoreData.value = true;
            } else {
                currentProducts.value = [];
            }
        }
    } catch (error) {
        console.error('加载商品失败:', error);
        // 只有当前请求还有效时才显示错误提示
        if (requestId === currentRequestId && requestTabIndex === activeTabIndex.value) {
            uni.showToast({
                title: '加载商品失败',
                icon: 'none'
            });
            if (!append) {
                currentProducts.value = [];
            }
        }
    } finally {
        // 只有当前请求还有效时才重置loading状态
        if (requestId === currentRequestId && requestTabIndex === activeTabIndex.value) {
            productLoading.value = false;
        }
    }
};



// 处理广告图片点击
const handleAdClick = (index: number) => {
    // 根据索引硬编码跳转逻辑
    switch(index) {
        case 0:
            // 拼团活动 - 暂无活动，显示友好提示
            uni.showToast({
                title: '拼团活动即将上线，敬请期待',
                icon: 'none',
                duration: 2000
            });
            break;
        case 1:
            // 满减券活动 - 跳转到优惠券页面
            uni.navigateTo({
                url: '/pages/coupon/index',
                fail: (error) => {
                    console.error('跳转优惠券页面失败:', error);
                    uni.showToast({
                        title: '页面跳转失败',
                        icon: 'none'
                    });
                }
            });
            break;
        case 2:
            // 折扣活动 - 跳转到折扣页面
            uni.navigateTo({
                url: '/pages/discount/list',
                fail: (error) => {
                    console.error('跳转折扣页面失败:', error);
                    uni.showToast({
                        title: '页面跳转失败',
                        icon: 'none'
                    });
                }
            });
            break;
        case 3:
            // 秒杀活动 - 跳转到秒杀页面
            uni.navigateTo({
                url: '/pages/seckill/list',
                fail: (error) => {
                    console.error('跳转秒杀页面失败:', error);
                    uni.showToast({
                        title: '页面跳转失败',
                        icon: 'none'
                    });
                }
            });
            break;
        default:
            console.log('未配置的广告位:', index);
            break;
    }
};

// 点击公告跳转详情页
const goToNoticeDetail = (notice?: any) => {
    const targetNotice = notice || noticeData.value;
    if (targetNotice && targetNotice.articleId) {
        uni.navigateTo({
            url: `/pages/article/news/detail?id=${targetNotice.articleId}`,
            fail: (error) => {
                console.error('跳转文章详情页失败:', error);
                uni.showToast({
                    title: '页面跳转失败',
                    icon: 'none'
                });
            }
        });
    } else {
        console.warn('无效的公告数据，无法跳转:', targetNotice);
    }
};

// 开始公告轮播
const startNoticeRotation = () => {
    if (noticeTimer.value) {
        clearInterval(noticeTimer.value);
    }
    
    // 只有当公告数据大于1条时才开始轮播
    if (noticeMessages.value.length > 1) {
        noticeTimer.value = setInterval(() => {
            const oldIndex = currentNoticeIndex.value;
            currentNoticeIndex.value = (currentNoticeIndex.value + 1) % noticeMessages.value.length;
        }, 5000); // 5秒切换一次
    } else {
        console.log('公告数量不足，不启动轮播');
    }
};

// 停止公告轮播
const stopNoticeRotation = () => {
    if (noticeTimer.value) {
        clearInterval(noticeTimer.value);
        noticeTimer.value = null;
    }
};


// 侧边栏相关方法
const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
};

const closeSidebar = () => {
    sidebarVisible.value = false;
};

// 头像点击处理 - 换头像
const handleAvatarClick = () => {
    if (!userStore.token) {
        // 未登录时触发登录
        handleLogin();
        return;
    }

    // 已登录时选择头像
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            // 关闭侧边栏
            closeSidebar();
            // 上传头像
            uploadAvatar(tempFilePath);
        },
        fail: (err) => {
            console.error('选择图片失败:', err);
            // 选择失败时也关闭侧边栏
            closeSidebar();
        }
    });
};

// 上传头像
const uploadAvatar = (filePath: string) => {
    uni.showLoading({
        title: '上传中...'
    });

    let apiBaseUrl;
    // #ifdef H5
    apiBaseUrl = import.meta.env.VITE_API_URL || location.origin;
    // #endif
    // #ifndef H5
    apiBaseUrl = import.meta.env.VITE_API_URL;
    // #endif

    uni.uploadFile({
        url: apiBaseUrl + import.meta.env.VITE_API_PREFIX + 'user/user/modifyAvatar',
        filePath: filePath,
        name: 'file',
        header: {
            'Authorization': userStore.token
        },
        success: (uploadFileRes) => {
            try {
                const result = JSON.parse(uploadFileRes.data);
                if (result.code === 200 || result.success) {
                    uni.showToast({
                        title: '头像更新成功',
                        icon: 'success'
                    });
                    // 重新获取用户信息以更新头像
                    userStore.getUserInfo();
                } else {
                    uni.showToast({
                        title: result.message || '上传失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('解析上传结果失败:', error);
                uni.showToast({
                    title: '上传失败',
                    icon: 'none'
                });
            }
        },
        fail: (error) => {
            console.error('上传头像失败:', error);
            uni.showToast({
                title: '上传失败',
                icon: 'none'
            });
        },
        complete: () => {
            uni.hideLoading();
        }
    });
};

// 用户名点击处理 - 跳转个人中心
const handleUserNameClick = () => {
    if (!userStore.token) {
        // 未登录时触发登录
        handleLogin();
        return;
    }

    // 已登录时跳转到个人资料页面
    uni.navigateTo({
        url: '/pages/user/profile/index',
        success: () => {
        },
        fail: (err) => {
            console.error('跳转失败', err);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
    closeSidebar();
};

// 用户登录处理
const handleLogin = () => {
    if (!userStore.token) {
        // 在微信生态下触发微信快捷登录
        if (
            configStore.openWechatOauth === 1 &&
            configStore.openWechatRegister === 1 &&
            (configStore.XClientType === "miniProgram" || configStore.XClientType === "wechat")
        ) {
            userStore.setAuthType("wechatLogin");
        } else {
            // 其他情况跳转到登录页面
            uni.navigateTo({
                url: '/pages/login/index'
            });
        }
    }
    closeSidebar();
};

// 导航方法
const goToCategory = () => {
    uni.navigateTo({
        url: '/pages/productCate/index'
    });
    closeSidebar();
};

// 需要登录的功能统一处理
const handleLoginRequired = (callback: () => void) => {
    if (!userStore.token) {
        // 在微信生态下触发微信快捷登录
        if (
            configStore.openWechatOauth === 1 &&
            configStore.openWechatRegister === 1 &&
            (configStore.XClientType === "miniProgram" || configStore.XClientType === "wechat")
        ) {
            userStore.setAuthType("wechatLogin");
        } else {
            // 其他情况跳转到登录页面
            uni.navigateTo({
                url: '/pages/login/index'
            });
        }
        return;
    }
    callback();
};

const goToOrders = () => {
    handleLoginRequired(() => {
        uni.navigateTo({
            url: '/pages/user/order/list'
        });
    });
    closeSidebar();
};

const goToMessages = () => {
    handleLoginRequired(() => {
        uni.navigateTo({
            url: '/pages/user/messageLog/index'
        });
    });
    closeSidebar();
};

const goToWishlist = () => {
    handleLoginRequired(() => {
        uni.navigateTo({
            url: '/pages/user/collectProduct/index'
        });
    });
    closeSidebar();
};

const goToCoupons = () => {
    handleLoginRequired(() => {
        uni.navigateTo({
            url: '/pages/coupon/index'
        });
    });
    closeSidebar();
};

const goToAddress = () => {
    handleLoginRequired(() => {
        uni.navigateTo({
            url: '/pages/address/list'
        });
    });
    closeSidebar();
};

const goToSettings = () => {
    uni.navigateTo({
        url: '/pages/user/profile/index'
    });
    closeSidebar();
};

// 跳转到AI页面
const goToAI = () => {
    uni.navigateTo({
        url: '/pages/ai/index'
    });
};


// 页面跳转方法
const goToSeckillList = () => {
    uni.navigateTo({
        url: '/pages/seckill/list'
    });
};

// 删除重复的函数定义，使用上面的版本

// 跳转限时折扣页面
const goToDiscountPage = () => {
    uni.navigateTo({
        url: '/pages/discount/list'
    });
};

// 跳转签到领券页面
const goToCouponPage = () => {
    uni.navigateTo({
        url: '/pages/coupon/index'
    });
};

// 跳转签到页面
const goToCheckinPage = () => {
    uni.navigateTo({
        url: '/pages/user/sign/index'
    });
};

onLoad(async (options: any) => {
    if (options && options.previewId) {
        configStore.previewId = options.previewId;
    }
    catnavStore.reset();
    await getSplashAdData();
    await getIndexData();
    
    // 加载默认商品数据（推荐好物）
    await loadTabProducts(false);

    // #ifdef APP-PLUS || APP-HARMONY
    checkAppUpdate();
    // #endif
});

onUnload(() => {
    catnavStore.reset();
    // 清理定时器
    stopNoticeRotation();
});


onReachBottom(() => {
    // 当滑动到底部时，加载更多商品
    if (!productLoading.value && !noMoreData.value && currentProducts.value.length > 0) {
        currentPage.value++; // 增加页码
        loadTabProducts(true); // true 表示追加模式
    }
});

onShow(() => {
    // 不再自动滚动到之前的位置，避免干扰用户浏览
    uni.hideTabBar();
    
    // 页面显示时恢复公告轮播和倒计时
    // 只有当已有公告数据时才启动轮播，避免重复启动
    if (noticeMessages.value.length > 0) {
        startNoticeRotation();
    }
});

onShareAppMessage((res) => {
    return {
        title: configStore.baseInfo.shopTitle
    };
});
onShareTimeline(() => {
    return {
        title: configStore.baseInfo.shopTitle
    };
});
</script>
<style>
page {
    background-color: #F5F5F5 !important;
}

/* 商品导航栏 - 全局样式 */
.index-page .product-nav-container {
    margin: 0 30rpx 30rpx !important;
    background-color: #ffffff !important;
    border-radius: 20rpx !important;
    overflow: hidden !important;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08) !important;
}

.index-page .product-nav-tabs {
    display: flex !important;
    width: 100% !important;
}

.index-page .nav-tab-item {
    flex: 1 !important;
    height: 88rpx !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 28rpx !important;
    color: #666666 !important;
    background-color: #ffffff !important;
    box-sizing: border-box !important;
    position: relative !important;
    transition: all 0.3s ease !important;
}

.index-page .nav-tab-item .tab-content {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8rpx !important;
    min-width: 100rpx !important;
    height: 100% !important;
}

.index-page .nav-tab-item .tab-text {
    animation: fadeIn 0.3s ease !important;
}

.index-page .nav-tab-item .tab-loading-icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    animation: fadeIn 0.3s ease !important;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.index-page .nav-tab-item.active {
    color: #000000 !important;
    font-weight: 500 !important;
    font-size: 30rpx !important;
}

.index-page .nav-tab-item.loading {
    pointer-events: none !important;
    opacity: 0.8 !important;
}

/* 分隔符样式 */
.index-page .nav-tab-divider {
    position: absolute !important;
    right: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 1rpx !important;
    height: 40rpx !important;
    background-color: #e8e8e8 !important;
}

/* 激活状态时隐藏相邻分隔符 */
/* .index-page .nav-tab-item.active .nav-tab-divider {
    opacity: 0 !important;
} */

/* 商品展示区域 - 全局样式 */
.index-page .product-display-container {
    margin: 20rpx 30rpx 30rpx 30rpx !important;
}

.index-page .masonry-wrapper {
    padding: 0 !important;
}

.index-page .product-item {
    width: 48% !important;
    background-color: #ffffff !important;
    border-radius: 33rpx !important;
    margin-bottom: 20rpx !important;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08) !important;
    border: 1rpx solid #f0f0f0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

.index-page .product-image-wrapper {
    position: relative !important;
    width: calc(100% - 24rpx) !important;
    height: 280rpx !important;
    overflow: hidden !important;
    border-radius: 22rpx !important;
    margin: 12rpx !important;
    margin-bottom: 8rpx !important;
}

.index-page .product-image {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    border-radius: 22rpx !important;
}

.index-page .product-info {
    padding: 0 20rpx 20rpx !important;
    box-sizing: border-box !important;
}

.index-page .product-title {
    font-size: 26rpx !important;
    color: #2a3145 !important;
    line-height: 40rpx !important;
    margin-bottom: 10rpx !important;
    height: 80rpx !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    width: 100% !important;
    box-sizing: border-box !important;
    font-weight: bold !important;
}

/* 刷新商品按钮 - 微信小程序兼容 */
.refresh-products-container {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 40rpx 0 60rpx !important;
    width: 100% !important;
}

.refresh-button {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16rpx 28rpx !important;
    background-color: #f8f9fa !important;
    border: 2rpx solid #e9ecef !important;
    border-radius: 36rpx !important;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1) !important;
    width: 160rpx !important;
    height: 60rpx !important;
    box-sizing: border-box !important;
}

.refresh-button:active {
    transform: scale(0.98) !important;
    background-color: #e9ecef !important;
    border-color: #dee2e6 !important;
}

.refresh-button.loading {
    opacity: 1 !important;
    width: 160rpx !important;
    height: 60rpx !important;
    padding: 16rpx 28rpx !important;
    box-sizing: border-box !important;
}

.refresh-icon-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 20rpx !important;
    height: 20rpx !important;
    margin-right: 10rpx !important;
}

.refresh-icon {
    width: 20rpx !important;
    height: 20rpx !important;
    transition: transform 0.3s ease !important;
}

.refresh-icon.loading-rotate {
    animation: rotate 1s linear infinite !important;
}



@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.refresh-text {
    font-size: 24rpx !important;
    color: #666666 !important;
    font-weight: 500 !important;
    line-height: 20rpx !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
}

.refresh-button:active .refresh-icon {
    transform: rotate(180deg) !important;
    opacity: 0.8 !important;
}

.refresh-button:active .refresh-text {
    color: #3544BA !important;
}

/* 加载更多状态 */
.loading-more {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 40rpx 0 !important;
    width: 100% !important;
}

.loading-more-text {
    font-size: 24rpx !important;
    color: #999999 !important;
    margin-top: 20rpx !important;
}

/* 没有更多数据提示 */
.no-more-data {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 40rpx 0 60rpx !important;
    width: 100% !important;
}

.no-more-data text {
    font-size: 24rpx !important;
    color: #999999 !important;
    position: relative !important;
}

.no-more-data text::before,
.no-more-data text::after {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    width: 60rpx !important;
    height: 1rpx !important;
    background-color: #e0e0e0 !important;
}

.no-more-data text::before {
    right: 100% !important;
    margin-right: 20rpx !important;
}

.no-more-data text::after {
    left: 100% !important;
    margin-left: 20rpx !important;
}
</style>
<style lang="scss" scoped>
.index-page {
    background-color: #F5F5F5;
    min-height: 100vh;
    position: relative;
}

/* 侧边栏遮罩 */
.sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

/* 侧边栏 */
.sidebar {
    position: fixed;
    top: 0;
    left: -600rpx;
    width: 600rpx;
    height: 100%;
    background-color: #fff;
    z-index: 1000;
    transition: left 0.3s ease;
    border-radius: 0 20rpx 20rpx 0;
    box-shadow: 2rpx 0 20rpx rgba(0, 0, 0, 0.1);

    &.sidebar-open {
        left: 0;
    }
}

.sidebar-content {
    padding: 250rpx 0;
    height: 100%;
    overflow-y: auto;
    background-color: #F6F6F6;
}

/* 用户信息区域 */
.user-section {
    border-radius: 20rpx;
    margin: -50rpx 23rpx 20rpx -18rpx;
    padding: 30rpx;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 15rpx 5rpx 0 15rpx;
}

.user-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-right: 30rpx;
    background-color: #f5f5f5;
    position: relative;

   
}

.user-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    &:active {
        opacity: 0.7;
    }
}

.user-name {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 10rpx;
}

.user-phone {
    font-size: 26rpx;
    color: #999;
}

.arrow-area {
    display: flex;
    align-items: center;
    padding: 5rpx;
    cursor: pointer;
    
    &:active {
        opacity: 0.7;
    }
}

.arrow-icon {
    width: 24rpx;
    height: 24rpx;
}

/* 菜单区域 */
.menu-section {
    margin-bottom: 20rpx;
    margin-left: 20rpx;
    margin-right: 20rpx;
    border-radius: 30rpx;
    background-color: #fff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;

    &:last-child {
        margin-bottom: 20rpx;
    }
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f8f8f8;

    &:active {
        background-color: #f8f8f8;
    }

    &:last-child {
        border-bottom: none;
    }
}

.menu-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 30rpx;
}

.menu-text {
    flex: 1;
    font-size: 30rpx;
    color: #333;
}

/* 自定义导航栏 */
.custom-navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(var(--status-bar-height) + 125rpx);
    background-color: #fff;
    z-index: 1000;
    
    .navbar-content {
        display: flex;
        align-items: center;
        height: 172rpx;
        margin-top: var(--status-bar-height);
        padding: 0 30rpx;
        
        .nav-left {
            width: 80rpx;
            height: 100%;
            display: flex;
            align-items: center;
        }
        
        .nav-icon {
            width: 35rpx;
            height: 35rpx;
        }
        
        .nav-center {
            flex: 1;
            // display: flex;
            // justify-content: center;
            // align-items: center;
            
            // .logo-text {
            //     font-size: 38rpx;
            //     font-weight: 500;
            //     color: #333;
            //     position: relative;
            //     right: 15rpx;
            // }

            .logo-image{
                width: 300rpx;
                height: 180rpx;
                margin-left: -8px;
                margin-top: -10px;
            }
        }
    }
}

/* 内容区域 */
.index-content {
    padding-top: calc(var(--status-bar-height) + 125rpx);
    background-color: #F5F5F5;
}

/* 搜索框 */
.search-container {
    padding: 20rpx 30rpx;
    
    .search-box {
        display: flex;
        align-items: center;
        height: 70rpx;
        background-color: #fff;
        border-radius: 35rpx;
        padding: 0 30rpx;
        cursor: pointer;
        /* 确保整个区域都可点击 */
        width: 100%;
        box-sizing: border-box;
        
        &:active {
            background-color: #f5f5f5;
        }
        
        .search-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 20rpx;
            /* 确保图标不阻挡点击 */
            pointer-events: none;
        }
        
        .search-placeholder {
            flex: 1;
            font-size: 28rpx;
            color: #999;
            /* 确保文字不阻挡点击 */
            pointer-events: none;
        }
    }
}

/* 轮播图 */
.banner-container {
    margin: 0 30rpx 20rpx;
    
    .banner-swiper {
        height: 320rpx;
        border-radius: 20rpx;
        overflow: hidden;
        
        .banner-image {
            width: 100%;
            height: 100%;
        }
    }
}

/* 消息公告 */
.notice-container {
    margin: 0 30rpx 20rpx;
    
    .notice-content {
        display: flex;
        align-items: center;
        height: 70rpx;
        background-color: #fff;
        border-radius: 35rpx;
        padding: 0 30rpx;
        width: 100%;
        box-sizing: border-box;
        
        .notice-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 20rpx;
            flex-shrink: 0;
        }
        
        .notice-text-wrapper {
            flex: 1;
            height: 70rpx;
            overflow: hidden;
            position: relative;
            min-width: 0; // 确保flex子项可以收缩
            
            .notice-text-slider {
                transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                will-change: transform;
                width: 100%;
                
                .notice-text-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 70rpx;
                    cursor: pointer;
                    width: 100%;
                    box-sizing: border-box;
                    
                    &:active {
                        opacity: 0.7;
                    }
                    
                    .notice-text {
                        flex: 1;
                        font-size: 26rpx;
                        color: #666;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        line-height: 70rpx;
                        min-width: 0;
                    }
                    
                    .notice-arrow {
                        width: 24rpx;
                        height: 24rpx;
                        margin-left: 15rpx;
                        flex-shrink: 0;
                        opacity: 0.6;
                    }
                }
            }
        }
    }
}

/* 营销板块 */
.marketing-section {
    margin: 0 30rpx 20rpx;
    display: flex;
    gap: 20rpx;
    height: 320rpx;
    overflow: hidden;
    position: relative;
    z-index: 1;
    
    /* 左侧秒杀区域 */
    .seckill-card {
        flex: 1;
        position: relative;
        border-radius: 20rpx;
        overflow: hidden;
        background: linear-gradient(135deg, #ffeaa7, #fab1a0);
        
        .seckill-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        .seckill-content {
            position: relative;
            z-index: 2;
            padding: 24rpx;
            height: 100%;
            display: flex;
            flex-direction: column;
            
            .seckill-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20rpx;
                
                .seckill-title-wrapper {
                    display: flex;
                    align-items: baseline;
                    gap: 12rpx;
                    
                    .seckill-main-title {
                        font-size: 45rpx;
                        font-weight: bold;
                        color: #2d3436;
                        line-height: 1;
                        white-space: nowrap;
                    }
                    
                    .seckill-sub-title {
                        font-size: 24rpx;
                        color: #636e72;
                        font-weight: 500;
                        white-space: nowrap;
                    }
                }
                
                .seckill-countdown {
                    display: flex;
                    align-items: center;
                    gap: 6rpx;
                    margin-left: 25rpx;
                    
                    .countdown-item {
                        background-color: #FF2A3E;
                        color: #fff;
                        font-size: 24rpx;
                        font-weight: bold;
                        width: 44rpx;
                        height: 44rpx;
                        border-radius: 8rpx;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .countdown-colon {
                        color: #2d3436;
                        font-size: 24rpx;
                        font-weight: bold;
                    }
                    
                    .countdown-enter-icon {
                        width: 32rpx;
                        height: 32rpx;
                        margin-left: -5rpx;
                    }
                }
            }
            
            .seckill-products {
                display: flex;
                gap: 20rpx;
                flex: 1;
                align-items: flex-end;
                
                .seckill-product-item {
                    flex-shrink: 0;
                    
                    .product-image {
                        width: 120rpx;
                        height: 120rpx;
                        border-radius: 16rpx;
                        margin-bottom: 12rpx;
                        background: #fff;
                        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
                    }
                    
                    .product-price {
                        display: flex;
                        align-items: center;
                        gap: 8rpx;
                        
                        .current-price {
                            background-color: #000000;
                            color: #fff;
                            font-size: 28rpx;
                            font-weight: bold;
                            padding: 4rpx 12rpx;
                            border-radius: 20rpx;
                        }
                        
                        .original-price {
                            font-size: 22rpx;
                            color: #636e72;
                            text-decoration: line-through;
                        }
                    }
                }
            }
        }
    }
    
    /* 右侧区域 */
    .right-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20rpx;
        
        /* 限时折扣卡片 */
        .discount-card {
            height: 160rpx;
            border-radius: 20rpx;
            position: relative;
            overflow: hidden;
            
            .discount-bg-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            
            .discount-overlay {
                position: relative;
                z-index: 2;
                height: 100%;
                padding: 24rpx;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                
                .discount-text-area {
                    .discount-title {
                        font-size: 36rpx;
                        font-weight: bold;
                        color: #000000;
                        line-height: 1.2;
                        margin-bottom: 8rpx;
                    }
                    
                    .discount-subtitle {
                        font-size: 24rpx;
                        color: #C5A27F;
                        opacity: 0.9;
                        line-height: 1.2;
                        position: relative;
                        top: 40rpx;
                        left: -140rpx;
                    }
                }
                
                .go-button {
                    align-self: flex-end;
                    
                    .go-icon {
                        width: 200rpx;
                        height: 128rpx;
                        position: relative;
                        left: 35rpx;
                    }
                }
            }
        }
        
        /* 优惠券和签到容器 */
        .bonus-container {
            display: flex;
            gap: 20rpx;
            height: 140rpx;
            
            .bonus-card {
                flex: 1;
                border-radius: 20rpx;
                position: relative;
                overflow: hidden;
                
                .bonus-bg-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                
                .bonus-overlay {
                    position: relative;
                    z-index: 2;
                    height: 100%;
                    padding: 16rpx;
                    
                    .bonus-tag {
                        position: absolute;
                        top: 0;
                        left: 0;
                        font-size: 20rpx;
                        font-weight: 500;
                        padding: 8rpx 20rpx;
                        border-radius: 20rpx 0 20rpx 0;
                        color: #fff;
                    }
                    
                    .bonus-main-text {
                        position: absolute;
                        bottom: 35rpx;
                        left: 12rpx;
                        font-size: 30rpx;
                        font-weight: 700;
                        text-shadow: none;
                    }
                }
                
                &.coupon-card {
                    .bonus-tag {
                        background: linear-gradient(135deg, #FF6B8A, #FF8A80);
                        box-shadow: 0 2rpx 8rpx rgba(255, 107, 138, 0.3);
                    }
                    
                    .bonus-main-text {
                        color: #E74C3C;
                    }
                }
                
                &.checkin-card {
                    .bonus-tag {
                        background: linear-gradient(135deg, #4FC3F7, #29B6F6);
                        box-shadow: 0 2rpx 8rpx rgba(79, 195, 247, 0.3);
                    }
                    
                    .bonus-main-text {
                        color: #2196F3;
                    }
                }
            }
        }
    }
}

/* 金刚区导航 */
.nav-grid-container {
    margin: 0 30rpx 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 1; /* 降低 z-index，避免覆盖底部 tabbar */

    .nav-scroll-view {
        width: 100%;
        white-space: nowrap;
        /* 优化滚动性能 */
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        position: relative;

        .nav-grid {
            display: flex;
            flex-wrap: nowrap; /* 不换行，支持水平滚动 */
            width: max-content; /* 宽度适应内容 */
            min-height: 320rpx;
            box-sizing: border-box;
            padding: 20rpx 0;
            /* 添加过渡动画 */
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;

            /* 每页显示8个项目的容器 */
            .nav-page {
                width: 690rpx;
                display: flex;
                flex-wrap: wrap;
                flex-shrink: 0;
                border-radius: 12rpx;
                /* 添加页面过渡效果 */
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                animation: fadeIn 0.3s ease-out;

                .nav-grid-item {
                    width: 25%;
                    height: 160rpx;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 10rpx;
                    box-sizing: border-box;
                    border-radius: 8rpx;
                    position: relative;
                    cursor: pointer;

                    .nav-grid-icon-wrapper {
                        width: 90rpx;
                        height: 90rpx;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 8rpx;
                        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

                        .nav-grid-icon {
                            width: 60px;
                            height: 60px;
                        }
                    }

                    .nav-grid-text {
                        font-size: 22rpx;
                        color: #333;
                        line-height: 1.3;
                        text-align: center;
                        word-break: break-all;
                        margin-top: 8rpx;
                        font-weight: 500;
                    }
            }
        }
    }
}

/* 切换按钮 - 在金刚区内部底部 */
.switch-toggle-wrapper {
    display: flex;
    justify-content: center;
    padding: 0 30rpx 16rpx;
    
    .switch-toggle-button {
        display: flex;
        align-items: center;
        background: #f5f5f5;
        border-radius: 30rpx;
        padding: 4rpx 6rpx;
        cursor: pointer;
        transition: all 0.2s ease;
        
        .toggle-text {
            font-size: 22rpx;
            color: #999;
            padding: 6rpx 20rpx;
            border-radius: 26rpx;
            
            &.active {
                background: #667eea;
                color: #ffffff;
                font-weight: 600;
            }
        }
        
        .toggle-divider {
            width: 1rpx;
            height: 24rpx;
            background: #ddd;
            margin: 0 4rpx;
        }
    }
}

/* 推荐商品标题 */
.recommend-title {
    display: flex;
    align-items: center;
    height: 80rpx;
    padding: 0 30rpx;
    margin-bottom: 20rpx;
    
    .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        position: relative;
        
        &::before {
            content: '';
            position: absolute;
            left: -20rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 8rpx;
            height: 28rpx;
            background-color: #4fc3f7;
            border-radius: 4rpx;
        }
    }
}

/* 商品容器 */
.goods-container {
    margin: 0 30rpx;
}


/* 商品导航栏 */
.product-nav-container {
    margin: 30rpx;
    margin-bottom: 0;
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.product-nav-tabs {
    display: flex;
    width: 100%;
}

.nav-tab-item {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666666;
    background-color: #ffffff;
    border-bottom: 3rpx solid transparent;
    box-sizing: border-box;
    transition: all 0.3s ease;
    
    .tab-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        min-width: 100rpx;
        height: 100%;
    }
    
    .tab-text {
        animation: fadeIn 0.3s ease;
    }
    
    .tab-loading-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }
}

.nav-tab-item.active {
    color: #000000;
    font-weight: bold;
}

.nav-tab-item.loading {
    pointer-events: none;
    opacity: 0.8;
}

/* 商品展示区域 */
.product-display-container {
    margin: 20rpx 30rpx 30rpx 30rpx;

    .loading-container {
        text-align: center;
        padding: 80rpx 0;
    }

    /* 缺失页面样式 */
    .empty-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
        padding: 40rpx;

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
            }
        }
    }
}

.loading-text {
    font-size: 26rpx;
    color: #999999;
    margin-top: 20rpx;
}

.products-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.product-item {
    width: 48%;
    background-color: #ffffff;
    border-radius: 33rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    border: 1rpx solid #f0f0f0;
    overflow: hidden;
}

.product-image-wrapper {
    position: relative;
    width: calc(100% - 24rpx);
    height: 280rpx;
    overflow: hidden;
    border-radius: 22rpx;
    margin: 12rpx;
    margin-bottom: 8rpx;
}

.product-image {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 22rpx;
}

.product-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    line-height: 280rpx;
}

.status-text {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: bold;
}

.product-info {
    padding: 0 20rpx 20rpx;
}

.product-title {
    font-size: 26rpx;
    color: #2a3145;
    line-height: 40rpx;
    margin-bottom: 10rpx;
    height: 80rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
    box-sizing: border-box;
    font-weight: bold;
}

.product-price {
    text-align: left;
    color: #333;
}



/* 优化的返回顶部按钮 - 微信小程序适配 */
.back-to-top-button {
    position: fixed;
    right: 30rpx;
    bottom: 150rpx;
    z-index: 9999;

    .back-top-icon-wrapper {
        width: 80rpx;
        height: 80rpx;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
        border: 1rpx solid rgba(0, 0, 0, 0.1);

        &:active {
            transform: scale(0.95);
            background-color: rgba(255, 255, 255, 1);
            opacity: 0.8;
        }

        .back-top-icon {
            width: 36rpx;
            height: 36rpx;
            opacity: 0.7;
        }
    }
}

/* 平台简介 */
.platform-intro {
    margin: 80rpx 30rpx 60rpx;  /* 增加顶部和底部间距，让布局更合理 */
    display: flex;
    justify-content: center;
    align-items: center;

    .intro-image-wrapper {
        width: 100%;
        max-width: 690rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .intro-image {
            width: 100%;
            border-radius: 20rpx;
            overflow: hidden;
            display: block;
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease;

            &:active {
                transform: scale(0.98);
            }
        }
    }
}

/* 空状态 */
.index_empty {
    padding-bottom: 200rpx;
    background: #F5F5F5;
    
    image {
        width: 100%;
    }
}

.empty-box {
    height: 500rpx;
    padding-bottom: 200rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.line-through {
    text-decoration: line-through;
}

.index_empty {
    padding-bottom: 200rpx;
    background: #fff;
}

.index_empty image {
    width: 100%;
}

.index .dist_s {
    height: 401rpx;
    position: absolute;
    top: -300rpx;
    left: 0;
    width: 100%;
    background-color: #fc4141;
}

.index .dist_base {
    height: 150rpx;
    position: absolute;
    top: 100rpx;
    left: 0;
    width: 100%;
    overflow: hidden;
}

.index .dist_base:after {
    position: absolute;
    left: -10%;
    right: -10%;
    bottom: 0rpx;
    z-index: -1;
    content: "";
    height: 150rpx;
    border-radius: 0 0 100% 100%;
    background-color: #fc4141;
}

.index .index-bg .slide-navigator .slide-image {
    width: 100%;
    height: 100%;
    border-radius: 15rpx;
}

.index .index-bg .wx-swiper-dot {
    width: 20rpx;
    height: 5rpx;
    border-radius: 3rpx;
}

.index .index-bg .wx-swiper-dots.wx-swiper-dots-horizontal {
    margin-bottom: 5rpx;
}

.index .nav {
    padding-top: 26rpx;
}

.index .nav .item {
    width: 25%;
    text-align: center;
    font-size: 26rpx;
    margin-bottom: 35rpx;
}

.index .nav .item .pictrue {
    width: 90rpx;
    height: 90rpx;
    margin: 0 auto 15rpx auto;
}

.index .nav .item .pictrue image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.index .news {
    height: 77rpx;
    border-top: 1rpx solid #f4f4f4;
    padding: 0 30rpx;
    box-shadow: 0 10rpx 30rpx #f5f5f5;
}

.index .news .pictrue {
    width: 124rpx;
    height: 28rpx;
    border-right: 1rpx solid #ddd;
    padding-right: 23rpx;
    box-sizing: content-box;
}

.index .news .pictrue image {
    width: 100%;
    height: 100%;
}

.index .news .swiperTxt {
    width: 523rpx;
    height: 100%;
    line-height: 77rpx;
    overflow: hidden;
}

.index .news .swiperTxt .text {
    width: 480rpx;
}

.index .news .swiperTxt .text .label {
    font-size: 20rpx;
    color: #ff4c48;
    width: 64rpx;
    height: 30rpx;
    border-radius: 40rpx;
    text-align: center;
    line-height: 28rpx;
    border: 2rpx solid #ff4947;
}

.index .news .swiperTxt .text .newsTitle {
    width: 397rpx;
    font-size: 24rpx;
    color: #666;
}

.index .news .swiperTxt .iconfont {
    font-size: 28rpx;
    color: #888;
}

.index .news .swiperTxt swiper {
    height: 100%;
}

.index .specialArea {
    padding: 30rpx;
}

.index .specialArea .assemble {
    width: 260rpx;
    height: 260rpx;
    position: relative;
}

.index .specialArea .assemble image {
    width: 100%;
    height: 100%;
    border-radius: 5rpx;
}

.index .specialArea .assemble .text {
    position: absolute;
    top: 37rpx;
    left: 22rpx;
}

.index .specialArea .name {
    font-size: 30rpx;
    color: #fff;
}

.index .specialArea .infor {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 5rpx;
}

.index .specialArea .list {
    height: 260rpx;
    width: 416rpx;
}

.index .specialArea .item {
    width: 100%;
    height: 124rpx;
    position: relative;
}

.index .specialArea .item image {
    width: 100%;
    height: 100%;
}

.index .specialArea .item .text {
    position: absolute;
    top: 23rpx;
    left: 28rpx;
}

.index .wrapper .title {
    border-top: 1rpx solid #eee;
    padding-top: 34rpx;
    margin: 0 30rpx;
}

.index .wrapper .title .text {
    font-size: 24rpx;
    color: #999;
    width: 530rpx;
}

.index .wrapper .title .text .name {
    color: #282828;
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 5rpx;
    position: relative;
}

.index .wrapper .title .text .name .new {
    position: absolute;
    top: 2rpx;
    left: 130rpx;
    font-size: 16rpx;
    font-weight: bold;
}

.index .wrapper .title .more {
    font-size: 26rpx;
    color: #333;
}

.index .wrapper .title .more .iconfont {
    margin-left: 9rpx;
    font-size: 26rpx;
    vertical-align: 3rpx;
}

.index .wrapper .scroll-product {
    white-space: nowrap;
    margin-top: 38rpx;
    padding: 0 30rpx 37rpx 30rpx;
}

.index .wrapper .scroll-product .item {
    width: 180rpx;
    display: inline-block;
    margin-right: 19rpx;
    border-bottom: 4rpx solid #47b479;
    box-shadow: 0 40rpx 30rpx -10rpx #eee;
}

.index .wrapper .scroll-product .item:nth-of-type(3n) {
    border-bottom: 4rpx solid #ff6960;
}

.index .wrapper .scroll-product .item:nth-of-type(3n-1) {
    border-bottom: 4rpx solid #579afe;
}

.index .wrapper .scroll-product .item:nth-last-child(1) {
    margin-right: 0;
}

.index .wrapper .scroll-product .item .goods-item {
    width: 100%;
    height: 180rpx;
}

.index .wrapper .scroll-product .item .goods-item image {
    width: 100%;
    height: 100%;
    border-radius: 6rpx 6rpx 0 0;
}

.index .wrapper .scroll-product .item .pro-info {
    font-size: 24rpx;
    color: #282828;
    text-align: center;
    height: 60rpx;
    line-height: 60rpx;
    border: 1rpx solid #f5f5f5;
    border-bottom: 0;
    border-top: 0;
    padding: 0 10rpx;
}

.index .wrapper .boutique {
    width: 690rpx;
    height: 300rpx;
    margin: 28rpx auto 0 auto;
}

.index .wrapper .boutique swiper {
    width: 100%;
    height: 100%;
    position: relative;
}

.index .wrapper .boutique image {
    width: 100%;
    height: 260rpx;
}

.index .wrapper .boutique .wx-swiper-dot {
    width: 7rpx;
    height: 7rpx;
    border-radius: 50%;
}

.index .wrapper .boutique .wx-swiper-dot-active {
    width: 20rpx;
    border-radius: 5rpx;
}

.index .wrapper .boutique .wx-swiper-dots.wx-swiper-dots-horizontal {
    margin-bottom: -8rpx;
}

.index .hotList .hot-bg {
    width: 100%;
    height: 215rpx;
    background-image: url("data:image/png;base64,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");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    padding: 0 30rpx;
    box-sizing: border-box;
    font-size: 24rpx;
    color: #fff;
    margin-top: 15rpx;
}

.index .hotList .hot-bg .title {
    height: 87rpx;
}

.index .hotList .hot-bg .title .text {
    width: 575rpx;
}

.index .hotList .hot-bg .title .text .label {
    font-size: 30rpx;
    font-weight: bold;
    margin-right: 20rpx;
}

.index .hotList .hot-bg .title .more {
    font-size: 26rpx;
}

.index .hotList .hot-bg .title .more .iconfont {
    font-size: 25rpx;
    vertical-align: 2rpx;
    margin-left: 10rpx;
}

.index .hotList .list {
    width: 690rpx;
    height: 330rpx;
    border-radius: 20rpx;
    background-color: #fff;
    margin: -128rpx auto 0 auto;
    padding: 0 22rpx;
    box-sizing: border-box;
    box-shadow: 0 0 30rpx -10rpx #aaa;
}

.index .hotList .list .item {
    width: 200rpx;
}

.index .hotList .list .item ~ .item {
    margin-left: 22rpx;
}

.index .hotList .list .item .pictrue {
    width: 100%;
    height: 200rpx;
    position: relative;
}

.index .hotList .list .item .pictrue image {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
}

.index .hotList .list .item .pictrue .numPic {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    position: absolute;
    top: 7rpx;
    left: 7rpx;
}

.index .hotList .list .item .name {
    font-size: 26rpx;
    color: #282828;
    margin-top: 12rpx;
}

.index .hotList .list .item .money {
    font-size: 20rpx;
    font-weight: bold;
    margin-top: 4rpx;
}

.index .hotList .list .item .money .num {
    font-size: 28rpx;
}

.index .adver {
    width: 100%;
    height: 180rpx;
    margin-top: 37rpx;
}

.index .adver image {
    width: 100%;
    height: 100%;
}

.index .wrapper .newProducts {
    white-space: nowrap;
    padding: 0 30rpx;
    margin: 35rpx 0 42rpx 0;
}

.index .wrapper .newProducts .item {
    display: inline-block;
    width: 240rpx;
    margin-right: 20rpx;
    border: 1rpx solid #eee;
    border-radius: 12rpx;
}

.index .wrapper .newProducts .item:nth-last-child(1) {
    margin-right: 0;
}

.index .wrapper .newProducts .item .goods-item {
    width: 100%;
    height: 240rpx;
}

.index .wrapper .newProducts .item .goods-item image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx 12rpx 0 0;
}

.index .wrapper .newProducts .item .pro-info {
    font-size: 28rpx;
    color: #333;
    text-align: center;
    padding: 19rpx 10rpx 0 10rpx;
}

.index .wrapper .newProducts .item .money {
    padding: 0 10rpx 18rpx 10rpx;
    text-align: center;
    font-size: 26rpx;
    font-weight: bold;
}

.index .overseas_cat_wrapper {
    padding: 0 30rpx;
    margin-top: 20rpx;
}

.index .overseas_cat {
    padding: 30rpx 20rpx 30rpx;
    white-space: nowrap;
    background: #fff;
    border-radius: 15rpx;
}

.index .overseas_cat .flexbox {
    display: flex;
    flex-wrap: nowrap;
}

.index .overseas_cat .item {
    text-align: center;
    font-size: 24rpx;
    height: 100%;
    width: 20%;
    flex-shrink: 0;
}

.index .overseas_cat .item .goods-item {
    padding: 10rpx 0;
}

.index .overseas_cat .item .goods-item image {
    width: 60rpx;
    height: auto;
    height: 60rpx;
}

.index .overseas_cat .wx-swiper-dots.wx-swiper-dots-horizontal {
    margin-bottom: 5rpx;
    border-radius: 4rpx;
    overflow: hidden;
}

.index .overseas_cat .wx-swiper-dot {
    width: 30rpx;
    height: 5rpx;
    border-radius: 0;
    margin: 0;
    background: #ccc;
}

.index .overseas_cat .wx-swiper-dot-active {
    width: 30rpx;
    border-radius: 0;
    background: #e93323;
}

.index .overseas_cat_wrapper1 swiper {
    height: 320rpx;
}

.index .overseas_cat_wrapper1.min_height swiper {
    height: 165rpx;
}

.index .overseas_cat_wrapper2 swiper {
    height: 180rpx;
}

.index .overseas_cat_wrapper2.min_height swiper {
    height: 165rpx;
}

.index .overseas_cat_wrapper.no_page .overseas_cat .wx-swiper-dots.wx-swiper-dots-horizontal {
    display: none;
}

/* 优惠券模块 */
.index .tmcscoupon {
    padding: 0;
    margin: 20rpx 30rpx;
    padding-bottom: 24rpx;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    background: #fff;
    -webkit-border-radius: 12rpx;
    -moz-border-radius: 12rpx;
    border-radius: 15rpx;
    position: relative;
}

.index .tmcscoupon .coupon-header {
    padding: 24rpx 24rpx 0;
    margin-bottom: 20rpx;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -moz-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 44rpx;
}

.index .tmcscoupon .coupon-header .coupon-header_title {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.index .tmcscoupon .coupon-header .coupon-header_title .main_title {
    font-size: 32rpx;
    line-height: 32rpx;
    color: #2a3145;
    font-weight: 700;
}

.index .tmcscoupon .coupon-header .coupon-header_title .sub_title {
    margin-left: 16rpx;
    font-size: 24rpx;
    color: #aaa;
}

.index .tmcscoupon .coupon-header .coupon-header_more {
    font-size: 26rpx;
    color: #aaa;
}

.index .tmcscoupon .coupon-header .iconfont {
    font-size: 26rpx;
    vertical-align: 3rpx;
}

.index .tmcscoupon swiper {
    height: 140rpx;
}

.index .tmcscoupon .swiper-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    padding: 20rpx 20rpx 0 0;
}

.index .tmcscoupon .swiper-wrapper .flexbox {
    display: flex;
    flex-wrap: nowrap;
}

.index .tmcscoupon .tmcscoupon-item-1 {
    display: flex;
    _width: 50%;
    width: 312rpx;
    overflow: hidden;
    margin-left: 20rpx;
    height: 120rpx;
    overflow: hidden;
    background: #fff;
    -webkit-border-radius: 12rpx;
    -moz-border-radius: 12rpx;
    border-radius: 12rpx;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item {
    -webkit-flex-shrink: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    width: 100%;
    display: flex;
    position: relative;
    background: #fff5c5;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 120rpx;
    margin-left: 12rpx;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    position: relative;
    min-width: 0;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:after,
.tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:before {
    content: "";
    position: absolute;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    width: 16rpx;
    height: 16rpx;
    background: #f7f7f7;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:before {
    top: -8rpx;
    right: -8rpx;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m:after {
    bottom: -8rpx;
    right: -8rpx;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-info {
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: baseline;
    -webkit-align-items: baseline;
    -moz-box-align: baseline;
    -ms-flex-align: baseline;
    align-items: baseline;
    font-weight: 700;
    height: 70rpx;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-info .item_m-info_tag {
    font-size: 28rpx;
    color: #2a3145;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-info .item_m-info_price {
    font-size: 48rpx;
    color: #2a3145;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-info .item_m-info_title {
    font-size: 24rpx;
    margin-left: 8rpx;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 0;
    color: #2a3145;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-rule {
    font-size: 20rpx;
    color: #999;
    margin-top: 6rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_m .tmcscoupon-item_m-date {
    font-size: 20rpx;
    color: #999;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r {
    width: 64rpx;
    height: 120rpx;
    color: #ff9400;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -moz-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -moz-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    position: relative;
    font-size: 24rpx;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r:before {
    content: "";
    height: 80rpx;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAABeAgMAAAB5il18AAAACVBMVEVHcEz/xy7/xi4WmQdzAAAAAnRSTlMAtc2YijsAAAAUSURBVAjXY9BggEARBhgQYRgiYgDQigepHfzaGwAAAABJRU5ErkJggg==);
    width: 4rpx;
    margin-left: -2rpx;
    position: absolute;
    top: 50%;
    left: 0;
    margin-top: -40rpx;
    -webkit-background-size: 100% 100%;
    -moz-background-size: 100% 100%;
    background-size: 100% 100%;
}

.index .tmcscoupon .tmcscoupon-item-1 .tmcscoupon-item .tmcscoupon-item_r .btn {
    width: 120rpx;
    height: 54rpx;
    background: #ff9400;
    -webkit-border-radius: 28rpx;
    -moz-border-radius: 28rpx;
    border-radius: 28rpx;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -moz-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -moz-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
}

/* 限时抢购 */
.rush-buy {
    background-color: #fff;
    border-radius: 15rpx;
    margin: 0 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
}

.rush-buy .rush-head {
    display: flex;
    padding: 20rpx;
    position: relative;
}

.rush-buy .rush-head .head-tit {
    margin-right: 20rpx;
    line-height: 32rpx;
    color: #212121;
    font-size: 28rpx;
    font-weight: 700;
}

.rush-buy .rush-head .head-desc {
    width: 200rpx;
    font-size: 24rpx;
    vertical-align: middle;
    color: #999;
    overflow: hidden;
}

.rush-buy .rush-head .last-wrap {
    position: absolute;
    right: 20rpx;
}

.rush-buy .rush-head .last-wrap .seckill-time-div .cout_time {
    display: inline-block;
    width: 36rpx;
    height: 36rpx;
    line-height: 36rpx;
    border-radius: 10rpx;
    background-color: #333;
    color: #fff;
    font-size: 20rpx;
    text-align: center;
}

.rush-buy .rush-head .last-wrap .seckill-time-div .cout_format {
    display: inline-block;
    padding: 0 6rpx;
    height: 36rpx;
    line-height: 36rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    font-weight: 700;
}

/* 限时抢购商品样式 */
.goods-box-content {
    background: #fff;
    border-radius: 15rpx;
    -webkit-overflow-scrolling: touch;
    overflow-x: auto;
    white-space: nowrap;
}

.goods-box-content .product-list {
    padding: 20rpx 0;
}

.goods-box-content .product-list .product-item {
    display: inline-block;
    width: 30%;
    font-size: 28rpx;
    vertical-align: top;
}

.goods-box-content .product-list .product-item.last {
    width: 66rpx;
    margin: 0;
}

.goods-box-content .product-list .product-item .product-box {
    display: block;
    width: 100%;
}

.goods-box-content .product-list .product-item .product-box .pic-wrap {
    background-color: #fff;
    padding: 16rpx;
}

.goods-box-content .product-list .product-item .product-box .pic-wrap .pic {
    position: relative;
    background-size: 120rpx auto;
}

.goods-box-content .product-list .product-item .product-box .pic-wrap .pic image {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}

.goods-box-content .product-list .product-item .product-box .pic-wrap .pic .tag {
    font-size: 20rpx;
    color: #fff;
    background: #f23030;
    text-align: center;
    line-height: 22rpx;
    border: 1rpx solid #f23030;
    position: absolute;
    left: 0;
    top: -20rpx;
    display: block;
    width: 70rpx;
    height: 24rpx;
    border-radius: 14rpx 4rpx 14rpx 4rpx;
}

.goods-box-content .product-list .product-item .product-box .pic-wrap .pic::after {
    content: "";
    display: block;
    width: 100%;
    padding-top: 100%;
}

.goods-box-content .product-list .product-item .product-box .price-box {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding-top: 20rpx;
}

.goods-box-content .product-list .product-item .product-box .now-price {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    line-height: 24rpx;
    overflow: hidden;
    text-align: center;
}

.goods-box-content .product-list .product-item .product-box .now-price .price {
    font-size: 24rpx;
}

.goods-box-content .product-list .product-item .product-box .market-price {
    font-size: 20rpx;
    color: #999;
}

.goods-box-content .product-list .product-item .product-box .reference {
    text-align: center;
    overflow: hidden;
}

.goods-box-content .product-list .product-item .product-box .reference .jayemart-buy {
    width: 45rpx;
    height: 45rpx;
}

.goods-box-content .product-list .product-item .product-box .reference .jayemart-buy image {
    width: 100%;
    height: 100%;
}

.goods-box-content .product-see-all {
    box-sizing: border-box;
    position: relative;
    width: 66rpx;
    height: 226rpx;
    padding: 20rpx;
    color: #95969f;
    font-size: 24rpx;
    line-height: 40rpx;
}

/* cat_goods2 */
.index .special-mod .special-mod-con {
    padding: 0 30rpx;
    margin-top: 20rpx;
}

.index .special-mod .special-mod-con .section {
    margin: 0 0 15rpx;
    -webkit-box-shadow: 0 10rpx 35rpx -5rpx rgba(0, 0, 0, 0.1);
    box-shadow: 0 10rpx 35rpx -5rpx rgba(0, 0, 0, 0.1);
    border-radius: 15rpx;
    overflow: hidden;
    overflow: hidden;
}

.index .special-mod .special-mod-con .area-conunter-banner {
    width: 100%;
}

.index .special-mod .special-mod-con image {
    width: 100%;
    height: 240rpx;
}

.index .special-mod .special-mod-con .special-mod-container {
    padding: 20rpx 20rpx 0;
    margin-top: -50rpx;
    border-top-left-radius: 30rpx;
    background: #fff;
    overflow: hidden;
    position: relative;
}

.index .special-mod .special-mod-con .special-mod-container swiper {
    height: 400rpx;
}

.index .special-mod .special-mod-con .special-mod-container .pro-flexbox {
    flex-wrap: nowrap;
    display: flex;
}

.index .special-mod .special-mod-con .special-mod-container .pro-item {
    width: 33.33%;
    overflow: hidden;
    font-size: 24rpx;
    height: 100%;
    flex-shrink: 0;
    padding: 10rpx;
    box-sizing: border-box;
}

.index .special-mod .special-mod-con .special-mod-container .pro-item .pro-txt {
    padding: 10rpx 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.index .special-mod .special-mod-con .special-mod-container .pro-item .pro-txt.pro-txt-small {
    font-size: 20rpx;
    color: #999;
    padding: 0;
}

.index .special-mod .wx-swiper-dots.wx-swiper-dots-horizontal {
    margin-bottom: 5rpx;
    border-radius: 4rpx;
    overflow: hidden;
}

.index .special-mod .wx-swiper-dot {
    width: 30rpx;
    height: 5rpx;
    border-radius: 0;
    margin: 0;
    background: #ccc;
}

.index .special-mod .wx-swiper-dot-active {
    width: 30rpx;
    border-radius: 0;
    background: #e93323;
}

.index .special-mod .special-mod-con .cat-default-tit {
    height: 120rpx;
    width: 100%;
    color: #fff;
    position: relative;
}

.index .special-mod .special-mod-con .cat-default-tit .name {
    color: #fff;
    padding: 16rpx 10rpx 0 20rpx;
    display: block;
    margin-left: 20rpx;
    line-height: 40rpx;
    position: relative;
    font-size: 26rpx;
    font-weight: bold;
}

.index .special-mod .special-mod-con .cat-default-tit .name text {
    position: absolute;
    left: 0;
    top: 22rpx;
    width: 6rpx;
    height: 28rpx;
    border-radius: 4rpx;
    background: #fff;
}

.index .special-mod .special-mod-con .cat-default-tit .more {
    position: absolute;
    right: 20rpx;
    top: 16rpx;
    color: #fff;
    font-size: 26rpx;
}

.index .special-mod .special-mod-con .cat-default-tit .more text {
    font-size: 26rpx;
}

.home_ads-1 {
    padding: 10rpx 30rpx 0;
}

.home_ads-1 image {
    overflow: hidden;
    border-radius: 15rpx;
    width: 690rpx;
    height: 230rpx;
    margin-top: 20rpx;
}

/*广告位*/
.home_ads,
.home_rec_goods,
.m-pop-entrance,
.m-special-mod-con {
    margin-left: 30rpx;
    margin-right: 30rpx;
}

.board-header .h1,
.channel-header .h1,
.channel-item .h1,
.life-header .h1,
.promo-header .h1,
.social-header .h1 {
    font-size: 28rpx;
    white-space: nowrap;
}

.home-bar-live {
    display: flex;
}

.home-bar-live .line {
    height: 30rpx;
    border-left: 1rpx solid #ddd;
    position: absolute;
    right: 0;
    top: 15rpx;
}

.home-bar-live .item {
    width: 50%;
    text-align: center;
    height: 70rpx;
    line-height: 70rpx;
    font-size: 28rpx;
    position: relative;
    font-weight: bold;
}

.home-bar-live .item-live image {
    width: 50rpx;
    height: 50rpx;
    padding-left: 6rpx;
    vertical-align: middle;
    margin-top: -2rpx;
}

.home-bar-live .item .arrow {
    background: #fc4141;
    height: 5rpx;
    width: 40%;
    position: absolute;
    left: 30%;
    right: 30%;
    border-radius: 6rpx;
    bottom: 0rpx;
}

.live-list-warp {
    padding: 30rpx 30rpx 50rpx 30rpx;
    overflow: hidden;
}

.live-list .live-item {
    background: #fff;
    width: 335rpx;
    border-radius: 10rpx;
    float: left;
    height: 600rpx;
    overflow: hidden;
    position: relative;
    margin-bottom: 20rpx;
}

.live-list .live-item:nth-child(2n) {
    float: right;
}

.live-list .live-item .bg_img {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
}

.live-list .live-item .shadow_bg {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0) linear-gradient(rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.1) 80%, #000000 130%) repeat scroll 0 0;
    z-index: 2;
    position: absolute;
    left: 0;
    top: 0;
}

.live-list .live-item .live-content {
    position: absolute;
    bottom: 0;
    height: 100rpx;
    width: 100%;
    z-index: 3;
    color: #fff;
}

.live-list .live-item .live-content .title {
    font-size: 22rpx;
    padding-left: 15rpx;
    padding-bottom: 10rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 20rpx;
    overflow: hidden;
}

.live-list .live-item .live-content .name {
    font-size: 22rpx;
    padding-left: 15rpx;
}

.live-list .live-item .live-content .anchor_img {
    width: 40rpx;
    height: 40rpx;
    border-radius: 40rpx;
    border: 2rpx solid #fff;
    display: inline-block;
    margin-right: 10rpx;
    vertical-align: middle;
}

.live-list .live-item .live-status {
    position: absolute;
    top: 20rpx;
    left: 10rpx;
    z-index: 3;
}

.live-list .live-item .live-status .status-ico {
    background: #fc4141;
    color: #fff;
    padding: 0 10rpx 0 30rpx;
    height: 35rpx;
    line-height: 35rpx;
    font-size: 22rpx;
    position: relative;
}

.live-list .live-item .live-status .status-ico .status-dot {
    background: #fff;
    height: 10rpx;
    width: 10rpx;
    border-radius: 100%;
    left: 10rpx;
    top: 15rpx;
    position: absolute;
}

.live-list .live-item .live-status .status-ico.status-gray {
    background: #bbb;
}

.live-list .live-item .live-status .status-ico image {
    width: 15rpx;
    height: 15rpx;
    padding-left: 8rpx;
}

/*首页 - 底部推荐商品模块头部*/
.homeTopBar {
    width: 100%;
    height: 120rpx;
    overflow: hidden;
    position: relative;
}

.homeTopBar .title-box {
    display: flex;
    padding: 20rpx;
}

.homeTopBar .title-box.topnavFixed {
    position: fixed;
    width: 100%;
    height: 130rpx;
    top: 265rpx;
    background: #fff;
    z-index: 1;
}

.homeTopBar .title-box.topnavAbsolute {
    position: absolute;
    width: 100%;
    height: 130rpx;
    top: 0 !important;
    background: #fff;
    z-index: 1;
}

.homeTopBar .title-box .title {
    height: 120rpx;
    line-height: 60rpx;
    text-align: center;
    position: relative;
    font-size: 24rpx;
    flex: 1;
}

.homeTopBar .title-box .title .text-fit {
    white-space: nowrap;
}

.homeTopBar .title-box .title:last-child {
    margin-right: 0;
}

.homeTopBar .title-box .title .name {
    color: #333;
}

.homeTopBar .title-box .title.current .name {
    color: #f23030;
    font-size: 120% !important;
    font-weight: 500;
}

.homeTopBar .title-box .title .desc {
    font-size: 20rpx;
    height: 40rpx;
    line-height: 40rpx;
}

.homeTopBar .title-box .title.current .desc {
    background: linear-gradient(to right, #f23030, #f23030);
    color: #fff;
    border-radius: 0 20rpx 20rpx 20rpx;
}

/*首页 - 头条*/
.headlines-box {
    position: relative;
    height: 60rpx;
    margin: 10rpx 30rpx;
    background: #fff;
    border-radius: 18rpx;
}

.headlines-box .headlines-box-wrap {
    display: flex;
}

.headlines-box .headlines-img {
    width: 100%;
    height: 32rpx;
}

.headlines-box .headlines-left {
    width: 160rpx;
    min-width: 160rpx;
    margin-right: 20rpx;
    padding: 10rpx;
    height: 56rpx;
}

.headlines-box .headlines-right {
    width: 90%;
    height: 60rpx;
    line-height: 60rpx;
    overflow: hidden;
}

.headlines-box .headlines-link {
    width: 100%;
    height: 60rpx;
    line-height: 60rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 24rpx;
}

.empty-box {
    height: 500rpx;
    padding-bottom: 200rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

/* AI浮动按钮 - 半隐藏在右侧边缘 */
.ai-float-button {
    position: fixed;
    right: -40rpx;  // 向右移动，让按钮有一半在屏幕外
    top: 50%;
    transform: translateY(-50%);
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: -4rpx 4rpx 16rpx rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    animation: aiPulse 2s ease-in-out infinite;

    &:active {
        transform: translateY(-50%) scale(0.95);
    }
}

/* AI按钮呼吸动画 */
@keyframes aiPulse {
    0%, 100% {
        box-shadow: -4rpx 4rpx 16rpx rgba(102, 126, 234, 0.4);
    }
    50% {
        box-shadow: -4rpx 4rpx 24rpx rgba(102, 126, 234, 0.6);
    }
}

/* 自定义返回顶部按钮 */
.custom-back-top {
    position: fixed;
    right: 30rpx;
    bottom: 120rpx;
    width: 96rpx;
    height: 96rpx;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-top-icon {
        width: 96rpx;
        height: 96rpx;
    }
}

/* 淡入动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
}
</style>
    