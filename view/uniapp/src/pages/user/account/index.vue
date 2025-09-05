<template>
    <tig-layout title="资金管理">
        <view class="top-card">
            <image class="card-bg" src="/static/images/common/balance.png" mode="aspectFill"></image>
            <view class="card-content">
                <view class="balance-row"> {{ $t("可用余额") }} </view>
                <view class="amount-row">
                    <format-price
                        :show-text="false"
                        :price-data="formState.balance"
                        :decimals-style="{
                            fontSize: '40rpx',
                            fontWeight: 'bold'
                        }"
                        :currency-style="{
                            fontSize: '38rpx',
                            fontWeight: 'bold'
                        }"
                    />
                </view>
                <view class="button-row">
                    <view class="round-button" :class="{ active: activeTab === 'deposit' }" @click="actionClick('deposit')">{{ $t("充值") }}</view>
                    <view class="divider"></view>
                    <view class="round-button" :class="{ active: activeTab === 'raplytocard' }" @click="actionClick('raplytocard')">{{ $t("提现") }}</view>
                </view>
            </view>
        </view>
        <view v-if="activeTab === 'detail' || activeTab === 'log'" class="custom-tabs">
            <view v-for="(tab, index) in tabs" :key="index" :class="{ 'active-tab': activeTab === tab.action }" class="tab" @click="actionClick(tab.action)">
                <view>{{ $t(tab.title) }}</view>
            </view>
        </view>

        <view v-show="activeTab === 'detail'">
            <detail v-model:active-tab="activeTab" />
        </view>

        <view v-show="activeTab === 'log'">
            <log v-model:active-tab="activeTab" />
        </view>

        <block v-if="activeTab === 'deposit'">
            <deposit @back-detail="backDetail" />
        </block>

        <block v-if="activeTab === 'raplytocard'">
            <raplyToCard :balance="formState.balance" @back-detail="backDetail" />
        </block>
    </tig-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import detail from "@/pages/user/account/src/detail.vue";
import log from "@/pages/user/account/src/log.vue";
import deposit from "@/pages/user/account/src/deposit.vue";
import raplyToCard from "@/pages/user/account/src/raplyToCard.vue";
import { onLoad } from "@dcloudio/uni-app";
import { getUser } from "@/api/user/user";
import type { UserItem } from "@/types/user/user";

const formState = ref<UserItem>({} as UserItem);

const __getUser = async () => {
    try {
        const result = await getUser();
        Object.assign(formState.value, result);
    } catch (error: any) {
        console.error(error.message);
    }
};

const tabs = [
    { title: "账户明细", action: "detail" },
    { title: "申请记录", action: "log" }
];

const activeTab = ref("detail");

const actionClick = (value: string) => {
    if (value === activeTab.value) return;
    activeTab.value = value;
};

const backDetail = () => {
    activeTab.value = "detail";
};

onLoad(() => {
    __getUser();
});
</script>
<style lang="scss" scoped>
.top-card {
    position: relative;
    border-radius: 35rpx;
    margin: 20rpx;
    overflow: hidden;

    .card-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .card-content {
        position: relative;
        z-index: 2;
        color: #fff;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 60rpx;

        .balance-row {
            text-align: left;
            font-size: 32rpx;
            margin-bottom: 20rpx;
            opacity: 0.9;
        }

        .amount-row {
            text-align: left;
            font-size: 72rpx;
            font-weight: bold;
            margin-bottom: 60rpx;
        }

        .button-row {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 80rpx;
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 40rpx;
            padding: 0 40rpx;

            .round-button {
                flex: 1;
                text-align: center;
                color: white;
                font-size: 32rpx;
                font-weight: 500;
                background: none;
                border: none;
                outline: none;
                padding: 20rpx;
                transition: all 0.2s ease;

                &:active {
                    opacity: 0.7;
                }

                &.active {
                    font-weight: bold;
                }
            }

            .divider {
                width: 2rpx;
                height: 40rpx;
                background-color: rgba(255, 255, 255, 0.4);
                margin: 0 20rpx;
            }
        }
    }
}
.custom-tabs {
    display: flex;
    justify-content: center;
    flex-direction: row;
    gap: 80rpx;
    margin: 20rpx 30rpx;
    .tab {
        padding: 20rpx;
        width: 100%;
        font-size: 28rpx;
        border-bottom: none;
        color: black;
        text-align: center;
    }
    & .active-tab {
        position: relative;
        color: var(--general);
        &::before {
            content: "";
            position: absolute;
            width: 30%;
            height: 4rpx;
            background-color: var(--general);
            left: 50%;
            transform: translateX(-50%);
            bottom: 0;
        }
    }
}
</style>
