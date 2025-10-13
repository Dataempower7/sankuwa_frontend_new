<template>
    <tig-layout title="订单详情">
        <view class="order-info">

            <template v-if="Object.keys(orderInfo).length">
                <!-- 待支付状态显示 -->
                <template v-if="orderInfo.orderStatus === 0">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/one@3x.png" />
                            <view class="status-text-custom">待支付</view>
                        </view>
                        <view class="countdown-text-custom" v-if="countdownTime">
                            剩余支付时间：{{ countdownTime }}
                        </view>
                    </view>
                </template>

                <!-- 待发货状态显示 -->
                <template v-if="orderInfo.orderStatus === 1">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/one@3x.png" />
                            <view class="status-text-custom">待发货</view>
                        </view>
                        <view class="countdown-text-custom">
                            已付款，等待发货
                        </view>
                    </view>
                </template>

                 <!-- 待收货状态显示 -->
                 <template v-if="orderInfo.orderStatus === 2">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/one@3x.png" />
                            <view class="status-text-custom">待收货</view>
                        </view>
                        <view class="countdown-text-custom">
                            已发货，等待收货
                        </view>
                    </view>
                </template>

                 <!-- 无效订单状态显示 -->
                 <template v-if="orderInfo.orderStatus === 4">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/three@3x.png" />
                            <view class="status-text-custom">订单无效</view>
                        </view>
                        <view class="countdown-text-custom">
                            您的订单被认定为无效订单，订单已被关闭。
                        </view>
                    </view>
                </template>

                  <!-- 待评论状态显示 -->
                  <template v-if="orderInfo.orderStatus === 5 && orderInfo.availableActions?.toComment">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/two@3x.png" />
                            <view class="status-text-custom">待评论</view>
                        </view>
                        <view class="countdown-text-custom">
                            订单已完成，您可以评价该订单。
                        </view>
                    </view>
                </template>

                  <!-- 已完成状态显示 -->
                  <template v-if="orderInfo.orderStatus === 5 && !orderInfo.availableActions?.toComment">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/two@3x.png" />
                            <view class="status-text-custom">已完成</view>
                        </view>
                        <view class="countdown-text-custom">
                            订单已完成，感谢您的购买。
                        </view>
                    </view>
                </template>

                 <!-- 取消状态显示 -->
                 <template v-if="orderInfo.orderStatus === 3">
                    <view class="payment-status-custom">
                        <view class="status-title-custom">
                            <image class="status-icon-img-custom" src="/static/images/after_sale/one@3x.png" />
                            <view class="status-text-custom">订单已取消</view>
                        </view>
                        <view class="countdown-text-custom">
                            订单已取消,您可以通过"再次购买"，重新购买订单中的商品。
                        </view>
                    </view>
                </template>
                <!-- 审核进度条
                <view class="order-info-steps">
                    <uni-steps active-color="var(--general)" :options="orderInfo.stepStatus.steps" :active="orderInfo.stepStatus.current" />
                </view> -->

                <!-- 物流信息模块 - 仅在待收货或已完成状态显示 -->
                <template v-if="(orderInfo.orderStatus === 2 || orderInfo.orderStatus === 5) && logisticsCompany">
                    <view class="logistics-module-custom">
                        <view class="logistics-status-custom" @click="handleLogisticsDetail(orderInfo.orderId)">
                            <view class="logistics-info-custom">
                                <text class="logistics-status-text">已发货</text>
                                <text class="logistics-separator">|</text>
                                <text class="logistics-message">{{ getLatestLogisticsMessage() }}</text>
                            </view>
                            <img src="/static/images/common/right.png" style="width: 25rpx; height: 25rpx;"></img>
                        </view>
                    </view>
                </template>

                <!-- 地址信息模块  -->
                <template >
                    <view class="address-module-custom">
                        <view class="address-content-custom">
                            <view class="address-left-custom">
                                <image class="location-icon-custom" src="/static/images/common/location.png" />
                                <view class="address-box-custom">
                                    <view class="user-info-custom">
                                        <view class="name-custom">{{ orderInfo.consignee + " " + orderInfo.mobile }}</view>
                                    </view>
                                    <view class="address-custom">{{ orderInfo.regionNames?.join(' ') }} {{ orderInfo.address }}</view>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>

                <!-- 商品列表 -->
                <view class="product-card-custom">
                    <template v-for="item in orderInfo.items" :key="item.productId">
                        <view class="item-box">
                            <view v-if="orderInfo.shop" class="shop-info" @click.stop="handleToShop(orderInfo.shop?.shopId)">
                                <text class="text">
                                    {{ orderInfo.shop?.shopTitle }}
                                </text>
                                <text class="iconfont icon-xiangyou" />
                            </view>
                            <view class="product-card-item">
                                <view class="product-card-item-left" @click="handleLink(item.productId)">
                                    <view class="left-img">
                                        <tig-image :src="item.picThumb" mode="aspectFill" />
                                    </view>
                                </view>
                                <view class="product-card-item-right">
                                    <view class="product-card-item-right-top">
                                        <view class="product-card-item-title line2" @click="handleLink(item.productId)">
                                            {{ item.productName }}
                                        </view>
                                        <view class="sku-card" :class="{ nodata: !item.skuData || item.skuData.length === 0 }">
                                            <template v-if="item.skuData && item.skuData.length > 0">
                                                <template v-for="(skuItem, skuIndex) in item.skuData" :key="skuIndex">
                                                    <view class="sku-item line1">{{ skuItem.value }}</view>
                                                </template>
                                            </template>
                                        </view>
                                    </view>
                                    <view class="product-card-item-right-bottom">
                                        <view class="product-card-item-price">
                                            <format-price :show-text="false" :is-bottom="false" :price-data="item.price" />
                                        </view>
                                        <view class="product-card-item-quantity">x{{ item.quantity }}</view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </template>
                </view>

                <!-- 商品总价模块 -->
                <view class="money-card-custom">
                    <view class="money-card-item">
                        <text class="order-item-label">{{ $t("商品总价") }}：</text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.productAmount" />
                    </view>
                    <view v-if="orderInfo.serviceFee && Number(orderInfo.serviceFee) > 0" class="money-card-item">
                        <text class="order-item-label">{{ $t("附加费用") }}：</text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.serviceFee" />
                    </view>
                    <view v-if="orderInfo.shippingFee" class="money-card-item">
                        <text class="order-item-label">{{ $t("运费") }}：</text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.shippingFee" />
                    </view>
                    <view v-if="orderInfo.couponAmount" class="money-card-item">
                        <text class="order-item-label">{{ $t("优惠券") }}：</text>
                        <text class="money-card-item-price"></text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.couponAmount" />
                    </view>
                    <view v-if="orderInfo.pointsAmount" class="money-card-item">
                        <text class="order-item-label">{{ $t("积分抵扣") }}：</text>
                        <text class="money-card-item-price"></text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.pointsAmount" />
                    </view>
                    <view v-if="orderInfo.balance" class="money-card-item">
                        <text class="order-item-label">{{ $t("余额支付") }}：</text>
                        <text class="money-card-item-price"></text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.balance" />
                    </view>
                    <view v-if="orderInfo.discountAmount" class="money-card-item">
                        <text class="order-item-label">{{ $t("优惠金额") }}：</text>
                        <text class="money-card-item-price"></text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.discountAmount" />
                    </view>
                    <view class="money-card-item total">
                        <text class="order-item-label">{{ $t("待付款") }}：</text>
                        <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.totalAmount" style="color: black;" />
                    </view>
                </view>

                <!-- 订单编号模块 -->
                <view class="order-info-custom">
                    <view class="order-card-item">
                        <text class="order-item-label">{{ $t("订单编号") }}：</text>
                        <text>{{ orderInfo.orderSn }}</text>
                    </view>
                    <view class="order-card-item">
                        <text class="order-item-label">{{ $t("下单时间") }}：</text>
                        <text>{{ orderInfo.addTime }}</text>
                    </view>
                    <view class="order-card-item" >
                        <text class="order-item-label">{{ $t("支付方式") }}：</text>
                        <text>{{ orderInfo.payTypeId === 1 ? $t("微信支付") : orderInfo.payTypeId === 2 ? $t("货到付款") : $t("线下支付") }}</text>
                    </view>
                    <view class="order-card-item" >
                        <text class="order-item-label">{{ $t("订单备注") }}：</text>
                        <text>{{ orderInfo.buyerNote || $t("无") }}</text>
                    </view>
                </view>

                <!-- 联系客服模块 -->
                <service
                    ref="serviceRef"
                    :phone="orderInfo.shop && orderInfo.shop.kefuPhone ? orderInfo.shop.kefuPhone : ''"
                    :order-id="orderInfo.orderId"
                    :shop-id="orderInfo.shopId"
                >
                    <view class="service-card-custom" @click="handleService">
                        <view class="service-content">
                            <image class="service-icon" src="/static/images/after_sale/service.png" />
                            <view class="service-text">
                                <view class="service-title">联系客服</view>
                            </view>
                        </view>
                    </view>
                </service>

                <!-- 原有的订单信息（暂时隐藏） -->
                <view class="order-info-content" style="display: none;">
                    <view class="order-card card-space">
                        <view class="order-card-item flex justify-between">
                            <view class="item-left">
                                <text class="order-item-label">{{ $t("订单编号") }}：</text>
                                <text>{{ orderInfo.orderSn }}</text>
                            </view>
                            <!-- <view class="item-right">
                                <text class="order-item-label">{{ $t("订单状态") }}：</text>
                                <text>{{ getFilteredOrderStatus(orderInfo.orderStatusName) }}</text>
                            </view> -->
                        </view>
                        <view class="order-card-item">
                            <text class="order-item-label">{{ $t("下单时间") }}：</text>
                            <text>{{ orderInfo.addTime }}</text>
                        </view>
                        <view class="order-card-item">
                            <text class="order-item-label">{{ $t("订单备注") }}：</text>
                            <text>{{ orderInfo.buyerNote }}</text>
                        </view>
                        <template v-if="orderInfo.autoDeliveryDays">
                            <view class="order-card-item">订单将在{{ orderInfo.autoDeliveryDays }}天后自动收货</view>
                        </template>
                        <template v-else>
                            <view class="order-card-item">{{ oStatusInfo[orderInfo.orderStatus] }}</view>
                        </template>
                    </view>
                    <template v-if="orderInfo.orderId && (orderInfo.orderStatus === 2 || orderInfo.orderStatus === 5)">
                        <view class="expressage-card card-space">
                            <template v-if="shippingInfo.length === 0">
                                <view class="shippingInfo-title"> {{ $t("物流信息") }} </view>
                            </template>

                            <view class="expressage-box">
                                <view class="expressage-info">
                                    <view class="company-name">{{ logisticsCompany || orderInfo.logisticsName }}</view>
                                    <view class="tracking-number">{{ orderInfo.trackingNo }}</view>
                                </view>
                                <view class="copy-btn" @click="handleCopy(orderInfo.trackingNo)">{{ $t("复制") }}</view>
                            </view>
                            <template v-if="shippingInfo.length > 0">
                                <view class="shippingInfo-box">
                                    <view class="shippingInfo-box-content" :class="{ dim: !showMore, 'more-height': showMore }">
                                        <up-steps :current="0" dot active-color="var(--general)" direction="column">
                                            <up-steps-item
                                                v-for="(item, index) in shippingInfo"
                                                :key="index"
                                                :title="item.acceptStation"
                                                :desc="item.acceptTime"
                                            />
                                        </up-steps>
                                    </view>
                                    <view class="shippingInfo-btn" @click="showMore = !showMore"
                                        >{{ showMore ? $t("收起") : $t("展开")
                                        }}<uni-icons class="btn-icon" :class="{ rotate: showMore }" type="down" size="18" color="#999"
                                    /></view>
                                </view>
                            </template>
                            <template v-else>
                                <view class="emptyText">
                                    {{ emptyText }}
                                </view>
                            </template>
                        </view>
                    </template>

                    <!-- <view class="pay-card card-space">
                        <view class="pay-card-item">
                            <text class="order-item-label">{{ $t("收货信息") }}：</text>
                            <text class="address-text">{{ orderInfo.userAddress + " " + orderInfo.consignee + " " + orderInfo.mobile }}</text>
                        </view>
                        <template v-if="orderInfo.shippingTypeName">
                            <view class="pay-card-item">
                                <text class="order-item-label">{{ $t("配送方式") }}：</text>
                                <text>{{ orderInfo.shippingTypeName }}</text>
                            </view>
                        </template>
                        <view class="pay-card-item">
                            <text class="order-item-label">{{ $t("支付方式") }}：</text>
                            <text>{{ orderInfo.payTypeId === 1 ? $t("在线支付") : orderInfo.payTypeId === 2 ? $t("货到付款") : $t("线下支付") }}</text>
                        </view>
                        <template v-if="showService">
                            <view class="pay-card-item im-btn">
                                <service
                                    ref="serviceRef"
                                    :phone="orderInfo.shop && orderInfo.shop.kefuPhone ? orderInfo.shop.kefuPhone : ''"
                                    :order-id="orderInfo.orderId"
                                    :shop-id="orderInfo.shopId"
                                >
                                    <tig-button :plain="true" color="#333" :custom-style="{ height: '55rpx' }" @click="handleService">
                                        {{ $t("联系客服") }}
                                    </tig-button>
                                </service>
                            </view>
                        </template>
                    </view> -->

                    <view class="product-card card-space">
                        <template v-for="item in orderInfo.items" :key="item.productId">
                            <view class="item-box">
                                <view v-if="orderInfo.shop" class="shop-info" @click.stop="handleToShop(orderInfo.shop?.shopId)">
                                    <text class="text">
                                        {{ orderInfo.shop?.shopTitle }}
                                    </text>
                                    <text class="iconfont icon-xiangyou" />
                                </view>
                                <view class="product-card-item">
                                    <view class="product-card-item-left" @click="handleLink(item.productId)">
                                        <view class="left-img">
                                            <tig-image :src="item.picThumb" />
                                            <template v-if="item.isGift === 1">
                                                <view class="gift-text">{{ $t("赠品") }}</view>
                                            </template>
                                        </view>
                                    </view>
                                    <view class="product-card-item-right" @click="handleLink(item.productId)">
                                        <view class="right-title line2">
                                            <text>{{ item.productName }}</text>
                                        </view>
                                        <view class="sku-card" :class="{ nodata: !item.skuData || item.skuData.length === 0 }">
                                            <template v-if="item.skuData && item.skuData.length > 0">
                                                <template v-for="(skuItem, skuIndex) in item.skuData" :key="skuIndex">
                                                    <view class="sku-item line1">{{ skuItem.value }}</view>
                                                </template>
                                            </template>
                                        </view>
                                        <template v-if="item.extraSkuData && item.extraSkuData.length">
                                            <view class="extraskudata-box">
                                                <view class="extraskudata">
                                                    <template v-for="attr in item.extraSkuData" :key="attr">
                                                        <view class="extraskudata-item">
                                                            <view class="title">{{ attr.attrName }}</view>
                                                            <view class="line-box">
                                                                <view class="line" />
                                                            </view>
                                                            <view class="content">
                                                                <text class="line1 content-text">{{ attr.attrValue }}</text>
                                                                <format-price :show-text="false" class="price" :price-data="attr.attrPrice" />
                                                                <view class="num">x{{ item.quantity }}</view>
                                                            </view>
                                                        </view>
                                                    </template>
                                                </view>
                                            </view>
                                        </template>
                                        <view class="right-price">
                                            <format-price
                                                :show-text="false"
                                                class="right-price-pricenum"
                                                :decimals-style="{
                                                    fontSize: '23rpx',
                                                    fontWeight: 'bold'
                                                }"
                                                :currency-style="{
                                                    fontSize: '21rpx',
                                                    fontWeight: 'bold'
                                                }"
                                                :price-data="item.price"
                                            />
                                            <view class="right-price-quantity">x {{ item.quantity }}</view>
                                        </view>
                                    </view>
                                    <template v-if="orderInfo.payStatus === 2 && item.isGift === 0">
                                        <view class="item-btn">
                                            <template v-if="item.aftersalesItem">
                                                <tig-button
                                                    :plain="true"
                                                    color="#333"
                                                    :custom-style="{ height: '55rpx' }"
                                                    @click="handleAfterSaleDetail(item.aftersalesItem.aftersaleId)"
                                                >
                                                    {{ $t("售后详情") }}
                                                </tig-button>
                                            </template>
                                            <template v-else-if="orderInfo.availableActions.toAftersales">
                                                <tig-button
                                                    :plain="true"
                                                    color="#333"
                                                    :custom-style="{ height: '55rpx' }"
                                                    @click="handleAfterSale(item.itemId)"
                                                >
                                                    {{ $t("申请售后") }}
                                                </tig-button>
                                            </template>
                                        </view>
                                    </template>
                                </view>
                                <template v-if="orderInfo.orderType === 8 && item.eCard.length > 0">
                                    <view class="virtualsample-box">
                                        <template v-for="subItem in item.eCard" :key="subItem">
                                            <view>
                                                <view class="virtualsample-item">
                                                    <view class="virtualsample-item-con">
                                                        <view class="label">{{ $t("卡号") }}：</view>
                                                        <view class="value"> {{ subItem.cardNumber }}</view>
                                                    </view>
                                                    <view class="virtualsample-item-con">
                                                        <view class="label">{{ $t("卡密") }}：</view>
                                                        <view class="value"> {{ subItem.cardPwd }}</view>
                                                    </view>
                                                </view>
                                                <view class="virtualsample-btn">
                                                    <view>
                                                        <tig-button
                                                            :plain="true"
                                                            color="#333"
                                                            :custom-style="{ height: '55rpx' }"
                                                            @click="handleCopy(`卡号：${subItem.cardNumber}  卡密：${subItem.cardPwd}`)"
                                                        >
                                                            {{ $t("复制") }}
                                                        </tig-button>
                                                    </view>
                                                </view>
                                            </view>
                                        </template>
                                    </view>
                                </template>
                            </view>
                        </template>
                    </view>

                    <template v-if="orderInfo.orderType === 6 && orderInfo.items[0].virtualSample">
                        <view class="virtualsample card-space">
                            <view class="virtualsample-label">{{ $t("虚拟内容") }}：</view>
                            <view class="virtualsample-value">
                                <rich-text class="desc-text-item" :nodes="orderInfo.items[0].virtualSample" />
                            </view>
                        </view>
                    </template>

                    <view class="money-card card-space">
                        <view class="money-card-item">
                            <text class="order-item-label">{{ $t("商品总价") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.productAmount" />
                        </view>
                        <view v-if="orderInfo.serviceFee && Number(orderInfo.serviceFee) > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("附加费用") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.serviceFee" />
                        </view>
                        <view v-if="orderInfo.shippingFee && orderInfo.shippingFee > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("运费") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.shippingFee" />
                        </view>
                        <view v-if="orderInfo.balance && orderInfo.balance > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("使用余额") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.balance" />
                        </view>
                        <view v-if="orderInfo.pointsAmount && orderInfo.pointsAmount > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("使用积分") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.pointsAmount" />
                        </view>
                        <view v-if="orderInfo.couponAmount && orderInfo.couponAmount > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("优惠券") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.couponAmount" />
                        </view>
                        <view v-if="orderInfo.discountAmount && orderInfo.discountAmount > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("其他优惠") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.discountAmount" />
                        </view>
                        <view v-if="orderInfo.unpaidAmount && orderInfo.unpaidAmount > 0" class="money-card-item">
                            <text class="order-item-label">{{ $t("待支付金额") }}：</text>
                            <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.unpaidAmount" />
                        </view>
                        <view v-if="orderInfo.payStatus == 0" class="money-card-item">
                            <text class="order-item-label" >{{ $t("待付款") }}：</text>
                            <view class="order-item-price">
                                <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.totalAmount" />
                            </view>
                        </view>

                        <view v-if="orderInfo.payStatus !== 0" class="money-card-item">
                            <text class="order-item-label" >{{ $t("实付款") }}：</text>
                            <view class="order-item-price">
                                <format-price :show-text="false" :is-bottom="false" :price-data="orderInfo.totalAmount" />
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 待支付订单的特殊底部样式 -->
                <template v-if="orderInfo.availableActions.toPay">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="pay-actions-custom">
                                <view class="action-left-custom">
                                    <view class="more-btn-custom" @click="toggleMoreActions">
                                        <text class="more-text-custom">更多</text>
                                    </view>
                                </view>

                                <view class="action-right-custom">
                                    <view class="pay-btn-custom" @click="handlePay(orderInfo.orderId)">
                                        <text class="pay-btn-text-custom">立即支付</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 待发货订单的特殊底部样式 -->
                <template v-if="orderInfo.orderStatus === 1">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="pay-actions-custom">
                                <view class="action-left-custom">
                                    <view class="more-btn-custom" @click="toggleMoreActions">
                                        <text class="more-text-custom">更多</text>
                                    </view>
                                </view>
                                <view class="comment-order-right-custom">
                                    <view class="invoice-btn-custom" @click="handleInvoice">
                                        <text class="invoice-btn-text-custom">申请开票</text>
                                    </view>
                                    <view class="go-comment-btn-custom" @click="handleAfterSale(null)">
                                        <text class="go-comment-text-custom">申请售后</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 订单已取消的特殊底部样式 -->
                <template v-if="orderInfo.orderStatus === 3">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="cancel-order-actions-custom">
                                <view class="cancel-order-buttons-custom">
                                    <view class="cancel-order-btn-custom" @click="handleDeleteOrder">
                                        <text class="cancel-order-btn-text-custom">删除订单</text>
                                    </view>
                                    <view class="cancel-order-btn-custom" @click="handleAddToCart">
                                        <text class="cancel-order-btn-text-custom">加入购物车</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 已完成订单的特殊底部样式 -->
                <template v-if="orderInfo.orderStatus === 5">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="pay-actions-custom">
                                <view class="action-left-custom">
                                    <view class="more-btn-custom" @click="toggleMoreActions">
                                        <text class="more-text-custom">更多</text>
                                    </view>
                                </view>

                                <view class="action-right-custom">
                                    <view class="invoice-btn-custom" @click="handleInvoice">
                                        <text class="invoice-btn-text-custom">申请开票</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 待收货订单的特殊底部样式 -->
                <template v-if="orderInfo.orderStatus === 2">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="receive-order-actions-custom">
                                <view class="receive-order-left-custom">
                                    <view class="more-btn-custom" @click="toggleMoreActions">
                                        <text class="more-text-custom">更多</text>
                                    </view>
                                </view>

                                <view class="receive-order-right-custom">
                                    <view class="invoice-btn-custom" @click="handleInvoice">
                                        <text class="invoice-btn-text-custom">申请开票</text>
                                    </view>

                                    <view class="confirm-receive-btn-custom" @click="handleConfirmReceipt(orderInfo.orderId)">
                                        <text class="confirm-receive-text-custom">确认收货</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 待评论订单的特殊底部样式 -->
                <template v-if="orderInfo.orderStatus === 5 && orderInfo.availableActions?.toComment">
                    <tig-fixed-placeholder background-color="#fff">
                        <view class="order-pay-footer-custom">
                            <!-- 操作按钮区域 -->
                            <view class="comment-order-actions-custom">
                                <view class="comment-order-left-custom">
                                    <view class="more-btn-custom" @click="toggleMoreActions">
                                        <text class="more-text-custom">更多</text>
                                    </view>
                                </view>

                                <view class="comment-order-right-custom">
                                    <view class="invoice-btn-custom" @click="handleInvoice">
                                        <text class="invoice-btn-text-custom">申请开票</text>
                                    </view>
                                    <view class="go-comment-btn-custom" @click="handleGoComment">
                                        <text class="go-comment-text-custom">去评论</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </tig-fixed-placeholder>
                </template>

                <!-- 其他状态订单的按钮 -->
                <template
                    v-else-if="
                        orderInfo.availableActions.cancelOrder ||
                        orderInfo.availableActions.confirmReceipt ||
                        orderInfo.availableActions.toAftersales
                    "
                >
                <!-- 
                    <tig-fixed-placeholder height="100rpx" background-color="#fff">
                        <view class="order-info-btn">
                            <view class="order-info-btn-box">
                                <tig-button
                                    v-if="orderInfo.availableActions.cancelOrder"
                                    class="btn"
                                    color="#333"
                                    :plain="true"
                                    @click="handleCancelOrder(orderInfo.orderId)"
                                >
                                    {{ $t("取消订单") }}
                                </tig-button>
                                <tig-button
                                    v-if="orderInfo.availableActions.confirmReceipt"
                                    color="#333"
                                    class="btn"
                                    :plain="true"
                                    @click="handleConfirmReceipt(orderInfo.orderId)"
                                >
                                    {{ $t("确认已收货") }}
                                </tig-button>
                              <tig-button
                                    v-if="orderInfo.availableActions.toAftersales"
                                    color="#333"
                                    class="btn"
                                    :plain="true"
                                    @click="handleAfterSale(null)"
                                >
                                    {{ $t("整单售后") }}
                                </tig-button>
                            </view>
                        </view>
                    </tig-fixed-placeholder>  -->
                </template>
            </template>
        </view>

        <!-- 更多操作下拉菜单 -->
        <view
            v-if="showMoreActions"
            class="more-dropdown-container"
            @tap="closeMoreActions"
            @click="closeMoreActions"
        >
            <view class="more-actions-dropdown" :style="{ bottom: dropdownBottom + 'px', right: '303px' }">
                <view class="dropdown-arrow-border"></view>
                <view class="dropdown-arrow"></view>

                <!-- 待支付订单的更多操作 -->
                <template v-if="orderInfo.orderStatus === 0">
                    <view class="dropdown-item" @tap.stop="handleAddToCart" @click.stop="handleAddToCart">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleCancelOrder(orderInfo.orderId)" @click.stop="handleCancelOrder(orderInfo.orderId)">
                        <text class="dropdown-text">取消订单</text>
                    </view>
                </template>

                <!-- 待发货订单的更多操作 -->
                <template v-if="orderInfo.orderStatus === 1">
                    <view class="dropdown-item" @tap.stop="handleAddToCart" @click.stop="handleAddToCart">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleCancelOrder(orderInfo.orderId)" @click.stop="handleCancelOrder(orderInfo.orderId)">
                        <text class="dropdown-text">取消订单</text>
                    </view>
                </template>

                <!-- 待收货订单的更多操作 -->
                <template v-if="orderInfo.orderStatus === 2">
                    <view class="dropdown-item" @tap.stop="handleAfterSaleForReceiving" @click.stop="handleAfterSaleForReceiving">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleAddToCart" @click.stop="handleAddToCart">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                </template>

                <!-- 待评论订单的更多操作 
                <template v-if="orderInfo.orderStatus === 5 && orderInfo.availableActions?.toComment">
                    <view class="dropdown-item" @tap.stop="handleAfterSaleForCompleted" @click.stop="handleAfterSaleForCompleted">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleAddToCart" @click.stop="handleAddToCart">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleLogistics" @click.stop="handleLogistics">
                        <text class="dropdown-text">物流详情</text>
                    </view>
                </template> -->

                <!-- 已完成订单的更多操作 -->
                <template v-if="orderInfo.orderStatus === 5">
                    <view class="dropdown-item" @tap.stop="handleAfterSaleForCompleted" @click.stop="handleAfterSaleForCompleted">
                        <text class="dropdown-text">申请售后</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleAddToCart" @click.stop="handleAddToCart">
                        <text class="dropdown-text">加入购物车</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleLogistics" @click.stop="handleLogistics">
                        <text class="dropdown-text">物流详情</text>
                    </view>
                    <view class="dropdown-item" @tap.stop="handleDeleteOrder" @click.stop="handleDeleteOrder">
                        <text class="dropdown-text">删除订单</text>
                    </view>
                </template>
            </view>
        </view>
    </tig-layout>
</template>

<script setup lang="ts">
import service from "@/components/service/index.vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { getOrder, cancelOrder, confirmReceipt, getShippingInfo, orderBuyAgain } from "@/api/user/order";
import type { OrderInfoResponseItem, ShippingInfoTrace } from "@/types/user/order";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";
import { copy } from "@/utils";

const serviceRef = ref<InstanceType<typeof service> | null>(null);
const handleService = () => {
    if (serviceRef.value) {
        serviceRef.value.handleClick();
    }
};

const userStore = useUserStore();

const { t } = useI18n();

interface IoStatusInfo {
    [key: number]: string;
}

const oStatusInfo = ref<IoStatusInfo>({
    0: t("您的订单已提交成功，请尽快完成付款哦！"),
    1: t("感谢您在本店的购物，您的订单已提交成功，我们会尽快为您发货！"),
    2: t("您的订单已经发货，请注意查收，祝您购物愉快！"),
    3: t('您的订单已被取消，您可以通过"再次购买"，重新购买订单中的商品。'),
    4: t('您的订单被认定为无效订单，订单已被关闭。您可以通过"再次购买"，重新购买订单中的商品。给您造成的不便请多多谅解！'),
    5: t("您的订单已经确认收货，感谢您在本店购物，祝您生活愉快！")
});

const orderInfo = ref<OrderInfoResponseItem>({} as OrderInfoResponseItem);
const showMore = ref(false);

// 待支付订单相关变量
const countdownTime = ref<string>("");
const showMoreActions = ref(false);
const dropdownBottom = ref(0);
let countdownTimer: any = null;

const id = ref<null | number>();
onLoad((option: any) => {
    if (option && option.id) {
        id.value = option.id;
        try {
            uni.showLoading({
                title: t("加载中")
            });
            Promise.all([__getOrder(), __getShippingInfo()]);
        } catch (error) {
            console.error(error);
        } finally {
            // uni.hideLoading();
        }
    }
});

const __getOrder = async () => {
    try {
        const result = await getOrder({ id: id.value });
        orderInfo.value = result;

        // 如果是待支付订单，启动倒计时
        if (result.orderStatus === 0) {
            startCountdown();
        } else {
            // 非待支付订单，清空倒计时
            countdownTime.value = "";
        }
    } catch (error) {
        console.error(error);
    }
};

const shippingInfo = ref<ShippingInfoTrace[]>([]);
const logisticsCompany = ref<string>("");
const emptyText = ref<string>("");
const __getShippingInfo = async () => {
    try {
        const result = await getShippingInfo({ id: id.value });
        console.log('物流查询结果:', result);
        
        if (result && result.success === 'true') {
            // 处理物流轨迹数据
            if (result.traces && Array.isArray(result.traces)) {
                // 按时间倒序排列，最新消息在前面
                const sortedTraces = result.traces.sort((a: any, b: any) => {
                    return new Date(b.acceptTime).getTime() - new Date(a.acceptTime).getTime();
                });
                
                shippingInfo.value = sortedTraces.map((trace: any) => ({
                    acceptTime: trace.acceptTime,
                    acceptStation: trace.acceptStation,
                    action: trace.action
                }));
            } else {
                shippingInfo.value = [];
            }
            
            // 设置物流公司名称
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
            logisticsCompany.value = companyNameMap[result.shipperCode] || result.shipperCode || orderInfo.value.logisticsName || '';
            
            emptyText.value = shippingInfo.value.length === 0 ? '暂无物流信息' : '';
        } else {
            shippingInfo.value = [];
            logisticsCompany.value = orderInfo.value.logisticsName || '';
            emptyText.value = '查询物流信息失败，请稍后再试';
        }
    } catch (error) {
        console.error('物流查询异常:', error);
        shippingInfo.value = [];
        logisticsCompany.value = orderInfo.value.logisticsName || '';
        emptyText.value = '网络异常，请稍后再试';
    } finally {
        uni.hideLoading();
    }
};

const handleCancelOrder = (id: number) => {
    uni.showModal({
        title: t("提示"),
        content: t("确认要取消该订单吗？"),
        success: async (res) => {
            if (res.confirm) {
                try {
                    await cancelOrder({ id });
                    __getOrder();
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

const handlePay = (id: number) => {
    uni.navigateTo({
        url: `/pages/order/pay?orderId=${id}`
    });
};

const handleToShop = (id: number) => {
    uni.navigateTo({
        url: `/pages/shop/index?shopId=${id}`
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
                    __getOrder();
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

const handleAfterSale = (itemId: null | number) => {
    if (itemId) {
        uni.navigateTo({
            url: `/pages/user/afterSale/edit?itemId=${itemId}&orderId=${orderInfo.value.orderId}`
        });
    } else {
        uni.navigateTo({
            url: `/pages/user/afterSale/edit?orderId=${orderInfo.value.orderId}`
        });
    }
};

const handleAfterSaleDetail = (id: number) => {
    uni.navigateTo({
        url: `/pages/user/afterSale/info?id=${id}`
    });
};

const handleLink = (id: number) => {
    uni.navigateTo({
        url: `/pages/product/index?id=${id}`
    });
};

const handleCopy = (data: any) => {
    copy(data, () => {
        uni.showToast({
            title: t("复制成功"),
            icon: "none"
        });
    });
};

// 获取最新物流消息
const getLatestLogisticsMessage = () => {
    if (shippingInfo.value && shippingInfo.value.length > 0) {
        // 返回最新的物流消息（数组第一个元素）
        return shippingInfo.value[0].acceptStation || '包裹正在等待揽收';
    }
    return '包裹正在等待揽收';
};

// 点击跳转到物流详情页面
const handleLogisticsDetail = (orderId: number) => {
    uni.navigateTo({
        url: `/pages/user/order/shoppingInfo?id=${orderId}`
    });
};

const showService = computed(() => {
    if (orderInfo.value.shop && Object.keys(orderInfo.value.shop).length > 0) {
        if (orderInfo.value.shop.kefuInlet && orderInfo.value.shop.kefuInlet.length > 0 && orderInfo.value.shop.kefuInlet.includes(2)) {
            return true;
        }
        return false;
    } else {
        return userStore.serviceConfig.show;
    }
});

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
const getTotalQuantity = () => {
    if (!orderInfo.value.items) return 0;
    return orderInfo.value.items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// 格式化价格显示
const formatPrices = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 切换更多操作显示
const toggleMoreActions = () => {
    showMoreActions.value = !showMoreActions.value;
    if (showMoreActions.value) {
        // 设置下拉菜单位置：固定在底部上方，菜单从下往上展开
        dropdownBottom.value = 102; // 可根据底部栏高度微调
    }
};

// 关闭更多操作
const closeMoreActions = () => {
    showMoreActions.value = false;
};

// 加入购物车
const handleAddToCart = async () => {
    try {
        closeMoreActions();
        await orderBuyAgain({ id: orderInfo.value.orderId });
        uni.showToast({
            title: t("已加入购物车"),
            icon: "success"
        });
    } catch (error: any) {
        uni.showToast({
            title: error.message || t("操作失败"),
            icon: "none"
        });
    }
};

// 启动倒计时
const startCountdown = () => {
    if (!orderInfo.value.addTime || orderInfo.value.orderStatus !== 0) return;

    // 清除之前的定时器
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    const updateCountdown = () => {
        const createTime = new Date(orderInfo.value.addTime).getTime();
        const now = new Date().getTime();
        const paymentTimeout = 15 * 60 * 1000; // 15分钟支付超时
        const endTime = createTime + paymentTimeout;
        const remainingTime = endTime - now;

        if (remainingTime <= 0) {
            countdownTime.value = "";
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
            return;
        }

        const minutes = Math.floor(remainingTime / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        countdownTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // 立即执行一次
    updateCountdown();

    // 每秒更新一次
    countdownTimer = setInterval(updateCountdown, 1000);
};

// 停止倒计时
const stopCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    countdownTime.value = "";
};

// 申请开票
const handleInvoice = () => {
    uni.navigateTo({
        url: `/pages/user/invoice/apply?orderId=${orderInfo.value.orderId}`
    });
};

// 删除订单
const handleDeleteOrder = () => {
    uni.showModal({
        title: t("提示"),
        content: t("确定要删除此订单吗？"),
        success: (res) => {
            if (res.confirm) {
                // 这里调用删除订单的API
                uni.showToast({
                    title: t("删除成功"),
                    icon: "success"
                });
                // 返回上一页或订单列表
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            }
        }
    });
};

// 已完成订单申请售后
const handleAfterSaleForCompleted = () => {
    closeMoreActions();
    uni.navigateTo({
        url: `/pages/user/afterSale/edit?orderId=${orderInfo.value.orderId}`
    });
};

// 查看物流详情
const handleLogistics = () => {
    closeMoreActions();
    uni.navigateTo({
        url: `/pages/user/order/shoppingInfo?id=${orderInfo.value.orderId}`
    });
};

// 待收货订单申请售后
const handleAfterSaleForReceiving = () => {
    closeMoreActions();
    uni.navigateTo({
        url: `/pages/user/afterSale/edit?orderId=${orderInfo.value.orderId}`
    });
};

// 去评论
const handleGoComment = () => {
    uni.navigateTo({
        url: `/pages/user/comment/info?id=${orderInfo.value.orderId}`
    });
};

// 页面销毁时清理定时器
onUnload(() => {
    stopCountdown();
});
</script>

<style lang="scss" scoped>
.order-info {
    background-color: #f5f5f5;
    min-height: 100vh;
}
.extraskudata-box {
    display: flex;
    .extraskudata {
        background-color: #ffffff;
        // padding: 10rpx 15rpx;
        // border-radius: 10rpx;
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

.item-box {
    padding-bottom: 20rpx;

    &:last-child {
        padding-bottom: 0;
    }
    .shop-info {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
    }
}
.virtualsample-box {
    border-top: 1px solid #f2f2f2;
    margin-top: 20rpx;
    padding-top: 20rpx;

    .virtualsample-item {
        .virtualsample-item-con {
            display: flex;
            font-size: 26rpx;
            line-height: 40rpx;
            .label {
                color: #999;
            }
            .value {
                color: #333;
            }
        }
    }
    .virtualsample-btn {
        display: flex;
        justify-content: flex-end;
        margin-top: 20rpx;
    }
}

.card-space {
    padding: 20rpx;
    border-radius: 30rpx;
    background-color: #fff;
    margin-top: 20rpx;
}
.address-text {
    width: calc(100% - 160rpx);
    text-align: end;
}
.order-item-label {
    color: #999;
    // max-width: 160rpx;
}

.order-info-steps {
    padding: 25rpx;
    background-color: #fff;
    border-radius: 0 0 20rpx 20rpx;
    overflow: hidden;
}

.order-info-content {
    padding: 0 20rpx;
    margin-top: 20rpx;
    .order-card {
        .order-card-item {
            align-items: center;
            display: flex;
            font-size: 24rpx;
            padding: 12rpx 0;
        }
    }

    .pay-card {
        font-size: 24rpx;
        .pay-card-item {
            padding: 20rpx 0;
            display: flex;
            justify-content: space-between;

            &.im-btn {
                justify-content: flex-end;
            }

            &:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
        }
    }

    .product-card {
        .product-card-item {
            display: flex;
            position: relative;
            margin-bottom: 20rpx;
            &:last-child {
                margin-bottom: 0;
            }

            .product-card-item-left {
                .left-img {
                    width: 160rpx;
                    height: 160rpx;
                    border-radius: 10rpx;
                    overflow: hidden;
                    margin-right: 20rpx;
                    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.04);
                    position: relative;
                }
            }

            .product-card-item-right {
                font-size: 24rpx;
                flex: 1;

                .right-title {
                    font-weight: bold;
                    margin-bottom: 10rpx;
                }

                .right-price {
                    display: flex;
                    font-size: 28rpx;
                    padding-top: 10rpx;
                    .right-price-pricenum {
                        font-weight: bold;
                        color: var(--general);
                        padding-right: 10rpx;
                    }

                    .right-price-quantity {
                        color: #999;
                    }
                }
            }
            .item-btn {
                position: absolute;
                right: 0;
                bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                column-gap: 10rpx;
            }
        }
    }

    .virtualsample {
        display: flex;
        width: 100%;
        column-gap: 20rpx;
        font-size: 24rpx;
        .virtualsample-label {
            color: #999;
        }
        .virtualsample-value {
            flex: 1;
            overflow: hidden;

            img {
                width: 100%;
                height: auto;
            }
        }
    }

    .money-card {
        font-size: 27rpx;
        .money-card-item {
            display: flex;
            justify-content: space-between;
            padding: 20rpx 0;
            &:last-child {
                padding-bottom: 0;
                border-bottom: none;
            }

            .order-item-price {
                font-weight: bold;
                color: var(--general);
                // padding-right: 10rpx;
                font-size: 28rpx;
                :deep(.util) {
                    font-size: 22rpx;
                    font-weight: normal;
                }
            }
        }
    }
}

.order-info-btn {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding: 20rpx;
    .order-info-btn-box {
        display: flex;
        align-items: center;
        .btn {
            margin-right: 10rpx;
            height: 100%;
            &:last-child {
                margin-right: 0;
            }
        }
    }
}

.shippingInfo-title {
    font-size: 28rpx;
    padding-bottom: 20rpx;
}

.expressage-box {
    display: flex;
    font-size: 26rpx;
    justify-content: space-between;

    .expressage-info {
        display: flex;
        column-gap: 15rpx;
    }

    .copy-btn {
        color: #b8b8b8;
        transition: color 0.2s;

        &:active {
            color: #333;
        }
    }
}

.shippingInfo-box {
    padding: 20rpx 0;
    .shippingInfo-box-content {
        height: 400rpx;
        overflow: hidden;
        position: relative;

        &.dim::after {
            width: 100%;
            height: 200rpx;
            content: "";
            position: absolute;
            left: 0;
            bottom: 0rpx;
            background-image: linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 80%);
        }

        &.more-height {
            height: auto;
        }
    }

    .shippingInfo-btn {
        display: flex;
        flex-direction: row;
        justify-content: center;

        .btn-icon {
            &.rotate {
                transition: all 0.3s;
                transform: rotate(180deg);
            }
        }
    }
}

.emptyText {
    padding-top: 15rpx;
    font-size: 24rpx;
}

/* 待支付状态显示样式 - 使用自定义类名 */
.payment-status-custom {
   // background: #fff;
    padding: 40rpx 20rpx;
    text-align: center;
    margin: 0 20rpx 20rpx 20rpx;
    border-radius: 18rpx;
}

.status-title-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
}

.status-icon-img-custom {
    width: 60rpx;
    height: 60rpx;
    margin-right: 12rpx;
}

.status-text-custom {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
}

.countdown-text-custom {
    font-size: 28rpx;
    color: #666;
}

/* 地址模块样式 - 使用自定义类名 */
.address-module-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    padding-bottom: 10rpx;
}

.address-content-custom {
    display: flex;
    align-items: center;
    padding: 25rpx;
}

.address-left-custom {
    display: flex;
    align-items: flex-start;
    flex: 1;
}

.location-icon-custom {
    width: 55rpx;
    height: 55rpx;
    margin-right: 15rpx;
    margin-top: 30rpx;
}

.address-box-custom {
    flex: 1;
}

.user-info-custom {
    margin-bottom: 10rpx;
}

.name-custom {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
}

.address-custom {
    font-size: 28rpx;
    color: #666;
    line-height: 1.4;
}

/* 物流模块样式 */
.logistics-module-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    border-left: 4rpx solid #3544BA;
}

/* 物流状态信息样式 */
.logistics-status-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 15rpx;
    box-sizing: border-box;
    
    .logistics-info-custom {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0; /* 重要：允许flex子元素缩小 */
        overflow: hidden;
        
        .logistics-status-text {
            font-size: 24rpx;
            font-weight: 600;
            color: #3544BA;
            margin-right: 10rpx;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        .logistics-separator {
            font-size: 24rpx;
            color: #a2a2a2;
            margin-right: 5rpx;
            flex-shrink: 0;
        }
        
        .logistics-message {
            font-size: 24rpx;
            color: #666;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
            text-align: left;
        }
    }
    
    .logistics-arrow {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
        flex-shrink: 0;
    }
    
    &:active {
        background-color: #f0f2ff;
        transform: scale(0.98);
        transition: all 0.2s;
    }
}

    .address-content {
        display: flex;
        align-items: center;
        padding: 30rpx;

        .address-left {
            display: flex;
            align-items: flex-start;
            flex: 1;

            .location-icon {
                width: 40rpx;
                height: 40rpx;
                margin-right: 20rpx;
                margin-top: 5rpx;
            }

            .address-box {
                flex: 1;

                .user-info {
                    margin-bottom: 10rpx;

                    .name {
                        font-size: 32rpx;
                        font-weight: 600;
                        color: #333;
                    }
                }

                .address {
                    font-size: 28rpx;
                    color: #666;
                    line-height: 1.4;
                }
            }
        }
    }

/* 待支付订单特殊样式 - 使用自定义类名 */
.order-pay-footer-custom {
    border-top: 1rpx solid #f0f0f0;
    padding-top: 20rpx;
    position: relative;
}

.pay-summary-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 0 20rpx;
}

.summary-text-custom {
    font-size: 28rpx;
    color: #666;
}

.summary-price-custom {
    display: flex;
    align-items: center;
}

.price-label-custom {
    font-size: 28rpx;
    color: #666;
}

.price-amount-custom {
    font-size: 40rpx;
    font-weight: 600;
    color: #ff6b35;
    margin-left: 8rpx;
}

.pay-actions-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    height: 80rpx;
}

.more-btn-custom {
    padding: 12rpx 24rpx;
}

.more-text-custom {
    font-size: 28rpx;
    color: #666;
}

.action-center-custom {
    flex: 1;
    display: flex;
    justify-content: center;
}

.countdown-text-pay-custom {
    font-size: 28rpx;
    color: #ff6b35;
    font-weight: 500;
}

.pay-btn-custom {
    padding: 16rpx 40rpx;
    background: #3544BA;
    border-radius: 50rpx;
    box-shadow: 0 4rpx 16rpx rgba(55, 68, 178, 0.3);
}

.pay-btn-text-custom {
    font-size: 30rpx;
    color: #fff;
    font-weight: 500;
}

/* 申请开票按钮样式 */
.invoice-btn-custom {
    padding: 16rpx 40rpx;
    background: #fff;
    border: 2rpx solid #333;
    border-radius: 50rpx;
}

/* 申请售后按钮样式 */
.after-sale-btn-custom {
    padding: 16rpx 40rpx;
    background: #fff;
    border: 2rpx solid #333;
    border-radius: 50rpx;
}

.after-sale-btn-text-custom {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
}

.invoice-btn-text-custom {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
}

/* 订单已取消按钮样式 */
.cancel-order-actions-custom {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20rpx 30rpx;
}

.cancel-order-buttons-custom {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.cancel-order-btn-custom {
    padding: 16rpx 40rpx;
    background: #fff;
    border: 2rpx solid #333;
    border-radius: 50rpx;
}

.cancel-order-btn-text-custom {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
}

/* 待收货订单按钮样式 */
.receive-order-actions-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
}

.receive-order-left-custom {
    display: flex;
    align-items: center;
}

.receive-order-right-custom {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

/* 确认收货按钮样式 */
.confirm-receive-btn-custom {
    padding: 16rpx 40rpx;
    background: #3544BA;
    border-radius: 50rpx;
}

.confirm-receive-text-custom {
    font-size: 30rpx;
    color: #fff;
    font-weight: 500;
}

/* 待评论订单按钮样式 */
.comment-order-actions-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
}

.comment-order-left-custom {
    display: flex;
    align-items: center;
}

.comment-order-right-custom {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

/* 去评论按钮样式 */
.go-comment-btn-custom {
    padding: 16rpx 40rpx;
    background: #3544BA;
    border-radius: 50rpx;
}

.go-comment-text-custom {
    font-size: 30rpx;
    color: #fff;
    font-weight: 500;
}

    .pay-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;
        padding: 0 20rpx;

        .summary-text {
            font-size: 28rpx;
            color: #666;
        }

        .summary-price {
            display: flex;
            align-items: center;

            .price-amount {
                font-size: 32rpx;
                font-weight: 600;
                color: #ff6b35;
                margin-left: 8rpx;
            }
        }
    }

    .pay-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20rpx;
        height: 80rpx;

        .action-left {
            .more-btn {
                padding: 12rpx 24rpx;
                background: #f8f8f8;
                border-radius: 50rpx;
                border: 1rpx solid #e0e0e0;

                .more-text {
                    font-size: 28rpx;
                    color: #666;
                }

                &:active {
                    background-color: #f0f0f0;
                }
            }
        }

        .action-center {
            flex: 1;
            display: flex;
            justify-content: center;

            .countdown-display {
                .countdown-text {
                    font-size: 28rpx;
                    color: #ff6b35;
                    font-weight: 500;
                }
            }
        }

        .action-right {
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
                    background: #2a3a9f;
                    transform: scale(0.98);
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
    border: 1rpx solid #e0e0e0;
    z-index: 1000;
    min-width: 200rpx;
    overflow: hidden;

    /* 箭头边框层（指向下，菜单在上方） */
    .dropdown-arrow-border {
        position: absolute;
        bottom: -17rpx;
        left: 60rpx;
        width: 0;
        height: 0;
        border-left: 17rpx solid transparent;
        border-right: 17rpx solid transparent;
        border-top: 17rpx solid #e0e0e0;
        z-index: 1001;
    }

    /* 箭头主体层 */
    .dropdown-arrow {
        position: absolute;
        bottom: -16rpx;
        left: 61rpx;
        width: 0;
        height: 0;
        border-left: 16rpx solid transparent;
        border-right: 16rpx solid transparent;
        border-top: 16rpx solid #fff;
        z-index: 1002;
    }

    .dropdown-item {
        padding: 24rpx 30rpx;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
            border-bottom: none;
        }

        .dropdown-text {
            font-size: 28rpx;
            color: #333;
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
    z-index: 999;
}

/* 商品列表样式 */
.product-card-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 30rpx;
}

.product-card-custom .item-box {
    margin-bottom: 30rpx;
}

.product-card-custom .item-box:last-child {
    margin-bottom: 0;
}

.product-card-custom .shop-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 20rpx;
}

.product-card-custom .shop-info .text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.product-card-custom .shop-info .iconfont {
    font-size: 24rpx;
    color: #999;
}

.product-card-custom .product-card-item {
    display: flex;
    align-items: flex-start;
}

.product-card-custom .product-card-item-left {
    margin-right: 20rpx;
}

.product-card-custom .left-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f5f5f5;
}

.product-card-custom .left-img :deep(tig-image) {
    width: 100%;
    height: 100%;
    display: block;
}

.product-card-custom .left-img :deep(.base-image-box) {
    width: 100%;
    height: 100%;
}

.product-card-custom .left-img :deep(.base-image) {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
}

.product-card-custom .product-card-item-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160rpx;
}

.product-card-custom .product-card-item-right-top {
    flex: 1;
}

.product-card-custom .product-card-item-title {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    line-height: 1.4;
   // margin-bottom: 15rpx;
}

.product-card-custom .sku-card {
    display: flex;
  //  flex-wrap: wrap;
}

.sku-card{
    font-size: 23rpx;
    color: #969799;
    margin: 10rpx 0;
    background-color: #ffffff;
    padding: 0rpx 0rpx;
    
}


.product-card-custom .sku-item {
    padding: 6rpx 0rpx ;
    font-size: 24rpx;
    color: #666;
}

.product-card-custom .product-card-item-right-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.product-card-custom .product-card-item-price {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
}

.product-card-custom .product-card-item-quantity {
    font-size: 24rpx;
    color: #999;
}

/* 商品总价模块样式 */
.money-card-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 30rpx;
}

.money-card-custom .money-card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #ffffff;
}

.money-card-custom .money-card-item:last-child {
    border-bottom: none;
}

.money-card-custom .money-card-item.total {
    font-weight: 600;
    font-size: 36rpx;
    color: #ff6b35;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.money-card-custom .money-card-item.total .order-item-label {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
}

.money-card-custom .order-item-label {
    font-size: 28rpx;
    color: #666;
}

.money-card-custom .money-card-item-price {
    font-size: 28rpx;
    color: #ff6b35;
}

/* 订单编号模块样式 */
.order-info-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 30rpx;
}

.order-info-custom .order-card-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #ffffff;
}

.order-info-custom .order-card-item:last-child {
    border-bottom: none;
}

.order-info-custom .order-item-label {
    font-size: 28rpx;
    color: #666;
    min-width: 160rpx;
    text-align: left;
    flex-shrink: 0;
}

/* 联系客服模块样式 */
.service-card-custom {
    background: #fff;
    border-radius: 18rpx;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 25rpx 30rpx;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.service-card-custom:active {
    background-color: #f8f8f8;
}

.service-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.service-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 15rpx;
}

.service-text {
    display: flex;
    align-items: center;
}

.service-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
}
</style>
