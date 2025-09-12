<template>
    <tig-layout :title="title">
        <view class="address-edit-main">
            <view class="address-edit-content">
                <uni-forms ref="formRef" :model-value="form" label-width="240rpx">
                    <!-- 收货人 -->
                    <uni-forms-item :label="$t('收货人')" name="consignee" required>
                        <uni-easyinput v-model="form.consignee" primary-color="rgb(192, 196, 204)" :input-border="false" :placeholder="$t('姓名')" />
                    </uni-forms-item>

                    <!-- 手机号 -->
                    <uni-forms-item :label="$t('手机号')" name="mobile" required>
                        <uni-easyinput v-model="form.mobile" primary-color="rgb(192, 196, 204)" :input-border="false" :placeholder="$t('收货人手机号')" />
                    </uni-forms-item>

                    <!-- 所在地区 -->
                    <uni-forms-item :label="$t('所在地区')" name="regionNames" required>
                        <view class="region-input" @click="handleShowSelectRegion">
                            <uni-easyinput
                                v-model="form.regionNames"
                                suffix-icon="right"
                                primary-color="rgb(192, 196, 204)"
                                :input-border="false"
                                :placeholder="$t('省、市、区/县')"
                                readonly
                                class="no-pointer"
                            />
                        </view>
                    </uni-forms-item>

                    <!-- 详细地址 -->
                    <uni-forms-item :label="$t('详细地址')" name="address" required>
                        <uni-easyinput
                            v-model="form.address"
                            primary-color="rgb(192, 196, 204)"
                            :input-border="false"
                            :placeholder="$t('街道、楼牌号等')"
                        />
                    </uni-forms-item>

                    <!-- 固定电话 -->
                    <uni-forms-item :label="$t('固定电话')" name="telephone">
                        <uni-easyinput v-model="form.telephone" primary-color="rgb(192, 196, 204)" :input-border="false" :placeholder="$t('固定电话号码')" />
                    </uni-forms-item>

                    <!-- 邮箱 -->
                    <uni-forms-item :label="$t('邮箱')" name="email">
                        <uni-easyinput v-model="form.email" primary-color="rgb(192, 196, 204)" :input-border="false" :placeholder="$t('邮箱地址')" />
                    </uni-forms-item>

                    <!-- 设为默认地址 -->
                    <uni-forms-item :label="$t('设为默认地址')" name="isDefault" ">
                        <view class="switch" style="    justify-content: flex-end;">
                            <u-switch v-model="isDefault" active-color="#3544BA"  />
                        </view>
                    </uni-forms-item>
                </uni-forms>

                <!-- 智能识别区域 -->
                <view class="smart-recognition">
                    <view class="recognition-textarea">
                        <textarea
                            v-model="smartText"
                            :placeholder="$t('粘贴文本，智能识别地址信息')"
                            class="smart-input"
                            :maxlength="500"
                        />
                        <view class="recognition-buttons">
                            <button class="paste-btn" @click="handlePaste">{{ $t('粘贴') }}</button>
                            <button
                                class="recognize-btn"
                                :class="{ 'disabled': !smartText.trim() }"
                                :disabled="!smartText.trim()"
                                @click="handleSmartRecognition"
                            >
                                {{ $t('智能识别') }}
                            </button>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <tig-fixed-placeholder background-color="#fff">
            <view class="btn-box">
                <tig-button class="save-btn" :loading="isLoading" @click="onSubmit"> {{ $t("保存") }} </tig-button>
            </view>
        </tig-fixed-placeholder>
    </tig-layout>
    <selectRegion v-model:show="showSelectRegion" v-model="form.regionIds" @send-region-names="getRegionNames" />
</template>

<script lang="ts" setup>
import selectRegion from "@/components/region/selectRegion.vue";
import { nextTick, reactive, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getAddressData, updateAddressData, addAddressData } from "@/api/user/address";
import { getRegionByIds } from "@/api/region";
import { useI18n } from "vue-i18n";
import { isOverseas } from "@/utils";

const { t } = useI18n();

const title = ref("添加地址");

const id = ref(null);
const form = reactive({
    consignee: "",
    regionIds: [] as number[],
    address: "",
    mobile: "",
    telephone: "",
    email: "",
    regionNames: "",
    isDefault: 0
});

