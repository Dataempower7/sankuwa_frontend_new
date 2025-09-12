<template>
    <view :class="'module-ad-con module-store_info ad-store_style__' + module.style">
        <view v-if="module" class="module-ad-content" >
            <view class="cap-store-banner">
                <view class="cap-store-banner__cover" :style="backgroundStyle">
                    <view class="cap-store-banner__cover-mask" />
                </view>
                <view class="cap-store-nav-warp">
                    <view class="cap-store-nav-con">
                        <view class="store-search-con">
                            <view id="search" @click="toSearchTransferPage">
                                <text class="module_ico module-ico-sousuo" />
                                <input type="text" class="search-input" :placeholder="$t('点击搜索商品')" />
                            </view>
                        </view>
                        <view class="store-nav-con">
                            <view class="store-nav-item" :class="{ active: activeTab === 'featured' }" @click="setActiveTab('featured')">
                                <a class="store-nav-item-a">{{ $t("精选") }}</a>
                            </view>
                            <view class="nav-divider">|</view>
                            <view class="store-nav-item" :class="{ active: activeTab === 'products' }" @click="setActiveTab('products')">
                                <a class="store-nav-item-a" @click="toSearch">{{ $t("商品") }}</a>
                            </view>
                            <view class="nav-divider">|</view>
                            <view class="store-nav-item" :class="{ active: activeTab === 'category' }" @click="setActiveTab('category')">
                                <a class="store-nav-item-a" @click="toCategory">{{ $t("分类") }}</a>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="cap-store-banner__inner">
                    <view class="cap-store-banner__content">
                        <view class="cap-store-banner__logo">
                            <tig-image :src="shopInfo.shopLogo" mode="widthFix" />
                        </view>
                        <view class="cap-store-banner__right-content">
                            <view class="cap-store-banner__right-content-title--middle">{{ shopInfo.shopTitle }}</view>
                            <view class="cap-store-banner__sum-content">
                                <view class="cap-store-banner__sum-content-total">{{ $t("全部商品") }} {{ shopInfo.productCount }}</view>

                                <view class="cap-store-banner__sum-content-total">{{ $t("新品") }} {{ shopInfo.newProductCount }}</view>
                            </view>
                        </view>
                        <view class="store-collect-button-con" @click="handleShopCollection">
                            <view class="store-collect-button">{{ collectText }}</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { imageFormat } from "@/utils/format";
import type { ShopDetailItem } from "@/types/shop/shop";
import { shopCollection } from "@/api/shop/shop";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
    module: any;
    shopInfo: ShopDetailItem;
}
const props = defineProps<Props>();
const emit = defineEmits(["refreshShopDetail"]);

// Tab functionality
const activeTab = ref('featured');
const setActiveTab = (tab: string) => {
    activeTab.value = tab;
};

const imgList = computed(() => {
    let arr = [];
    for (let i = 1; i <= 10; i++) {
        arr.push(`https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/shopBackground.png`);
    }
    return arr;
});
const backgroundImg = computed(() => {
    let url;
    // 优先使用新的背景图片
    url = '/static/images/shop/shopBackground.png';
    
    // 如果有自定义背景，则使用自定义背景
    if (props.module.backgroundDefault == 0 && props.module.customPic?.picUrl) {
        url = imageFormat(props.module.customPic.picUrl);
    } else if (props.module.backgroundDefault > 0) {
        url = imgList.value[props.module.backgroundDefault - 1];
    }
    
    return url;
});

const backgroundStyle = computed(() => {
    let style: any = {};
    
    // 尝试使用自定义背景或预设背景
    if (props.module.backgroundDefault == 0 && props.module.customPic?.picUrl) {
        // 使用自定义背景
        style.backgroundImage = `url(${imageFormat(props.module.customPic.picUrl)})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
    } else if (props.module.backgroundDefault > 0 && imgList.value[props.module.backgroundDefault - 1]) {
        // 使用预设背景
        style.backgroundImage = `url(${imgList.value[props.module.backgroundDefault - 1]})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
    } else {
        // 使用渐变背景作为默认/后备方案，多种渐变效果可选
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 蓝紫渐变
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红渐变
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝色渐变
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿色渐变
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 粉黄渐变
        ];
        // 可以根据店铺ID或其他标识选择渐变，这里使用第一个作为默认
        style.background = gradients[0];
    }
    
    return style;
});

const collectText = computed(() => {
    return props.shopInfo.collectShop ? t("已关注") : t("+ 关注");
});

