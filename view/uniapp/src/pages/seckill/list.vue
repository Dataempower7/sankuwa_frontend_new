<template>
    <view class="seckill-page">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="back-btn" @click="goBack">
                    <image class="back-icon" src="/static/images/common/trolley_icon_back@3x.png" mode="aspectFit" />
                </view>
                <view class="navbar-title">
                    {{ $t("限时秒杀") }}
                </view>
                <view class="placeholder"></view>
            </view>
        </view>
        
        <view class="qianggou-list">
            <!-- 筛选条件 -->
            <view class="filter-container">
                <view class="tab-box flex align-center justify-between">
                    <template v-for="item in tabList" :key="item.value">
                        <view class="item flex align-center" :class="{ active: tabIndex === item.value }" @click="onChangeTab(item)">
                            <text>{{ $t(item.label) }}</text>
                            <view v-show="item.value === 'price'" class="price-ico-box flex flex-column">
                                <image
                                    :src="tabIndex === 'price' && item.order === 'asc' ? '/static/images/search/top_l.png' : '/static/images/search/top.png'"
                                    class="price-icon"
                                />
                                <image
                                    :src="tabIndex === 'price' && item.order === 'desc' ? '/static/images/search/down_l.png' : '/static/images/search/down.png'"
                                    class="price-icon"
                                />
                            </view>
                        </view>
                    </template>
                    
                <view class="item flex" id="filter-btn" @click.stop="showFilterDrawer">
                    <text>{{ $t("筛选") }}</text>
                    <image class="filter-icon" src="/static/images/common/right.png" mode="aspectFit" />
                </view>
                </view>
            </view>
            <!-- 空状态页面 -->
            <view v-if="!isLoading && seckillProductList.length === 0" class="empty-seckill-container">
                <view class="empty-content">
                    <image class="empty-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/17587058805bEdlfVAmtBsLCYcfz.jpeg" mode="aspectFit" />
                    <text class="empty-text">{{ $t("暂无秒杀商品") }}</text>
                    <text class="empty-desc">{{ $t("敬请期待") }}</text>
                </view>
            </view>
            
            <!-- 商品列表 -->
            <view v-for="(item, index) in seckillProductList" :key="index" class="qianggou-item" @click="toDetail(item)">
                <view class="qianggou-img-box">
                    <image class="qianggou-img" :src="imageFormat(item.picThumb || '')" mode="aspectFill" />
                    <view v-if="item.seckillStock === 0" class="qianggou-out">
                        <view class="qianggou-out-txt">{{ $t("已抢完") }}</view>
                    </view>
                </view>
                <view class="qianggou-info">
                    <view class="qianggou-tit line2">
                        {{ item.productName }}
                    </view>
                    <view class="line1 pro-txt-small">
                        <text class="line1">{{ $t("限时秒杀 抢先提醒") }}</text>
                    </view>
                    <view class="qianggou-money-box">
                        <view class="qianggou-num">
                            <view class="num"
                                ><format-price
                                    :font-style="{
                                        fontSize: '36rpx',
                                        fontWeight: 'bold',
                                        color: 'red'
                                    }"
                                    :decimals-style="{
                                        fontSize: '25rpx',
                                        fontWeight: 'bold',
                                        color:'red'
                                    }"
                                    :currency-style="{
                                        fontSize: '23rpx',
                                        fontWeight: 'bold',
                                         color:'red'
                                    }"
                                    :price-data="item.seckillPrice"
                            /></view>
                            <view class="del"
                                ><format-price 
                                    :font-style="{ 
                                        'text-decoration': 'line-through',
                                        fontSize: '18rpx',
                                        color: '#999'
                                    }" 
                                    :currency-style="{
                                        fontSize: '16rpx',
                                        color: '#999'
                                    }"
                                    :decimals-style="{
                                        fontSize: '16rpx',
                                        color: '#999'
                                    }"
                                    :is-bottom="false" 
                                    :price-data="item.marketPrice"
                            /></view>
                        </view>
                        <view class="qianggou-btn" :class="{ flex: item.seckillStock === 0, 'align-center': item.seckillStock > 0 }">
                            <view v-if="item.seckillStock === 0" class="btn-txt"> {{ $t("已抢完") }} </view>
                            <view v-else class="btn-txt">
                                <view class="txt">{{ $t("马上抢") }}</view>
                                <view class="progress-box flex align-center">
                                    <view class="progress-bar">
                                        <view
                                            class="progress"
                                            :style="{
                                                width: seckillPercentage(item.seckillSales, item.seckillStock)
                                            }"
                                        />
                                    </view>
                                    <view class="progress-txt">{{ seckillPercentage(item.seckillSales, item.seckillStock) }}</view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <loading-box v-model="isLoadMore" color="#fff" :page="filterParams.page" :length="seckillProductList.length" />
        
        <!-- 筛选下拉菜单 -->
        <view
            v-if="showDropdown"
            class="filter-dropdown-container"
            @tap="closeDropdown"
            @click="closeDropdown"
            @touchmove.stop=""
        >
            <view
                class="filter-dropdown"
                :style="{
                    top: dropdownPosition.top + 'px',
                    left: 272.34375 + 'px'
                }"
                @tap.stop=""
                @click.stop=""
                @touchmove.stop=""
            >
                <!-- 小箭头 -->
                <view class="dropdown-arrow-border"></view>
                <view class="dropdown-arrow"></view>
                
                <!-- 筛选选项 -->
                <view class="dropdown-item" @tap="handleDropdownItemClick('isBest')" @click="handleDropdownItemClick('isBest')">
                    <text class="dropdown-text">精品推荐{{ filterConditions.isBest === 1 ? ' ✓' : '' }}</text>
                </view>
                <view class="dropdown-item" @tap="handleDropdownItemClick('isHot')" @click="handleDropdownItemClick('isHot')">
                    <text class="dropdown-text">热门商品{{ filterConditions.isHot === 1 ? ' ✓' : '' }}</text>
                </view>
                <view class="dropdown-item" @tap="handleDropdownItemClick('isNew')" @click="handleDropdownItemClick('isNew')">
                    <text class="dropdown-text">新品上市{{ filterConditions.isNew === 1 ? ' ✓' : '' }}</text>
                </view>
                <view class="dropdown-item" @tap="handleDropdownItemClick('reset')" @click="handleDropdownItemClick('reset')">
                    <text class="dropdown-text">取消筛选</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from "vue";