const isDefault = ref(false);
const smartText = ref('');

const rules = {
    consignee: {
        rules: [{ required: true, errorMessage: t("请您填写收货人姓名") }]
    },
    regionNames: {
        rules: [
            { required: true, errorMessage: t("请选择所在地区") },
            {
                validateFunction: function (rule: any, value: any, data: any, callback: any) {
                    if (form.regionIds.length < 1) {
                        callback(t("请选择所在地区"));
                    }
                    return true;
                }
            }
        ]
    },
    address: {
        rules: [{ required: true, errorMessage: t("请您填写详细收货地址") }]
    },
    mobile: {
        rules: [
            { required: true, errorMessage: t("请您填写收货人手机号码") },
            {
                validateFunction: function (rule: any, value: any, data: any, callback: any) {
                    if (isOverseas()) {
                        callback(); // 如果是海外手机号，直接通过验证
                    } else {
                        const regex = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
                        const status = regex.test(value);
                        if (!status) {
                            callback(t("请输入正确的手机号码"));
                        }
                    }

                    return true;
                }
            }
        ]
    }
};

onShow(() => {
    nextTick(() => {
        formRef.value.setRules(rules);
    });
});

onLoad((option: any) => {
    if (option && option.id) {
        title.value = "编辑地址";
        id.value = option.id;
        __getAddressData();
    }

    // 如果是从一键导入进入
    if (option && option.import === 'true') {
        title.value = "添加地址";

        // 如果有位置信息，自动填入
        if (option.location) {
            try {
                const locationData = JSON.parse(decodeURIComponent(option.location));
                handleLocationImport(locationData);
            } catch (error) {
                console.error('解析位置信息失败:', error);
                showManualInputTip();
            }
        } else {
            // 没有位置信息，显示手动输入提示
            showManualInputTip();
        }
    }
});

// 显示手动输入提示
const showManualInputTip = () => {
    nextTick(() => {
        uni.showToast({
            title: t("请在下方输入完整地址信息进行智能识别"),
            icon: "none",
            duration: 3000
        });
    });
};

// 处理位置导入（支持完整的省市区街道信息）
const handleLocationImport = async (locationData: any) => {
    try {
        console.log('处理位置导入数据:', locationData);

        // 若包含收货人信息（来自 wx.chooseAddress），预填
        if (locationData.consignee) {
            form.consignee = locationData.consignee;
        }
        if (locationData.mobile) {
            form.mobile = locationData.mobile;
        }
        
        if (locationData.regions && locationData.regions.length > 0) {
            // 设置地区名称（省市区）
            form.regionNames = locationData.regions.join(' ');

            // 尝试匹配地区ID
            try {
                const regionIds = await findRegionIdsByNames(locationData.regions);
                if (regionIds.length > 0) {
                    form.regionIds = regionIds;
                    console.log('地区ID匹配成功:', regionIds);
                }
            } catch (error) {
                console.error('地区ID匹配失败:', error);
            }
        }

        // 构建详细地址（包含街道信息）
        let detailAddress = '';
        
        // 优先使用原始的detail字段
        if (locationData.detail) {
            detailAddress = locationData.detail;
        } else {
            // 如果没有detail，尝试组合街道信息
            const addressParts = [];
            if (locationData.township) addressParts.push(locationData.township);
            if (locationData.street) addressParts.push(locationData.street);
            if (locationData.streetNumber) addressParts.push(locationData.streetNumber);
            
            if (addressParts.length > 0) {
                detailAddress = addressParts.join('');
            } else if (locationData.nearbyPois && locationData.nearbyPois.length > 0) {
                // 如果还是没有，使用附近的POI信息
                detailAddress = locationData.nearbyPois[0].name || '';
            } else if (locationData.businessAreas && locationData.businessAreas.length > 0) {
                // 最后使用商圈信息
                detailAddress = locationData.businessAreas[0].name || '';
            }
        }
        
        if (detailAddress) {
            form.address = detailAddress;
        }

        nextTick(() => {
            let message = t("位置信息已自动填入，请完善收货人和联系方式");
            let iconType = "success";
            
            // 根据导入类型显示不同提示
            if (locationData.type === 'wechat_address') {
                // 微信地址簿导入
                message = t("已导入成功");
            } else if (locationData.type === 'location_address') {
                // 定位获取的地址
                message = t("定位成功！地址信息已自动填入，请完善收货人信息");
            }
            
            // 如果有街道信息，给出特别提示
            if (locationData.township || locationData.street) {
                message += t("（已包含街道信息）");
            }

            uni.showToast({
                title: message,
                icon: iconType,
                duration: 4000
            });
            
            // 如果有附加信息，在控制台输出
            if (locationData.businessAreas || locationData.nearbyPois) {
                console.log('附近商圈:', locationData.businessAreas);
                console.log('附近POI:', locationData.nearbyPois);
            }
        });
    } catch (error) {
        console.error('位置信息处理失败:', error);
        uni.showToast({
            title: t("位置信息处理失败，请手动输入"),
            icon: "none",
            duration: 3000
        });
        showManualInputTip();
    }
};