const handleShopCollection = () => {
    if (props.shopInfo.collectShop) {
        cancelCollect();
    } else {
        collect();
    }
};
const collect = async () => {
    try {
        const result = await shopCollection({ shopId: props.shopInfo.shopId });
        uni.showToast({
            title: t("关注成功")
        });
        emit("refreshShopDetail", props.shopInfo.shopId);
    } catch (error) {
        console.error(error);
    }
};
const cancelCollect = async () => {
    uni.showModal({
        title: t("提示"),
        content: t("确认要取消关注店铺吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    const result = await shopCollection({ shopId: props.shopInfo.shopId });
                    uni.showToast({
                        title: t("操作成功")
                    });
                    emit("refreshShopDetail", props.shopInfo.shopId);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    });
};

const toSearchTransferPage = () => {
    uni.navigateTo({
        url: `/pages/search/index?shopId=${props.shopInfo.shopId}`
    });
};

const toSearch = () => {
    uni.navigateTo({
        url: `/pages/search/result?&shopId=${props.shopInfo.shopId}`
    });
};

const toCategory = () => {
    uni.navigateTo({
        url: `/pages/shop/category?shopId=${props.shopInfo.shopId}`
    });
};
</script>
<style lang="scss" scoped>
/*店铺信息*/
.module-store_info {
    position: relative;
    font-size: 24rpx;
  //  background-color: #fff;
}
.module-store_info .cap-store-banner .cap-store-banner__cover {
    position: relative;
    top: -190rpx;
    height: 420rpx;
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    margin-bottom: -90rpx;
    /* 确保渐变背景正常显示 */
    background-attachment: scroll;
    /* 为渐变背景添加后备颜色 */
    background-color: #667eea;
}
.module-store_info .cap-store-banner .cap-store-banner__cover-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.module-store_info .cap-store-banner .cap-store-banner__inner {
    position: absolute;
    top: 90rpx;
    width: 100%;
    color: #fff;
}
.module-store_info .cap-store-banner .cap-store-banner__content {
    position: relative;
    padding-left: 30rpx;
    overflow: hidden;
}
.module-store_info .cap-store-banner .cap-store-banner__logo {
    float: left;
    width: 116rpx;
    height: 116rpx;
    overflow: hidden;
    vertical-align: bottom;
    background-color: #fff;
    border-radius: 50%;
}
.module-store_info .cap-store-banner .cap-store-banner__logo image {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
    border: none;
}
.module-store_info .cap-store-banner .cap-store-banner__right-content {
    margin-left: 140rpx;
}
.module-store_info .cap-store-banner .cap-store-banner__right-content .cap-store-banner__right-content-title--middle {
    max-width: 440rpx;
    margin-top: 10rpx;
    color: #000000;
    font-weight: 700;
    font-size: 36rpx;
    line-height: 44rpx;
    //text-shadow: 0 2rpx 30rpx rgba(0, 0, 0, 0.5);
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.module-store_info .cap-store-banner .cap-store-banner__sum-content {
    margin-top: 30rpx;
    line-height: 7rpx;
    display: flex;
    color: #4D6174;
    font-size: 26rpx;
}
.module-store_info .cap-store-banner .cap-store-banner__sum-content-total {
    display: inline-block;
    vertical-align: middle;
    padding-right: 20rpx;
    position: relative;
    &:first-child::after {
        position: absolute;
        top: 0;
        right: 0;
        width: 4rpx;
        height: 24rpx;
        color: #4D6174;
        font-size: 20rpx;
        content: "|";
    }
    &:last-child {
        padding-right: 0;
        padding-left: 20rpx;
    }
}
.module-store_info .cap-store-banner .store-collect-button-con {
    position: absolute;
    top: 35rpx;
    right: 20rpx;
    display: block;
    text-align: center;
}
.module-store_info .cap-store-banner .store-collect-button {
    position: relative;
    display: block;
    background:#3544BA;
    border: 2rpx solid#3544BA;
    border-radius: 30rpx;
    overflow: hidden;
    box-sizing: border-box;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 24rpx;
    white-space: nowrap;
    font-size: 26rpx;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
}
.module-store_info .cap-store-banner .store-collect-button.store-collect-button-collected {
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
}
.module-store_info .cap-store-banner .store-collect-button text {
    font-size: 28rpx;
}
.module-store_info .cap-store-banner .cap-store-nav-warp {
    position: absolute;
    height: 100rpx;
    top: 180rpx;
    z-index: 9;
    width: 100%;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .cap-store-nav-con {
    display: flex;
    flex-wrap: nowrap;
    height: 210rpx;
    align-items: center;
    justify-content: space-between;
    padding: 0 35rpx;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-search-con {
    width: 300rpx;
    height: 80rpx;
    margin: 0;
    padding: 0 30rpx 0 80rpx;
    background: white;
    line-height: 80rpx;
    border-radius: 40rpx;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-search-con .module-ico-sousuo {
    position: absolute;
    left: 0;
    top: 0;
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    font-size: 32rpx;
    color: #999;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-search-con .search-input {
    background: transparent;
    border: 0;
    padding: 0;
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    display: block;
    font-size: 28rpx;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-search-con .search-input::-webkit-input-placeholder {
    color: #666;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-search-con .search-input:focus {
    border: 0;
    box-shadow: none;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-nav-con {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    height: 80rpx;
    position: relative;
    top: 0;
    color: #999;
    flex-shrink: 0;
    gap: 8rpx;
}

.module-store_info .cap-store-banner .cap-store-nav-warp .store-nav-con .store-nav-item {
    margin: 0 15rpx;
    flex: none;
    position: relative;
    display: inline-block;
    height: 50rpx;
    font-size: 32rpx;
    line-height: 50rpx;
    font-weight: 400;
    color: #999;
    transition: all 0.3s ease;
}

.module-store_info .cap-store-banner .cap-store-nav-warp .store-nav-con .store-nav-item.active {
    color: #000;
    font-size: 36rpx;
    font-weight: 600;
}

.module-store_info .cap-store-banner .cap-store-nav-warp .store-nav-con .store-nav-item.active .store-nav-item-a {
    color: #000;
}

.module-store_info .cap-store-banner .cap-store-nav-warp .store-nav-con .nav-divider {
    font-size: 28rpx;
    margin: 0 8rpx;
    color: #ddd;
}
.module-store_info .cap-store-banner .cap-store-nav-warp .store-all-cat-con {
    width: 52rpx;
    text-align: center;
    color: #fff;
}
.ad-store_style__2 {
    height: 476rpx;
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__cover-mask {
    background-color: initial;
    background-image: -webkit-linear-gradient(bottom, #000, transparent);
    background-image: linear-gradient(0deg, #000, transparent);
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__inner {
    top: 210rpx;
}
.ad-store_style__2 .cap-store-banner .cap-store-nav-warp {
    top: 0;
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__logo {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__logo image {
    border-radius: 50%;
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__right-content {
    margin-left: 164rpx;
}

.ad-store_style__3 {
    height: 516rpx;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__cover {
    height: 300rpx;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__inner {
    top: 136rpx;
}
.ad-store_style__3 .cap-store-banner .cap-store-nav-warp {
    top: 0;
}
.ad-store_style__3 .cap-store-banner .store-collect-button-con {
    top: 80rpx;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__cover-mask {
    background-color: initial;
    background-image: -webkit-linear-gradient(bottom, #000, transparent);
    background-image: linear-gradient(0deg, #000, transparent);
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__content {
    padding-left: 0;
    text-align: center;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__logo {
    display: inline-block;
    float: none;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__right-content {
    margin-left: 0;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__right-content .cap-store-banner__right-content-title--middle {
    display: inline-block;
    max-width: 100%;
    margin-top: 40rpx;
    color: #333;
    text-shadow: none;
}
.ad-store_style__3 .cap-store-banner .cap-store-banner__sum-content {
    margin-top: 20rpx;
    color: #999;
    justify-content: center;
}
.ad-store_style__2 .cap-store-banner .cap-store-banner__sum-content {
    color: #999;
}
.ad-store_style__4 .cap-store-banner {
    height: 440rpx;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__cover {
    height: 100%;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__inner {
    top: 30rpx;
}
.ad-store_style__4 .cap-store-banner .cap-store-nav-warp {
    top: 340rpx;
}
.ad-store_style__4 .cap-store-banner .store-collect-button-con {
    top: 0;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__content {
    padding-left: 0;
    text-align: center;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__logo {
    display: inline-block;
    float: none;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__right-content {
    margin-left: 0;
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__right-content .cap-store-banner__right-content-title--middle {
    display: inline-block;
    max-width: 100%;
    margin-top: 40rpx;
    padding-bottom: 20rpx;
    color: #fff;
    text-shadow: none;
    border-bottom: 2rpx solid hsla(0, 0%, 100%, 0.5);
}
.ad-store_style__4 .cap-store-banner .cap-store-banner__sum-content {
    margin-top: 10rpx;
    justify-content: center;
}
</style>
