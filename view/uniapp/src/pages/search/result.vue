<template>
    <view class="search-result-page">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="back-btn" @click="handleBack">
                    <text class="iconfont-h5 icon-zuojiantou" />
                </view>
                <view class="search-container">
                    <view class="search-box" @click.stop="toSearch">
                        <text class="iconfont-h5 icon-sousuo search-icon" />
                        <view class="search-text">{{ filterParams.keyword || $t("点击搜索商品") }}</view>
                    </view>
                </view>
                <view class="refresh-btn" @click="handleRefresh">
                    <text class="iconfont-h5 icon-shuaxin" />
                </view>
            </view>
        </view>

        <view class="pageMain productSort"  @click="handlePageClick">

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

                <view class="item flex" @click.stop="showDrawer">
                    <text>{{ $t("筛选") }}</text>
                    <uni-icons type="right" size="12" class="sanjiaoright" />
                </view>
            </view>

            <view class="tag-row">
                <view class="tag-list flex-wrap align-center">
                    <view v-if="filterParams.keyword" class="tag-item mr10 line1" @click="del('keyword')">
                        <text class="line1">{{ $t("搜索关键词") }}"{{ filterParams.keyword }}"</text>
                        <uni-icons type="closeempty"  color="#252525" />
                    </view>
                    <view v-if="filterParams.intro" class="tag-item mr10" @click="del('intro')">
                        <text>{{ introList[filterParams.intro] }}</text>
                        <uni-icons type="closeempty" size="10" />
                    </view>
                    <view v-if="couponInfo && couponInfo.couponName" class="tag-item mr10" @click="del('coupon_info')">
                        <text>{{ $t("优惠券") }}: "{{ couponInfo.couponName }}"</text>
                        <uni-icons type="closeempty" size="10" />
                    </view>
                    <view v-if="brandName" class="tag-item mr10 brand" @click="del('brand')">
                        <text>{{ brandName }}</text>
                        <uni-icons type="closeempty" size="10" />
                    </view>
                    <view v-if="filterParams.max || filterParams.min" class="tag-item mr10" @click="del('price')">
                        <text>{{ filterParams.min || 0 }} - {{ filterParams.max || 0 }}</text>
                        <uni-icons type="closeempty" size="10" />
                    </view>
                    <template v-if="treeList.length > 0">
                        <view v-for="(item, index) in treeList" :key="index" class="flex align-center" @click="delCategory(index)">
                            <view class="tag-item">
                                <text>{{ item.categoryName }}</text>
                                <uni-icons type="closeempty" size="10" />
                            </view>
                            <view v-if="index < treeList.length - 1" class="tag-interval">
                                <uni-icons type="right" size="10" />
                            </view>
                        </view>
                    </template>
                </view>
            </view>

            <template v-if="isMerchant() && filterParams.keyword">
                <shopInfo :keyword="filterParams.keyword" :shop-id="filterParams.shopId" />
            </template>

            <!-- 加载商品模块 -->
            <template v-if="!isLoading && total > 0">
                <view class="goods-container">
                    <masonry :commodity-list="productList" :promotion-list="promotionList" />
                </view>
            </template>
            <template v-if="!isLoading && total === 0">
                <empty-box mode="search" background="#f5f5f5" />
            </template>

            <loading-box v-model="isLoadMore" :page="filterParams.page" :length="productList.length" />
            </view>
        </view>

        <!-- 筛选弹框 -->
        <view v-show="showDrawerRef">
            <!-- 下方商品区域的半透明蒙版 -->
            <view style="position: fixed; top: 180rpx; left: 0; right: 0; bottom: 0;  z-index: 9998;" @click="closeDrawer"></view>
            <!-- 筛选弹框内容 - 紧贴筛选按钮下方 -->
            <view class="filter-dropdown" @click.stop style="position: fixed; top: 163px; left: 0; right: 0;  padding: 30rpx; max-height: calc(100vh - 180rpx); overflow-y: auto; animation: slideUp 0.3s ease-out; z-index: 9999;">
            <!-- 分类筛选 -->
            <view v-if="categoryList.length > 0" style="margin-bottom: 50rpx;">
                <view style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 24rpx; margin-bottom: 30rpx;">
                    <text style="font-size: 36rpx; font-weight: 600; color: #333;">{{ $t("分类") }}</text>
                    <view style="padding: 10rpx; opacity: 0.6;" @click="categoryShow = !categoryShow">
                        <uni-icons :type="categoryShow ? 'up' : 'down'" size="16" color="#999" />
                    </view>
                </view>
                <view v-if="categoryShow" style="display: flex; flex-wrap: wrap; gap: 24rpx;">
                    <template v-if="filterParams.shopId">
                        <view
                            v-for="(item, index) in getShopCategoryList"
                            :key="index"
                            :style="{
                                padding: '20rpx 32rpx',
                                backgroundColor: filterParams.shopCategoryId == item.categoryId ? '#e8ebff' : '#f8f8f8',
                                borderRadius: '60rpx',
                                fontSize: '30rpx',
                                color: filterParams.shopCategoryId == item.categoryId ? '#414BB8' : '#666',
                                border: filterParams.shopCategoryId == item.categoryId ? '2rpx solid #414BB8' : '2rpx solid transparent',
                                transition: 'all 0.25s ease',
                                minWidth: '120rpx',
                                textAlign: 'center',
                                fontWeight: filterParams.shopCategoryId == item.categoryId ? '600' : 'normal'
                            }"
                            @click="filterParams.shopCategoryId = item.categoryId"
                        >
                            {{ item.categoryName }}
                        </view>
                    </template>
                    <template v-else>
                        <view
                            v-for="(item, index) in getCategoryList"
                            :key="index"
                            :style="{
                                padding: '20rpx 32rpx',
                                backgroundColor: filterParams.cat == item.categoryId ? '#e8ebff' : '#f8f8f8',
                                borderRadius: '60rpx',
                                fontSize: '30rpx',
                                color: filterParams.cat == item.categoryId ? '#414BB8' : '#666',
                                border: filterParams.cat == item.categoryId ? '2rpx solid #414BB8' : '2rpx solid transparent',
                                transition: 'all 0.25s ease',
                                minWidth: '120rpx',
                                textAlign: 'center',
                                fontWeight: filterParams.cat == item.categoryId ? '600' : 'normal'
                            }"
                            @click="filterParams.cat = item.categoryId"
                        >
                            {{ item.categoryName }}
                        </view>
                    </template>
                </view>
            </view>

            <!-- 品牌筛选 -->
            <view v-if="brandList.length > 0" style="margin-bottom: 50rpx;">
                <view style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 24rpx; margin-bottom: 30rpx;">
                    <text style="font-size: 36rpx; font-weight: 600; color: #333;">{{ $t("品牌") }}</text>
                    <view style="padding: 10rpx; opacity: 0.6;" @click="brandShow = !brandShow">
                        <uni-icons :type="brandShow ? 'up' : 'down'" size="16" color="#999" />
                    </view>
                </view>
                <view v-if="brandShow" style="display: flex; flex-wrap: wrap; gap: 24rpx;">
                    <view
                        v-for="(item, index) in brandList"
                        :key="index"
                        :style="{
                            padding: '20rpx 32rpx',
                            backgroundColor: brandIds.includes(item.brandId) ? '#e8ebff' : '#f8f8f8',
                            borderRadius: '60rpx',
                            fontSize: '30rpx',
                            color: brandIds.includes(item.brandId) ? '#414BB8' : '#666',
                            border: brandIds.includes(item.brandId) ? '2rpx solid #414BB8' : '2rpx solid transparent',
                            transition: 'all 0.25s ease',
                            minWidth: '120rpx',
                            textAlign: 'center',
                            fontWeight: brandIds.includes(item.brandId) ? '600' : 'normal'
                        }"
                        @click="onChangeBrand(item)"
                    >
                        {{ item.brandName }}
                    </view>
                </view>
            </view>

            <!-- 价格筛选 -->
            <view style="margin-bottom: 50rpx;">
                <view style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 24rpx; margin-bottom: 30rpx;">
                    <text style="font-size: 36rpx; font-weight: 600; color: #333;">{{ $t("价格") }}</text>
                </view>
                <view style="display: flex; align-items: center; gap: 30rpx;">
                    <input
                        v-model="filterParams.min"
                        type="number"
                        :placeholder="$t('最低价')"
                        style="flex: 1; height: 88rpx; background-color: #f8f8f8; border-radius: 16rpx; padding: 0 24rpx; font-size: 30rpx; color: #333; text-align: center; border: 2rpx solid transparent; transition: all 0.25s ease;"
                    />
                    <text style="font-size: 32rpx; color: #999; font-weight: bold; width: 40rpx; text-align: center;">—</text>
                    <input
                        v-model="filterParams.max"
                        type="number"
                        :placeholder="$t('最高价')"
                        style="flex: 1; height: 88rpx; background-color: #f8f8f8; border-radius: 16rpx; padding: 0 24rpx; font-size: 30rpx; color: #333; text-align: center; border: 2rpx solid transparent; transition: all 0.25s ease;"
                    />
                </view>
            </view>

            <!-- 底部按钮 -->
            <view :style="{ display: 'flex', gap: '30rpx', padding: '40rpx 0 20rpx', borderTop: '1rpx solid #f0f0f0', marginTop: '30rpx', paddingBottom: safeBottom + 'px' }">
                <view
                    style="flex: 1; height: 96rpx; border-radius: 48rpx; display: flex; align-items: center; justify-content: center; font-size: 34rpx; font-weight: 600; transition: all 0.25s ease; background-color: #f8f8f8; color: #666; border: 2rpx solid #e8e8e8;"
                    @click="reset"
                >
                    {{ $t("重置") }}
                </view>
                <view
                    style="flex: 1; height: 96rpx; border-radius: 48rpx; display: flex; align-items: center; justify-content: center; font-size: 34rpx; font-weight: 600; transition: all 0.25s ease; background-color: #414BB8; color: #fff; box-shadow: 0 4rpx 16rpx rgba(65, 75, 184, 0.3);"
                    @click="submit"
                >
                    {{ $t("确定") }}
                </view>
            </view>
            </view>
        </view>

