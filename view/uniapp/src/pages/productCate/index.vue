<template>
    <tig-layout>
        <!-- 新的UI设计 - 默认使用新样式 -->
        <newStyleCate :height="height" v-model:cat-id="catId" />
        
        <!-- 保留原有样式作为备选 -->
        <template v-if="false">
            <template v-if="configStore.categoryDecorateType === 1">
                <styleOneCate v-model:cat-id="catId" />
            </template>
            <template v-if="configStore.categoryDecorateType === 2">
                <styleTwoCate :height="height" />
            </template>
            <template v-if="configStore.categoryDecorateType === 3">
                <styleThreeCate :height="height" />
            </template>
        </template>
    </tig-layout>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref, computed } from "vue";
import styleOneCate from "./styleOneCate.vue";
import styleTwoCate from "./styleTwoCate.vue";
import styleThreeCate from "./styleThreeCate.vue";
import newStyleCate from "./newStyleCate.vue";
import { useConfigStore } from "@/store/config";
import { useTabbarStore } from "@/store/tabbar";

const configStore = useConfigStore();

const tabbarStore = useTabbarStore();

const catId = ref(0);

onLoad((options) => {
    if (options && options.categoryId) {
        catId.value = parseInt(options.categoryId);
        console.log('分类页面接收到categoryId:', options.categoryId, '转换后:', catId.value);
    }
});

const height = computed(() => {
    return `calc(${configStore.windowInfo.screenHeight}px - var(${tabbarStore.currentActiveValue > -1 ? "--tabbar-height" : "--safe-bottom"}) - var(--nav-height))`;
});
</script>
<style>
/* 兼容小程序 */
page {
    background-color: #fff !important;
}
</style>
