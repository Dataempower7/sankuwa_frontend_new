<template>
    <view v-if="guessLike.length" class="recommend_wrapper">
        <view class="title" :style="{ background: titleBg }">
            <view class="text">
                <view class="name">{{ $t("好物推荐") }}</view>
                <view class="desc">{{ $t("您还可以逛一逛") }}</view>
            </view>
        </view>
        <view class="masonry-content">
            <masonry :commodity-list="guessLike" :promotion-list="promotionList" @callback="$emit('callback')" />
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

defineEmits(["callback"]);

// 商品列表数据
const guessLike = ref<any[]>([]);
const promotionList = ref<Record<string, any>>({});
const isLoading = ref(false);

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

// 加载商品数据（只加载一次，16条数据）
const loadProducts = async () => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    try {
        const result = await getCateProduct({
            page: 1,
            size: 16, // 只获取16条数据
            // 不传categoryId，获取所有分类的商品
        });
        
        if (result.records && result.records.length > 0) {
            // 打乱商品顺序，让每次加载的数据看起来都不一样
            const shuffledRecords = shuffleArray(result.records);
            guessLike.value = shuffledRecords;
            
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
                promotionList.value = resPromotion;
            } catch (err) {
                console.error("获取促销信息失败:", err);
            }
        }
    } catch (error) {
        console.error("加载推荐商品失败:", error);
    } finally {
        isLoading.value = false;
    }
};

// 初始加载
loadProducts();
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
</style>
