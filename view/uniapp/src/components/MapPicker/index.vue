<template>
    <uni-popup ref="popup" type="bottom" @change="handleChange">
        <view class="map-picker-popup">
            <!-- 地图容器 -->
            <map
                v-if="show"
                id="mapPicker"
                class="map"
                :latitude="latitude"
                :longitude="longitude"
                :show-location="true"
                :enable-3D="false"
                :enable-rotate="false"
                :enable-overlooking="false"
                :enable-zoom="true"
                :enable-scroll="true"
                @regionchange="onRegionChange"
            >
                <!-- 中心点标记 -->
                <cover-view class="map-center-marker" v-if="showCenterMarker">
                    <cover-image 
                        class="marker-pin" 
                        src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/1764309785ZCQNBd3nMP0r9OO77c.jpeg"
                    />
                </cover-view>
                
                <!-- 定位按钮 -->
                <cover-view class="location-btn" @tap="moveToCurrentLocation">
                    <cover-image 
                        class="location-icon" 
                        src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/1764309110WSTEbDo4qRenkFrM2U.jpeg"
                    />
                </cover-view>
            </map>
            
            <!-- 顶部搜索框 -->
            <view class="search-container">
                <view class="search-box">
                      <image class="search-icon" style="width: 32rpx; height: 32rpx;" src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758778963QMciIVS0zkhfhjYBdM.jpeg" mode="aspectFit" />
                    <input 
                        class="search-input" 
                        v-model="searchKeyword"
                        placeholder="搜索地址，更快填写"
                        @input="onSearchInput"
                        @confirm="handleSearch"
                    />
                    <text class="search-clear" v-if="searchKeyword" @tap="clearSearch">✕</text>
                </view>
                <view class="search-btn" @tap="handleSearch" v-if="searchKeyword">搜索</view>
            </view>
            
            <!-- 搜索结果列表 -->
            <view class="search-results" v-if="searchResults.length > 0">
                <scroll-view class="results-scroll" scroll-y>
                    <view 
                        class="result-item" 
                        v-for="(item, index) in searchResults" 
                        :key="index"
                        @tap="selectSearchResult(item)"
                    >
                        <view class="result-name">{{ item.name }}</view>
                        <view class="result-address">{{ item.address }}</view>
                    </view>
                </scroll-view>
            </view>
            
            <!-- 底部地址信息卡片 -->
            <view class="address-card">
                <view class="loading" v-if="isLoading">
                    <image 
                        class="loading-icon" 
                        src="https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202511/1764309374erw75Om2HksfYyj6hr.jpeg"
                        mode="aspectFit"
                    />
                </view>
                <view class="address-info" v-else>
                    <view class="address-main">
                        <text class="address-title">{{ regionText || '未获取到地址' }}</text>
                        <text class="address-detail" v-if="detailAddress">{{ detailAddress }}</text>
                    </view>
                    <view class="address-full" v-if="completeAddress">
                        <text class="full-text">{{ completeAddress }}</text>
                    </view>
                </view>
                
                <!-- 操作按钮 -->
                <view class="action-btns">
                    <view class="cancel-btn" @click="handleCancel">取消</view>
                    <view class="confirm-btn" @click="handleConfirm">确认选择</view>
                </view>
            </view>
        </view>
    </uni-popup>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { AMAP_CONFIG } from '@/config/map';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const popup = ref();
const show = ref(false);

// 地图相关
const latitude = ref(30.274084);
const longitude = ref(120.155070);

// 当前定位的经纬度
const currentLocationLat = ref(0);
const currentLocationLng = ref(0);

// 判断是否显示中心标记（当地图中心不在当前定位时显示）
const showCenterMarker = computed(() => {
    // 如果还没有定位，不显示
    if (currentLocationLat.value === 0 && currentLocationLng.value === 0) {
        return false;
    }
    
    // 计算距离差值（容差约10米）
    const tolerance = 0.0001;
    const latDiff = Math.abs(latitude.value - currentLocationLat.value);
    const lngDiff = Math.abs(longitude.value - currentLocationLng.value);
    
    // 如果差值大于容差，说明已经移动了地图，显示标记
    return latDiff > tolerance || lngDiff > tolerance;
});

// 地址数据
const regionText = ref('');
const detailAddress = ref('');
const fullAddress = ref('');
const completeAddress = ref(''); // 完整拼接地址
const isLoading = ref(false);
// 完整地址数据（用于返回）
const addressData = ref<any>(null);

// 搜索相关
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);

// 防抖定时器
let debounceTimer: any = null;
let searchTimer: any = null;

// 监听显示状态
watch(() => props.modelValue, (val) => {
    if (val) {
        popup.value?.open();
        show.value = true;
        // 打开后自动定位
        setTimeout(() => {
            moveToCurrentLocation();
        }, 800); // 延迟增加到800ms，确保地图完全渲染
    } else {
        popup.value?.close();
        // 重置状态
        regionText.value = '';
        detailAddress.value = '';
        fullAddress.value = '';
        completeAddress.value = '';
        isLoading.value = false;
        addressData.value = null;
        searchKeyword.value = '';
        searchResults.value = [];
    }
});