const __getAddressData = async () => {
    try {
        const result = await getAddressData({ id: id.value });
        const { regionNames } = result;
        Object.assign(form, result);
        form.regionNames = regionNames.join(" ");
        isDefault.value = form.isDefault === 1;
    } catch (error) {
        console.error(error);
    }
};

const getRegionNames = (val: string[]) => {
    form.regionNames = val.join(" ");
};

const showSelectRegion = ref(false);
const handleShowSelectRegion = () => {
    showSelectRegion.value = true;
};

// 粘贴功能
const handlePaste = async () => {
    try {
        // 尝试从剪贴板读取内容
        const clipboardData = await uni.getClipboardData();
        if (clipboardData.data) {
            smartText.value = clipboardData.data;
            uni.showToast({
                title: t("粘贴成功"),
                icon: "success"
            });
        }
    } catch (error) {
        uni.showToast({
            title: t("粘贴失败"),
            icon: "none"
        });
    }
};

// 校验地址输入是否包含必要信息
const validateAddressInput = (text: string) => {
    const cleanText = text.trim().replace(/\s+/g, ' ');

    // 校验手机号
    const phoneRegex = /1[3-9]\d{9}/g;
    const hasPhone = phoneRegex.test(cleanText);

    // 校验姓名（中文姓名，2-4个字符）
    const nameRegex = /(?:收货人|姓名|联系人)?[：:\s]*([^\d\s]{2,4}(?:先生|女士|小姐)?)/;
    const hasName = nameRegex.test(cleanText);

    // 校验是否包含地区信息
    const regionRegex = /([\u4e00-\u9fa5]{2,}(?:省|市|区|县|自治区|特别行政区|地区|州|盟))/;
    const hasRegion = regionRegex.test(cleanText);

    // 校验是否包含详细地址（去除姓名、手机号、地区后还有内容）
    let detailCheck = cleanText;
    const phoneMatches = cleanText.match(phoneRegex);
    if (phoneMatches) {
        phoneMatches.forEach(phone => {
            detailCheck = detailCheck.replace(phone, '');
        });
    }
    const nameMatch = cleanText.match(nameRegex);
    if (nameMatch) {
        detailCheck = detailCheck.replace(nameMatch[0], '');
    }
    const regionMatches = cleanText.match(new RegExp(regionRegex.source, 'g'));
    if (regionMatches) {
        regionMatches.forEach(region => {
            detailCheck = detailCheck.replace(region, '');
        });
    }

    detailCheck = detailCheck
        .replace(/收货人|姓名|联系人|地址|详细地址/g, '')
        .replace(/[：:\s]+/g, '')
        .trim();

    const hasDetailAddress = detailCheck.length >= 5; // 详细地址至少5个字符

    // 构建错误信息
    const missingItems = [];
    if (!hasName) missingItems.push('收货人姓名');
    if (!hasPhone) missingItems.push('手机号码');
    if (!hasRegion) missingItems.push('省市区信息');
    if (!hasDetailAddress) missingItems.push('详细地址');

    const isValid = hasName && hasPhone && hasRegion && hasDetailAddress;

    let message = '';
    if (!isValid) {
        message = `请确保输入内容包含以下信息：\n${missingItems.map(item => `• ${item}`).join('\n')}\n\n正确格式示例：\n张三 13812345678 北京市朝阳区望京街道某某小区1号楼2单元303室`;
    }

    return {
        isValid,
        message,
        missingItems,
        hasName,
        hasPhone,
        hasRegion,
        hasDetailAddress
    };
};

