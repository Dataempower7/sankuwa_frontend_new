<template>
    <view class="new-category-page">
        <!-- 顶部搜索栏 -->
        <view class="search-header">
            <view class="search-container">
                <view class="search-box" @click="toSearch">
                    <text class="iconfont-h5 icon-sousuo search-icon" />
                    <text class="search-placeholder">{{ $t("点击搜索商品") }}</text>
                </view>
                <view class="location-icon">
                    <text class="iconfont-h5 icon-weizhi" />
                </view>
            </view>
        </view>

        <!-- 一级分类圆形图标横向滚动 -->
        <view class="top-categories">
            <scroll-view scroll-x class="category-scroll">
                <view class="category-items">
                    <view 
                        v-for="(item, index) in firstLevelCategories" 
                        :key="index"
                        class="category-item"
                        :class="{ active: selectedFirstCategoryId === item.categoryId }"
                        @click="selectFirstCategory(item)"
                    >
                        <view class="category-icon">
                            <tig-image :src="item.categoryPic || defaultCategoryIcon" mode="aspectFill" />
                        </view>
                        <text class="category-name">{{ item.categoryName }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 主要内容区域 -->
        <view class="main-content" :style="{ height: contentHeight }">
            <!-- 左侧二级分类菜单 -->
            <view class="left-menu">
                <scroll-view scroll-y class="menu-scroll">
                    <!-- <view class="menu-header">SANKUWA</view> -->
                    <view 
                        v-for="(category, index) in secondLevelCategories" 
                        :key="index"
                        class="menu-item"
                        :class="{ active: selectedSecondCategoryId === category.categoryId }"
                        @click="selectSecondCategory(category)"
                    >
                        {{ category.categoryName }}
                    </view>
                </scroll-view>
            </view>

            <!-- 右侧内容区域 -->
            <view class="right-content">
                <!-- 三级分类筛选标签 -->
                <!-- Debug: 三级分类数量: {{ thirdLevelCategories.length }}, 选中ID: {{ selectedThirdCategoryId }} -->
                <view v-if="thirdLevelCategories.length > 0" class="filter-tabs">
                    <scroll-view 
                        scroll-x 
                        class="tabs-scroll" 
                        :show-scrollbar="false"
                        :scroll-with-animation="true"
                        :enhanced="true"
                    >
                        <view class="tabs-container">
                            <view 
                                v-for="(tab, index) in thirdLevelCategories" 
                                :key="`third-${tab.categoryId}-${index}`"
                                class="tab-item"
                                :class="{ active: selectedThirdCategoryId === tab.categoryId }"
                                @click="selectThirdCategory(tab)"
                            >
                                {{ tab.categoryName }}
                            </view>
                        </view>
                    </scroll-view>
                </view>

                <!-- 产品排序选项 -->
                <view class="sort-options">
                    <view class="sort-container">
                        <view 
                            v-for="(option, index) in sortOptions" 
                            :key="index"
                            class="sort-item"
                            :class="{ active: selectedSort === option.value }"
                            @click="selectSort(option.value)"
                        >
                            {{ option.label }}
                            <view v-if="option.value === 'price'" class="price-ico-box flex flex-column">
                                <image
                                    :src="selectedSort === 'price' && sortOrder === 'asc' ? '/static/images/search/top_l.png' : '/static/images/search/top.png'"
                                    class="price-icon"
                                />
                                <image
                                    :src="selectedSort === 'price' && sortOrder === 'desc' ? '/static/images/search/down_l.png' : '/static/images/search/down.png'"
                                    class="price-icon"
                                />
                            </view>
                        </view>
                        
                        <!-- 列表切换图标 -->
                        <view class="list-toggle-icon" @click="toggleListViewMode">
                            <image 
                                v-if="listViewMode === 'double'" 
                                src="/static/images/category/oneList.png" 
                                mode="aspectFit"
                                class="toggle-icon"
                            />
                            <image 
                                v-else 
                                src="/static/images/category/twoList.png" 
                                mode="aspectFit"
                                class="toggle-icon"
                            />
                        </view>
                    </view>
                </view>

                <!-- 产品列表 -->
                <view class="product-list">
                    <scroll-view 
                        scroll-y 
                        class="product-scroll" 
                        @scrolltolower="loadMoreProducts"
                        :enhanced="true"
                        :show-scrollbar="false"
                        :enable-back-to-top="true"
                        :scroll-with-animation="true"
                    >
                        <view v-if="loading && productList.length === 0" class="loading-container">
                            <up-loading-icon mode="circle" />
                        </view>
                        
                        <view v-else-if="productList.length === 0" class="empty-container">
                            <up-empty :icon="staticResource('salesman/no_order.png')" :text="$t('暂无商品')" />
                        </view>
                        
                        <view v-else class="products-grid" :class="{ 'single-column': listViewMode === 'single' }">
                            <view 
                                v-for="(product, index) in productList" 
                                :key="index"
                                class="product-card"
                                :class="{ 'single-card': listViewMode === 'single' }"
                                @click="toProductDetail(product.productId!)"
                            >
                                <view class="product-image">
                                    <tig-image :src="product.picThumb" mode="aspectFill" />
                                    <!-- 缺货/下架状态 -->
                                    <view v-if="product.productStock === 0 || product.productStatus === 0" class="product-status">
                                        <text class="status-text">{{ product.productStock === 0 ? $t("已售罄") : $t("已下架") }}</text>
                                    </view>
                                </view>
                                
                                <view class="product-info">
                                    <text class="product-title line2">{{ product.productName }}</text>
                                    
                                    <view class="price-container">
                                        <view class="current-price">
                                            <format-price
                                                :decimals-style="{ fontSize: '20rpx', fontWeight: 'bold', color: '#d1a671' }"
                                                :currency-style="{ fontSize: '20rpx', fontWeight: 'bold', color: '#d1a671' }"
                                                :font-style="{ fontSize: '28rpx', fontWeight: 'bold', color: '#d1a671' }"   
                                                :price-data="product.productPrice"
                                            />
                                        </view>
                                        
                                        <!-- <view v-if="product.marketPrice && product.marketPrice > (product.productPrice || 0)" class="original-price">
                                            <format-price
                                                :font-style="{ fontSize: '22rpx', color: '#999', textDecoration: 'line-through' }"
                                                :price-data="product.marketPrice"
                                            />
                                        </view> -->
                                        
                                        <!-- <view v-if="product.marketPrice && product.productPrice && product.marketPrice > product.productPrice" class="discount-badge">
                                            {{ Math.round((product.productPrice / product.marketPrice) * 10) }}折
                                        </view> -->
                                    </view>
                                    
                                    <view class="add-to-cart" @click.stop="addToCart(product)">
                                        <template v-if="(product as any).isLoading">
                                            <up-loading-icon mode="circle" size="24" />
                                        </template>
                                        <template v-else>
                                            <image 
                                                src="/static/images/category/addProduct.png" 
                                                mode="aspectFit"
                                                class="cart-icon"
                                            />
                                        </template>
                                    </view>
                                </view>
                            </view>
                        </view>
                        
                        <!-- 加载更多 -->
                        <view v-if="hasMore && !loading" class="load-more">
                            <up-loading-icon mode="circle" />
                            <text class="load-text">{{ $t("加载中...") }}</text>
                        </view>
                    </scroll-view>
                </view>
            </view>
        </view>
        
        <!-- 商品规格选择弹窗 -->
        <specification 
            ref="specificationRef" 
            v-model="currentProductId" 
            @add-card-succeed="onAddCartSuccess" 
            @load-end="onSpecLoadEnd" 
            @close="onSpecClose" 
        />
    </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { getCategoryAll, getCategoryHot } from "@/api/productCate/productCate";
import { getCateProduct } from "@/api/home/home";
import { staticResource, redirect } from "@/utils";
import type { filterSeleted } from "@/types/productCate/productCate";
import type { GetProductFilterResult } from "@/types/home/home";
import specification from "@/components/product/specification.vue";

// Props
const props = defineProps({
    height: {
        type: [Number, String],
        default: 0
    }
});

// Models
const catId = defineModel("catId", {
    type: Number,
    default: 0
});

// 数据状态
const loading = ref(false);
const firstLevelCategories = ref<filterSeleted[]>([]); // 一级分类（顶部圆形图标）
const secondLevelCategories = ref<filterSeleted[]>([]); // 二级分类（左侧菜单）
const thirdLevelCategories = ref<filterSeleted[]>([]); // 三级分类（筛选条件上方）
const productList = ref<GetProductFilterResult[]>([]);
const hasMore = ref(true);
const selectedFirstCategoryId = ref(0); // 选中的一级分类
const selectedSecondCategoryId = ref(0); // 选中的二级分类  
const selectedThirdCategoryId = ref(0); // 选中的三级分类
const selectedSort = ref('');
const sortOrder = ref('desc');
const listViewMode = ref('double'); // 列表显示模式：'single' 单列，'double' 双列

// 规格选择相关状态
const currentProductId = ref(0);
const specificationRef = ref();
const currentProduct = ref<GetProductFilterResult>();

// 默认分类图标
const defaultCategoryIcon = staticResource('common/empty-img-bg3.png');

// 排序选项
const sortOptions = [
    { label: '综合', value: '' },
    { label: '热销', value: 'isHot' },
    { label: '新品', value: 'isNew' },
    { label: '价格', value: 'price' }
];

// 请求参数
const params = reactive({
    categoryId: 0, // 最终的分类ID（可能是一级、二级或三级）
    page: 1,
    size: 20,
    sort: '',
    order: 'desc',
    sortField: '', // 添加后端期望的排序字段
    sortOrder: 'desc', // 添加后端期望的排序顺序
});

// 计算属性
const contentHeight = computed(() => {
    return `calc(${props.height} - 200rpx)`;
});

// 删除了productListHeight计算，现在使用flex布局自动分配高度

// 方法
const toSearch = () => {
    redirect({ url: "/pages/search/index" });
};

// 选择一级分类
const selectFirstCategory = async (category: filterSeleted) => {
    selectedFirstCategoryId.value = category.categoryId;
    selectedSecondCategoryId.value = 0;
    selectedThirdCategoryId.value = 0;
    
    // 加载二级分类
    await loadSecondCategories(category.categoryId);
    
    // 重置产品列表，使用当前有效的分类ID
    if (selectedSecondCategoryId.value > 0) {
        params.categoryId = selectedSecondCategoryId.value;
    } else {
        params.categoryId = category.categoryId;
    }
    resetProducts();
};

// 选择二级分类
const selectSecondCategory = async (category: filterSeleted) => {
    selectedSecondCategoryId.value = category.categoryId;
    selectedThirdCategoryId.value = 0;
    
    // 加载三级分类
    await loadThirdCategories(category.categoryId);
    // 重置产品列表，使用二级分类ID
    params.categoryId = category.categoryId;
    resetProducts();
};

// 选择三级分类
const selectThirdCategory = (tab: filterSeleted) => {
    selectedThirdCategoryId.value = tab.categoryId;
    
    // 如果选择的是"全部"（categoryId为0），则使用当前二级分类ID
    if (tab.categoryId === 0) {
        params.categoryId = selectedSecondCategoryId.value;
    } else {
        // 否则使用三级分类ID
        params.categoryId = tab.categoryId;
    }
    
    resetProducts();
};

const selectSort = (sortValue: string) => {
    if (sortValue === 'price') {
        // 如果当前已经选中价格排序，则切换排序顺序
        if (selectedSort.value === 'price') {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            // 如果是第一次点击价格，默认从低到高排序
            sortOrder.value = 'asc';
        }
    } else {
        // 选择其他排序时，重置为默认排序顺序
        sortOrder.value = 'desc';
    }
    
    selectedSort.value = sortValue;
    
    // 设置排序参数
    params.sort = sortValue;
    params.order = sortOrder.value;
    
    // 价格排序需要设置 sortField 参数
    if (sortValue === 'price') {
        params.sortField = 'product_price';
    } else {
        params.sortField = '';
    }
    params.sortOrder = sortOrder.value;
    
    console.log('排序参数:', { 
        sort: params.sort, 
        order: params.order,
        sortField: params.sortField, 
        sortOrder: params.sortOrder 
    });
    resetProducts();
};

// 切换列表显示模式
const toggleListViewMode = () => {
    listViewMode.value = listViewMode.value === 'double' ? 'single' : 'double';
    console.log('切换列表模式为:', listViewMode.value);
};

const resetProducts = () => {
    productList.value = [];
    params.page = 1;
    hasMore.value = true;
    loadProducts();
};

const loadProducts = async () => {
    if (loading.value) return;
    
    loading.value = true;
    try {
        const result = await getCateProduct(params);
        
        if (params.page === 1) {
            productList.value = result.records || [];
        } else {
            productList.value.push(...(result.records || []));
        }
        
        hasMore.value = (result.records?.length || 0) >= params.size;
    } catch (error) {
        console.error('加载产品失败:', error);
    } finally {
        loading.value = false;
    }
};

const loadMoreProducts = () => {
    if (!hasMore.value || loading.value) return;
    
    params.page += 1;
    loadProducts();
};

// 加载二级分类
const loadSecondCategories = async (firstCategoryId: number) => {
    try {
        // 从一级分类中查找子分类
        const firstCategory = firstLevelCategories.value.find(cat => cat.categoryId === firstCategoryId);
        
        if (firstCategory && firstCategory.children && firstCategory.children.length > 0) {
            secondLevelCategories.value = firstCategory.children;
            
            // 默认选中第一个二级分类
            const firstSecond = secondLevelCategories.value[0];
            selectedSecondCategoryId.value = firstSecond.categoryId;
            
            // 加载三级分类并等待完成
            await loadThirdCategories(firstSecond.categoryId);
            
            // 确保三级分类加载完成后再设置查询参数
            params.categoryId = firstSecond.categoryId;
        } else {
            // 如果没有子分类，直接使用一级分类
            secondLevelCategories.value = [];
            thirdLevelCategories.value = [];
            params.categoryId = firstCategoryId;
        }
    } catch (error) {
        console.error('加载二级分类失败:', error);
        secondLevelCategories.value = [];
        thirdLevelCategories.value = [];
    }
};

// 加载三级分类
const loadThirdCategories = async (secondCategoryId: number) => {
    try {
        // 从二级分类中查找子分类
        const secondCategory = secondLevelCategories.value.find(cat => cat.categoryId === secondCategoryId);
        
        // 始终显示"全部"选项
        const allOption = { categoryId: 0, categoryName: '全部', categoryDesc: '', nparentId: secondCategoryId };
        
        if (secondCategory && secondCategory.children && secondCategory.children.length > 0) {
            thirdLevelCategories.value = [
                allOption,
                ...secondCategory.children
            ];
        } else {
            // 如果没有三级分类，只显示"全部"
            thirdLevelCategories.value = [allOption];
        }
        
        // 默认选中"全部"
        selectedThirdCategoryId.value = 0;
        
    } catch (error) {
        console.error('加载三级分类失败:', error);
        thirdLevelCategories.value = [
            { categoryId: 0, categoryName: '全部', categoryDesc: '', nparentId: secondCategoryId }
        ];
        selectedThirdCategoryId.value = 0;
    }
};

const toProductDetail = (productId: number) => {
    redirect({ url: `/pages/product/index?id=${productId}` });
};

const addToCart = (product: GetProductFilterResult) => {
    if ((product as any).isLoading) return;
    
    // 设置当前商品信息
    currentProduct.value = product;
    currentProductId.value = product.productId || 0;
    (product as any).isLoading = true;
    
    // 触发规格选择弹窗
    // 注意：specification组件会在loadEnd事件中自动显示弹窗
};

// 规格组件加载完成
const onSpecLoadEnd = () => {
    if (specificationRef.value && currentProductId.value > 0) {
        specificationRef.value.handleShowPopup();
    }
    // 重置加载状态
    if (currentProduct.value) {
        (currentProduct.value as any).isLoading = false;
    }
};

// 成功添加到购物车
const onAddCartSuccess = () => {
    uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
    });
};

