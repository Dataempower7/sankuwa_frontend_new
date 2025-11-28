<template>
    <view>
        <!-- 生成海报的canvas -->
        <canvas id="myCanvas" class="canvas-content" canvas-id="myCanvas" :style="{ height: canvasHeightRef + 'px' }" />
        <tig-popup v-model:show="show" background-color="transparent" position="center" :show-close="false"
            @close="$emit('update:modelValue', false)">
            <view class="poster-box" @touchmove.stop.prevent @longpress.stop="handleSave"
                :style="{ height: canvasHeightRef + 'px' }">
                <image :src="img" style="height: 100%; width: 100%" mode="aspectFit" />
            </view>
            <view class="canvas-tip">{{ $t("长按可保存海报") }}</view>
        </tig-popup>
    </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from "vue";
import { imageFormat } from "@/utils/format";
import { useThemeStore } from "@/store/theme";
import type { ProductItem } from "@/types/product/product";
import type { GrouponPromotionDetail, GrouponItemListParams, GrouponRecordDetail } from "@/types/groupon/groupon";
import { getMiniCode, getQrCode } from "@/api/common";
import { getGrouponPromotionDetail, getGrouponRecordDetail } from "@/api/groupon/groupon";
import { currRoute, getImageInfo } from "@/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const instance = getCurrentInstance();
const props = defineProps<{
    modelValue: boolean;
    productId: number;
    productInfo: ProductItem;
    grouponPromotionId: number;
    grouponPromotionRecordId: number;
    productPrice: string | number;
}>();

const grouponPromotion = ref<GrouponPromotionDetail>({
    endTime: "",
    grouponExplain: "",
    grouponImage: "",
    startTime: "",
    shopId: 0,
    shopTitle: ""
});
const grouponRecordDetail = ref<GrouponRecordDetail>({
    grouponPromotionRecordId: 0,
    productId: 0,
    productName: "",
    joinType: 0,
    joinStatus: 0,
    minGroupNum: 0,
    groupNum: 0,
    shopId: 0,
    shopTitle: "",
    grouponImage: "",
    minGrouponPrice: 0,
    grouponPrice: 0,
    productPrice: 0,
    picThumb: "",
    joinNumCount: 0,
    joinUsers: [],
    skuId: 0,
    startTime: "",
    endTime: "",
    grouponPromotionId: 0
});

const emit = defineEmits(["update:modelValue"]);

const qrImg = ref("");
const show = ref(false);
const powerw = ref(0);
const canvasHeightRef = ref(900); // 动态高度值

onMounted(async () => {
    const { windowWidth } = uni.getSystemInfoSync();
    powerw.value = windowWidth / 375;
    // const result = await getGrouponPromotionDetail(props.grouponPromotionId);
    // console.log(result);
    // grouponPromotion.value = result;
    const grouponRecordRes = await getGrouponRecordDetail(props.grouponPromotionRecordId);
    grouponRecordRes && (grouponRecordDetail.value = grouponRecordRes);
    await __getQrCode();
    generatePoster();
});

const __getQrCode = async () => {
    try {
        // #ifdef H5
        // 拼接地址
        const url = `${location.origin}/mobile/pages/product/groupBuying?grouponPromotionRecordId=${props.grouponPromotionRecordId}`
        const result = await getQrCode(url);
        qrImg.value = result;
        // #endif
        // #ifdef MP-WEIXIN
        // const page = currRoute();
        const page = `/pages/product/groupBuying?grouponPromotionRecordId=${props.grouponPromotionRecordId}`;
        const res = await getMiniCode(page ?? "", props.productId);
        qrImg.value = res;
        // #endif
        uni.showToast({
            title: t("正在生成海报，请稍后"),
            icon: "none",
            duration: 1000
        });
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none"
        });
    }
};