// 智能识别地址信息
const handleSmartRecognition = async () => {
    if (!smartText.value.trim()) {
        uni.showToast({
            title: t("请先输入或粘贴地址信息"),
            icon: "none"
        });
        return;
    }

    // 校验输入内容是否包含必要信息
    const validationResult = validateAddressInput(smartText.value);
    if (!validationResult.isValid) {
        uni.showModal({
            title: t('输入信息不完整'),
            content: validationResult.message,
            showCancel: false,
            confirmText: t('我知道了')
        });
        return;
    }

    await parseAddress(smartText.value);
};

// 地址解析函数
const parseAddress = async (addressText: string) => {
    if (!addressText || addressText.trim() === '') {
        uni.showToast({
            title: t('地址内容为空'),
            icon: 'none'
        });
        return;
    }

    uni.showLoading({
        title: t('正在解析地址...')
    });

    try {
        const result = smartParseAddress(addressText);

        if (result.success) {
            // 填充解析结果到表单
            if (result.name) {
                form.consignee = result.name;
            }
            if (result.phone) {
                form.mobile = result.phone;
            }
            if (result.regions && result.regions.length > 0) {
                form.regionNames = result.regions.join(' ');

                // 根据地区名称获取对应的regionIds
                try {
                    uni.showLoading({
                        title: t('正在匹配地区...')
                    });
                    const regionIds = await findRegionIdsByNames(result.regions);

                    if (regionIds.length > 0) {
                        form.regionIds = regionIds;
                        uni.showToast({
                            title: t(`成功匹配${regionIds.length}级地区`),
                            icon: 'success',
                            duration: 1500
                        });
                    } else {
                        uni.showToast({
                            title: t('未能自动匹配地区，请手动选择'),
                            icon: 'none',
                            duration: 2000
                        });
                    }
                } catch (error) {
                    uni.showToast({
                        title: t('地区匹配失败，请手动选择'),
                        icon: 'none',
                        duration: 2000
                    });
                }
            }
            if (result.detail) {
                form.address = result.detail;
            }

            // 清空输入框
            smartText.value = '';

            uni.hideLoading();
            uni.showToast({
                title: t('地址解析成功'),
                icon: 'success'
            });
        } else {
            uni.hideLoading();
            uni.showToast({
                title: result.message || t('地址解析失败'),
                icon: 'none'
            });
        }
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: t('地址解析失败'),
            icon: 'none'
        });
    }
};

// 智能地址解析算法
const smartParseAddress = (text: string) => {
    const cleanText = text.trim().replace(/\s+/g, ' ');

    // 手机号正则
    const phoneRegex = /1[3-9]\d{9}/g;
    const phones = cleanText.match(phoneRegex);

    // 姓名正则（通常在地址开头或手机号前后）
    const nameRegex = /(?:收货人|姓名|联系人)?[：:\s]*([^\d\s]{2,4}(?:先生|女士|小姐)?)/;
    const nameMatch = cleanText.match(nameRegex);

    // 分别匹配省、市、区
    const provinceRegex = /([\u4e00-\u9fa5]{2,}(?:省|自治区|特别行政区))/;
    const cityRegex = /([\u4e00-\u9fa5]{2,}(?:市|地区|州|盟))/;
    const districtRegex = /([\u4e00-\u9fa5]{2,}(?:区|县|市))/;

    const provinceMatch = cleanText.match(provinceRegex);
    const cityMatch = cleanText.match(cityRegex);
    const districtMatch = cleanText.match(districtRegex);

    // 详细地址（去除已识别的省市区、姓名、手机号后的剩余部分）
    let detailAddress = cleanText;
    if (phones) {
        phones.forEach(phone => {
            detailAddress = detailAddress.replace(phone, '');
        });
    }
    if (nameMatch) {
        detailAddress = detailAddress.replace(nameMatch[0], '');
    }
    // 移除已识别的省市区
    if (provinceMatch) {
        detailAddress = detailAddress.replace(provinceMatch[0], '');
    }
    if (cityMatch) {
        detailAddress = detailAddress.replace(cityMatch[0], '');
    }
    if (districtMatch) {
        detailAddress = detailAddress.replace(districtMatch[0], '');
    }

    // 清理详细地址
    detailAddress = detailAddress
        .replace(/收货人|姓名|联系人|地址|详细地址/g, '')
        .replace(/[：:\s]+/g, '')
        .trim();

    // 构建结果
    const result: any = {
        success: false,
        message: '',
        name: '',
        phone: '',
        regions: [],
        detail: ''
    };

    // 提取姓名
    if (nameMatch && nameMatch[1]) {
        result.name = nameMatch[1].replace(/先生|女士|小姐/, '');
    }

    // 提取手机号
    if (phones && phones.length > 0) {
        result.phone = phones[0];
    }

    // 提取省市区
    const regions = [];
    if (provinceMatch && provinceMatch[1]) regions.push(provinceMatch[1]);
    if (cityMatch && cityMatch[1]) regions.push(cityMatch[1]);
    if (districtMatch && districtMatch[1]) regions.push(districtMatch[1]);
    result.regions = regions;

    // 提取详细地址
    if (detailAddress) {
        result.detail = detailAddress;
    }

    // 判断解析是否成功
    if (result.regions.length > 0 || result.detail || result.name || result.phone) {
        result.success = true;
        result.message = t('地址解析成功');
    } else {
        result.message = t('未能识别有效的地址信息');
    }

    return result;
};