// 关闭规格选择弹窗
const onSpecClose = () => {
    currentProductId.value = 0;
    currentProduct.value = undefined;
};

// 初始化数据
const initData = async () => {
    try {
        // 加载所有分类（作为一级分类）
        const allCategories = await getCategoryAll();

        firstLevelCategories.value = allCategories || [];

        if (firstLevelCategories.value.length === 0) {
            console.warn('没有获取到分类数据');
            uni.showToast({
                title: '暂无分类数据',
                icon: 'none'
            });
            return;
        }

        // 检查是否有传入的分类ID
        let targetCategory = null;
        if (catId.value > 0) {
            // 查找传入的分类ID对应的分类
            targetCategory = firstLevelCategories.value.find(cat => cat.categoryId === catId.value);
        }

        // 如果没有找到传入的分类或没有传入分类ID，则使用第一个分类
        if (!targetCategory) {
            targetCategory = firstLevelCategories.value[0];
        }

        selectedFirstCategoryId.value = targetCategory.categoryId;

        // 加载二级分类
        await loadSecondCategories(targetCategory.categoryId);

        // 设置产品查询参数
        if (selectedSecondCategoryId.value > 0) {
            params.categoryId = selectedSecondCategoryId.value;
        } else {
            params.categoryId = targetCategory.categoryId;
        }

        // 加载产品
        loadProducts();
    } catch (error) {
        console.error('初始化数据失败:', error);
        uni.showToast({
            title: '加载分类失败，请稍后重试',
            icon: 'error'
        });
    }
};

