<template>
    <view class="promotion" :class="{ subbg: cardType != 'list' }">
        <view v-if="activityInfo.type != 2" class="activity">{{ $t(getActivityText(activityInfo.type)) }}</view>
        <view v-if="activityInfo.type == 2" class="ticket">
            <view class="ticket-type"
            
                ><image src="/static/images/product/coupon.png"  style="    width: 14px;   height: 13px;  position: relative;top: 2px;"/>
                 {{ $t("券") }}
                <text class="ticket-line" />
            </view>
            <view class="ticket-content">{{ activityInfo.data.promotionDesc }}</view>
        </view>
    </view>
</template>

<script setup lang="ts">
const props = defineProps({
    activityInfo: {
        type: Object,
        default: () => ({})
    },
    cardType: {
        type: String,
        default: "list"
    },
    fontSize: {
        type: String,
        default: "23rpx"
    }
});

//1秒杀2优惠券3满减4折扣5满赠6限时折扣
type ActivityInfo = {
    [key: number]: string;
};
const activitType: ActivityInfo = {
    1: "秒杀价",
    2: "券",
    3: "满减",
    4: "折扣",
    5: "满赠",
    6: "限时折扣"
};
const getActivityText = (type: number) => {
    return activitType[type];
};
</script>

<style lang="scss" scoped>
.promotion {
    padding-bottom: 2rpx;
    overflow: hidden;
    font-size: v-bind("props.fontSize");
    display: flex;
    margin-bottom: 20rpx;
    padding-left: 15rpx;

    .activity {
        max-width: 250rpx;
        padding: 0 8rpx;
        border-radius: 5rpx;
        padding-bottom: 2rpx;
        margin-right: 10rpx;
        background: linear-gradient(130deg,#ff8853,#f52828);
        color: #ffffff;
        font-weight: 500;
    }
    .ticket {
        display: flex;
        background: linear-gradient(130deg,#ff8853,#f52828);
        color: #ffffff;
        font-weight: 500;
        border-radius: 5rpx;
        padding-bottom: 2rpx;

        .ticket-type {
            padding: 0 9rpx;
            // max-width: 50rpx;
            position: relative;

            .ticket-line {
                position: absolute;
                display: inline-block;
                height: 100%;
                opacity: 0.5;
                width: 2px;
                top: 0;
                right: 0rpx;
                transform: scaleY(0.7);
                background: linear-gradient(
                    to bottom,
                    var(--ump-border, #c9c9ff) 20%,
                    var(--ump-border, #c9c9ff) 20%,
                    var(--ump-border, #c9c9ff) 20%,
                    rgba(255, 255, 255, 0) 20%,
                    rgba(255, 255, 255, 0) 35%,
                    rgba(136, 76, 255, 1) 35%,
                    var(--ump-border, #c9c9ff) 35%,
                    var(--ump-border, #c9c9ff) 35%,
                    var(--ump-border, #c9c9ff) 60%,
                    rgba(255, 255, 255, 0) 60%,
                    rgba(255, 255, 255, 0) 55%,
                    rgba(255, 255, 255, 0) 75%,
                    var(--ump-border, #c9c9ff) 75%,
                    var(--ump-border, #c9c9ff) 75%,
                    var(--ump-border, #c9c9ff) 100%
                );
            }
        }
        .ticket-content {
            padding: 0 8rpx;
            max-width: 200rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    &.subbg {
        margin: 0;
        padding: 0;
        
        .activity {
            background: linear-gradient(130deg,#ff8853,#f52828);
            color: #ffffff;
            font-weight: 500;
            border: none;
            padding: 0 6rpx 0 0;
            border-radius: 5rpx;
            font-size: 26rpx;
        }
        
        .ticket {
            background: linear-gradient(130deg,#ff8853,#f52828);
            color: #ffffff;
            font-weight: 500;
            border-radius: 5rpx;
            
            .ticket-type {
                color: #ffffff;
            }
            
            .ticket-content {
                color: #ffffff;
                font-weight: bold;
            }
            
            .ticket-line {
                background: linear-gradient(
                    to bottom,
                    #ff4444 20%,
                    #ff4444 20%,
                    #ff4444 20%,
                    rgba(255, 255, 255, 0) 20%,
                    rgba(255, 255, 255, 0) 35%,
                    #ff4444 35%,
                    #ff4444 35%,
                    #ff4444 35%,
                    #ff4444 60%,
                    rgba(255, 255, 255, 0) 60%,
                    rgba(255, 255, 255, 0) 55%,
                    rgba(255, 255, 255, 0) 75%,
                    #ff4444 75%,
                    #ff4444 75%,
                    #ff4444 100%
                );
            }
        }
    }
}
</style>
