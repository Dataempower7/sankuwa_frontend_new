<template>
    <tig-layout title="收货地址">
        <view class="address-list">
            <up-radio-group v-model="isCheckedId" placement="column" @change="getCurrentAddress">
                <template v-for="item in addressList" :key="item.addressId">
                    <view class="address-item">
                        <view class="address-item-content">
                                    <view class="address-item-left flex-center">
                                        <up-radio active-color="#3544BA" :name="item.addressId" />
                                    </view>
                                    <view class="address-item-middle">
                                        <view class="user-info">
                                            <view class="name">{{ item.consignee }}</view>

                                            <view class="phone"
                                                >{{ mobileConceal(item.mobile) }} <view v-if="item.isDefault === 1" class="tag">{{ $t("默认") }}</view></view
                                            >
                                        </view>
                                        <view class="address line1">{{ item.regionName }} {{ item.address }}</view>
                                    </view>
                                    <view class="address-item-right">
                                        <view class="action-buttons">
                                            <image class="action-icon delete-icon" src="@/static/images/search/del.png" @click="handleDel(item.addressId)" />
                                            <image class="action-icon edit-icon" src="@/static/images/search/edit.png" @click="handleEdit(item.addressId)" />
                                        </view>
                                    </view>
                        </view>
                    </view>
                </template>
            </up-radio-group>
        </view>

        <!-- 自定义缺失页面 -->
        <view v-if="!isLoadMore && !isLoading && addressList.length === 0" class="empty-address-container">
            <view class="empty-content">
                <image class="empty-image" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880vZYp8jdsXtbPshx9B6.jpeg" mode="aspectFit" />
                <text class="empty-text">{{ $t("暂无收货地址") }}</text>
                <text class="empty-desc">{{ $t("快速获取位置或手动添加收货地址") }}</text>
            </view>
        </view>

        <loading-box v-model="isLoadMore" :page="filterParams.page" :length="addressList.length" />

        <tig-fixed-placeholder background-color="#fff">
            <view class="btn-box">
                <!-- 当没有地址时显示两个按钮 -->
                <template v-if="addressList.length === 0">
                    <tig-button class="import-address-btn" @click="handleImportAddress">
                        <view class="btn-content">
                            <text class="iconfont-h5 icon-weizhi location-icon"></text>
                            <text>{{ $t("一键导入地址") }}</text>
                        </view>
                    </tig-button>
                    <tig-button class="add-address-btn" style="border-color: #3544ba;" @click="handleAdd">{{ $t("添加新地址") }}</tig-button>
                </template>
                <!-- 有地址时只显示添加按钮 -->
                <template v-else>
                    <tig-button class="add-address-btn" style="border-color: #3544ba;" @click="handleAdd">{{ $t("添加新地址") }}</tig-button>
                </template>
            </view>
        </tig-fixed-placeholder>

        <tig-loadingpage v-model="isLoading" />
        
        <!-- 地图选点弹窗 -->
        <MapPickerPopup v-model="showMapPicker" @confirm="handleMapPickerConfirm" />
    </tig-layout>
</template>

<script lang="ts" setup>
import { getAddressList, delAddress, selectedAddress } from "@/api/user/address";
import type { AddressFilterResult } from "@/types/user/address";
import MapPickerPopup from "@/components/MapPicker/index.vue";
import { reactive, ref } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { mobileConceal, currRoute } from "@/utils";
import { importAddressOneClick } from "@/utils/location";
import { useList } from "@/hooks";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const filterParams = reactive({
    page: 1,
    size: 10
});
const {
    getList,
    data: addressList,
    isLoadMore,
    isLoading
} = useList<AddressFilterResult>(getAddressList, {
    params: filterParams,
    path: {
        dataKey: "records"
    },
    immediate: true,
    manageData: (data: any) => {
        isCheckedId.value = data.find((item: any) => item.isSelected === 1)?.addressId;
    }
});

onLoad(() => {
    const pages = getCurrentPages();
    const prevRoute = pages.length > 1 ? pages[pages.length - 2].route : "";
    if (prevRoute === "pages/order/check") {
        uni.setStorageSync("link", true);
    } else {
        uni.removeStorageSync("link");
    }
    uni.$on("refreshData", () => {
        filterParams.page = 1;
        addressList.value = [];
        getList();
    });
});