// 监听 catId 变化
watch(catId, (newCatId) => {
    if (newCatId > 0 && firstLevelCategories.value.length > 0) {
        // 查找对应的分类并切换
        const targetCategory = firstLevelCategories.value.find(cat => cat.categoryId === newCatId);
        if (targetCategory) {
            selectFirstCategory(targetCategory);
        }
    }
}, { immediate: false });

// 组件挂载时初始化
onMounted(() => {
    initData();
});
</script>

<style lang="scss" scoped>
.new-category-page {
   // height: 100vh;
    background-color: #ffffff;
    padding-top: 43px;
}

.search-header {
    background-color: #fff;
    padding: 20rpx 135rpx 22rpx 30rpx;
    
    .search-container {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .search-box {
            flex: 1;
            height: 75rpx;
            background-color: #f5f5f5;
            border-radius: 35rpx;
            display: flex;
            align-items: center;
            padding: 0 30rpx;
            gap: 15rpx;
            
            .search-icon {
                font-size: 32rpx;
                color: #999;
            }
            
            .search-placeholder {
                font-size: 28rpx;
                color: #999;
            }
        }
        
        .location-icon {
            width: 70rpx;
            height: 70rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .iconfont-h5 {
                font-size: 40rpx;
                color: #333;
            }
        }
    }
}