</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import masonry from "@/components/masonry/masonry.vue";
import type { Brand, filterSeleted, ProductFilterParams } from "@/types/search/search";
import { getCategoryTree, getCategoryProductFilter, getCategoryProduct, getShopCategoryTree } from "@/api/search/search";
import { useList } from "@/hooks";
import { useI18n } from "vue-i18n";
import shopInfo from "./src/shopInfo.vue";
import { isMerchant } from "@/utils";
import { useSafeAreaInsets } from "@/hooks";

const { t } = useI18n();

const navbarTitle = ref("商品搜索");

const { safeBottom } = useSafeAreaInsets();

const filterParams = reactive<ProductFilterParams>({
    //初始化用于查询的参数
    page: 1,
    size: 10,
    sort: "",
    order: "asc",
    keyword: "",
    max: "",
    min: "",
    cat: 0,
    couponId: 0,
    brand: [],
    intro: "",
    pageType: "search"
});
const brandList = ref<Brand[]>([]);
const brandIds = ref<number[]>([]);
const brandName = ref("");
const categoryList = ref<filterSeleted[]>([]);
const shopCategoryList = ref<filterSeleted[]>([]);
const introList: { [key: string]: string } = {
    new: t("新品"),
    hot: t("热销"),
    best: t("精品")
};
const categoryTree = ref<filterSeleted[]>([]);