const handleDel = (id: number) => {
    console.log("handleDel", id);
    uni.showModal({
        title: t("提示"),
        content: t("确定删除吗？"),
        success: async (res) => {
            if (res.confirm) {
                __delAddress(id);
            }
        }
    });
};
const __delAddress = async (id: number) => {
    try {
        await delAddress({ id });

        uni.showToast({
            title: t("删除成功"),
            icon: "none"
        });

        filterParams.page = 1;
        addressList.value = [];
        getList();
    } catch (error) {
        console.error(error);
    }
};

const handleEdit = (id: number) => {
    uni.navigateTo({
        url: "/pages/address/editRegion?id=" + id
    });
};
const handleAdd = () => {
    uni.navigateTo({
        url: "/pages/address/editRegion"
    });
};

// 地图选点弹窗显示状态
const showMapPicker = ref(false);

// 地图选点确认
const handleMapPickerConfirm = (addressData: any) => {
    
    // 将地址数据传递给编辑页面
    // detail字段已经去掉了省市区，只包含街道及详细地址
    const addressInfo = encodeURIComponent(JSON.stringify({
        regions: [addressData.province, addressData.city, addressData.district].filter(Boolean),
        detail: addressData.detail || '',  // 街道+门牌号（不含省市区）
        type: 'map_location',
        provinceName: addressData.province,
        cityName: addressData.city,
        countyName: addressData.district,
        township: addressData.township || '',
        street: addressData.street || '',
        streetNumber: addressData.streetNumber || '',
        poi: addressData.poi || '',
        latitude: addressData.latitude,
        longitude: addressData.longitude
    }));
    
    
    uni.navigateTo({
        url: `/pages/address/editRegion?import=true&location=${addressInfo}`
    });
};

const handleImportAddress = () => {
    // APP/H5环境：显示地图选点弹窗
    // #ifndef MP-WEIXIN
    showMapPicker.value = true;
    return;
    // #endif
    
    // 微信小程序：使用原有逻辑（微信地址簿）
    uni.showLoading({
        title: t('获取地址信息...'),
        mask: true
    });
    
    importAddressOneClick().then(result => {
        uni.hideLoading();
        
        if (result.success) {
            let addressInfo;
            
            // 根据不同类型处理地址数据
            if (result.type === 'wechat_address') {
                // 微信地址簿的数据
                const regions = [result.provinceName, result.cityName, result.countyName].filter(Boolean);
                addressInfo = encodeURIComponent(JSON.stringify({
                    regions,
                    detail: result.detailInfo || '',
                    fullAddress: `${regions.join('')}${result.detailInfo || ''}`,
                    type: 'wechat_address',
                    consignee: result.userName,
                    mobile: result.telNumber
                }));
            } else {
                // 高德地图定位获取的地址数据
                addressInfo = encodeURIComponent(JSON.stringify({
                    regions: result.regions || [],
                    detail: result.detail || '',
                    fullAddress: result.fullAddress || '',
                    type: 'amap_location',
                    provinceName: result.provinceName || '',
                    cityName: result.cityName || '',
                    countyName: result.countyName || '',
                    townName: result.townName || '',
                    streetName: result.streetName || '',
                    streetNumber: result.streetNumber || '',
                    nearbyPoi: result.nearbyPoi || '',
                    nearbyRoad: result.nearbyRoad || ''
                }));
            }
            
            uni.navigateTo({ 
                url: `/pages/address/editRegion?import=true&location=${addressInfo}` 
            });
        } else {
            // 导入失败，显示提示
            uni.showModal({
                title: t('导入失败'),
                content: t(result.message || '无法获取地址信息，请手动输入'),
                showCancel: false,
                success: () => {
                    uni.navigateTo({ url: "/pages/address/editRegion" });
                }
            });
        }
    }).catch(error => {
        uni.hideLoading();
        console.error('一键导入地址失败:', error);
        uni.showToast({
            title: '导入失败',
            icon: 'none'
        });
    });
};