.top-categories {
    background: linear-gradient(to top, #F8F8FF 0%, #ffffff 100%);
    padding: 30rpx 0;
    
    .category-scroll {
        white-space: nowrap;
        
        .category-items {
            display: flex;
            gap: 40rpx;
            padding: 0 30rpx;
            
                            .category-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15rpx;
                    
                    .category-icon {
                        width: 100rpx;
                        height: 100rpx;
                        border-radius: 50%;
                        overflow: hidden;
                        background-color: #f5f5f5;
                        transition: all 0.3s ease;
                    }
                    
                    .category-name {
                        font-size: 24rpx;
                        color: #333;
                        text-align: center;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                    }
                    
                    &.active {
                        .category-icon {
                            border: 3rpx solid #3A41BC;
                            box-shadow: 0 0 10rpx rgba(58, 65, 188, 0.3);
                        }
                        
                        .category-name {
                            color: #3A41BC;
                            font-weight: bold;
                        }
                    }
                }
        }
    }
}

.main-content {
    display: flex;
    background-color: #fff;
    flex: 1; // 占据剩余空间
    min-height: 0; // 允许flex收缩
    width: 100%;
}

.left-menu {
    width: 180rpx;
    min-width: 180rpx; // 确保最小宽度
    max-width: 180rpx; // 确保最大宽度
    background-color: #f5f5f5;
    border-right: 10rpx solid #ffffff;
    flex-shrink: 0; // 防止被压缩
    
    .menu-scroll {
        height: 100%;
        width: 100%;
        overflow-x: hidden; // 防止横向溢出
        
        // .menu-header {
        //     padding: 30rpx 20rpx;
        //     font-size: 28rpx;
        //     font-weight: bold;
        //     color: #333;
        //     text-align: center;
        //     border-bottom: 1rpx solid #e9ecef;
        // }
        
        .menu-item {
            padding: 25rpx 20rpx;
            font-size: 28rpx;
            color: #666;
            text-align: center;
            border-bottom: 0rpx solid #ffffff;
            width: 100%;
            box-sizing: border-box;
            
            &.active {
                background-color: #fff;
                color: #000000;
                font-weight: bold;
                position: relative;
                
                &::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 6rpx;
                    background-color: #3A41BC;
                }
            }
        }
    }
}