// 移动到当前位置
const moveToCurrentLocation = async () => {
    isLoading.value = true;
    
    uni.getLocation({
        type: 'gcj02',
        success: async (res) => {
            latitude.value = res.latitude;
            longitude.value = res.longitude;
            // 保存当前定位的经纬度
            currentLocationLat.value = res.latitude;
            currentLocationLng.value = res.longitude;
            await getAddressInfo(res.longitude, res.latitude);
        },
        fail: (err) => {
            isLoading.value = false;
            console.error('❌ 定位失败:', err);
            uni.showToast({
                title: '定位失败，请使用localhost访问',
                icon: 'none',
                duration: 2000
            });
        }
    });
};

// 获取地址信息
const getAddressInfo = async (lng: number, lat: number) => {
    isLoading.value = true;
    
    try {
        const url = `${AMAP_CONFIG.geocodeApi}?key=${AMAP_CONFIG.key}&location=${lng},${lat}&extensions=all`;
        
        const res: any = await new Promise((resolve, reject) => {
            uni.request({
                url,
                success: (res) => {
                    resolve(res.data);
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
        
        if (res.status === '1' && res.regeocode) {
            const { addressComponent, formatted_address, pois } = res.regeocode;
            
            // 省市区
            const province = addressComponent.province || '';
            const city = addressComponent.city || addressComponent.province || '';
            const district = addressComponent.district || '';
            
            regionText.value = `${province} ${city} ${district}`;
            fullAddress.value = formatted_address || '';
            
            // 详细地址
            const street = addressComponent.streetNumber?.street || '';
            const number = addressComponent.streetNumber?.number || '';
            const poi = pois && pois.length > 0 ? pois[0].name : '';
            
            if (street && number) {
                detailAddress.value = `${street}${number}`;
            } else if (poi) {
                detailAddress.value = poi;
            } else if (addressComponent.township) {
                detailAddress.value = addressComponent.township;
            }
            
            // 去掉省市区，只保留街道及详细地址
            let addressWithoutRegion = formatted_address
                .replace(province, '')
                .replace(city, '')
                .replace(district, '')
                .trim();
            
            // 拼接：街道地址 + 门牌号
            const detailOnlyAddress = detailAddress.value 
                ? `${addressWithoutRegion} ${detailAddress.value}`.trim()
                : addressWithoutRegion;
            
            // 完整地址（用于弹窗显示）
            completeAddress.value = detailAddress.value 
                ? `${formatted_address} ${detailAddress.value}` 
                : formatted_address;
            
            // 保存完整数据
            addressData.value = {
                province,
                city,
                district,
                township: addressComponent.township || '',
                street,
                streetNumber: number,
                poi,
                // detail 字段：街道门牌号或POI（去掉省市区）
                detail: detailOnlyAddress,
                // fullAddress 字段：完整地址（包含省市区，用于弹窗显示）
                fullAddress: formatted_address,
                // completeAddress 字段：完整拼接（包含省市区）
                completeAddress: completeAddress.value,
                regionText: regionText.value,
                latitude: latitude.value,
                longitude: longitude.value
            };
        }
    } catch (error) {
        console.error('获取地址失败:', error);
        uni.showToast({
            title: '地址解析失败',
            icon: 'none'
        });
    } finally {
        isLoading.value = false;
    }
};

// 地图区域改变
const onRegionChange = (e: any) => {
    
    // 地图移动结束时更新地址（不限制causedBy，因为可能是undefined）
    if (e.type === 'end') {
        
        // 清除之前的定时器
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        // 防抖：300ms后才执行，避免频繁调用
        debounceTimer = setTimeout(() => {
            const mapContext = uni.createMapContext('mapPicker');
            mapContext.getCenterLocation({
                success: (res: any) => {
                    latitude.value = res.latitude;
                    longitude.value = res.longitude;
                    getAddressInfo(res.longitude, res.latitude);
                },
                fail: (err: any) => {
                    console.error('❌ 获取中心点失败:', err);
                }
            });
        }, 300);
    }
};

// 搜索输入事件（防抖）
const onSearchInput = () => {
    if (searchTimer) {
        clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
        if (searchKeyword.value.trim()) {
            handleSearch();
        } else {
            searchResults.value = [];
        }
    }, 500);
};

// 执行搜索
const handleSearch = async () => {
    const keyword = searchKeyword.value.trim();
    if (!keyword) return;
    
    try {
        // 高德地图搜索API
        const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_CONFIG.key}&keywords=${encodeURIComponent(keyword)}&city=&citylimit=false&output=json`;
        
        const res: any = await new Promise((resolve, reject) => {
            uni.request({
                url,
                success: (res) => resolve(res.data),
                fail: reject
            });
        });
        
        if (res.status === '1' && res.pois && res.pois.length > 0) {
            searchResults.value = res.pois.map((poi: any) => ({
                name: poi.name,
                address: poi.address || poi.pname + poi.cityname + poi.adname,
                location: poi.location,
                adcode: poi.adcode,
                pname: poi.pname,
                cityname: poi.cityname,
                adname: poi.adname
            }));
        } else {
            searchResults.value = [];
            uni.showToast({
                title: '未找到相关地址',
                icon: 'none'
            });
        }
    } catch (error) {
        console.error('搜索失败:', error);
        uni.showToast({
            title: '搜索失败',
            icon: 'none'
        });
    }
};

// 清空搜索
const clearSearch = () => {
    searchKeyword.value = '';
    searchResults.value = [];
};

// 选择搜索结果
const selectSearchResult = async (item: any) => {
    // 解析经纬度
    const [lng, lat] = item.location.split(',').map((v: string) => parseFloat(v));
    
    // 更新地图中心点
    latitude.value = lat;
    longitude.value = lng;
    
    // 获取详细地址
    await getAddressInfo(lng, lat);
    
    // 清空搜索
    clearSearch();
};

// 弹窗状态改变
const handleChange = (e: any) => {
    if (e.show === false) {
        show.value = false;
        emit('update:modelValue', false);
    }
};

// 取消
const handleCancel = () => {
    popup.value?.close();
};

// 确认
const handleConfirm = () => {
    if (!addressData.value) {
        uni.showToast({
            title: '请等待地址解析完成',
            icon: 'none'
        });
        return;
    }
    
    emit('confirm', addressData.value);
    popup.value?.close();
};
</script>

<style lang="scss" scoped>
.map-picker-popup {
    width: 100%;
    height: 80vh;
    position: relative;
    background: #f5f5f5;
    border-radius: 30rpx 30rpx 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.map {
    width: 100%;
    height: 80vh;
    flex: 1;
    /* 启用GPU加速，提升滚动流畅度 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.map-center-marker {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -100%);
    z-index: 999;
    /* GPU加速 */
    will-change: transform;
    
    .marker-pin {
        width: 45rpx;
        height: 45rpx;
        /* 平滑过渡 */
        transition: opacity 0.2s ease;
    }
}

.location-btn {
    position: absolute;
    right: 30rpx;
    bottom: 280rpx;
    width: 60rpx;
    height: 60rpx;
    top: 800rpx;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    
    .location-icon {
        width: 36rpx;
        height: 36rpx;
    }
}

.search-container {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    right: 20rpx;
    display: flex;
    gap: 20rpx;
    z-index: 1000;
}

.search-box {
    flex: 1;
    height: 80rpx;
    background: white;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
    color: #666;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    
    &::placeholder {
        color: #999;
    }
}

.search-clear {
    font-size: 32rpx;
    color: #999;
    margin-left: 10rpx;
    padding: 10rpx;
}

.search-btn {
    height: 80rpx;
    padding: 0 30rpx;
    background: linear-gradient(135deg, #ff8a65, #ff6b35);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28rpx;
    font-weight: 500;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);
}

.search-results {
    position: absolute;
    top: 120rpx;
    left: 20rpx;
    right: 20rpx;
    max-height: 400rpx;
    background: white;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
    z-index: 1001;
    overflow: hidden;
}

.results-scroll {
    max-height: 400rpx;
}

.result-item {
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:active {
        background: #f5f5f5;
    }
}

.result-name {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 10rpx;
}

.result-address {
    font-size: 24rpx;
    color: #999;
}

.smart-btn {
    width: 140rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #ff8a65, #ff6b35);
    border-radius: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);
    font-size: 28rpx;
    color: white;
    
    .smart-text {
        font-size: 20rpx;
        margin-top: 4rpx;
    }
}

.address-card {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: 30rpx 30rpx 0 0;
    padding: 30rpx 30rpx 60rpx 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
    /* GPU加速 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: transform;
}

.loading {
    padding: 40rpx 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    
    .loading-icon {
        width: 32rpx;
        height: 32rpx;
        animation: rotate 1.5s linear infinite;
    }
    
    .loading-text {
        font-size: 28rpx;
        color: #666;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.address-info {
    .address-main {
        margin-bottom: 20rpx;
        
        .address-title {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
        }
        
        .address-detail {
            display: block;
            font-size: 28rpx;
            color: #666;
        }
    }
    
    .address-full {
        padding: 20rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        margin-bottom: 20rpx;
        
        .full-text {
            font-size: 24rpx;
            color: #999;
            line-height: 1.5;
        }
    }
}

.action-btns {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    
    .cancel-btn, .confirm-btn {
        flex: 1;
        height: 88rpx;
        border-radius: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        font-weight: 500;
    }
    
    .cancel-btn {
        background: #f5f5f5;
        color: #666;
    }
    
    .confirm-btn {
        background: #3744B2;
        color: white;
    }
}
</style>