const getCategoryList = computed(() => {
    return categoryList.value.length > 3 && !categoryShow.value ? categoryList.value.slice(0, 3) : categoryList.value;
});
const getShopCategoryList = computed(() => {
    return shopCategoryList.value.length > 3 && !categoryShow.value ? shopCategoryList.value.slice(0, 3) : shopCategoryList.value;
});
const treeList = computed(() => {
    if (filterParams.cat) {
        return categoryTree.value;
    }
    if (filterParams.shopCategoryId) {
        return shopCategoryList.value;
    }
    return [];
});

const {
    getList,
    total,
    data: productList,
    promotionList,
    isLoadMore,
    isLoading
} = useList(getCategoryProduct, {
    params: filterParams,
    path: {
        dataKey: "records"
    },
    needPromotionList: true
});

// 获取列表的查询结果
const loadFilter = async () => {
    try {
        filterParams.brand = brandIds.value.join(",");
        const productFilter = await getCategoryProductFilter({ ...filterParams });
        brandList.value = productFilter.filter.brand;
        categoryList.value = productFilter.filter.category;
        shopCategoryList.value = productFilter.filter.shopCategory;
        brandName.value = productFilter.filterSelected.brand;
        if (filterParams.cat) {
            const tree = await getCategoryTree(filterParams.cat);
            categoryTree.value = tree;
        }
        if (filterParams.shopCategoryId) {
            const shopTree = await getShopCategoryTree(filterParams.shopCategoryId);
            shopCategoryList.value = shopTree;
        }
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};
const tabIndex = ref("default");
const tabList = ref([
    {
        label: "默认",
        value: "default"
    },
    {
        label: "销量",
        value: "sale"
    },
    {
        label: "价格",
        value: "price",
        order: "desc"
    }
]);
const onChangeTab = (item: any) => {
    if (item.value == "price") {
        item.order = item.order === "desc" ? "asc" : "desc";
    } else {
        item.order = "";
    }
    tabIndex.value = item.value;
    filterParams.sort = item.value;
    filterParams.order = item.order;
    loadFilter();
    resetList();
    getList(() => {
        return (filterParams.brand = brandIds.value.join(","));
    });
};

const del = (type: string) => {
    switch (type) {
        case "brand":
            brandIds.value = [];
            brandName.value = "";
            break;
        case "price":
            filterParams.min = "";
            filterParams.max = "";
            break;
        case "keyword":
            filterParams.keyword = "";
            break;
        case "intro":
            filterParams.intro = "";
            break;
        case "couponInfo":
            couponInfo.value = {};
            filterParams.couponId = 0;
            break;
    }
    loadFilter();
    resetList();
    getList(() => {
        return { brand: brandIds.value.join(",") };
    });
};
const delCategory = (index: number) => {
    if (index > 0) {
        if (filterParams.shopCategoryId) {
            filterParams.shopCategoryId = shopCategoryList.value[index - 1].categoryId;
        } else {
            filterParams.cat = categoryTree.value[index - 1].categoryId;
        }
    } else {
        if (filterParams.shopCategoryId) {
            filterParams.shopCategoryId = 0;
        } else {
            filterParams.cat = 0;
        }
    }
    loadFilter();
    resetList();
    getList(() => {
        return { brand: brandIds.value.join(",") };
    });
};

const showDrawerRef = ref<boolean>(false);
// 打开窗口
const showDrawer = () => {
    showDrawerRef.value = true;
    // 重置滚动距离
    scrollDistance = 0;
    lastScrollTop = 0;
};
// 关闭窗口
const closeDrawer = () => {
    showDrawerRef.value = false;
};

// 点击页面其他区域关闭筛选弹框
const handlePageClick = () => {
    if (showDrawerRef.value) {
        closeDrawer();
    }
};



const toSearch = () => {
    uni.redirectTo({
        url: "/pages/search/index?shopId=" + filterParams.shopId
    });
};
const couponInfo = ref<any>({});
onLoad((option: any) => {
    console.log(option, "123123");

    if (option) {
        if (option.keyWords) {
            filterParams.keyword = option.keyWords;
        }
        if (option.intro) {
            filterParams.intro = option.intro;
        }
        if (option.categoryId) {
            filterParams.cat = option.categoryId;
        }
        if (option.brandId) {
            brandIds.value.push(option.brandId);
        }
        if (option.shopId) {
            filterParams.shopId = option.shopId;
            navbarTitle.value = "店铺商品搜索";
        }
        if (option.shopCategoryId) {
            filterParams.shopCategoryId = option.shopCategoryId;
        }
        if (option.couponInfo) {
            couponInfo.value = JSON.parse(decodeURIComponent(option.couponInfo));
            filterParams.couponId = couponInfo.value.couponId;
        }
    }
    loadFilter();
    getList(() => {
        return { brand: brandIds.value.join(",") };
    });
});

// 页面滚动监听 - 记录滚动位置
let lastScrollTop = 0;
let scrollDistance = 0;

// 页面滚动时关闭筛选弹窗
onPageScroll((e: any) => {
    if (showDrawerRef.value) {
        const currentScrollTop = e.scrollTop;
        const deltaY = Math.abs(currentScrollTop - lastScrollTop);

        // 累计滚动距离
        scrollDistance += deltaY;

        if (scrollDistance > 40) {
            closeDrawer();
            scrollDistance = 0; // 重置滚动距离
        }

        lastScrollTop = currentScrollTop;
    } else {
        // 弹窗关闭时重置滚动距离
        scrollDistance = 0;
        lastScrollTop = 0;
    }
});




const categoryShow = ref<boolean>(true);
const brandShow = ref<boolean>(true);

const onChangeBrand = (item: any) => {
    let index = brandIds.value.indexOf(item.brandId);
    if (index !== -1) {
        brandIds.value.splice(index, 1);
    } else {
        brandIds.value.push(item.brandId);
    }
};
const submit = () => {
    if (Number(filterParams.min) > Number(filterParams.max)) {
        uni.showToast({
            title: t("最低价不能大于最高价"),
            icon: "none"
        });
        return;
    }

    loadFilter();
    closeDrawer();
    resetList();
    getList(() => {
        return { brand: brandIds.value.join(",") };
    });
};
const reset = () => {
    filterParams.min = "";
    filterParams.max = "";
    brandIds.value = [];
    filterParams.cat = 0;
};

const resetList = () => {
    total.value = 0;
    filterParams.page = 1;
    filterParams.intro = "";
    productList.value = [];
    promotionList.value = {};
};

const handleBack = () => {
    uni.navigateBack();
};

const handleRefresh = () => {
    // 刷新搜索结果
    resetList();
    getList(() => {
        return { brand: brandIds.value.join(",") };
    });
};
</script>

<style lang="scss" scoped>
.search-result-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    position: relative;
}

