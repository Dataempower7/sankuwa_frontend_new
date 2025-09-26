<template>
    <view class="success-box">
        <view class="content">
            <image class="success-img" mode="heightFix" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758771456eH1YXx7mC4W0UEqcUt.jpeg"/>
            <view class="success-text">{{ $t("审核已通过") }}</view>
            <view v-if="initialUserInfo && initialUserInfo.initialPassword && initialUserInfo.mobile" class="tip">
                {{
                    isOverseas()
                        ? $t("您的账号：{0}，初始密码：{1}，为了保障你的账户安全，请尽快修改初始密码", [
                              initialUserInfo.mobile ?? "",
                              initialUserInfo.initialPassword ?? ""
                          ])
                        : `您的账号：${initialUserInfo.mobile ?? ""}，初始密码：${initialUserInfo.initialPassword ?? ""}，为了保障你的账户安全，请尽快修改初始密码`
                }}
            </view>
        </view>
        <view class="success-btn">
            <tig-button
                :custom-style="{ borderColor: 'black', color: '#013148', marginRight: '20rpx', height: '90rpx', width: '300rpx' ,  fontWeight: 500 }"
                plain
                @click="handleLink"
                >{{ $t("返回首页") }}</tig-button
            >
            <tig-button :custom-style="{ height: '90rpx', width: '300rpx' , borderColor:'#3544BA' ,backgroundColor:'#3544BA', fontWeight: 500}" @click="handleLink('admin')">{{ $t("商家后台") }}</tig-button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { isOverseas, redirect, staticResource } from "@/utils";
import { useConfigStore } from "@/store/config";

const configStore = useConfigStore();

const props = defineProps({
    initialUserInfo: {
        type: Object,
        default: () => ({})
    }
});
const handleLink = (type: string) => {
    if (type === "admin") {
        let url;
        //url = configStore.baseInfo.adminDomain ? `${configStore.baseInfo.adminDomain}/admin` : `${window.location.origin}/admin`;
        url = 'https://sankuwa.com/admin';
        
        
        // #ifdef MP-WEIXIN
        // 微信小程序环境，显示弹窗让用户复制地址
        uni.showModal({
            title: '提示',
            content: '请在浏览器中打开商家后台进行管理',
            confirmText: '复制地址',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    const adminUrl = url;
                    uni.setClipboardData({
                        data: adminUrl,
                        success: () => {
                            uni.showToast({
                                title: '地址已复制',
                                icon: 'success'
                            });
                        },
                        fail: () => {
                            uni.showToast({
                                title: '复制失败',
                                icon: 'none'
                            });
                        }
                    });
                }
            }
        });
        // #endif
        
        // #ifndef H5
        // #ifndef MP-WEIXIN
        redirect({ url });
        // #endif
        // #endif
        
        // #ifdef H5
        window.open(url);
        // #endif
    } else {
        redirect({ url: "/pages/index/index" });
    }
};
</script>

<style lang="scss" scoped>
.success-box {
    height: 76vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    box-sizing: border-box;
    
    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 500rpx;
    }

    .success-img {
        height: 192rpx;
        margin-bottom: 40rpx;
    }
    
    .success-text {
        font-weight: 500;
        font-size: 40rpx;
        color: #013148;
        text-align: center;
        font-style: normal;
        margin-bottom: 40rpx;
    }
    
    .success-btn {
        display: flex;
        justify-content: center;
        width: 110%;
        padding: 45rpx 0 75rpx;
        background: white;
        position: relative;
        top: 75rpx;
    }
    
    .tip {
        color: #7c889c;
        font-size: 28rpx;
        line-height: 1.5;
        text-align: center;
        padding: 0 30rpx;
        max-width: 600rpx;
    }
}
</style>