import { imageFormat } from "@/utils/format";
import { getSeckill } from "@/api/seckill/seckill";
import type { SeckillFilterState } from "@/types/seckill/seckill";
import { staticResource } from "@/utils";
import { useList } from "@/hooks";
const filterParams = reactive({
    //初始化用于查询的参数
    page: 1,
    size: 20
});
const {
    getList,
    isLoadMore,
    isLoading,
    data: seckillProductList
} = useList<SeckillFilterState>(getSeckill, {
    params: filterParams,
    path: {
        dataKey: "records"
    },
    immediate: true,
    manageData: (data: SeckillFilterState[]) => {
        // 保存原始数据用于前端排序
        originalSeckillList.value = [...data];
    }
});

const toDetail = (data: SeckillFilterState) => {
    let url = `/pages/product/index?id=${data.productId}${data.skuId > 0 ? `&skuId=${data.skuId}` : ""}`;
    uni.navigateTo({
        url
    });
};

const seckillPercentage = (sales: number, stock: number) => {
    return Math.round((sales / (stock + sales)) * 100) + "%";
};

// 返回功能
const goBack = () => {
    uni.navigateBack();
};

// 筛选相关状态
const tabIndex = ref("default");
const tabList = ref([
    {
        label: "默认",
        value: "default"
    },
    {
        label: "价格",
        value: "price",
        order: "desc"
    }
]);