.right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; // 重要：允许flex子项收缩
    min-height: 0; // 允许高度收缩
}

.filter-tabs {
    padding: 20rpx 0 20rpx 30rpx; // 右侧不加padding，让滚动区域延伸到边缘
    flex-shrink: 0; // 防止被挤压
    width: 100%; // 明确指定宽度
    box-sizing: border-box;
    overflow: hidden; // 确保不会溢出
    
    .tabs-scroll {
        width: 100%;
        height: 60rpx; // 固定高度
        margin-top: 4px;
        
        .tabs-container {
            display: flex; // 使用flex布局
            align-items: center;
            gap: 30rpx;
            padding: 0 30rpx 13px 0rpx;
            height: 100%;
            width: max-content; // 宽度适应内容，支持滚动
            
            .tab-item {
                padding: 12rpx 24rpx;
                font-size: 28rpx;
                color: #424242;
                border-radius: 20rpx;
                white-space: nowrap;
                flex-shrink: 0;
                height: 36rpx;
                line-height: 36rpx;
                display: flex;
                align-items: center;
                background-color: #f1f1f1;
                
                &.active {
                    background-color: #EDEEFE;
                    color: #3347b9;
                    font-weight: 600;
                }
            }
        }
    }
}

.sort-options {
    padding: 20rpx 30rpx;
    flex-shrink: 0; // 防止被挤压
    
    .sort-container {
        display: flex;
        gap: 65rpx;
        margin-left: 15rpx;
        margin-top: -15rpx;
        align-items: center;
        justify-content: flex-start;
        
        .sort-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            font-size: 26rpx;
            color: #666;
            position: relative;
            white-space: nowrap; // 防止换行
            
            &.active {
                color: #3347B9;
                font-weight: bold;
            }
            
            .price-ico-box {
                margin-left: 12rpx;
                gap: 5rpx;

                .price-icon {
                    width: 12rpx;
                    height: 12rpx;
                }
            }
        }
        
        .list-toggle-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: -20rpx;
            
            .toggle-icon {
                width: 40rpx;
                height: 40rpx;
                transition: opacity 0.3s;
                
                &:active {
                    opacity: 0.7;
                }
            }
        }
    }
}

