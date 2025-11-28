<template>
    <tig-layout title="我的订单">
        <view class="order">
            <view class="order-menu badgecolor">
                <up-tabs
                    v-model:current="currentIndex"
                    line-color="#3444BA"
                    :list="menuTypeList"
                    :active-style="{ padding: '0 14rpx' }"
                    :inactive-style="{ padding: '0 14rpx' }"
                    :scrollable="true"
                    key-name="value"
                    @change="changeMenu"
                />
            </view>
            <view class="placeholder" />
            <view class="order-list">
                <template v-for="(item, index) in orderList" :key="item.orderId">
                    <view class="order-list-item">
                        <view class="order-list-item-header">
                            <text v-if="item.shop" class="special-text" @click.stop="handleToShop(item.shop?.shopId)">
                                <text class="iconfont icon-dianpu" />
                                {{ item.shop?.shopTitle }}
                                <text class="iconfont icon-xiangyou" />
                            </text>
                            <text v-else class="order-special-text"
                                >{{ $t("订单编号") }}：<text class="special-color">{{ item.orderSn }}</text>
                            </text>
                            <text style="color: #404AAF;font-size: 26rpx;font-weight: 500;">{{ getFilteredOrderStatus(item.orderStatusName) }}</text>
                        </view>
                        <view class="order-list-item-content">
                            
                            <!-- <view class="item-content-text">
                                <view> {{ $t("收件人") }}：{{ item.consignee }} </view>
                                <view class="special-color">{{ item.addTime }}</view>
                            </view> -->

                            <view class="item-content-product">
                                <template v-for="subItem in item.items" :key="subItem.itemId">
                                    <navigator :url="'/pages/user/order/info?id=' + subItem.orderId" hover-class="navigator-hover">
                                        <view class="item-content-product-item">
                                            <view class="item-content-product-img">
                                                <tig-image :src="subItem.picThumb" />
                                                <template v-if="subItem.isGift === 1">
                                                    <view class="gift-text">{{ $t("赠品") }}</view>
                                                </template>
                                            </view>
                                            <view class="item-content-product-info">
                                                <view class="product-item-title">
                                                    {{ subItem.productName }}
                                                </view>

                                                <view class="sku-card" :class="{ nodata: !subItem.skuData || subItem.skuData.length === 0 }">
                                                    <template v-if="subItem.skuData && subItem.skuData.length > 0">
                                                        <view v-for="(skuItem, skuIndex) in subItem.skuData" :key="skuIndex" class="sku-item line1">{{
                                                            skuItem.value
                                                        }}</view>
                                                    </template>
                                                </view>
                                                <template v-if="subItem.extraSkuData && subItem.extraSkuData.length">
                                                    <view class="extraskudata-box">
                                                        <view class="extraskudata">
                                                            <template v-for="attr in subItem.extraSkuData" :key="attr">
                                                                <view class="extraskudata-item">
                                                                    <view class="title">{{ attr.attrName }}</view>
                                                                    <view class="line-box">
                                                                        <view class="line" />
                                                                    </view>
                                                                    <view class="content">
                                                                        <text class="line1 content-text">{{ attr.attrValue }}</text>
                                                                        <format-price :show-text="false" class="price" :price-data="attr.attrPrice" v-if="attr.attrPrice" />
                                                                        <view class="num">x{{ subItem.quantity }}</view>
                                                                    </view>
                                                                </view>
                                                            </template>
                                                        </view>
                                                    </view>
                                                </template>
                                                <view class="product-item-price">
                                                    <format-price
                                                        v-if="subItem.price"
                                                        :show-text="false"
                                                        class="product-item-pricenum"
                                                        :decimals-style="{
                                                            fontSize: '25rpx'
                                                        }"
                                                        :currency-style="{
                                                            fontSize: '23rpx'
                                                        }"
                                                        :price-data="subItem.price"
                                                    />
                                                    <text v-else class="product-item-pricenum">¥{{ formatPrices(subItem.price || 0) }}</text>
                                                    <view class="product-item-quantity">x {{ subItem.quantity }}</view>
                                                </view>
                                            </view>
                                        </view>
                                        <!-- <template v-if="subItem.extraSkuData && subItem.extraSkuData.length">
                                            <view class="attr-list">
                                                <template v-for="attr in subItem.extraSkuData" :key="attr">
                                                    <view class="attr-item">
                                                        <view class="sub-title">{{ attr.attrName }}</view>
                                                        <view class="item-content">
                                                            <text class="line1 content-text">{{ attr.attrValue }}</text>
                                                            <view class="right">
                                                                <format-price class="price" :priceData="attr.attrPrice"></format-price>
                                                                <view class="num">x{{ subItem.quantity }}</view>
                                                            </view>
                                                        </view>
                                                    </view>
                                                </template>
                                            </view>
                                        </template> -->
                                    </navigator>
                                </template>
                            </view>

                            <!-- <view class="item-content-pay">
                                <view class="item-content-pay-box">
                                    <view class="pay-item pay-type">
                                        {{ item.payTypeId === 1 ? $t("在线支付") : item.payTypeId === 2 ? $t("货到付款") : t("线下支付") }}</view
                                    >
                                    <view class="pay-item total-money"
                                        >{{ $t("总额") }}：<format-price :show-text="false" :is-bottom="false" :price-data="item.totalAmount"
                                    /></view>
                                    <view v-if="item.orderStatus === 0 && Number(item.unpaidAmount) > 0" class="pay-item">
                                        {{ $t("应付") }}：<format-price :show-text="false" :is-bottom="false" :price-data="item.unpaidAmount" />
                                    </view>
                                </view>
                            </view> -->
                            
                        </view>
                        <!-- 待支付订单的特殊底部样式 -->
                        <template v-if="item.availableActions.toPay">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">待支付：</text>
                                        <text class="price-amount">¥{{ formatPrices(item.unpaidAmount || item.totalAmount || item.productAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <view class="more-btn" :id="`more-btn-${item.orderId}`" @click.stop="toggleMoreActions(item.orderId, index)">
                                            <text class="more-text">更多</text>
                                        </view>
                                    </view>

                                    <view class="action-center">
                                        <!-- 支付倒计时 -->
                                        <view v-if="getCountdownTime(item)" class="countdown">
                                            <text class="countdown-text">剩余支付时间 {{ getCountdownTime(item) }}</text>
                                        </view>
                                    </view>

                                    <view class="action-right">
                                        <view class="pay-btn" @click="handlePay(item.orderId)">
                                            <text class="pay-btn-text">立即支付</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 待发货订单的特殊底部样式 -->
                        <template v-else-if="item.orderStatus === 1 || item.availableActions.toShip">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">实付款：</text>
                                        <text class="price-amount">¥{{ formatPrices(item.totalAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <view class="more-btn" :id="`more-btn-${item.orderId}`" @click.stop="toggleMoreActions(item.orderId, index)">
                                            <text class="more-text">更多</text>
                                        </view>
                                    </view>


                                    <view class="action-right">
                                        <view
                                            class="invoice-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff; margin-right: 10rpx;"
                                            @tap="handleApplyInvoice(item.orderId)"
                                            @click="handleApplyInvoice(item.orderId)"
                                        >
                                            <text class="invoice-btn-text" style="font-size: 28rpx; color: #1c1c1c;">申请开票</text>
                                        </view>
                                        <view
                                            class="logistics-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #3544BA; border-radius: 50rpx; background-color: #3544BA;"
                                            @tap="handleAfterSales(item.orderId)"
                                            @click="handleAfterSales(item.orderId)"
                                        >
                                            <text class="logistics-btn-text" style="font-size: 28rpx; color: #ffffff;">申请售后</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 待评价订单的特殊底部样式：只有确认收货后且没有售后完成且需要评价的订单才显示 -->
                        <template v-else-if="item.payStatus === 2 && item.orderStatus === 5 && item.shippingStatus === 2 && item.availableActions.toComment">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">实付款：</text>
                                        <text class="price-amount">￥{{ formatPrices(item.totalAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <view class="more-btn" :id="`more-btn-${item.orderId}`" @click.stop="toggleMoreActions(item.orderId, index)">
                                            <text class="more-text">更多</text>
                                        </view>
                                    </view>

                                    <view class="action-right">
                                        <view
                                            class="invoice-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff; margin-right: 10rpx;"
                                            @tap="handleApplyInvoice(item.orderId)"
                                            @click="handleApplyInvoice(item.orderId)"
                                        >
                                            <text class="invoice-btn-text" style="font-size: 28rpx; color: #1c1c1c;">申请开票</text>
                                        </view>
                                        <view
                                            class="comment-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #3544ba; border-radius: 50rpx; background-color: #3544ba;"
                                            @tap="handleEvaluate(item.orderId)"
                                            @click="handleEvaluate(item.orderId)"
                                        >
                                            <text class="comment-btn-text" style="font-size: 28rpx; color: #ffffff;">去评论</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 已取消订单的特殊底部样式 -->
                        <template v-else-if="item.orderStatus === 3">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">实付款：</text>
                                        <text class="price-amount">¥{{ formatPrices(item.totalAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 - 无更多按钮 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <!-- 已取消订单不显示更多按钮 -->
                                    </view>

                                    <view class="action-right">
                                        <view
                                            class="delete-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff; margin-right: 10rpx;"
                                            @tap="handleDelOrder(item.orderId)"
                                            @click="handleDelOrder(item.orderId)"
                                        >
                                            <text class="delete-btn-text" style="font-size: 28rpx; color: #1c1c1c;">删除订单</text>
                                        </view>
                                        <view
                                            class="cart-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff;"
                                            @tap="handleAddToCart(item.orderId)"
                                            @click="handleAddToCart(item.orderId)"
                                        >
                                            <text class="cart-btn-text" style="font-size: 28rpx; color: #1c1c1c;">加入购物车</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 已完成且评论完的订单特殊底部样式 -->
                        <template v-else-if="item.orderStatus === 5 && !item.availableActions.toComment">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">实付款：</text>
                                        <text class="price-amount">￥{{ formatPrices(item.totalAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <view class="more-btn" :id="`more-btn-${item.orderId}`" @click.stop="toggleMoreActions(item.orderId, index)">
                                            <text class="more-text">更多</text>
                                        </view>
                                    </view>

                                    <view class="action-center">
                                        <!-- 已完成订单无倒计时 -->
                                    </view>

                                    <view class="action-right">
                                        <!-- 如果是售后完成订单，显示售后详情按钮 -->
                                        <template v-if="item.isAfterSaleCompleted">
                                            <view
                                                class="after-sale-detail-btn"
                                                style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff;"
                                                @tap="handleAfterSaleDetail(item.orderId)"
                                                @click="handleAfterSaleDetail(item.orderId)"
                                            >
                                                <text class="after-sale-detail-btn-text" style="font-size: 28rpx; color: #1c1c1c;">售后详情</text>
                                            </view>
                                        </template>
                                        <!-- 普通已完成订单显示申请开票按钮 -->
                                        <template v-else>
                                            <view
                                                class="invoice-btn"
                                                style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff;"
                                                @tap="handleApplyInvoice(item.orderId)"
                                                @click="handleApplyInvoice(item.orderId)"
                                            >
                                                <text class="invoice-btn-text" style="font-size: 28rpx; color: #1c1c1c;">申请开票</text>
                                            </view>
                                        </template>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 待收货订单的特殊底部样式 -->
                        <template v-else-if="item.orderStatus === 2 || item.availableActions.confirmReceipt">
                            <view class="order-pay-footer">
                                <!-- 商品统计和总价 -->
                                <view class="pay-summary">
                                    <text class="summary-text">共{{ getTotalQuantity(item.items) }}件商品</text>
                                    <view class="summary-price">
                                        <text style="font-size: 28rpx; color: #666;">实付款：</text>
                                        <text class="price-amount">¥{{ formatPrices(item.totalAmount || 0) }}</text>
                                    </view>
                                </view>

                                <!-- 操作按钮区域 -->
                                <view class="pay-actions">
                                    <view class="action-left">
                                        <view class="more-btn" :id="`more-btn-${item.orderId}`" @click.stop="toggleMoreActions(item.orderId, index)">
                                            <text class="more-text">更多</text>
                                        </view>
                                    </view>

                                    <view class="action-center">
                                        <!-- 待收货订单无倒计时 -->
                                    </view>

                                    <view class="action-right">
                                        <view
                                            class="logistics-btn"
                                            style="padding: 16rpx 32rpx; border: 1rpx solid #808080; border-radius: 50rpx; background-color: #fff; margin-right: 10rpx;"
                                            @tap="handleLogisticsDetail(item.orderId)"
                                            @click="handleLogisticsDetail(item.orderId)"
                                        >
                                            <text class="logistics-btn-text" style="font-size: 28rpx; color: #1c1c1c;">物流详情</text>
                                        </view>
                                        <view
                                            class="confirm-receipt-btn"
                                            style="padding: 16rpx 40rpx; background: #3544BA; border-radius: 50rpx; box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);"
                                            @tap="handleConfirmReceipt(item.orderId)"
                                            @click="handleConfirmReceipt(item.orderId)"
                                        >
                                            <text class="confirm-receipt-btn-text" style="font-size: 30rpx; color: #fff; font-weight: 500;">确认收货</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </template>

                        <!-- 其他状态订单的原有底部样式 -->
                        <template v-else>
                            <view class="order-list-item-btn">
                                <view class="autodeliverydays">
                                    <template v-if="item.autoDeliveryDays">
                                        <view class="autodeliverydays-text line1">订单将在{{ item.autoDeliveryDays }}天后自动收货</view>
                                    </template>
                                </view>
                                <view class="item-btn-box">
                                    <tig-button
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        :plain-main-color="true"
                                        @click="handleOrederDetail(item.orderId)"
                                    >
                                        {{ $t("订单详情") }}
                                    </tig-button>
                                    <tig-button
                                        v-if="item.availableActions.cancelOrder"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleCancelOrder(item.orderId)"
                                    >
                                        {{ $t("取消订单") }}
                                    </tig-button>
                                    <tig-button
                                        v-if="item.availableActions.delOrder"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleDelOrder(item.orderId)"
                                    >
                                        {{ $t("删除订单") }}
                                    </tig-button>
                                    <tig-button
                                        v-if="item.availableActions.rebuy"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleBuyAgain(item.orderId)"
                                    >
                                        {{ $t("再次购买") }}
                                    </tig-button>
                                    <!-- 只有在没有售后完成的情况下且需要评价的订单才显示去评价按钮 -->
                                    <tig-button
                                        v-if="item.availableActions.toComment && !item.isAfterSaleCompleted"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleEvaluate(item.orderId)"
                                    >
                                        {{ $t("去评价") }}
                                    </tig-button>
                                    <!-- 如果是售后完成订单，显示售后详情按钮 -->
                                    <tig-button
                                        v-if="item.isAfterSaleCompleted"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleAfterSaleDetail(item.orderId)"
                                    >
                                        {{ $t("售后详情") }}
                                    </tig-button>
                                    <tig-button
                                        v-if="item.availableActions.confirmReceipt"
                                        color="#333"
                                        class="btn-margin"
                                        :custom-style="{ height: '55rpx' }"
                                        :plain="true"
                                        @click="handleConfirmReceipt(item.orderId)"
                                    >
                                        {{ $t("确认收货") }}
                                    </tig-button>
                                </view>
                            </view>
                        </template>
                    </view>
                </template>
            </view>
            <loading-box v-model="isLoadMore" :page="filterParams.page" :length="orderList.length" />

            <!-- 空订单状态 -->
            <view v-if="!isLoading && total === 0" class="empty-order-container">
                <view class="empty-content">
                    <image class="empty-image" :src="getEmptyStateConfig().image" mode="aspectFit" />
                    <text class="empty-text">{{ getEmptyStateConfig().text }}</text>
                    <text class="empty-desc">{{ getEmptyStateConfig().desc }}</text>
                </view>
            </view>
        </view>
        <tig-loadingpage v-model="isLoading" />

        <!-- 更多操作下拉菜单 - 定位到更多按钮下方 -->
        <view
            v-if="expandedOrderId"
            class="more-dropdown-container"
            @tap="closeMoreActions"
            @click="closeMoreActions"
            @touchmove.stop=""
        >
            <view
                class="more-actions-dropdown"
                :style="{
                    top: dropdownPosition.top + 'px',
                    left: dropdownPosition.left + 'px'
                }"
                @tap.stop=""
                @click.stop=""
                @touchmove.stop=""
            >
                <!-- 小箭头 -->
                <view class="dropdown-arrow-border"></view>
                <view class="dropdown-arrow"></view>

                <!-- 根据订单状态显示不同的菜单项 -->
                <template v-if="getExpandedOrder()?.availableActions?.toComment && !getExpandedOrder()?.isAfterSaleCompleted">
                    <!-- 待评价订单的菜单项（仅限非售后完成订单） -->
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAfterSales, expandedOrderId)" @click="handleDropdownItemClick(handleAfterSales, expandedOrderId)">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAddToCart, expandedOrderId)" @click="handleDropdownItemClick(handleAddToCart, expandedOrderId)">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)" @click="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)">
                        <text class="dropdown-text">物流详情</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleDelOrder, expandedOrderId)" @click="handleDropdownItemClick(handleDelOrder, expandedOrderId)">
                        <text class="dropdown-text">删除订单</text>
                    </view>
                </template>
                <template v-else-if="getExpandedOrder()?.isAfterSaleCompleted">
                    <!-- 售后完成订单的菜单项 -->
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAfterSaleDetail, expandedOrderId)" @click="handleDropdownItemClick(handleAfterSaleDetail, expandedOrderId)">
                        <text class="dropdown-text">售后详情</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAddToCart, expandedOrderId)" @click="handleDropdownItemClick(handleAddToCart, expandedOrderId)">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)" @click="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)">
                        <text class="dropdown-text">物流详情</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleDelOrder, expandedOrderId)" @click="handleDropdownItemClick(handleDelOrder, expandedOrderId)">
                        <text class="dropdown-text">删除订单</text>
                    </view>
                </template>
                <template v-else-if="getExpandedOrder()?.orderStatus === 2 || getExpandedOrder()?.availableActions?.confirmReceipt">
                    <!-- 待收货订单的菜单项 -->
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAfterSales, expandedOrderId)" @click="handleDropdownItemClick(handleAfterSales, expandedOrderId)">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAddToCart, expandedOrderId)" @click="handleDropdownItemClick(handleAddToCart, expandedOrderId)">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleApplyInvoice, expandedOrderId)" @click="handleDropdownItemClick(handleApplyInvoice, expandedOrderId)">
                        <text class="dropdown-text">申请开票</text>
                    </view>
                </template>
                <template v-else-if="getExpandedOrder()?.orderStatus === 5 && !getExpandedOrder()?.availableActions?.toComment">
                    <!-- 已完成且评论完的订单菜单项 -->
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAfterSales, expandedOrderId)" @click="handleDropdownItemClick(handleAfterSales, expandedOrderId)">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAddToCart, expandedOrderId)" @click="handleDropdownItemClick(handleAddToCart, expandedOrderId)">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)" @click="handleDropdownItemClick(handleLogisticsDetail, expandedOrderId)">
                        <text class="dropdown-text">物流详情</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleDelOrder, expandedOrderId)" @click="handleDropdownItemClick(handleDelOrder, expandedOrderId)">
                        <text class="dropdown-text">删除订单</text>
                    </view>
                </template>
                <template v-else>
                    <!-- 其他订单状态的默认菜单项 -->
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleAddToCart, expandedOrderId)" @click="handleDropdownItemClick(handleAddToCart, expandedOrderId)">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap="handleDropdownItemClick(handleCancelOrder, expandedOrderId)" @click="handleDropdownItemClick(handleCancelOrder, expandedOrderId)">
                        <text class="dropdown-text">取消订单</text>
                    </view>
                </template>
            </view>
        </view>
        
        <!-- 支付方式选择弹窗 -->
        <view v-if="showPaymentModal" class="payment-modal-overlay" @tap="closePaymentModal">
            <view class="payment-modal" @tap.stop="">
                <view class="modal-header">
                    <text class="modal-title">选择支付方式</text>
                    <text class="modal-close" @tap="closePaymentModal">✕</text>
                </view>
                <view class="modal-content">
                    <!-- 微信支付 -->
                    <view class="payment-option" @tap="selectPaymentAndPay('wechat')">
                        <view class="option-left">
                            <image src="/static/images/common/wechatpay.png" class="option-icon" />
                            <text class="option-name">微信支付</text>
                        </view>
                        <image v-if="selectedPaymentMethod === 'wechat'" src="/static/images/common/check.png" class="option-check" />
                    </view>
                    <!-- 支付宝支付 -->
                    <view class="payment-option" @tap="selectPaymentAndPay('alipay')">
                        <view class="option-left">
                            <image src="/static/images/common/alipay.png" class="option-icon" />
                            <text class="option-name">支付宝支付</text>
                        </view>
                        <image v-if="selectedPaymentMethod === 'alipay'" src="/static/images/common/check.png" class="option-check" />
                    </view>
                </view>
            </view>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">

import { reactive, ref, onUnmounted, nextTick, computed } from "vue";
import { getOrderList, cancelOrder, delOrder, orderBuyAgain, confirmReceipt } from "@/api/user/order";
import type { OrderListFilterParams, OrderListFilterResult } from "@/types/user/order";
import { onLoad } from "@dcloudio/uni-app";
import { redirect } from "@/utils";
import { useList } from "@/hooks";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "@/store/config";
import { creatPay } from "@/api/order/pay";

const { t } = useI18n();
const configStore = useConfigStore();

// 判断是否为微信生态
const isWechatEcosystem = computed(() => {
    return configStore.XClientType === 'wechat' || configStore.XClientType === 'miniProgram';
});

// 支付相关状态
const showPaymentModal = ref(false);
const selectedPaymentMethod = ref<'wechat' | 'alipay'>('wechat');
const currentPayOrderId = ref<number | null>(null);

interface MenuType {
    type: string;
    value: string;
    badge: AnyObject;
}
const menuTypeList = reactive<MenuType[]>([
    { type: "all", value: t("全部订单"), badge: { value: 0 } },
    { type: "awaitPay", value: t("待支付"), badge: { value: 0 } },
    { type: "awaitShipping", value: t("待发货"), badge: { value: 0 } },
    { type: "awaitReceived", value: t("待收货"), badge: { value: 0 } },
    { type: "awaitComment", value: t("待评价"), badge: { value: 0 } }
]);
const currentType = ref<string>("all");
const filterParams = reactive<OrderListFilterParams>({
    page: 1,
    size: 10,
    orderStatus: -1,
    commentStatus: -1
});

const currentIndex = ref(0);
const expandedOrderId = ref<number | null>(null);
const countdownTimers = ref<Map<number, number>>(new Map()); // 存储每个订单的倒计时
const countdownIntervals = ref<Map<number, any>>(new Map()); // 存储定时器
const dropdownPosition = ref({ top: 0, left: 0 }); // 下拉菜单位置

const changeMenu = (data: any) => {
    if (currentType.value === data.type) return;
    currentType.value = data.type;
    filterParams.page = 1;
    orderList.value = [];
    if (data.type === "awaitComment") {
        filterParams.commentStatus = 0;
        filterParams.orderStatus = 5; // 只显示已完成的订单
        filterParams.isAfterSaleCompleted = false; // 排除售后完成的订单
    } else {
        filterParams.orderStatus = formatOrderStatus(data.type);
        filterParams.commentStatus = -1;
        delete filterParams.isAfterSaleCompleted; // 其他类型不过滤售后状态
    }
    getList();
};

const {
    getList,
    data: orderList,
    isLoadMore,
    isLoading,
    total
} = useList<OrderListFilterResult>(getOrderList, {
    params: filterParams,
    path: {
        dataKey: "records"
    }
});

const handleCancelOrder = async (id: number) => {
    // 先关闭更多操作
    expandedOrderId.value = null;

    uni.showModal({
        title: t("提示"),
        content: t("确认要取消该订单吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await cancelOrder({ id });
                    filterParams.page = 1;
                    orderList.value = [];
                    getList();
                } catch (error: any) {
                    uni.showToast({
                        title: error.message,
                        icon: "none"
                    });
                }
            }
        }
    });
};