// 根据地区名称智能查找对应的地区ID
const findRegionIdsByNames = async (regionNames: string[]): Promise<number[]> => {
    try {
        if (!regionNames || regionNames.length === 0) return [];

        // 获取所有省份数据
        const result: any = await getRegionByIds('');
        if (!result || !Array.isArray(result) || result.length === 0) return [];

        const provinces = result[0] || [];
        const regionIds: number[] = [];
        let currentLevel = provinces;

        // 逐级查找匹配的地区
        for (let i = 0; i < regionNames.length && i < 3; i++) { // 最多3级：省市区
            const targetName = regionNames[i];
            let foundRegion = null;

            // 在当前级别中查找匹配的地区
            for (const region of currentLevel) {
                if (isRegionMatch(region.regionName, targetName)) {
                    foundRegion = region;
                    break;
                }
            }

            if (foundRegion) {
                regionIds.push(foundRegion.regionId);

                // 如果还有下一级，获取下一级数据
                if (i < regionNames.length - 1) {
                    try {
                        const nextResult: any = await getRegionByIds(regionIds.join(','));
                        if (nextResult && Array.isArray(nextResult) && nextResult[i + 1]) {
                            currentLevel = nextResult[i + 1];
                        } else {
                            break; // 没有下一级数据了
                        }
                    } catch (error) {
                        console.error('获取下级地区失败:', error);
                        break;
                    }
                }
            } else {
                console.warn(`未找到匹配的地区: ${targetName}`);
                break;
            }
        }

        return regionIds;
    } catch (error) {
        console.error('查找地区ID失败:', error);
        return [];
    }
};

// 判断地区名称是否匹配
const isRegionMatch = (regionName: string, targetName: string): boolean => {
    // 完全匹配
    if (regionName === targetName) return true;

    // 移除后缀后匹配
    const cleanRegionName = regionName.replace(/省|市|自治区|特别行政区|区|县|旗$/g, '');
    const cleanTargetName = targetName.replace(/省|市|自治区|特别行政区|区|县|旗$/g, '');

    if (cleanRegionName === cleanTargetName) return true;

    // 包含匹配（处理简称情况）
    if (regionName.includes(targetName) || targetName.includes(cleanRegionName)) {
        return true;
    }

    return false;
};



const isLoading = ref(false);
const formRef = ref();
const onSubmit = () => {
    formRef.value
        .validate()
        .then(() => {
            form.isDefault = isDefault.value ? 1 : 0;
            // if (isLoading.value) return;
            // isLoading.value = true;
            if (id.value) {
                edit();
            } else {
                add();
            }
        })
        .catch((err: any) => {
            console.log("表单错误信息：", err);
        });
};