const getDate = (date: string) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${year}-${month}-${day}`;
}
// 保持纵横比绘制图片
const drawImageWithAspect = (ctx: any, image: any, x: number, y: number, areaWidth: number, areaHeight: number) => {
    const { width: imgWidth, height: imgHeight, path: imgPath } = image;

    // 计算缩放比例，保持图片不变形
    const scale = Math.min(areaWidth / imgWidth, areaHeight / imgHeight);

    // 计算实际绘制尺寸
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // 计算居中位置
    const drawX = x + (areaWidth - drawWidth) / 2;
    const drawY = y + (areaHeight - drawHeight) / 2;

    // 绘制图片
    ctx.drawImage(imgPath, drawX, drawY, drawWidth, drawHeight);
};
// 生成海报
const generatePoster = async () => {
    const userInfo = uni.getStorageSync("userInfo");
    const themeStore = useThemeStore();
    try {

        // 使用固定的 rpx 尺寸，然后转换为实际像素
        const canvasWidthRpx = 500;  // 画布宽度 (rpx)

        // 边距设置 (rpx)
        const horizontalPaddingRpx = 30;
        const topMarginRpx = 120;
        const bottomMarginRpx = 130;

        // 内边距设置 (rpx)
        const innerTopPaddingRpx = 40;
        const innerBottomPaddingRpx = 220;
        const qrCodeSizeRpx = 100;

        // 转换为实际像素尺寸
        const canvasWidth = uni.upx2px(canvasWidthRpx);

        // 转换为实际像素
        const horizontalPadding = uni.upx2px(horizontalPaddingRpx);
        const topMargin = uni.upx2px(topMarginRpx);
        const bottomMargin = uni.upx2px(bottomMarginRpx);

        // 转换为实际像素
        const innerTopPadding = uni.upx2px(innerTopPaddingRpx);
        const innerBottomPadding = uni.upx2px(innerBottomPaddingRpx);
        const qrCodeSize = uni.upx2px(qrCodeSizeRpx);

        // 图片区域
        // 获取图片信息
        const picRes = await getImageInfo(imageFormat(grouponRecordDetail.value.grouponImage));
        const imageAreaWidth = canvasWidth - 2 * horizontalPadding;
        // 计算缩放比例
        // const scale = imageAreaWidth / picRes.width;
        // const imageAreaHeight = picRes.height * scale;
        const imageAreaHeight = imageAreaWidth;

        const contentHeight = innerTopPadding + imageAreaHeight + innerBottomPadding;
        // 最终高度
        const canvasHeight = topMargin + contentHeight + bottomMargin;
        canvasHeightRef.value = canvasHeight;

        let context = uni.createCanvasContext("myCanvas", instance);

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.draw();

        // 填充背景色
        context.setFillStyle("red");
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // 画渐变背景
        const grd = context.createLinearGradient(0, 0, 0, canvasHeight);
        grd.addColorStop(0, '#F2F2F6');
        grd.addColorStop(1, '#E6E6EE');
        context.setFillStyle(grd);
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // 头部文字
        context.setFontSize(uni.upx2px(30));
        context.setFillStyle("#333");
        context.fillText(t('拼团'), (canvasWidth / 2) - uni.upx2px(30), topMargin / 2 + uni.upx2px(16));

        // 绘制主要内容区域（白色背景）
        const contentX = horizontalPadding;
        const contentY = topMargin;
        const contentWidth = imageAreaWidth;
        const contentHeightTotal = contentHeight;

        // 绘制阴影效果
        const shadowBlur = uni.upx2px(20);
        const shadowOffsetX = 0;
        const shadowOffsetY = uni.upx2px(20);
        context.save();
        context.shadowColor = 'rgba(0, 0, 0, 0.1)';
        context.shadowBlur = shadowBlur;
        context.shadowOffsetX = shadowOffsetX;
        context.shadowOffsetY = shadowOffsetY;

        // 绘制圆角背景区域（带阴影）
        const contentRadius = uni.upx2px(30);
        context.beginPath();
        context.moveTo(contentX + contentRadius, contentY);
        context.lineTo(contentX + contentWidth - contentRadius, contentY);
        context.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + contentRadius);
        context.lineTo(contentX + contentWidth, contentY + contentHeightTotal - contentRadius);
        context.quadraticCurveTo(contentX + contentWidth, contentY + contentHeightTotal, contentX + contentWidth - contentRadius, contentY + contentHeightTotal);
        context.lineTo(contentX + contentRadius, contentY + contentHeightTotal);
        context.quadraticCurveTo(contentX, contentY + contentHeightTotal, contentX, contentY + contentHeightTotal - contentRadius);
        context.lineTo(contentX, contentY + contentRadius);
        context.quadraticCurveTo(contentX, contentY, contentX + contentRadius, contentY);
        context.closePath();

        // 填充白色背景
        context.fillStyle = '#FFFFFF';
        context.fill();
        context.restore(); // 恢复

        // 绘制商品名称，这里是调用一个方法，按字符串长度进行分割换行。【可以做一个优化】
        // 在内部底部留白区域添加信息
        const infoAreaStartY = contentY + innerTopPadding + imageAreaHeight;
        const groupNameX = contentX + uni.upx2px(20);
        const groupNameY = infoAreaStartY + innerBottomPadding - qrCodeSize - uni.upx2px(50);
        drawText(grouponRecordDetail.value.productName, groupNameX, groupNameY, context);

        // 绘制拼团时间
        const timeY = infoAreaStartY + innerBottomPadding - uni.upx2px(30);
        context.setFontSize(uni.upx2px(18));
        context.setFillStyle("#888");
        context.fillText(getDate(grouponRecordDetail.value.startTime) + '~' + getDate(grouponRecordDetail.value.endTime), groupNameX, timeY);
        context.save();

        // 计算二维码位置
        const qrX = contentX + contentWidth - qrCodeSize - uni.upx2px(20);
        const qrY = infoAreaStartY + innerBottomPadding - qrCodeSize - uni.upx2px(50);
        context.setFontSize(uni.upx2px(16));
        context.setFillStyle("#666");
        context.fillText(t('长按识别查看'), qrX + uni.upx2px(4), timeY);

        // debug
        // const avatarRes = await getImageInfo(userInfo.avatar ? imageFormat(userInfo.avatar) : staticResource("user/default_avatar.jpg"));
        // 这个就是绘制圆形头像
        // context.beginPath();
        // context.arc(50, 50, 28, 0, 2 * Math.PI);
        // context.clip();
        // context.drawImage(avatarRes.path, 20, 20, 70 * powerw.value, 70 * powerw.value);
        context.restore();
        context.draw(true, async () => {
            context.save();
            // debug            
            // context.drawImage(picRes.path, 40, 160, 245 * powerw.value, 245 * powerw.value);
            // 绘制商品图片，以当前的大小绘制，进行缩放
            // context.drawImage(picRes.path, contentX, contentY + innerTopPadding, imageAreaWidth, imageAreaHeight);
            drawImageWithAspect(context, picRes, contentX, contentY + innerTopPadding, imageAreaWidth, imageAreaHeight);

            context.draw(true, () => {
                // 绘制小程序码
                // #ifdef MP-WEIXIN
                const fs = uni.getFileSystemManager();
                let codeimg = wx.env.USER_DATA_PATH + "/" + new Date().getTime() + ".png";
                fs.writeFile({
                    filePath: codeimg,
                    data: qrImg.value.slice(22),
                    encoding: "base64",
                    success: () => {
                        console.log("codeimg", codeimg);
                        // context.drawImage(codeimg, 165, 360 * powerw.value, 100 * powerw.value, 100 * powerw.value);
                        context.drawImage(codeimg, qrX, qrY, qrCodeSize, qrCodeSize);
                        context.draw(true, () => {
                            saveToImg();
                        });
                    }
                });

                // #endif
                // #ifdef H5
                // context.drawImage(qrImg.value, 165, 360 * powerw.value, 100 * powerw.value, 100 * powerw.value);
                // debug
                context.drawImage(qrImg.value, qrX, qrY, qrCodeSize, qrCodeSize);
                context.draw(true, () => {
                    saveToImg();
                });
                // #endif
            });
        });
    } catch (error) {
        console.error(error);
    }
};

// 商品名称文字换行
const drawText = (context: any, x: any, y: any, canvas: any) => {
    let strArr = [];
    let n = 11;
    for (let i = 0, l = context.length; i < l / n; i++) {
        let a = context.slice(n * i, n * (i + 1));
        strArr.push(a);
    }
    strArr.forEach((item, index) => {
        // 限制只能显示4行文字
        if (index > 3) {
            return;
        }
        y += 20;
        canvas.setFontSize(uni.upx2px(28));
        canvas.setFillStyle("#333333");
        canvas.fillText(item, x, y);
    });
};

const img = ref("");
const saveToImg = () => {
    uni.canvasToTempFilePath(
        {
            // 这里修改保存的图片格式
            fileType: "jpg",
            canvasId: "myCanvas",
            quality: 1,
            success: function (res) {
                img.value = res.tempFilePath;
                show.value = true;
                // console.log("img", img.value);
            },
            fail: (err) => {
                uni.showToast({
                    title: JSON.stringify(err),
                    icon: "none",
                    duration: 3000
                });
                show.value = false;
                console.log(err);
            }
        },
        instance
    );
};

const handleSave = () => {
    // #ifdef APP-PLUS||MP-WEIXIN
    uni.saveImageToPhotosAlbum({
        filePath: img.value,
        success: function () {
            uni.showToast({
                title: t("保存海报成功"),
                icon: "none",
                duration: 1500
            });
            setTimeout(() => {
                emit("update:modelValue", false);
            }, 1500);
        },
        fail: function (err) {
            console.error(err);
            uni.showToast({
                title: t("保存海报失败"),
                icon: "none",
                duration: 3000
            });
        }
    });
    // #endif
};
</script>

<style lang="scss" scoped>
.my-canvas-box {
    width: 100vw;
    height: 100vh;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 88;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.canvas-tip {
    color: #ffffff;
    font-size: 24rpx;
    margin-top: 30rpx;
    text-align: center;
}

.canvas-content {
    width: 500rpx;
    // height: 900rpx;
    // background-color: #ffffff;
    position: fixed;
    top: -9999px;
    left: -9999px;
}

.poster-box {
    width: 500rpx;
    height: 900rpx;
    border-radius: 20rpx;
    overflow: hidden;
}
</style>