// 筛选条件状态
const filterConditions = ref({
    isBest: 0,
    isHot: 0,
    isNew: 0
});

// 下拉菜单状态
const showDropdown = ref(false);
const dropdownPosition = ref({ top: 0, left: 272.34375 });

// 原始未排序的商品列表
const originalSeckillList = ref<SeckillFilterState[]>([]);

// 筛选条件切换 - 使用前端排序
const onChangeTab = (item: any) => {
    if (item.value === "price") {
        item.order = item.order === "desc" ? "asc" : "desc";
    } else {
        item.order = "";
    }
    tabIndex.value = item.value;
    
    // 前端排序逻辑
    sortProductList(item.value, item.order);
};

// 前端排序函数（现在集成到 applyFilter 中）
const sortProductList = (sortType: string, order: string) => {
    // 直接调用 applyFilter 来同时应用筛选和排序
    applyFilter();
};

// 监听原始数据变化，自动应用当前筛选和排序
watch(originalSeckillList, (newData) => {
    if (newData.length > 0) {
        applyFilter();
    }
}, { deep: true });

// 显示筛选下拉菜单
const showFilterDrawer = () => {
    if (showDropdown.value) {
        closeDropdown();
        return;
    }
    
    showDropdown.value = true;
    
    // 使用 nextTick 确保 DOM 已经更新
    nextTick(() => {
        const query = uni.createSelectorQuery();
        query.select('#filter-btn').boundingClientRect((rect) => {
            if (rect && !Array.isArray(rect)) {
                dropdownPosition.value = {
                    top: (rect.bottom || 0) + 10,
                    left: (rect.left || 0) - 100 // 左偏移一些使菜单更好对齐
                };
            } else {
                // 降级方案
                dropdownPosition.value = {
                    top: 200,
                    left: 200
                };
            }
        }).exec();
    });
};

// 关闭下拉菜单
const closeDropdown = () => {
    showDropdown.value = false;
};

// 处理下拉菜单项点击
const handleDropdownItemClick = (filterType: 'isBest' | 'isHot' | 'isNew' | 'reset') => {
    closeDropdown();
    
    if (filterType === 'reset') {
        resetFilter();
    } else {
        toggleFilter(filterType);
    }
};

// 切换筛选条件
const toggleFilter = (filterType: 'isBest' | 'isHot' | 'isNew') => {
    filterConditions.value[filterType] = filterConditions.value[filterType] === 0 ? 1 : 0;
    applyFilter();
    
    // uni.showToast({
    //     title: `${getFilterName(filterType)}: ${filterConditions.value[filterType] === 1 ? '开启' : '关闭'}`,
    //     icon: 'none'
    // });
};

// 获取筛选条件名称
const getFilterName = (filterType: 'isBest' | 'isHot' | 'isNew') => {
    switch (filterType) {
        case 'isBest': return '精品推荐';
        case 'isHot': return '热门商品';
        case 'isNew': return '新品上市';
        default: return '';
    }
};

// 重置筛选条件
const resetFilter = () => {
    filterConditions.value = {
        isBest: 0,
        isHot: 0,
        isNew: 0
    };
    applyFilter();
    
    uni.showToast({
        title: '已取消所有筛选',
        icon: 'none'
    });
};

