<template>
    <view class="level_desc_container">
        <!-- 等级说明 -->
        <view class="level_card">
            <view class="card_title">{{ $t("等级说明") }}</view>
            <view class="card_info_wapper">
                <view class="list list_head">
                    <view class="level_icon_label">{{ $t("标识") }}</view>
                    <view class="level_name_label">{{ $t("会员名称") }}</view>
                    <view class="level_condition_label">{{ $t("升级条件") }}</view>
                </view>
                <view class="list">
                    <template v-for="(item, index) in list" :key="item?.rankId">
                        <view class="list_item">
                            <view class="level_icon">
                                <image
                                    class="icon"
                                    :src="item?.rankLogo"
                                    mode="aspectFit"
                                />
                            </view>
                            <view class="level_name">{{ $t(item?.rankName) }}</view>
                            <view class="level_condition">{{ handelGrowth(item?.minGrowthPoints) }}</view>
                        </view>
                    </template>
                </view>
            </view>
        </view>
        <view class="level_card">
            <view class="card_title">{{ $t("保级说明") }}</view>
            <view class="card_info_wapper">
                <view class="list list_head">
                    <!-- <view class="level_icon_label">{{ $t("标识") }}</view> -->
                    <view class="level_name_label">{{ $t("会员名称") }}</view>
                    <view class="level_condition_label">{{ $t("保级条件") }}</view>
                </view>
                <view class="list">
                    <template v-for="(item, index) in relegationRule" :key="index">
                        <view class="list_item">
                            <!-- <view class="level_icon">
                                <view class="icon" :class="`card${item?.rank_level}`"></view>
                            </view> -->
                            <view class="level_name">{{ $t(item?.rankName) }}</view>
                            <view class="level_condition">{{ $t(item?.condition) }}</view>
                        </view>
                    </template>
                </view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { staticResource } from "@/utils";
import { useI18n } from "vue-i18n";
import type { Rank } from "@/types/user/level";
import type { PropType } from "vue";

const { t } = useI18n();
const props = defineProps({
    list: {
        type: Array as PropType<Rank[]>,
        default: () => []
    },
    rankConfig: {
        type: Object,
        default: () => {}
    }
});

const relegationRule = ref<any[]>([]);

const handleRelegationRuleData = (level: Rank[], rankConfig: any) => {
    level?.forEach((item) => {
        if (rankConfig?.data?.type === 1) {
            relegationRule.value.push({ ...item, condition: t("不降级") });
        } else if (rankConfig?.data?.type === 2) {
            relegationRule.value.push({
                ...item,
                condition: rankConfig.data?.rankAfterMonth + t("个月后，按近") + rankConfig.data?.useMonth + t("个月成长值重新计算")
            });
        }
    });
};

watchEffect(() => {
    handleRelegationRuleData(props.list, props.rankConfig);
});
const handelGrowth = (growth: number) => {
    if (growth === 0) {
        return t("无门槛");
    } else {
        return growth + t("成长值");
    }
};
</script>
<style scoped lang="scss">
.level_desc_container {
    display: flex;
    flex-direction: column;
    row-gap: 24rpx;
    margin-top: 32rpx;
    .level_card {
        width: 100%;
        padding: 40rpx 24rpx;
        background: #fff;
        border-radius: 16rpx;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

        .card_title {
            color: #333;
            font-size: 36rpx;
            font-weight: 600;
            margin-bottom: 40rpx;
            text-align: center;
        }

        .list {
            width: 100%;
            border: 2rpx solid #f0f0f0;
            overflow: hidden;

            .list_item {
                display: flex;
                height: 100rpx;
                font-size: 28rpx;
                color: #666;
                text-align: center;
                border-bottom: 2rpx solid #f0f0f0;

                &:last-child {
                    border-bottom: none;
                }

                .level_icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100rpx;
                    width: 120rpx;
                    border-right: 2rpx solid #f0f0f0;
                    background: #fafafa;

                    .icon {
                        width: 48rpx;
                        height: 44rpx;
                        background-repeat: no-repeat;
                        background-size: 100% 100%;
                    }
                }

                .level_name {
                    width: 240rpx;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-right: 2rpx solid #f0f0f0;
                    background: #fff;
                    font-weight: 500;
                    color: #333;
                }

                .level_condition {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    color: #666;
                }
            }
        }

        .list_head {
            display: flex;
            align-items: center;
            font-size: 28rpx;
            text-align: center;
            color: #333;
            background-color: #f8f9fa;
            height: 80rpx;
            font-weight: 600;
            border-bottom: 2rpx solid #e9ecef;

            .level_icon_label {
                width: 120rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                border-right: 2rpx solid #e9ecef;
            }

            .level_name_label {
                width: 240rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                border-right: 2rpx solid #e9ecef;
            }

            .level_condition_label {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
