<template>
    <view class="groupon-nav">
        <tig-navbar :title="$t('我的拼团')">
            <template #right>
                <view class="groupon-nav__rigth-icon">
                    <view class="click-placehoder" @click="handleSearch"></view>
                    <text class="iconfont-h5 icon-sousuo"></text>
                </view>
            </template>
        </tig-navbar>
    </view>
</template>

<script lang="ts" setup>
import { redirect } from '@/utils';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

/**
 * 处理跳转搜索页面
 */
const handleSearch = () => {
    redirect({
        url: "/pages/search/index",
        param: {
            redirectPath: "/pages/groupon/mylist",
            searchHistoryKey: "mygrouponSerchHistory",
            navbarTitle: t('搜索我的拼团'),
            placeholder: t('点击搜索'),
            isSwitchTab: true
        }
    });
}
</script>

<style lang="scss" scoped>
.groupon-nav {

    .groupon-nav__rigth-icon {
        .click-placehoder {
            width: 84rpx;
            position: absolute;
            top: 0;
            right: 16rpx;
            bottom: 0;
        }

        .icon-sousuo {
            font-size: 40rpx;
        }
    }
}
</style>