// 应用筛选条件
const applyFilter = () => {
    let filteredList = [...originalSeckillList.value];
    
    // 根据筛选条件过滤商品
    if (filterConditions.value.isBest === 1) {
        filteredList = filteredList.filter(item => item.isBest === 1);
    }
    if (filterConditions.value.isHot === 1) {
        filteredList = filteredList.filter(item => item.isHot === 1);
    }
    if (filterConditions.value.isNew === 1) {
        filteredList = filteredList.filter(item => item.isNew === 1);
    }
    
    // 更新原始数据以应用当前排序
    const currentTab = tabList.value.find(tab => tab.value === tabIndex.value);
    if (currentTab) {
        // 使用过滤后的数据进行排序
        let sortedList = [...filteredList];
        
        switch (currentTab.value) {
            case "price":
                sortedList.sort((a, b) => {
                    const priceA = parseFloat(a.seckillPrice);
                    const priceB = parseFloat(b.seckillPrice);
                    return currentTab.order === "asc" ? priceA - priceB : priceB - priceA;
                });
                break;
        }
        
        seckillProductList.value = sortedList;
    } else {
        seckillProductList.value = filteredList;
    }
};
</script>
<style>
page {
    background: linear-gradient(to right, #fd146b 0%, #f52828 100%);
}
</style>
<style scoped lang="scss">
.seckill-page {
    min-height: 120vh;
    background: url('https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/175869467673crlBuHp2RHBa1CsZ.jpeg') no-repeat top center;
    background-size: 100% auto;
    padding-top: 65px;
}

.custom-navbar {
    height: 88rpx;
    padding-top: var(--status-bar-height, 44rpx);
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    
    .navbar-content {
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 49px 30rpx;
        
        .back-btn {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .back-icon {
                width: 40rpx;
                height: 40rpx;
            }
        }
        
        .navbar-title {
            color: #020202;
            font-size: 36rpx;
            font-weight: bold;
            text-align: center;
            flex: 1;
        }
        
        .placeholder {
            width: 60rpx;
        }
    }
}

.qianggou-list {
    margin: calc(88rpx + var(--status-bar-height, 44rpx) + 200rpx) 25rpx 0 25rpx;
    background-color: #fff;
    border-radius: 30rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0,0,0,.08);
    min-height: 60vh;
    padding: 0 10rpx 10rpx;
    
    // 筛选条件样式（在商品列表内部）
    .filter-container {
        background-color: #fff;
        padding: 5px 0rpx;
        position: sticky;
        top: calc(88rpx + var(--status-bar-height, 44rpx));
        z-index: 999;
        border-radius: 30rpx;
        
        .tab-box {
            padding: 20rpx 0;
            
            .item {
                flex: 1;
                color: #333;
                font-size: 28rpx;
                align-items: center;
                justify-content: center;
                padding: 10rpx;
                
                &.active {
                    color: #3D42C2;
                    font-weight: bold;
                }
                
                .price-ico-box {
                        margin-left: 12rpx;
                        gap: 4rpx;
                    .price-icon {
                        width: 14rpx;
                        height: 11rpx;
                    }
                }
                
                .filter-icon {
                    width: 24rpx;
                    height: 24rpx;
                    margin-left: 8rpx;
                    transform: rotate(90deg);
                }
            }
        }
    }
    
    // 商品列表内容区域
    padding: 0 20rpx 20rpx 20rpx;
    
    // 商品项目样式
    .qianggou-item {
       margin-bottom: 15rpx;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx 5rpx 10rpx 0rpx;
    display: flex;
    align-items: center;

    .qianggou-img-box {
        width: 200rpx;
        height: 200rpx;
        position: relative;

        .qianggou-img,
        .qianggou-out {
            width: 100%;
            height: 100%;
            border-radius: 25rpx;
        }

        .qianggou-out {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.5);

            .qianggou-out-txt {
                width: 150rpx;
                height: 150rpx;
                line-height: 150rpx;
                background-color: rgba(0, 0, 0, 0.5);
                color: #ffffff;
                font-size: 32rpx;
                text-align: center;
                font-weight: bold;
                border-radius: 100rpx;
            }
        }
    }

    .qianggou-info {
        margin-left: 20rpx;
        flex: 1;
        width: calc(100% - 200rpx);

        .qianggou-tit {
            color: #333333;
            font-size: 27rpx;
            margin-bottom: 10rpx;
            font-family:
                PingFangSC,
                PingFang SC;
            font-weight: 600;
            width: 100%;
        }

        .pro-txt-small {
            font-size: 25rpx;
            color: #666666;
            margin-bottom: 10rpx;
            width: 100%;

            .attr-tag {
                width: 25rpx;
                height: 25rpx;
                margin-right: 8rpx;
                margin-top: 3rpx;
            }
            .text {
                width: 400rpx;
            }
        }

        .qianggou-money-box {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            height: 80rpx;

            .qianggou-num {
                display: flex;
                align-items: flex-end;
                .num {
                    color: red;
                    font-weight: bold;
                    font-size: 36rpx;
                    display: flex;
                    align-items: center;
                }
                .del {
                    display: flex;
                    margin-left: 15rpx;
                    font-size: 18rpx;
                }
            }

            .qianggou-btn {
                width: 190rpx;
                height: 75rpx;
                background: linear-gradient(130deg, #ff8853 0%, #f52828 100%);
                border-radius: 38rpx;
                line-height: 60rpx;
                text-align: center;

                .btn-txt {
                    width: 100%;
                    color: #fff;
                    position: relative;
                }

                .progress-box {
                    position: absolute;
                    bottom: -30rpx;
                    left: 50%;
                    margin-left: -60rpx;
                    .progress-bar {
                        width: 80rpx; /* 进度条容器的总宽度 */
                        height: 8rpx; /* 进度条的高度 */
                        background-color: #fcaa9e; /* 进度条背景色 */
                        border-radius: 4rpx; /* 进度条容器的圆角 */
                        box-shadow: inset 0 1rpx 3rpx rgba(0, 0, 0, 0.2); /* 可选：为进度条添加内阴影效果 */
                    }
                    .progress-txt {
                        font-size: 20rpx;
                        margin-left: 5rpx;
                    }

                    .progress {
                        height: 8rpx; /* 进度条的高度 */
                        background-color: #fff; /* 进度条的颜色 */
                        border-radius: 4rpx; /* 进度部分的圆角 */
                        transition: width 0.4s ease; /* 进度变化时的过渡动画效果 */
                    }
                }
            }

            .btn-out {
                background: rgba(178, 178, 178, 1);
            }
        }
    }
    
    // qianggou-item 结束
    }
    
// qianggou-list 结束
}