const isCheckedId = ref();
const getCurrentAddress = (e: any) => {
    __selectedAddress();
};

const __selectedAddress = async () => {
    uni.showLoading({
        title: t("切换中")
    });
    const pages = getCurrentPages();
    try {
        await selectedAddress({ id: isCheckedId.value });
        filterParams.page = 1;
        addressList.value = [];
        if (pages.length > 1) {
            const prevRoute = pages[pages.length - 2].route;
            if (prevRoute === "pages/order/check") {
                return uni.navigateBack();
            }
        }

        getList();
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    } finally {
        uni.hideLoading();
    }
};

onUnload(() => {
    uni.$off("refreshData");
});
</script>

<style lang="scss" scoped>
.btn-box {
    padding: 25rpx;

    .add-address-btn {
        background-color: #3544BA !important;
        color: #fff !important;
        font-size: 28rpx;
        border-radius: 44rpx;
        height: 88rpx;
        border: none;
    }
}

.address-list {
    padding: 20rpx;

    .address-item {
        border-radius: 30rpx;
        background-color: #fff;
        margin-bottom: 20rpx;

        .address-item-content {
            display: flex;
            padding: 20rpx;
            .flex-center {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .address-item-left {
                width: 60rpx;
            }

            .address-item-middle {
                flex: 1;
                padding-left: 10rpx;
                padding-right: 10rpx;
                min-width: 0; /* 确保可以收缩 */
                .user-info {
                    color: #333;
                    font-size: 32rpx;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    margin-bottom: 8rpx;
                }
                .name {
                    margin-right: 20rpx;
                    color: #333;
                }

                .phone {
                    position: relative;
                    color: #333;
                    font-size: 32rpx;

                    .tag {
                        position: absolute;
                        right: -80rpx;
                        top: -2rpx;
                        font-size: 20rpx;
                        font-weight: normal;
                        padding: 4rpx 8rpx;
                        background-color:#EDEEFF;
                        border-radius: 10rpx;
                        color: #4546AB;
                    }
                }

                .address {
                    color: #666;
                    font-size: 28rpx;
                    line-height: 1.6;
                    margin-top: 8rpx;
                    max-width: 480rpx;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: normal;
                    /* 使用CSS多行省略 */
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    -webkit-box-orient: vertical;
                    /* 备用方案：固定高度 */
                    max-height: 89.6rpx; /* 28rpx * 1.6 * 2 = 89.6rpx */
                }
            }

            .address-item-right {
                width: 120rpx;
                display: flex;
                align-items: center;
                justify-content: flex-end;

                .action-buttons {
                    display: flex;
                    gap: 20rpx;

                    .action-icon {
                        width: 40rpx;
                        height: 40rpx;
                        cursor: pointer;
                    }

                    .edit-icon {
                        opacity: 0.7;
                    }

                    .delete-icon {
                        opacity: 0.7;
                    }

                    .action-icon:hover {
                        opacity: 1;
                    }
                }
            }
        }
    }
}

/* 缺失页面样式 */
.empty-address-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 40rpx;

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .empty-image {
            width: 300rpx;
            height: 300rpx;
            margin-bottom: 40rpx;
        }

        .empty-text {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 16rpx;
        }

        .empty-desc {
            font-size: 28rpx;
            color: #999;
            line-height: 1.5;
        }
    }
}

/* 按钮样式 */
.btn-box {
    padding: 25rpx;
    display: flex;
    gap: 20rpx;

    .import-address-btn {
        flex: 1;
        background-color: #f5f5f5 !important;
        color: #666 !important;
        border: 2rpx solid #e0e0e0 !important;
        border-radius: 44rpx;
        height: 88rpx;
        font-size: 32rpx;

        .btn-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8rpx;

            .location-icon {
                font-size: 28rpx;
            }
        }
    }

    .add-address-btn {
        flex: 1;
        background-color: #3544BA !important;
        color: #fff !important;
        border-radius: 44rpx;
        height: 88rpx;
        font-size: 32rpx;
        border: none;
    }

    /* 当只有一个按钮时，占满宽度 */
    .add-address-btn:only-child {
        flex: none;
        width: 100%;
    }
}
</style>