const handleDelOrder = async (id: number) => {
    uni.showModal({
        title: t("提示"),
        content: t("确认要删除该订单吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await delOrder({ id });
                    filterParams.page = 1;
                    orderList.value = [];
                    getList();
                } catch (error: any) {
                    uni.showToast({
                        title: error.message,
                        icon: "none"
                    });
                }
            }
        }
    });
};

const handleBuyAgain = async (id: number) => {
    try {
        await orderBuyAgain({ id });
        redirect({ url: "/pages/cart/index" });
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

const handleAddToCart = async (id: number) => {
    try {
        // 先关闭更多操作
        expandedOrderId.value = null;

        await orderBuyAgain({ id });
        uni.showToast({
            title: t("已加入购物车"),
            icon: "success"
        });
    } catch (error: any) {
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

// 立即支付 - 智能处理
const handlePay = (id: number) => {
    currentPayOrderId.value = id;
    
    // 如果是微信生态，直接调起微信支付
    if (isWechatEcosystem.value) {
        directPay('wechat');
    } else {
        // H5/APP 显示支付方式选择弹窗
        showPaymentModal.value = true;
    }
};

// 关闭支付方式选择弹窗
const closePaymentModal = () => {
    showPaymentModal.value = false;
    selectedPaymentMethod.value = 'wechat';
};

// 选择支付方式并支付
const selectPaymentAndPay = (method: 'wechat' | 'alipay') => {
    selectedPaymentMethod.value = method;
    showPaymentModal.value = false;
    directPay(method);
};

// 直接调起支付
const directPay = async (paymentType: 'wechat' | 'alipay') => {
    if (!currentPayOrderId.value) return;
    
    try {
        uni.showLoading({
            title: t("支付中..."),
            mask: true
        });
        
        let payResult;
        
        // 微信小程序需要先获取 code
        // #ifdef MP-WEIXIN
        if (paymentType === 'wechat') {
            payResult = await new Promise((resolve, reject) => {
                // @ts-ignore
                wx.login({
                    success: async (res: any) => {
                        try {
                            const result = await creatPay({
                                id: currentPayOrderId.value!,
                                type: 'wechat',
                                code: res.code
                            });
                            resolve(result);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    fail: (err: any) => {
                        reject(err);
                    }
                });
            });
        } else {
            payResult = await creatPay({
                id: currentPayOrderId.value,
                type: paymentType
            });
        }
        // #endif
        
        // #ifndef MP-WEIXIN
        // 其他平台直接创建支付订单
        payResult = await creatPay({
            id: currentPayOrderId.value,
            type: paymentType
        });
        // #endif
        
        uni.hideLoading();
        
        if (payResult && payResult.payInfo) {
            // 根据平台调起对应的支付
            if (configStore.XClientType === 'miniProgram') {
                // 微信小程序支付
                miniProgramPay(payResult.payInfo, currentPayOrderId.value);
            } else if (configStore.XClientType === 'wechat') {
                // 微信公众号支付
                if (paymentType === 'wechat') {
                    window.open(payResult.payInfo.url, '_blank');
                }
            } else if (configStore.XClientType === 'h5') {
                // H5支付
                if (paymentType === 'wechat') {
                    window.open(payResult.payInfo.url, '_blank');
                } else if (paymentType === 'alipay' && payResult.payInfo.html) {
                    // 支付宝 H5 支付
                    const div = document.createElement('div');
                    div.innerHTML = payResult.payInfo.html;
                    document.body.appendChild(div);
                    const form = div.querySelector('form');
                    if (form) {
                        form.submit();
                    }
                }
            } else if (configStore.XClientType === 'app') {
                // APP 支付
                appPay(payResult.payInfo, paymentType);
            }
            
            // 支付后跳转到支付状态页面或返回
            setTimeout(() => {
                uni.redirectTo({
                    url: '/pages/user/order/list?type=awaitPay'
                });
            }, 2000);
        }
    } catch (error: any) {
        uni.hideLoading();
        uni.showToast({
            title: error.message || t("支付失败"),
            icon: 'none',
            duration: 2000
        });
    }
};

// 微信小程序支付
const miniProgramPay = (payInfo: any, orderId: number) => {
    // @ts-ignore
    wx.requestPayment({
        timeStamp: String(payInfo.timeStamp),
        nonceStr: payInfo.nonceStr,
        package: payInfo.package,
        signType: payInfo.signType,
        paySign: payInfo.paySign,
        success: () => {
            uni.showToast({
                title: t("支付成功"),
                duration: 1500
            });
            setTimeout(() => {
                uni.redirectTo({
                    url: '/pages/user/order/list'
                });
            }, 1500);
        },
        fail: () => {
            uni.showToast({
                title: t("支付失败"),
                duration: 1500,
                icon: 'none'
            });
        }
    });
};

// APP 支付
const appPay = (payInfo: any, paymentType: 'wechat' | 'alipay') => {
    if (paymentType === 'wechat') {
        // 微信APP支付
        uni.requestPayment({
            provider: 'wxpay',
            orderInfo: {
                appid: payInfo.appId,
                noncestr: payInfo.nonceStr,
                package: payInfo.package,
                partnerid: String(payInfo.partnerId),
                prepayid: payInfo.prepayId,
                timestamp: payInfo.timeStamp,
                sign: payInfo.sign
            },
            success() {
                uni.showToast({
                    title: t("支付成功"),
                    duration: 1500
                });
            },
            fail() {
                uni.showToast({
                    title: t("支付失败"),
                    duration: 1500,
                    icon: 'none'
                });
            }
        });
    } else {
        // 支付宝APP支付
        uni.requestPayment({
            provider: payInfo.provider || 'alipay',
            orderInfo: payInfo.orderInfo,
            success() {
                uni.showToast({
                    title: t("支付成功"),
                    duration: 1500
                });
            },
            fail() {
                uni.showToast({
                    title: t("支付失败"),
                    duration: 1500,
                    icon: 'none'
                });
            }
        });
    }
};

// 处理申请开票
const handleApplyInvoice = (orderId: number) => {
    uni.navigateTo({
        url: `/pages/user/invoice/apply?orderId=${orderId}`
    });
};

// 处理物流详情
const handleLogisticsDetail = (id: number) => {
    uni.navigateTo({
        url: `/pages/user/order/shoppingInfo?id=${id}`
    });
};

// 处理售后详情
const handleAfterSaleDetail = (orderId: number) => {
    uni.navigateTo({
        url: `/pages/user/afterSale/detail?orderId=${orderId}`
    });
};

// 获取当前展开的订单信息
const getExpandedOrder = () => {
    if (!expandedOrderId.value) return null;
    return orderList.value.find(order => order.orderId === expandedOrderId.value);
};

// 处理申请售后
const handleAfterSales = (orderId: number) => {
    uni.navigateTo({
        url: `/pages/user/afterSale/edit?orderId=${orderId}`
    });
};

const handleOrederDetail = (id: number) => {
    uni.navigateTo({
        url: `/pages/user/order/info?id=${id}`
    });
};
const handleEvaluate = (id: number) => {
    uni.navigateTo({
        url: `/pages/user/comment/info?id=${id}`
    });
};
const handleConfirmReceipt = (id: number) => {
    uni.showModal({
        title: t("提示"),
        content: t("确认收货吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await confirmReceipt({ id });
                    uni.redirectTo({
                        url: "/pages/user/order/list?type=awaitComment"
                    });
                } catch (error: any) {
                    uni.showToast({
                        title: error.message,
                        icon: "none"
                    });
                }
            }
        }
    });
};

const handleToShop = (id: number) => {
    uni.navigateTo({
        url: `/pages/shop/index?shopId=${id}`
    });
};
const formatOrderStatus = (status: string) => {
    switch (status) {
        case "all":
            return -1;
        case "awaitPay":
            return 0;
        case "awaitShipping":
            return 1;
        case "awaitReceived":
            return 2;
        default:
            return -1;
    }
};

// 空状态配置映射
const emptyStateConfig = {
    all: {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880vZYp8jdsXtbPshx9B6.jpeg",
        text: t("暂无订单"),
        desc: t("您还没有任何订单记录")
    },
    awaitPay: {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880cdOrKjg0Od9bHE7LHW.jpeg",
        text: t("暂无待支付订单"),
        desc: t("您没有需要支付的订单")
    },
    awaitShipping: {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880Mnz8Rv2y15GUvGFRJv.jpeg",
        text: t("暂无待发货订单"),
        desc: t("您没有等待发货的订单")
    },
    awaitReceived: {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880Mnz8Rv2y15GUvGFRJv.jpeg",
        text: t("暂无待收货订单"),
        desc: t("您没有等待收货的订单")
    },
    awaitComment: {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880z0mMO8S5n9KqitAkgK.jpeg",
        text: t("暂无待评价订单"),
        desc: t("您没有需要评价的订单")
    }
};

// 获取空状态配置
const getEmptyStateConfig = () => {
    return emptyStateConfig[currentType.value as keyof typeof emptyStateConfig] || {
        image: "https://sankuwa-image.oss-cn-hangzhou.aliyuncs.com/img/gallery/202509/1758705880vZYp8jdsXtbPshx9B6.jpeg",
        text: t("暂无订单"),
        desc: t("快去购买心仪的商品吧")
    };
};

// 切换更多操作显示
const toggleMoreActions = (orderId: number, orderIndex?: number) => {
    // 检查是否为已取消订单，已取消订单不显示下拉菜单
    const order = orderList.value.find(item => item.orderId === orderId);
    if (order && order.orderStatus === 3) {
        return; // 已取消订单不显示下拉菜单
    }

    if (expandedOrderId.value === orderId) {
        expandedOrderId.value = null;
    } else {
        expandedOrderId.value = orderId;

        // 使用 uni.createSelectorQuery 获取更多按钮的精确位置
        nextTick(() => {
            // #ifdef H5
            // H5环境下使用 DOM API
            const element = document.querySelector(`#more-btn-${orderId}`) as HTMLElement;
            if (element) {
                const rect = element.getBoundingClientRect();
                dropdownPosition.value = {
                    top: rect.bottom + window.scrollY + 10,
                    left: rect.left + window.scrollX
                };
            } else {
                // 降级方案：使用估算位置
                dropdownPosition.value = {
                    top: 200 + (orderIndex || 0) * 300,
                    left: 40
                };
            }
            // #endif
            
            // #ifndef H5
            // 小程序环境下使用 uni.createSelectorQuery
            const query = uni.createSelectorQuery();
            query.select(`#more-btn-${orderId}`).boundingClientRect((rect) => {
                if (rect && !Array.isArray(rect)) {
                    dropdownPosition.value = {
                        top: (rect.bottom || 0) + 10,
                        left: rect.left || 40
                    };
                } else {
                    // 降级方案：使用估算位置
                    dropdownPosition.value = {
                        top: 200 + (orderIndex || 0) * 300,
                        left: 40
                    };
                }
            }).exec();
            // #endif
        });
    }
};

// 关闭更多操作
const closeMoreActions = () => {
    expandedOrderId.value = null;
};

// 处理下拉菜单项点击后自动关闭
const handleDropdownItemClick = (handler: Function, ...args: any[]) => {
    handler(...args);
    closeMoreActions();
};

// 过滤订单状态名称，去掉"待确认"和"已确认"
const getFilteredOrderStatus = (statusName: string) => {
    if (!statusName) return '';

    // 去掉"待确认"和"已确认"状态，只保留"待支付"等其他状态
    if (statusName === '待确认' || statusName === '已确认') {
        return '';
    }

    return statusName;
};

// 计算订单商品总数量
const getTotalQuantity = (items: any[]) => {
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// 格式化价格显示
const formatPrices = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 转换日期格式以兼容 iOS
const parseDate = (dateString: string) => {
    if (!dateString) return new Date();

    try {
        // 将 "2025-08-29 10:52:58" 格式转换为 "2025/08/29 10:52:58" 格式
        const formattedDate = dateString.replace(/-/g, '/');
        const date = new Date(formattedDate);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', dateString);
            return new Date();
        }

        return date;
    } catch (error) {
        console.error('Date parsing error:', error, dateString);
        return new Date();
    }
};

// 初始化订单倒计时（15分钟 = 900秒）
const initCountdown = (orderId: number, createTime?: string) => {
    if (countdownTimers.value.has(orderId)) return;

    // 如果有创建时间，计算已经过去的时间
    let remainingSeconds = 15 * 60; // 15分钟

    if (createTime) {
        try {
            const now = new Date().getTime();
            const orderTime = parseDate(createTime).getTime();

            // 确保时间戳有效
            if (isNaN(orderTime) || orderTime <= 0) {
                console.warn('Invalid order time:', createTime);
                return;
            }

            const elapsedSeconds = Math.floor((now - orderTime) / 1000);
            remainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
        } catch (error) {
            console.error('Countdown initialization error:', error);
            return;
        }
    }

    if (remainingSeconds <= 0) return;

    countdownTimers.value.set(orderId, remainingSeconds);

    // 启动定时器
    const interval = setInterval(() => {
        const current = countdownTimers.value.get(orderId);
        if (current && current > 0) {
            countdownTimers.value.set(orderId, current - 1);
        } else {
            // 倒计时结束，清除定时器
            clearInterval(interval);
            countdownTimers.value.delete(orderId);
            countdownIntervals.value.delete(orderId);
        }
    }, 1000);

    countdownIntervals.value.set(orderId, interval);
};

// 格式化倒计时显示
const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 获取订单倒计时显示
const getCountdownTime = (order: any) => {
    // 只有待支付订单才显示倒计时
    if (order.orderStatus !== 0 || !order.availableActions?.toPay) {
        return null;
    }

    // 初始化倒计时
    initCountdown(order.orderId, order.addTime);

    const remainingSeconds = countdownTimers.value.get(order.orderId);
    if (remainingSeconds && remainingSeconds > 0) {
        return formatCountdown(remainingSeconds);
    }

    return null;
};

onLoad((options) => {
    if (options && options.type) {
        currentIndex.value = menuTypeList.findIndex((item) => item.type === options.type);

        if (options.type === "awaitComment") {
            filterParams.commentStatus = 0;
        } else {
            filterParams.orderStatus = formatOrderStatus(options.type);
        }
        currentType.value = options.type;
    }
    getList();
});

// 组件销毁时清理所有定时器
onUnmounted(() => {
    countdownIntervals.value.forEach((interval) => {
        clearInterval(interval);
    });
    countdownIntervals.value.clear();
    countdownTimers.value.clear();
});
</script>

<style lang="scss" scoped>
.extraskudata-box {
    display: flex;
    .extraskudata {
        background-color: #f7f8fa;
        padding: 10rpx 15rpx;
        border-radius: 10rpx;
        margin-top: 5rpx;
        color: #969799;
        display: flex;
        flex-direction: column;
        .extraskudata-item {
            overflow: hidden;
            font-size: 22rpx;
            display: flex;
            line-height: 40rpx;
            .content {
                flex: 1;
                display: flex;
                align-items: center;
                overflow: hidden;
                .price {
                    color: #555;
                    padding-left: 10rpx;
                }
                .content-text {
                    flex: 1;
                }
                .num {
                    padding-left: 10rpx;
                }
            }

            .line-box {
                width: 25rpx;
                position: relative;
                .line {
                    width: 1rpx;
                    height: 15rpx;
                    background-color: #c0c0c0;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
}

.attr-list {
    padding-bottom: 10rpx;
    .attr-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 45rpx;
        line-height: 45rpx;
        .sub-title {
            padding-right: 30rpx;
        }
        .item-content {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            overflow: hidden;

            .content-text {
                flex: 1;
                text-align: end;
            }
            .right {
                display: flex;
                padding-left: 10rpx;
                color: #242424;
                .num {
                    padding-left: 10rpx;
                }
            }
        }
    }
}

.placeholder {
    height: 88rpx;
}

.badgecolor {
    :deep(.u-badge--error) {
        background-color: var(--general);
    }
}

.order-menu {
    background-color: #fff;
    margin-bottom: 30rpx;
    position: fixed;
    width: 100%;
    z-index: 88;

    .order-menu-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 88rpx;
        position: relative;

        .order-menu-item-text {
            padding: 0 10rpx 0 0;
        }
        &.active {
            color: #333;
            font-weight: bold;

            &:after {
                content: "";
                position: absolute;
                bottom: 0;
                height: 5rpx;
                width: 60rpx;
                background-color: var(--general);
                border-radius: 10rpx;
            }
        }
    }
}

.order-list {
    padding: 10rpx 20rpx;

    .order-list-item {
        background-color: #fff;
        border-radius: 40rpx;
        margin-bottom: 20rpx;
        padding: 20rpx;
        font-size: 24rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .order-list-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20rpx;
            .special-text {
                font-size: 26rpx;
                font-weight: bold;
            }
            .order-special-text {
                font-size: 26rpx;
                color: #727272;
            }
            .special-color {
                color: #727272;
                font-weight: normal;
            }
        }

        .order-list-item-content {
            .item-content-text {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10rpx;

                .special-color {
                    color: #999;
                }
            }

            .item-content-product-item {
                padding-bottom: 15rpx;
                display: flex;
                &:first-child {
                    padding-top: 15rpx;
                }

                .item-content-product-img {
                    width: 140rpx;
                    height: 140rpx;
                    // border-radius: 10rpx;
                    overflow: hidden;
                    position: relative;

                    .gift-text {
                        position: absolute;
                        top: 0;
                        left: 0;
                        font-size: 23rpx;
                        padding: 3rpx 8rpx;
                        background-color: var(--main-bg);
                        color: var(--main-text);
                        border-radius: 0 var(--tag-round-border-radius, 999px) var(--tag-round-border-radius, 999px) 0;
                    }
                }
                .item-content-product-info {
                    flex: 1;
                    padding-left: 25rpx;
                    overflow: hidden;

                    .product-item-title {
                        font-weight: 500;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        padding-bottom: 10rpx;
                        font-size: 27rpx;
                        margin-top: -5rpx;
                    }

                    .product-item-price {
                        display: flex;
                        padding-top: 10rpx;
                        .product-item-pricenum {
                            font-size: 30rpx;
                        }

                        .product-item-quantity {
                            font-size: 26rpx;
                            color: #999;
                            padding-left: 23rpx;
                            margin-top: 3.3px;
                        }
                    }
                }
            }

            .item-content-pay {
                display: flex;
                justify-content: flex-end;

                .item-content-pay-box {
                    display: flex;
                    .pay-item {
                        padding: 0 10rpx;

                        &.pay-type {
                            color: #999;
                        }

                        &.total-money {
                            .price-content {
                                color: var(--general);
                            }
                        }
                    }
                }
            }
        }

        .order-list-item-btn {
            display: flex;
            justify-content: flex-end;
            padding-top: 25rpx;

            .autodeliverydays {
                flex: 1;
                display: flex;
                align-items: center;
                overflow: hidden;

                .autodeliverydays-text {
                    width: 100%;
                    color: var(--main-bg);
                }
            }

            .item-btn-box {
                display: flex;

                .btn-margin {
                    margin-right: 10rpx;

                    &:last-child {
                        margin-right: 0;
                    }
                }
            }
        }
    }
}

/* 待支付订单特殊样式 */
.order-pay-footer {
    border-top: 1rpx solid #f0f0f0;
    padding-top: 20rpx;
    position: relative;

    .pay-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;

        .summary-text {
            font-size: 28rpx;
            color: #666;
        }

        .summary-price {
            font-size: 32rpx;
            display: flex;
            align-items: center;

            .price-amount {
                color: #000000;
                font-weight: 600;
                margin-left: 8rpx;
            }

            :deep(.price-content) {
                color: #000000;
                font-weight: 600;
            }
        }
    }

    .pay-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .action-left {
            .more-btn {
                padding: 12rpx 24rpx;
                min-width: 80rpx;
                min-height: 60rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;

                .more-text {
                    font-size: 30rpx;
                    color: #666;
                    user-select: none;
                    pointer-events: auto;
                    display: inline-block;
                }

                &:active {
                    background-color: #f8f8f8;
                }
            }
        }

        .action-center {
            flex: 1;
            display: flex;
            justify-content: center;

            .countdown {
                .countdown-text {
                    font-size: 28rpx;
                    color: #ff4757;
                    font-weight: 600;
                    padding: 8rpx 16rpx;
                    border-radius: 20rpx;
                }
            }
        }

        .action-right {
            display: flex;
            align-items: center;
            gap: 10rpx; /* 按钮间距 */

            .pay-btn {
                padding: 16rpx 40rpx;
                background: #3544BA;
                border-radius: 50rpx;
                box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

                .pay-btn-text {
                    font-size: 30rpx;
                    color: #fff;
                    font-weight: 500;
                }

                &:active {
                    background: linear-gradient(135deg, #3744B2, #2A3A9F);
                    transform: scale(0.96);
                }
            }

            /* 待发货订单的申请开票按钮 */
            .invoice-btn {
                padding: 16rpx 32rpx;
                border: 1rpx solid #808080;
                border-radius: 50rpx;
                background-color: #fff;

                .invoice-btn-text {
                    font-size: 28rpx;
                    color: #1c1c1c;
                    font-weight: 500;
                }

                &:active {
                    background-color: #f0f2ff;
                }
            }

            /* 待发货订单的物流详情按钮 */
            .logistics-btn {
                padding: 16rpx 32rpx;
                border: 1rpx solid #3544BA;
                border-radius: 50rpx;
                background-color: #3544BA;

                .logistics-btn-text {
                    font-size: 28rpx;
                    color: #ffffff;
                    font-weight: 500;
                }

                &:active {
                    background-color: #3640a0;
                }
            }

            /* 待评价订单的去评价按钮 */
            .comment-btn {
                padding: 16rpx 32rpx;
                border: 1rpx solid #808080;
                border-radius: 50rpx;
                background-color: #fff;

                .comment-btn-text {
                    font-size: 28rpx;
                    color: #1c1c1c;
                    font-weight: 500;
                }

                &:active {
                    background-color: #f8f8f8;
                }
            }

            /* 已取消订单的删除订单按钮 */
            .delete-btn {
                padding: 16rpx 32rpx;
                border: 1rpx solid #808080;
                border-radius: 50rpx;
                background-color: #fff;

                .delete-btn-text {
                    font-size: 28rpx;
                    color: #1c1c1c;
                    font-weight: 500;
                }

                &:active {
                    background-color: #f8f8f8;
                }
            }

            /* 已取消订单的加入购物车按钮 */
            .cart-btn {
                padding: 16rpx 32rpx;
                border: 1rpx solid #808080;
                border-radius: 50rpx;
                background-color: #fff;

                .cart-btn-text {
                    font-size: 28rpx;
                    color: #1c1c1c;
                    font-weight: 500;
                }

                &:active {
                    background-color: #f8f8f8;
                }
            }

            /* 待收货订单的确认收货按钮 - 与立即支付样式一致 */
            .confirm-receipt-btn {
                padding: 16rpx 40rpx;
                background: #3544BA;
                border-radius: 50rpx;
                box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);

                .confirm-receipt-btn-text {
                    font-size: 30rpx;
                    color: #fff;
                    font-weight: 500;
                }

                &:active {
                    background: linear-gradient(135deg, #3744B2, #2A3A9F);
                    transform: scale(0.96);
                }
            }
        }
    }
}



/* 更多操作下拉展开 */
.more-actions-dropdown {
    position: absolute;
    background-color: #fff;
    border-radius: 18rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    z-index: 9999;
    min-width: 200rpx;
    max-width: 320rpx;
    overflow: visible; /* 显示箭头 */
    border: 1rpx solid #e0e0e0;
    pointer-events: auto;

    /* 添加动画效果 */
    animation: dropdownFadeIn 0.2s ease-out;
    transform-origin: top center;

    /* 箭头边框层 */
    .dropdown-arrow-border {
        position: absolute;
        top: -17rpx;
        left: 60rpx; /* 箭头位置，指向更多按钮 */
        width: 0;
        height: 0;
        border-left: 17rpx solid transparent;
        border-right: 17rpx solid transparent;
        border-bottom: 17rpx solid #e0e0e0;
        z-index: 9999;
    }

    /* 箭头主体层 */
    .dropdown-arrow {
        position: absolute;
        top: -16rpx;
        left: 61rpx; /* 箭头位置，指向更多按钮 */
        width: 0;
        height: 0;
        border-left: 16rpx solid transparent;
        border-right: 16rpx solid transparent;
        border-bottom: 16rpx solid #fff;
        z-index: 10000;
    }

    .dropdown-item {
        padding: 24rpx 30rpx;
        text-align: left; /* 左对齐 */
        border-bottom: 1rpx solid #f8f8f8;
        display: flex;
        align-items: center;
        min-height: 88rpx; /* 确保足够的点击区域 */

        &:last-child {
            border-bottom: none;
        }

        .dropdown-text {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
        }

        &:active {
            background-color: #f8f8f8;
        }
    }
}

/* 更多操作下拉菜单容器 */
.more-dropdown-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    background-color: rgba(0, 0, 0, 0.1); /* 添加半透明遮罩 */
    pointer-events: auto; /* 允许点击事件 */
}



/* 空订单状态 */
.empty-order-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 80rpx 40rpx;
    background-color: #f5f5f5;

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

/* 下拉菜单动画 */
@keyframes dropdownFadeIn {
    0% {
        opacity: 0;
        transform: translateY(-10rpx) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.sku-card{
    display: inline-block;
    background-color: #ffffff;
    font-size: 23rpx;
    color: #969799;
    margin: 8rpx 0 ;
    padding: 0rpx 0rpx;
}

/* 支付方式选择弹窗样式 */
.payment-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: flex-end;
}

.payment-modal {
    width: 100%;
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    animation: slideUp 0.3s ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40rpx 40rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
}

.modal-close {
    font-size: 48rpx;
    color: #999;
    padding: 0 10rpx;
}

.modal-content {
    padding: 20rpx 40rpx 60rpx;
}

.payment-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f8f8f8;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:active {
        background-color: #f8f8f8;
    }
}

.option-left {
    display: flex;
    align-items: center;
    flex: 1;
}

.option-icon {
    width: 70rpx;
    height: 70rpx;
    margin-right: 25rpx;
}

.option-name {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
}

.option-check {
    width: 40rpx;
    height: 40rpx;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}
</style>
