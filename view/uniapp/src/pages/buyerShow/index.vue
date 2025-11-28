<template>
    <template v-if="buyerShowEnabled === 1">
        <tig-layout :title="configStore.buyerShowMobileShowName || '种草'" :show-left="false">
            <view class="buyerShowBox">
                <view class="header">
                    <view class="search-container">
                        <view class="search-box">
                            <image class="search-icon" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778963QMciIVS0zkhfhjYBdM.jpeg" mode="aspectFit" />
                            <input 
                                v-model="filterParams.keyword" 
                                class="txt" 
                                type="text" 
                                placeholder="搜索买家秀" 
                                @confirm="handleSearch"
                                confirm-type="search"
                            />
                            <view v-if="filterParams.keyword" class="clear-btn" @click="clearSearch">
                                <text class="iconfont-h5 icon-guanbi" />
                            </view>
                        </view>
                    </view>
                </view>
                <view class="tabs">
                    <horizontal-tabs v-model:current-tab="currentTab" :tabs="tabList" />
                </view>
                <view class="container">
                    <waterfall-layout
                        :list="buyerShowListData"
                        :has-more="hasMore"
                        :loading="loading"
                        :layout="configStore.buyerShowTemplateStyle ? 'single' : 'double'"
                        @load-more="loadMoreData"
                        @item-click="onProductClick"
                    >
                        <!-- 自定义项目渲染 -->
                        <template #item="{ item, index }">
                            <buyerShowItem :buyer-show-item="item" :buyer-show-index="index" :buyer-show-list-data="buyerShowListData" />
                        </template>
                        <template #itemRight="{ item, index }">
                            <buyerShowItem :buyer-show-item="item" :buyer-show-index="index" :buyer-show-list-data="buyerShowListData" />
                        </template>
                    </waterfall-layout>
                </view>
                <!--            判断是否已登录-->
                <template v-if="!hasToken">
                    <view class="publish" @click="handleLogin">
                        <image src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/17612729318TBBfBkFY66TbOGSzl.jpeg" class="publish-icon" />
                    </view>
                </template>
                <!--            判断是否有购买的商品-->
                <template v-else-if="getHistoryProductTotal">
                    <view class="publish" @click="addBuyerShow">
                        <image src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202510/17612729318TBBfBkFY66TbOGSzl.jpeg" class="publish-icon" />
                    </view>
                </template>
                <!--            <tig-loadingpage v-model="isLoading" />-->
                <loading-box v-model="isLoadMore" :page="filterParams.page" :length="buyerShowListData.length" />
            </view>
        </tig-layout>
        <template v-if="!isLoading && total === 0">
            <view class="empty-box">
                <up-empty :icon="staticResource('salesman/no_order.png')" :text="$t('暂无数据')" />
            </view>
        </template>
    </template>

    <template v-else>
        <tig-layout :title="'买家秀'" :show-left="false" style="height: 100vh">
            <buyerShowCloseTip v-model:buyer-show-enabled="buyerShowEnabled" />
        </tig-layout>
    </template>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import HorizontalTabs from "@/components/buyerShow/horizontal-tabs.vue";
import WaterfallLayout from "@/components/buyerShow/WaterfallLayout.vue";
import TigLayout from "@/components/tig/tig-layout/tig-layout.vue";
import buyerShowItem from "./src/buyerShowItem.vue";
import buyerShowCloseTip from "./src/buyerShowCloseTip.vue";
import { redirect, staticResource } from "@/utils";
import { useList } from "@/hooks";
import { buyerShowList, getBuyerShowGroupList, getHistoryProduct } from "@/api/buyerShow/buyerShow";
import type { BuyerShowListFilter, BuyerShowListParams } from "@/types/buyerShow/buyerShow";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useConfigStore } from "@/store/config";
import { useUserStore } from "@/store/user";
import { handleLogin } from "@/utils/request";
const configStore = useConfigStore();

// 注意：只有 TabBar 页面才能调用 hideTabBar
// 买家秀页面不是 TabBar 页面，所以不需要隐藏
// uni.hideTabBar();
// onShow(() => {
//     uni.hideTabBar();
// });

const buyerShowEnabled = ref<number | undefined>(1);
watch(
    () => configStore,
    (val) => {
        if (val.initLoading) {
            buyerShowEnabled.value = val.buyerShowEnabled;
        }
    },
    { deep: true, immediate: true }
);

const userStore = useUserStore();
const hasToken = computed(() => {
    return userStore.token || uni.getStorageSync("token");
});

const { total: getHistoryProductTotal } = useList(getHistoryProduct, {
    params: { page: 1, size: 1 },
    path: {
        dataKey: "records"
    },
    immediate: true,
    needReachBottom: false
});
const handleLink = (type: string) => {
    if (type === "home") {
        redirect({ url: "/pages/index/index" });
    } else {
        // #ifdef H5
        history.back();
        // #endif

        // #ifndef H5
        uni.navigateBack();
        // #endif
    }
};

