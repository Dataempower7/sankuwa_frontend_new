<template>
    <iframe v-if="!isMobile && isClient" :src="h5Url" class="mobile-iframe" frameborder="0" allowfullscreen></iframe>
</template>

<script setup lang="ts">
import { useCommonStore } from "@/store/common";

definePageMeta({
    layout: false
});

const commonStore = useCommonStore();
const isClient = import.meta.client;

const h5Url = computed(() => {
    if (!isClient) return '';
    return commonStore.h5Domain ? commonStore.h5Domain : `${window.location.origin}/mobile`;
});

const isMobile = ref(false);

const handlerToMobile = () => {
    if (!isClient) return;
    window.location.href = h5Url.value;
};

const checkMobile = () => {
    if (!isClient) return false;
    
    const userAgent = navigator.userAgent;
    const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileDevice = mobileKeywords.test(userAgent);

    const isSmallScreen = window.innerWidth <= 768;

    return isMobileDevice || isSmallScreen;
};

const handleResize = () => {
    if (!isClient) return;
    
    const mobile = checkMobile();
    if (mobile && !isMobile.value) {
        handlerToMobile();
    }
    isMobile.value = mobile;
};

onMounted(() => {
    if (checkMobile()) {
        return handlerToMobile();
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
});
</script>

<style lang="less" scoped>
.mobile-iframe {
    display: block;
    margin: 0 auto;
    width: 100%;
    min-width: 300px;
    max-width: 460px;
    height: 100vh;
    box-sizing: border-box;
    overflow: visible;
}

// 移动端样式
@media (max-width: 768px) {
    .mobile-iframe {
        max-width: 100%;
        min-width: 100%;
    }
}
</style>
