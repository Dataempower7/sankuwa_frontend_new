<template>
    <view class="recommend_wrapper">
        <view class="title" :style="{ background: titleBg }">
            <view class="text">
                <view class="name">{{ $t("好物推荐") }}</view>
                <view class="desc">{{ $t("您还可以逛一逛") }}</view>
            </view>
        </view>
        
        <!-- 商品瀑布流 -->
        <view v-if="guessLike.length > 0" class="masonry-content">
            <masonry :commodity-list="guessLike" :promotion-list="promotionList" @callback="$emit('callback')" />
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="!isLoading && guessLike.length === 0" class="empty-wrapper">
            <text class="empty-text">暂无推荐商品</text>
        </view>
        
        <!-- 加载更多状态 -->
        <view class="load-more-wrapper">
            <uni-load-more :status="loadMoreStatus" />
        </view>
    </view>
</template>

<script setup lang="ts">
import masonry from "@/components/masonry/masonry.vue";
import { getCateProduct } from "@/api/home/home";
import { ref } from "vue";
import getPromotionList from "@/utils/getPromotionList";

defineProps({
    // 是否显示
    titleBg: {
        type: String,
        default: ""
    }
});

const emit = defineEmits(["callback"]);

// 商品列表数据
const guessLike = ref<any[]>([]);
const promotionList = ref<Record<string, any>>({});
const isLoading = ref(false);
const currentPage = ref(1);
const noMoreData = ref(false);
const pageSize = 12; // 每页12条数据

// 加载状态：loading(加载中) / more(可以加载更多) / noMore(没有更多了)
const loadMoreStatus = ref<'loading' | 'more' | 'noMore'>('more');

// 多重随机洗牌算法：更激进的打乱效果
const shuffleArray = <T>(array: T[]): T[] => {
    let newArray = [...array];
    
    // 第一步：分块打乱 - 将数组分成多个小块，每个块内部打乱
    const chunkSize = Math.ceil(newArray.length / 5); // 分成5块
    const chunks: T[][] = [];
    
    for (let i = 0; i < newArray.length; i += chunkSize) {
        const chunk = newArray.slice(i, i + chunkSize);
        // 对每个块进行Fisher-Yates洗牌
        for (let j = chunk.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [chunk[j], chunk[k]] = [chunk[k], chunk[j]];
        }
        chunks.push(chunk);
    }
    
    // 第二步：打乱块的顺序
    for (let i = chunks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
    }
    
    // 第三步：重新合并并再次整体洗牌
    newArray = chunks.flat();
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
};

// 加载商品数据 - 支持分页和追加
const loadProducts = async (append: boolean = false) => {
    // 如果正在加载或已经没有更多数据，则不继续加载
    if (isLoading.value || (noMoreData.value && append)) {
        return;
    }
    
    isLoading.value = true;
    loadMoreStatus.value = 'loading';
    
    try {
        const result = await getCateProduct({
            page: currentPage.value,
            size: pageSize,
        });
        
        
        if (result.records && result.records.length > 0) {
            // 打乱商品顺序，让每次加载的数据看起来都不一样
            const shuffledRecords = shuffleArray(result.records);
            
            if (append) {
                // 追加模式：将新数据添加到现有数据后面
                guessLike.value = [...guessLike.value, ...shuffledRecords];
            } else {
                // 替换模式：直接替换（首次加载）
                guessLike.value = shuffledRecords;
            }
            
            // 如果返回的数据少于请求的数量，说明没有更多数据了
            if (result.records.length < pageSize) {
                noMoreData.value = true;
                loadMoreStatus.value = 'noMore';
            } else {
                loadMoreStatus.value = 'more';
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
                // 合并促销信息
                promotionList.value = { ...promotionList.value, ...resPromotion };
            } catch (err) {
                console.error("获取促销信息失败:", err);
            }
        } else {
            console.warn('好物推荐：没有获取到商品数据');
            if (append) {
                noMoreData.value = true;
                loadMoreStatus.value = 'noMore';
            } else {
                guessLike.value = [];
                loadMoreStatus.value = 'noMore';
            }
        }
    } catch (error) {
        console.error("加载推荐商品失败:", error);
        if (!append) {
            guessLike.value = [];
        }
        loadMoreStatus.value = 'more';
    } finally {
        isLoading.value = false;
    }
};

// 加载更多 - 供外部调用
const loadMore = () => {
    if (!isLoading.value && !noMoreData.value) {
        currentPage.value++;
        loadProducts(true);
    }
};

// 暴露方法给父组件
defineExpose({
    loadMore
});

// 初始加载
loadProducts(false);
</script>

<style lang="scss" scoped>
.recommend_wrapper {
    margin-top: 20rpx;
}
.recommend_wrapper .title {
    padding: 20rpx;
}
.recommend_wrapper .title .text {
    font-size: 24rpx;
    color: #999;
}
.recommend_wrapper .title .text .name {
    color: #282828;
    font-size: 35rpx;
    font-weight: bold;
    margin-bottom: 5rpx;
    display: inline-block;
}
.recommend_wrapper .title .text .desc {
    display: inline-block;
    padding-left: 20rpx;
}

.masonry-content {
    padding: 0 20rpx;
}

.empty-wrapper {
    padding: 80rpx 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}

.load-more-wrapper {
    padding: 20rpx 0 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
