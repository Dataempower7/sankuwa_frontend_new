<template>
    <view class="search-page">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="back-btn" @click="handleBack">
                   <image style="    width: 50rpx;    height: 50rpx;" src="/static/images/common/trolley_icon_back@3x.png" mode="aspectFit" />
                </view>
                <view class="search-container">
                    <view class="search-box">
                        <image class="search-icon" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778963QMciIVS0zkhfhjYBdM.jpeg" mode="aspectFit" />
                        <input
                            v-model="keyWords"
                            :focus="true"
                            type="text"
                            :placeholder="$t('点击搜索商品')"
                            placeholder-class="placeholder"
                            @confirm="searchSubmit"
                        />
                    </view>
                </view>
                <view class="refresh-btn" @click="handleRefresh">
                    <text class="iconfont-h5 icon-shuaxin" />
                </view>
            </view>
        </view>

        <view class="searchGood">
            <!-- 热门搜索 -->
            <view v-if="hotKeywords.length" class="search_init_box">
                <view class="search_hot_box">
                    <view class="title">
                        {{ $t("热门搜索") }}
                    </view>
                    <view class="list acea-row">
                        <template v-for="(item, index) in hotKeywords" :key="index">
                            <view class="item line1" @click="handleSearch(item)">{{ item }}</view>
                        </template>
                    </view>
                </view>
            </view>     
            
            <!-- 历史搜索 -->
            <view v-if="searchHistory.length" class="search_init_box">
                <view class="search_history_box">
                    <view class="title">
                        {{ $t("历史搜索") }}
                        <view class="clear_history" @click.stop="clearHistory">
                            <image src="/static/images/search/del.png" class="del-icon" />
                        </view>
                    </view>
                    <view class="list acea-row">
                        <template v-for="(item, index) in searchHistory" :key="index">
                            <view class="item line1" @click="handleSearch(item)">{{ item }}</view>
                        </template>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
import { redirect } from "@/utils";
import { getHotKeywords } from "@/api/search/search";

const { t } = useI18n();

const navbarTitle = ref("搜索商品");

const keyWords = ref("");

const searchHistory = ref<any[]>([]);

const hotKeywords = ref<string[]>([]);

const shopId = ref("");

// 获取热门搜索关键词
const loadHotKeywords = async () => {
    try {
        const result = await getHotKeywords();
        if (result && typeof result === 'string') {
            // 假设后端返回的是逗号分隔的字符串
            hotKeywords.value = result.split(',').filter(item => item.trim()).slice(0, 10);
        }
    } catch (error) {
        console.error('获取热门搜索失败:', error);
    }
};

onLoad((options: any) => {
    if (options) {
        if (options.shopId && options.shopId != 'undefined') {
            shopId.value = options.shopId;
            navbarTitle.value = "店铺搜索";
        }
    }
    if (uni.getStorageSync("searchHistory")) {
        searchHistory.value = uni.getStorageSync("searchHistory");
    }
    
    // 加载热门搜索
    loadHotKeywords();
});
const searchSubmit = () => {
    if (keyWords.value) {
        searchHistory.value.unshift(keyWords.value);
        searchHistory.value = [...new Set(searchHistory.value)];
        if (searchHistory.value.length > 10) {
            searchHistory.value.splice(10, searchHistory.value.length - 10);
        }
        uni.setStorageSync("searchHistory", searchHistory.value);
        handleSearch(keyWords.value);
    } else {
        uni.showToast({
            title: t("请输入搜索内容"),
            icon: "none"
        });
    }
};
const clearHistory = () => {
    searchHistory.value = [];
    uni.removeStorageSync("searchHistory");
};

const handleSearch = (item: any) => {
    let url = `/pages/search/result?keyWords=${item}`;
    shopId.value && (url += `&shopId=${shopId.value}`);
    redirect({
        url
    });
};

const handleBack = () => {
    uni.switchTab({
        url: "/pages/index/index"
    });
};

const handleRefresh = () => {
    // 刷新页面或重置搜索
    keyWords.value = "";
    // 可以添加其他刷新逻辑
};
</script>
<style>
page {
    background-color: #ffffff !important;
}
</style>

<style lang="scss" scoped>
.search-page {
    background-color: #ffffff;
    min-height: 100vh;
}

/* 自定义导航栏 */
.custom-navbar {
    background-color: #fff;
    padding-top: 50px;
}

.navbar-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    gap: 20rpx;
}

.back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont-h5 {
        font-size: 65rpx;
        color: #333;
    }
}

.search-container {
    flex: 1;
    margin-left: -5rpx;
    margin-right: 70px;
}

.search-box {
    height: 75rpx;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    gap: 15rpx;

    .search-icon {
        font-size: 35rpx;
        color: #999;
        width: 32rpx;
        height: 32rpx;
    }

    input {
        flex: 1;
        font-size: 28rpx;
        color: #333;

        .placeholder {
            color: #999;
        }
    }
}



.refresh-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont-h5 {
        font-size: 36rpx;
        color: #333;
    }
}

.searchGood {
    padding-top: 20rpx;
}
</style>
<style scoped>


.search_init_box .title {
    font-size: 38rpx;
    color: #333;
    margin: 30rpx 40rpx 35rpx;
    font-weight: bold;
    position: relative;
}
.search_init_box .list {
    padding-left: 10rpx;
}
.search_init_box .list .item {
    font-size: 32rpx;
    color: #333;
    padding: 0 32rpx;
    height: 68rpx;
    border-radius: 34rpx;
    line-height: 68rpx;
    margin: 0 0 24rpx 20rpx;
    background: #f6f6f6;
}

.clear_history {
    position: absolute;
    right: 0;
    top: 0;
    font-weight: normal;
    font-size: 26rpx;
    padding: 20rpx;
    top: -20rpx;

    .del-icon {
        width: 40rpx;
        height: 40rpx;
        margin-top: 6rpx;
    }
}

/* 热门搜索样式 */
.search_hot_box {
    margin-bottom: 40rpx;
}
</style>
