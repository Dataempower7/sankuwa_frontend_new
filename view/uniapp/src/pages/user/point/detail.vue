<template>
    <tig-layout title="积分明细">
        <view class="top-card">
            <image class="card-bg" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758694514XskqOAUYQnQbtMXnyj.jpeg" mode="aspectFill"></image>
            <view class="card-content">
                <view class="balance-row"> {{ $t("我的积分") }} </view>
                <view class="amount-row">
                    {{ userStore.userInfo.points }}
                </view>
            </view>
        </view>
        <view v-if="filterState.length > 0" class="log-main">
            <template v-for="(item, index) in filterState" :key="index">
                <view class="item">
                    <view class="tit">{{ item.changeDesc }}</view>
                    <view class="time">{{ item.changeTime }}</view>
                    <view class="real_total">
                        <text v-if="item.changeTypeName === '增加'">+</text>
                        <text v-else>-</text>
                        <text>{{ item.points }}</text>
                    </view>
                </view>
            </template>
        </view>
        <view v-if="!isLoading && total === 0" class="empty-box">
            <view class="pictrue"><image :src="staticResource('common/data_empty.png')" /></view>
            <view class="txt">{{ $t("暂无数据") }}</view>
        </view>
    </tig-layout>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { AccountFilterParams } from "@/types/user/account";
import { getPointList } from "@/api/user/point";
import type { PointFilterState } from "@/types/user/point";
import { staticResource } from "@/utils";
import { useUserStore } from "@/store/user";
import { useList } from "@/hooks";


const userStore = useUserStore();

const filterParams = reactive<AccountFilterParams>({
    page: 1,
    size: 10,
    status: 1
});

const {
    getList,
    data: filterState,
    total,
    isLoading
} = useList<PointFilterState>(getPointList, {
    params: filterParams,
    path: {
        dataKey: "records"
    }
});

onLoad(async () => {
    await userStore.getUserInfo();
    await getList();
});


</script>
<style lang="scss" scoped>
.top-card {
    position: relative;
    border-radius: 5px;
    margin: 10px;
    overflow: hidden;

    .card-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        border-radius: 35rpx;
    }

    .card-content {
        position: relative;
        top: -20px;
        right: 55rpx;
        z-index: 2;
        color: #fff;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 40rpx;

        .balance-row,
        .amount-row,
        .button-row {
            margin: 25rpx 30px 0;
        }

        .balance-row {
            font-size: 40rpx;
        }

        .amount-row {
            font-size: 52rpx;
            font-weight: 400;
        }
    }
}
.log-main {
    margin-top: 40rpx;
    .item {
        position: relative;
        padding: 40rpx;
        margin: 0 20rpx;
        background: #fff;
        border-radius: 18rpx;
        margin-bottom: 20rpx;
        .tit {
            font-size: 28rpx;
            color: #333;
            padding-bottom: 10rpx;
            padding-right: 200rpx;
        }
        .time {
            color: #999;
            position: relative;
            font-size: 24rpx;
        }
        .real_total {
            font-size: 32rpx;
            // color: #fa0;
            font-weight: bold;
            position: absolute;
            right: 40rpx;
            top: 40rpx;
        }
        .actions {
            margin-top: 10rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #999;
            .txt {
                flex: 1 1 auto;
                font-size: 22rpx;
                padding-right: 20rpx;
            }
            .status {
                flex-shrink: 0;
                font-size: 24rpx;
            }
        }
    }
}
</style>