/* 筛选下拉菜单样式 */
.filter-dropdown-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: auto;
}

.filter-dropdown {
    position: absolute;
    background-color: #fff;
    border-radius: 18rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 200rpx;
    max-width: 320rpx;
    overflow: visible;
    border: 1rpx solid #e0e0e0;
    pointer-events: auto;
    
    /* 动画效果 */
    animation: dropdownFadeIn 0.2s ease-out;
    transform-origin: top center;
    
    /* 箭头边框层 */
    .dropdown-arrow-border {
        position: absolute;
        top: -17rpx;
        right: 80rpx;
        width: 0;
        height: 0;
        border-left: 17rpx solid transparent;
        border-right: 17rpx solid transparent;
        border-bottom: 17rpx solid #e0e0e0;
        z-index: 9999;
    }
    
    /* 箭头主体层 */
    .dropdown-arrow {
        position: absolute;
        top: -16rpx;
        right: 80rpx;
        width: 0;
        height: 0;
        border-left: 16rpx solid transparent;
        border-right: 16rpx solid transparent;
        border-bottom: 16rpx solid #fff;
        z-index: 10000;
    }
    
    .dropdown-item {
        padding: 24rpx 30rpx;
        text-align: left;
        border-bottom: 1rpx solid #f8f8f8;
        display: flex;
        align-items: center;
        min-height: 88rpx;
        
        &:last-child {
            border-bottom: none;
        }
        
        .dropdown-text {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
        }
        
        &:active {
            background-color: #f8f8f8;
        }
    }
}

/* 下拉菜单动画 */
@keyframes dropdownFadeIn {
    0% {
        opacity: 0;
        transform: translateY(-10rpx) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 空状态页面样式 */
.empty-seckill-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 80rpx 40rpx;
    
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
</style>