.pageMain {
    background-color: #f5f5f5;
}

/* 自定义导航栏样式 - 与index页面保持一致 */
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
        font-size: 45rpx;
        color: #999;
    }

    .search-text {
        flex: 1;
        font-size: 28rpx;
        color: #333;
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
}</style>

<style lang="scss" scoped>

.tab-box {
    padding-top: 10rpx;
    background-color: #fff;
    .item {
        width: 100%;
        margin: 30rpx 0;
        flex: 1;
        color: #333;
        font-size: 30rpx;
        align-items: center;
        justify-content: center;
        .price-ico-box {
            margin-left: 12rpx;
            gap: 5rpx;
            .price-icon {
                width: 12rpx;
                height: 12rpx;
            }
        }
        .sanjiaoright {
            color: $tig-color-grey !important;
            margin-left: 10rpx;
        }
    }
    .active {
        color: #414BB8;
        font-weight: bold;
    }
}
.tag-row {
    background-color: #fff;
    padding: 0rpx 30rpx 10rpx 30rpx;
    .tag-list {
        .tag-item {
            display: flex;
            align-items: center;
            padding: 8rpx 15rpx;
            text-align: center;
            color: #232326;
            background-color: #f7f7f7;
            border-radius: 27px;
            border: solid 1px #f0f2f5;
            font-size: 24rpx;
            vertical-align: middle;
            margin-bottom: 20rpx;
            text {
                margin: 0 5rpx;
            }

            // 搜索关键词标签特殊样式 - 更大更突出
            &:first-child {
                padding: 12rpx 20rpx;
                font-size: 30rpx;
                background-color: #F7F7F7;
                color: #252525;
                border-color: #F7F7F7;

                text {
                    font-size: 30rpx;
                }

            }
        }
        .mr10 {
            margin-right: 10rpx;
        }
        .tag-interval {
            margin: 0 10rpx;
            margin-bottom: 20rpx;
            font-size: 18rpx;
        }
    }
}
/* 筛选下拉框样式 */
.filter-dropdown {
    position: fixed;
    //top: 163px; /* 筛选按钮下方 */
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 30rpx;
    max-height: calc(100vh - 200rpx);
    overflow-y: auto;
    animation: slideDown 0.25s ease-out;
    z-index: 9999;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.filter-section {
        margin-bottom: 50rpx;

        .section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 24rpx;
            margin-bottom: 30rpx;

            text {
                font-size: 36rpx;
                font-weight: 600;
                color: #333;
            }

            .expand-btn {
                padding: 10rpx;
                opacity: 0.6;
            }
        }

        .filter-options {
            display: flex;
            flex-wrap: wrap;
            gap: 24rpx;

            .filter-option {
                padding: 20rpx 32rpx;
                background-color: #f8f8f8;
                border-radius: 60rpx;
                font-size: 30rpx;
                color: #666;
                border: 2rpx solid transparent;
                transition: all 0.25s ease;
                min-width: 120rpx;
                text-align: center;

                &.active {
                    background-color: #e8ebff;
                    color: #414BB8;
                    border-color: #414BB8;
                    font-weight: 600;
                }

                &:active {
                    transform: scale(0.95);
                }
            }
        }

        .price-range {
            display: flex;
            align-items: center;
            gap: 30rpx;

            .price-input {
                flex: 1;
                height: 88rpx;
                background-color: #f8f8f8;
                border-radius: 16rpx;
                padding: 0 24rpx;
                font-size: 30rpx;
                color: #333;
                text-align: center;
                border: 2rpx solid transparent;
                transition: all 0.25s ease;

                &:focus {
                    border-color: #414BB8;
                    background-color: #fff;
                    box-shadow: 0 0 0 4rpx rgba(65, 75, 184, 0.1);
                }

                &::placeholder {
                    color: #999;
                    font-size: 28rpx;
                }
            }

            .price-separator {
                font-size: 32rpx;
                color: #999;
                font-weight: bold;
                width: 40rpx;
                text-align: center;
            }
        }
    }

    .filter-actions {
        display: flex;
        gap: 30rpx;
        padding: 40rpx 0 20rpx;
        border-top: 1rpx solid #f0f0f0;
        margin-top: 30rpx;

        .action-btn {
            flex: 1;
            height: 96rpx;
            border-radius: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34rpx;
            font-weight: 600;
            transition: all 0.25s ease;

            &.reset-btn {
                background-color: #f8f8f8;
                color: #666;
                border: 2rpx solid #e8e8e8;

                &:active {
                    background-color: #f0f0f0;
                    transform: scale(0.98);
                }
            }

            &.confirm-btn {
                background-color: #414BB8;
                color: #fff;
                box-shadow: 0 4rpx 16rpx rgba(65, 75, 184, 0.3);

                &:active {
                    background-color: #3a42a6;
                    transform: scale(0.98);
                }
            }
        }
    }

.pageMain {
}

.goods-container {
    padding: 20rpx;
    background-color: #f5f5f5;
    min-height: 200rpx;

    :deep(.masonry) {
        display: flex;
        gap: 20rpx;

        .masonry-item {
            flex: 1;

            .item-li {
                background-color: #fff;
                border-radius: 10rpx;
                margin-bottom: 20rpx;
                overflow: hidden;

                .photo {
                    position: relative;

                    image {
                        width: 100%;
                        display: block;
                    }
                }

                .info {
                    padding: 20rpx;

                    .detail {
                        font-size: 28rpx;
                        color: #333;
                        line-height: 1.4;
                        margin-bottom: 10rpx;
                    }

                    .action {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-top: 10rpx;

                        .pricenum {
                            flex: 1;
                        }
                    }
                }
            }
        }
    }
}
.sousuo {
    color: $tig-color-grey !important;
}
</style>

<style>
page {
    background-color: #f5f5f5 !important;
}
</style>