.product-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 重要：允许flex子项收缩
    
    .product-scroll {
        flex: 1;
        padding: 15rpx 0;
        min-height: 0; // 允许滚动容器收缩
    }
    
    .loading-container,
    .empty-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 400rpx;
        flex-direction: column;
        gap: 20rpx;
    }
    
    .products-grid {
        padding: 0 20rpx; // 添加左右间距，防止被遮挡
        
        // 双列布局 (默认)
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 25rpx;
        
        // 单列布局
        &.single-column {
            grid-template-columns: 1fr;
            gap: 25rpx;
        }
        
        .product-card {
            background-color: #fff;
            border-radius: 33rpx;
            overflow: hidden;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
            border: 1rpx solid #f0f0f0;
            transition: box-shadow 0.3s ease;
            
            &:active {
                box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
            }
            
            // 单列卡片样式
            &.single-card {
                display: flex;
                flex-direction: row;
                height: 180rpx;
                
                .product-image {
                    width: 170rpx;
                    height: 170rpx;
                    flex-shrink: 0;
                    border-radius: 22rpx;
                    overflow: hidden;
                    margin: 5rpx;
                    position: relative;
                    
                    :deep(img), :deep(image) {
                        border-radius: 22rpx;
                    }
                    
                    .product-status {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 22rpx;
                        
                        .status-text {
                            color: #fff;
                            font-size: 24rpx;
                            font-weight: bold;
                        }
                    }
                }
                
                .product-info {
                    flex: 1;
                    padding: 6rpx 20rpx 15rpx;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    background: #ffffff;
                    
                    .product-title {
                        font-size: 24rpx;
                        color: #2a3145;
                        margin-bottom: 10rpx;
                        height: 80rpx;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        line-height: 40rpx;
                        font-weight: bold;
                    }
                    
                    .price-container {
                        display: flex;
                        align-items: center;
                        gap: 8rpx;
                        margin-bottom: 8rpx;
                        flex-wrap: wrap;
                        
                        .current-price {
                            order: 1;
                        }
                        
                        .original-price {
                            order: 2;
                        }
                        
                        .discount-badge {
                            background-color: #ff6b6b;
                            color: #fff;
                            font-size: 18rpx;
                            padding: 2rpx 6rpx;
                            border-radius: 4rpx;
                            font-weight: bold;
                            order: 3;
                        }
                    }
                    
                    .add-to-cart {
                        position: absolute;
                        bottom: 15rpx;
                        right: 15rpx;
                        width: 50rpx;
                        height: 50rpx;
                        background-color: transparent;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        
                        .cart-icon {
                            width: 45rpx;
                            height: 45rpx;
                            margin-top: -15rpx;
                        }
                    }
                }
            }
            
            // 双列卡片样式 (默认)
            &:not(.single-card) {
                display: flex;
                flex-direction: column;
                
                .product-image {
                    position: relative;
                    width: calc(100% - 24rpx);
                    height: 280rpx;
                    border-radius: 22rpx;
                    overflow: hidden;
                    margin: 12rpx;
                    margin-bottom: 8rpx;
                    
                    :deep(img), :deep(image) {
                        border-radius: 22rpx;
                    }
                    
                    .product-status {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 22rpx;
                        
                        .status-text {
                            color: #fff;
                            font-size: 28rpx;
                            font-weight: bold;
                        }
                    }
                }
                
                .product-info {
                   padding: 0rpx 20rpx 0rpx;
                    position: relative;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                    
                    .product-title {
                        font-size: 24rpx;
                        color: #2a3145;
                        margin-bottom: 10rpx;
                        height: 80rpx;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        line-height: 40rpx;
                        font-weight: bold;
                    }
                    
                    .price-container {
                        display: flex;
                        align-items: center;
                        gap: 8rpx;
                        margin-bottom: 50rpx; // 增加底部间距给购物车按钮
                        flex-wrap: wrap;
                        
                        .current-price {
                            order: 1;
                        }
                        
                        .original-price {
                            order: 2;
                        }
                        
                        .discount-badge {
                            background-color: #ff6b6b;
                            color: #fff;
                            font-size: 18rpx;
                            padding: 2rpx 6rpx;
                            border-radius: 4rpx;
                            font-weight: bold;
                            order: 3;
                        }
                    }
                    
                    .add-to-cart {
                        position: absolute;
                        bottom: 45rpx;
                        right: 15rpx;
                        width: 50rpx;
                        height: 50rpx;
                        background-color: transparent;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        
                        .cart-icon {
                            width: 45rpx;
                            height: 45rpx;

                        }
                    }
                }
            }
        }
    }
    
    .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15rpx;
        padding: 40rpx 0;
        
        .load-text {
            font-size: 26rpx;
            color: #999;
        }
    }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
    .products-grid {
        grid-template-columns: 1fr;
        
        .product-card {
            .product-image {
                height: 400rpx;
            }
        }
    }
}
</style>
