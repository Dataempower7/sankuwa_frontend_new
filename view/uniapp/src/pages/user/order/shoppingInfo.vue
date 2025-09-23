<template>
    <view class="logistics-page">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="back-btn" @click="goBack">
                    <image class="back-icon" src="/static/images/common/trolley_icon_back@3x.png" mode="aspectFit" />
                </view>
                <view class="navbar-title">
                    {{ $t('物流追踪') }}
                </view>
                <view class="placeholder"></view>
            </view>
        </view>
        
        <view class="page-content">
            <!-- 物流信息头部 -->
            <view v-if="logisticsData" class="logistics-header">
                <view class="company-section">
                    <image class="company-icon" src="/static/images/logistics/express_delivery.png" mode="aspectFit" />
                    <view class="company-info">
                        <view class="company-name"><text style=" color: rgba(73, 73, 73, 0.8);font-size: 28rpx;  margin-right: 10rpx;"> 物流公司：</text>{{ getCompanyName(logisticsData.shipperCode) }}</view>
             
                        <view class="tracking-section">
                            <text class="tracking-number"><text style=" color: rgba(73, 73, 73, 0.8);font-size: 28rpx;  margin-right: 10rpx;"> 运单编号：</text>{{ logisticsData.logisticCode }}</text>
                            <view class="copy-btn" @tap="copyTrackingNumber" @click="copyTrackingNumber">
                                <text class="copy-text">复制</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 当前状态 -->
            <view v-if="logisticsData && logisticsData.traces?.length > 0" class="current-status">
                <view class="status-card" :class="getStatusClass(logisticsData.state)">
                    <view class="status-icon">
                        <image 
                            :src="getStatusIcon(logisticsData.state)" 
                            class="icon-img" 
                            mode="aspectFit" 
                            style="margin-right: 30rpx;"
                        />
                    </view>
                    <view class="status-content">
                        <view class="status-text">{{ getStatusText(logisticsData.state) }}</view>
                        <view class="status-desc">{{ logisticsData.traces[0]?.acceptStation || getStatusDesc(logisticsData.state) }}</view>
                        <view class="status-time">{{ logisticsData.traces[0]?.acceptTime }}</view>
                    </view>
                </view>
            </view>

            <!-- 物流轨迹 -->
            <view v-if="logisticsData && logisticsData.traces?.length > 0" class="logistics-traces">
                <view class="traces-title">
                    <text class="title-text">物流轨迹</text>
                </view>
                <view class="traces-timeline">
                    <view 
                        v-for="(trace, index) in logisticsData.traces" 
                        :key="index" 
                        class="trace-item"
                        :class="{
                            'is-first': index === 0,
                            'is-delivered': logisticsData.state === '3' && index === 0
                        }"
                    >
                        <view class="trace-dot"></view>
                        <view class="trace-content">
                            <view class="trace-desc">{{ trace.acceptStation }}</view>
                            <view class="trace-time">{{ trace.acceptTime }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空数据状态 -->
            <view v-else-if="!loading" class="empty-state">
                <image class="empty-image" src="/static/images/missing_page/address.png" mode="aspectFit" />
                <view class="empty-text">暂无物流信息</view>
                <view class="empty-desc">{{ errorMessage || '请稍后再试或联系客服' }}</view>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-state">
                <view class="loading-content">
                    <view class="loading-spinner"></view>
                    <view class="loading-text">正在查询物流信息...</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from 'vue-i18n';
import { getShippingInfo } from '@/api/user/order';

const { t } = useI18n();

// 定义物流数据接口
interface LogisticsTrace {
    action: string;
    acceptTime: string;
    acceptStation: string;
}

interface LogisticsData {
    success: string;
    shipperCode: string;
    logisticCode: string;
    state: string;
    stateEx: string;
    location: string;
    ebusinessID: string;
    traces: LogisticsTrace[];
}

// 响应式数据
const loading = ref<boolean>(true);
const logisticsData = ref<LogisticsData | null>(null);
const errorMessage = ref<string>('');
const orderId = ref<number>(0);

// 物流公司代码映射
const companyNameMap: Record<string, string> = {
    'ZTO': '中通快递',
    'YTO': '圆通速递', 
    'STO': '申通快递',
    'SF': '顺丰速递',
    'EMS': '中国邮政',
    'JD': '京东快递',
    'HTKY': '百世汇通',
    'UC': '优速快递',
    'DBL': '德邦物流',
    'YZPY': '邮政包裹'
};

// 状态文本映射
const statusTextMap: Record<string, string> = {
    '0': '暂无轨迹信息',
    '1': '已揽收',
    '2': '在途中', 
    '3': '已签收',
    '4': '问题件'
};

// 状态描述映射
const statusDescMap: Record<string, string> = {
    '0': '暂无物流信息',
    '1': '快件已被收寄',
    '2': '快件正在配送途中',
    '3': '快件已签收，感谢使用',
    '4': '快件存在异常情况'
};

// 页面加载时获取参数
onLoad((option: any) => {
    if (option && option.id) {
        orderId.value = parseInt(option.id);
        loadLogisticsInfo();
    } else {
        loading.value = false;
        errorMessage.value = '缺少订单参数';
    }
});

// 获取物流信息
const loadLogisticsInfo = async () => {
    loading.value = true;
    try {
        const result = await getShippingInfo({ id: orderId.value });
        console.log('物流查询结果:', result);
        
        if (result && result.success === 'true') {
            // 对物流轨迹按时间倒序排列，确保最新消息在前面
            if (result.traces && Array.isArray(result.traces)) {
                result.traces.sort((a, b) => {
                    return new Date(b.acceptTime).getTime() - new Date(a.acceptTime).getTime();
                });
            }
            logisticsData.value = result;
            errorMessage.value = '';
        } else {
            console.warn('物流查询失败:', result);
            logisticsData.value = null;
            errorMessage.value = '查询物流信息失败';
        }
    } catch (error: any) {
        console.error('物流查询异常:', error);
        logisticsData.value = null;
        errorMessage.value = error.message || '网络异常，请稍后再试';
    } finally {
        loading.value = false;
    }
};

// 获取公司名称
const getCompanyName = (shipperCode: string): string => {
    return companyNameMap[shipperCode] || shipperCode || '未知快递';
};

// 获取状态文本
const getStatusText = (state: string): string => {
    return statusTextMap[state] || '未知状态';
};

// 获取状态描述
const getStatusDesc = (state: string): string => {
    return statusDescMap[state] || '';
};

// 获取状态样式类
const getStatusClass = (state: string): string => {
    switch (state) {
        case '3':
            return 'status-delivered';
        case '2':
            return 'status-transit';
        case '1':
            return 'status-picked';
        case '4':
            return 'status-problem';
        default:
            return 'status-unknown';
    }
};

// 获取状态图标
const getStatusIcon = (state: string): string => {
    switch (state) {
        case '3':
            return '/static/images/logistics/delivery.png';
        case '2':
            return '/static/images/logistics/transit.png';
        case '1':
            return '/static/images/logistics/collect.png';
        case '4':
            return '/static/images/logistics/payment.png';
        default:
            return '/static/images/logistics/delivery.png';
    }
};

// 返回方法
const goBack = () => {
    uni.navigateBack();
};

// 复制运单号
const copyTrackingNumber = async () => {
    if (logisticsData.value?.logisticCode) {
        try {
            await uni.setClipboardData({
                data: logisticsData.value.logisticCode,
                success: () => {
                    uni.showToast({
                        title: t('复制成功'),
                        icon: 'success'
                    });
                }
            });
        } catch (error) {
            uni.showToast({
                title: t('复制失败'),
                icon: 'none'
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.logistics-page {
    min-height: 100vh;
    background-color: #f8f9fa;
}

// 自定义导航栏
.custom-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    
    .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 88rpx;
        padding: 0 20rpx;
        margin-top: 80rpx;
        
        .back-btn {
            width: 88rpx;
            height: 88rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .back-icon {
                width: 36rpx;
                height: 36rpx;
            }
        }
        
        .navbar-title {
            flex: 1;
            text-align: center;
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
        }
        
        .placeholder {
            width: 88rpx;
        }
    }
}

.page-content {
    padding: 20rpx;
    margin-top: 175rpx;
}

// 物流信息头部
.logistics-header {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,.08) ;

    .company-section {
        display: flex;
        align-items: center;
        
        .company-icon {
            width: 50rpx;
            height: 50rpx;
            margin-right: 30rpx;
        }
        
        .company-info {
            flex: 1;
            
            .company-name {
                color: #313131;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 10rpx;
            }
            
            .tracking-section {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                
                .label {
                    color: rgba(73, 73, 73, 0.8);
                    font-size: 28rpx;
                    margin-right: 10rpx;
                }
                
                .tracking-number {
                    color: #313131;
                    font-size: 16px;
                    font-weight: 500;
                    margin-right: 20rpx;
                }
                
                .copy-btn {
                       border-radius: 12rpx;
                        padding: 0rpx 9rpx;
                        box-shadow: 0 0 0 2rpx #818181;
                    .copy-text {
                        color: #818181;
                        font-size: 22rpx;
                        position: relative;
                        top: -3rpx;
                    }
                }
            }
        }
    }
}

// 当前状态
.current-status {
    margin-bottom: 20rpx;
    
    .status-card {
        background: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        display: flex;
        align-items: center;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
        
        .status-icon {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .icon-img {
                width: 40rpx;
                height: 40rpx;
            }
        }
        
        .status-content {
            flex: 1;
            
            .status-text {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
                margin-bottom: 10rpx;
            }
            
            .status-desc {
                font-size: 28rpx;
                color: #666;
                line-height: 1.4;
                margin-bottom: 10rpx;
            }
            
            .status-time {
                font-size: 24rpx;
                color: #999;
            }
        }
    }
}

// 物流轨迹
.logistics-traces {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    .traces-title {
        margin-bottom: 30rpx;
        padding-bottom: 20rpx;
        border-bottom: 1rpx solid #f0f0f0;
        
        .title-text {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
        }
    }
    
    .traces-timeline {
        position: relative;
        
        .trace-item {
            position: relative;
            display: flex;
            align-items: flex-start;
            padding: 20rpx 0;
            
            // 时间线
            &:not(:last-child)::before {
                content: '';
                position: absolute;
                left: 12rpx;
                top: 40rpx;
                width: 2rpx;
                height: calc(100% - 20rpx);
                background: #e8e8e8;
            }
            
            .trace-dot {
                width: 24rpx;
                height: 24rpx;
                border-radius: 50%;
                background: #d9d9d9;
                border: 4rpx solid #fff;
                box-shadow: 0 0 0 2rpx #d9d9d9;
                margin-right: 30rpx;
                margin-top: 4rpx;
                flex-shrink: 0;
                z-index: 1;
            }
            
            .trace-content {
                flex: 1;
                
                .trace-desc {
                    font-size: 28rpx;
                    color: #333;
                    line-height: 1.5;
                    margin-bottom: 10rpx;
                }
                
                .trace-time {
                    font-size: 24rpx;
                    color: #999;
                }
            }
            
            // 第一个节点（最新状态）
            &.is-first {
                .trace-dot {
                    background: #1890ff;
                    box-shadow: 0 0 0 2rpx #1890ff;
                    width: 28rpx;
                    height: 28rpx;
                }
                
                .trace-content {
                    .trace-desc {
                        font-weight: 600;
                        color: #1890ff;
                    }
                }
            }
            
            // 已签收状态
            &.is-delivered.is-first {
                .trace-dot {
                    background: #52c41a;
                    box-shadow: 0 0 0 2rpx #52c41a;
                }
                
                .trace-content {
                    .trace-desc {
                        color: #52c41a;
                    }
                }
            }
        }
    }
}

// 空状态
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 40rpx;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    .empty-image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 30rpx;
    }
    
    .empty-text {
        font-size: 32rpx;
        color: #333;
        margin-bottom: 15rpx;
    }
    
    .empty-desc {
        font-size: 26rpx;
        color: #999;
        text-align: center;
        line-height: 1.4;
    }
}

// 加载状态
.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400rpx;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .loading-spinner {
            width: 60rpx;
            height: 60rpx;
            border: 4rpx solid #f3f3f3;
            border-top: 4rpx solid #1890ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20rpx;
        }
        
        .loading-text {
            font-size: 28rpx;
            color: #666;
        }
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 750rpx) {
    .logistics-header {
        .company-section {
            .company-info {
                .tracking-section {
                    .tracking-number {
                        font-size: 28rpx;
                    }
                }
            }
        }
    }
    
    .current-status {
        .status-card {
            .status-icon {
                width: 60rpx;
                height: 60rpx;
                margin-right: 20rpx;
                
                .icon-img {
                    width: 30rpx;
                    height: 30rpx;
                }
            }
        }
    }
}
</style>