// 处理搜索
const handleSearch = () => {
    // 重置到第一页
    filterParams.page = 1;
    // 重新获取数据
    getList();
};

// 清空搜索
const clearSearch = () => {
    filterParams.keyword = '';
    filterParams.page = 1;
    // 重新获取数据
    getList();
};

const addBuyerShow = () => {
    redirect({ url: "/pages/buyerShow/addBuyerShow" });
};

const tabList = ref<any[]>([{ title: "全部" }]);
const currentTab = ref(0);

const hasMore = ref(true);
const loading = ref(false);
const loadMoreData = async () => {
    console.log("loadMoreData");
};
const onProductClick = (item: any) => {
    redirect({ url: "/pages/buyerShow/buyerShowDetail", param: { buyerShowId: item.buyerShowId } });
};

const filterParams = reactive<BuyerShowListParams>({
    page: 1,
    size: 10,
    sortField: "addTime",
    sortOrder: "desc",
    keyword: ""
});

const {
    getList,
    data: buyerShowListData,
    isLoading,
    isLoadMore,
    total
} = useList<BuyerShowListFilter>(buyerShowList, {
    params: filterParams,
    path: {
        dataKey: "records"
    },
    immediate: false
});

// 获取买家秀分组列表
const getGroupList = () => {
    getBuyerShowGroupList()
        .then((res) => {
            // 确保 res 是数组，如果是对象则取 data 属性
            const groupList = Array.isArray(res) ? res : res?.data || [];
            
            tabList.value = groupList.map((item: any) => {
                return {
                    ...item,
                    title: item.groupName
                };
            });
            tabList.value.unshift({ title: "全部" });
        })
        .catch((err) => {
            console.error("获取买家秀分组失败:", err);
            // 失败时至少保留"全部"选项
            tabList.value = [{ title: "全部" }];
        });
};

// 监听分组切换
watch(
    currentTab,
    (newValue) => {
        filterParams.goodsId = tabList.value[newValue]?.buyerShowGroupId;
        getList({ ...filterParams });
    },
    { deep: true }
);

onLoad((options: any) => {
    if (options.keyWords) {
        filterParams.keyword = options.keyWords;
        getList({ ...filterParams });
    } else {
        getList();
    }
    getGroupList();
});
</script>

<style scoped lang="scss">
.buyerShowBox {
    .header {
        width: 100%;
        height: 99rpx;
        background-color: #fff;
        position: fixed;
        left: 0;
        right: 0;
        z-index: 9;
        border-bottom: 1rpx solid #f5f5f5;
        top: var(--nav-height);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 30rpx;
        
        .search-container {
            flex: 1;
            max-width: 700rpx;
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
                width: 32rpx;
                height: 32rpx;
            }

            input {
                flex: 1;
                font-size: 28rpx;
                color: #333;
            }
            
            .txt {
                color: #999;
                font-size: 28rpx;
            }
            
            ::placeholder {
                color: #999;
            }
            
            .clear-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40rpx;
                height: 40rpx;
                
                .iconfont-h5 {
                    font-size: 28rpx;
                    color: #999;
                }
            }
        }
    }
    .tabs {
        height: 100rpx;
        position: fixed;
        top: calc(var(--nav-height) + 99rpx);
        left: 0;
        right: 0;
        z-index: 9;
    }
    .container {
        // #ifdef H5
        margin-top: calc(var(--nav-height) + 80rpx);
        // #endif

        // #ifdef APP-PLUS
        margin-top: calc(var(--nav-height) + 20rpx);
        // #endif
        // #ifdef MP-WEIXIN
        margin-top: calc(var(--nav-height));
        // #endif
        box-sizing: border-box;
    }
}

.publish {
    position: fixed;
    right: 0;
    bottom: 158rpx;
    z-index: 9;
    width: 115rpx;
    height: 115rpx;
    padding: 20rpx 0 20rpx;
    box-sizing: content-box;
    .publish-icon {
        width: 65%;
        height: 65%;
        background-color: #ffffff;
        border-radius: 50%;
        padding: 15rpx;
        box-sizing: border-box;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }
}

.popupBox {
    padding: 45rpx 80rpx;
    box-sizing: border-box;
    font-size: 32rpx;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    width: 590rpx;
    height: 340rpx;
    background: #ffffff;
    border-radius: 16rpx;
    .title {
        text-align: center;
        font-weight: bold;
        font-size: 32rpx;
        color: #262626;
        margin-bottom: 40rpx;
    }
    .tip {
        font-weight: 500;
        font-size: 28rpx;
        color: #8c8c8c;
        margin-bottom: 76rpx;
        text-align: center;
    }
    .btn {
        text-align: center;
        // 下划线
        text-decoration: underline;
        color: var(--general);
        font-weight: 500;
        font-size: 28rpx;
    }
}
</style>