const add = async () => {
    isLoading.value = true;
    try {
        await addAddressData(form);
        uni.showToast({
            title: t("添加地址成功"),
            icon: "none",
            duration: 1000
        });

        setTimeout(() => {
            uni.navigateBack({
                success: function (res) {
                    uni.$emit("refreshData"); // 发送刷新信号
                    isLoading.value = false;
                }
            });
        }, 1000);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1000
        });
        isLoading.value = false;
    }
};

const edit = async () => {
    isLoading.value = true;
    try {
        await updateAddressData({ id: id.value, ...form });
        uni.showToast({
            title: t("编辑地址成功"),
            icon: "none",
            duration: 1000
        });

        setTimeout(() => {
            uni.navigateBack({
                success: function (res) {
                    uni.$emit("refreshData"); // 发送刷新信号
                    isLoading.value = false;
                }
            });
        }, 1000);
    } catch (error: any) {
        console.error(error);
        uni.showToast({
            title: error.message,
            icon: "none",
            duration: 1000
        });
    }
};
</script>

<style lang="scss" scoped>
:deep(.uni-forms-item) {
    margin-bottom: 30rpx;
}
:deep(.uni-forms-item__error) {
    top: 90%;
    left: 18rpx;
}
:deep(.uni-easyinput__placeholder-class) {
    font-size: 28rpx;
    color: #999;
}

:deep(.uni-easyinput__content-input) {
    font-size: 28rpx;
    color: #333;
}
:deep(.uni-forms-item__label) {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    position: relative;
    margin-left: 15px;
    width: 120px !important;

    .is-required {
        position: absolute;
        top: 10rpx;
        left: -20rpx;
        color: #ff4757;
    }
}
:deep(.is-disabled) {
    background-color: #fff;
}

.btn-box {
    padding: 25rpx;

    .save-btn {
        background-color: #3544BA !important;
        color: #fff !important;
        border-radius: 44rpx;
        height: 88rpx;
        font-size: 32rpx;
        border: none;
    }
}

.address-edit-main {
    padding: 30rpx;
    padding-bottom: 0rpx;

    .address-edit-content {
        background-color: #fff;
        border-radius: 15rpx;
        padding: 20rpx;
        padding-bottom: 5rpx;
    }
}

.button-position {
    position: fixed;
    bottom: 30rpx;
    left: 0;
    right: 0;
    padding: 0 30rpx;
}
.switch {
    height: 100%;
    display: flex;
    align-items: center;
}
.no-pointer {
    pointer-events: none;
}

/* 智能识别区域样式 */
.smart-recognition {
    margin-top: 30rpx;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 23rpx 5rpx 36rpx 4rpx;

    .recognition-textarea {
        position: relative;

        .smart-input {
            width: 100%;
            min-height: 200rpx;
            padding: 20rpx 20rpx 80rpx 20rpx; /* 底部留出空间给按钮 */
            border: 2rpx solid #f0f0f0;
            border-radius: 12rpx;
            font-size: 28rpx;
            line-height: 1.5;
            background-color: #fafafa;
            resize: none;
            box-sizing: border-box;
        }

        .smart-input:focus {
            border-color: #3544BA;
            background-color: #fff;
        }

        .recognition-buttons {
            position: absolute;
            bottom: 15rpx;
            right: 15rpx;
            display: flex;
            gap: 15rpx;

            .paste-btn, .recognize-btn {
                height: 50rpx;
                padding: 0 20rpx;
                border-radius: 25rpx;
                font-size: 22rpx;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                white-space: nowrap;
            }

            .paste-btn {
                background-color: rgba(245, 245, 245, 0.9);
                color: #666;
                border: 1rpx solid #e0e0e0;
            }

            .paste-btn:active {
                background-color: rgba(224, 224, 224, 0.9);
            }

            .recognize-btn {
                background-color: rgba(53, 68, 186, 0.9);
                color: #fff;
                transition: all 0.3s ease;
            }

            .recognize-btn:active {
                background-color: rgba(42, 58, 154, 0.9);
            }

            .recognize-btn.disabled {
                background-color: rgba(204, 204, 204, 0.9) !important;
                color: #999 !important;
                cursor: not-allowed;
            }

            .recognize-btn:disabled {
                background-color: rgba(204, 204, 204, 0.9) !important;
                color: #999 !important;
                cursor: not-allowed;
            }
        }
    }
}
</style>
