<template>
    <div class="container">
        <a-spin :spinning="loading">
            <el-form ref="formRef" :model="formState" label-width="auto"
                style="display: flex; gap: 0.75rem; flex-direction: column">
                <div class="content_wrapper">
                    <div class="form-item">
                        <div class="flex flex-align-center mb10">
                            <div class="label mr10">同城配送功能</div>
                            <el-switch v-model="formState.enabled" :active-value="1" :inactive-value="0" />
                            <div class="tips ml10">{{ formState.enabled ? "已开启" : "已关闭" }}</div>
                        </div>
                        <div class="extra">买家下单支持同城配送，商家可自行配送</div>
                    </div>
                </div>
                <div class="content_wrapper">
                    <div class="base-info">
                        <span style="color: #919191">发货方：</span><span>{{ storeInfo?.storeSelfOperatedName ?
                            storeInfo?.storeSelfOperatedName : "--" }}</span>
                    </div>
                    <div class="base-info">
                        <span style="color: #919191">门店地址：</span>
                        <div>
                            <span>{{
                                storeInfo?.storeSelfOperatedRegions
                                    ? storeInfo?.storeSelfOperatedRegions?.join("") + storeInfo?.storeSelfOperatedAddress
                                    : "--"
                            }}</span>
                            <div class="base-info mt10" style="color: #bdc3c7">
                                配送区域以门店为中心设置服务半径，若要修改地址，请前往门店设置-->门店信息进行编辑修改
                            </div>
                        </div>
                    </div>

                    <div class="form-item">
                        <Map ref="mapRef" :center="radiuCenter" :radius="formState.deliveryRadius"
                            @updateRadius="updateRadius"></Map>
                        <div class="base-info mt20" style="color: #bdc3c7">收货地址在配送范围之外的买家将不可下单</div>
                    </div>

                    <div class="base-info">
                        <span style="color: #919191">配送价格：</span>
                        <div class="setting-box">
                            <el-form-item label="起送价" prop="minOrderAmount"
                                :rules="[{ required: true, message: '请输入起送价', trigger: 'blur' }]">
                                <TigInput width="160px" v-model="formState.minOrderAmount" type="integer">
                                    <template #append>元</template>
                                </TigInput>
                                <span style="color: #b6babf" class="ml5">订单中的商品在优惠前的总金额（不包含运费）低于起送价时，买家将不能下单</span>
                            </el-form-item>
                            <el-form-item label="基础运费" prop="minOrderAmount"
                                :rules="[{ required: true, message: '请输入基础运费', trigger: 'blur' }]">
                                <TigInput width="160px" v-model="formState.baseDeliveryFee" type="integer">
                                    <template #append>元</template>
                                </TigInput>
                                <span style="color: #b6babf"
                                    class="ml5">商家未设置叠加溢价规则时，则所有订单统一运费标准；商家可按配送服务半径设置叠加溢价规则</span>
                            </el-form-item>
                            <el-form-item label="叠加溢价" prop="distancePricingEnabled" :rules="pricingRulesRequired">
                                <div class="flex flex-align-center">
                                    <el-checkbox :true-value="1" :false-value="0"
                                        v-model="formState.distancePricingEnabled"
                                        @change="distancePricingEnabledChange">开启叠加溢价</el-checkbox>
                                    <el-tooltip effect="dark" content="最终费用 = 基础运费 + 叠加溢价" placement="top">
                                        <el-icon color="#b6babf" class="ml5">
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </div>
                            </el-form-item>
                            <el-form-item :label="index === 0 ? '溢价规则' : ' '"
                                v-for="(item, index) in formState.distancePricingList" :key="index">
                                <div class="pricing-rule-item">
                                    <span>超过</span>
                                    <el-form-item :prop="`distancePricingList.${index}.distanceThreshold`"
                                        :rules="getDistanceThresholdRules(index)"
                                        style="display: inline-block; margin: 0">
                                        <TigInput width="100px" v-model="item.distanceThreshold" type="integer"
                                            class="ml5 mr10"> </TigInput>
                                    </el-form-item>
                                    <span>km，每增加</span>
                                    <el-form-item :prop="`distancePricingList.${index}.distanceUnit`"
                                        :rules="getDistanceUnitRules()" style="display: inline-block; margin: 0">
                                        <TigInput width="100px" v-model="item.distanceUnit" type="integer"
                                            class="ml5 mr10"> </TigInput>
                                    </el-form-item>
                                    <span>km，配送费增加</span>
                                    <el-form-item :prop="`distancePricingList.${index}.additionalFee`"
                                        :rules="getAdditionalFeeRules()" style="display: inline-block; margin: 0">
                                        <TigInput width="100px" v-model="item.additionalFee" type="integer"
                                            class="ml5 mr10"> </TigInput>
                                    </el-form-item>
                                    <span>元</span>
                                    <el-button class="ml10" link type="primary"
                                        @click="deletePricingRule(index)">删除</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label=" ">
                                <el-button link type="primary" @click="addPricingRule"
                                    :disabled="!formState.distancePricingEnabled">添加收费规则</el-button>
                            </el-form-item>
                        </div>
                    </div>
                </div>
            </el-form>
        </a-spin>
    </div>
    <div class="selected-action-warp selected-warp-left"
        :style="{ left: themeInfo.layout !== 'topMenu' ? '23.0625rem' : '16.875rem' }">
        <div class="selected-action">
            <el-button :loading="confirmLoading" class="form-submit-btn" size="large" type="primary" @click="onSubmit">提
                交</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import "@/style/css/list.less";
import Map from "./src/Map.vue";
import { onMounted, ref, shallowRef, nextTick, watch } from "vue";
import { message } from "ant-design-vue";
import { CityDeliveryResponse, SelfShopDetailResponse, SaveIntraCityDeliveryConfigParams } from "@/types/setting/intraCityDelivery";
import {
    getConfigAmapAllSettings,
    saveAllAmapSettings,
    getIntraCityDeliveryConfig,
    saveIntraCityDeliveryConfig,
    getSelfShopDetail
} from "@/api/setting/intraCityDelivery";
import { convertNullsToEmptyStrings } from "@/utils/format";
import { useThemeStore } from "@/store/theme";
import { QuestionFilled } from "@element-plus/icons-vue";
//门店用的
import { getShop } from "@/api/shop/shop";
import { getShopType } from "@/utils/storage";
const { themeInfo } = useThemeStore();
const formRef = shallowRef();
const mapRef = ref<any>();
const radiuCenter = ref<number[]>([116.433322, 39.900256]);
// 基本参数定义
const storeInfo = ref<SelfShopDetailResponse>({
    storeSelfOperatedName: "",
    storeSelfOperatedAddress: "",
    storeSelfOperatedRegion: "",
    storeSelfOperatedLogo: "",
    storeSelfOperatedLongitude: "",
    storeSelfOperatedLatitude: "",
    storeSelfOperatedRegions: []
});

const confirmLoading = ref<boolean>(false);
const formState = ref<SaveIntraCityDeliveryConfigParams>({
    distancePricingList: [],
    minOrderAmount: 0,
    baseDeliveryFee: 0,
    deliveryRadius: 1000,
    distancePricingEnabled: 0,
    enabled: 0
});

const loading = ref<boolean>(true);

//是否叠加溢价变化
const distancePricingEnabledChange = (value: boolean) => {
    if (!value) {
        formState.value.distancePricingList = [];
    }
};
// 校验规则：当开启叠加溢价时，至少需要一条溢价规则
const pricingRulesRequired = [
    {
        validator: (rule: any, value: any, callback: any) => {
            if (value === 1 && formState.value.distancePricingList?.length === 0) {
                callback(new Error("开启叠加溢价时，至少需要添加一条溢价规则"));
            } else {
                callback();
            }
        },
        trigger: "change"
    }
];

// 距离校验规则
const getDistanceThresholdRules = (index: number) => {
    return [
        {
            required: true,
            message: "请输入距离",
            trigger: "blur"
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (!value || value === "" || value === 0) {
                    callback(new Error("距离不能为空或为0"));
                    return;
                }

                const currentValue = Number(value);

                // 检查是否小于等于前一个规则的值
                if (index > 0) {
                    const prevRule = formState.value.distancePricingList[index - 1];
                    const prevValue = Number(prevRule.distanceThreshold);

                    if (currentValue <= prevValue) {
                        callback(new Error(`距离值必须大于前一条规则的值 (${prevValue}km)`));
                        return;
                    }
                }

                // 检查是否小于等于后一个规则的值
                if (index < formState.value.distancePricingList.length - 1) {
                    const nextRule = formState.value.distancePricingList[index + 1];
                    const nextValue = Number(nextRule.distanceThreshold);

                    if (currentValue >= nextValue) {
                        callback(new Error(`距离值必须小于后一条规则的值 (${nextValue}km)`));
                        return;
                    }
                }

                callback();
            },
            trigger: "blur"
        }
    ];
};

// 距离单位校验规则
const getDistanceUnitRules = () => {
    return [
        {
            required: true,
            message: "请输入距离单位",
            trigger: "blur"
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (!value || value === "" || value === 0) {
                    callback(new Error("距离单位不能为空或为0"));
                    return;
                }
                callback();
            },
            trigger: "blur"
        }
    ];
};

// 附加费用校验规则
const getAdditionalFeeRules = () => {
    return [
        {
            required: true,
            message: "请输入附加费用",
            trigger: "blur"
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (!value || value === "" || value === 0) {
                    callback(new Error("附加费用不能为空或为0"));
                    return;
                }
                callback();
            },
            trigger: "blur"
        }
    ];
};

const loadFilter = async () => {
    loading.value = true;
    try {
        const result = await getConfigAmapAllSettings();
        Object.assign(formState.value, convertNullsToEmptyStrings(result));
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};
//加载页面配送价格数据
const loadPageData = async () => {
    loading.value = true;
    try {
        const result = await getIntraCityDeliveryConfig();
        formState.value = { ...result, distancePricingList: result.distancePricingList ? [...result.distancePricingList] : [] };
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};
//加载门店信息
const loadShopInfo = async () => {
    loading.value = true;
    try {
        if (getShopType() && JSON.parse(localStorage.getItem("shopInfo") || "{}").shopId) {
            //门店的
            const result = await getShop("detail", { shopId: JSON.parse(localStorage.getItem("shopInfo") || "{}").shopId });
            const { shopTitle, shopLogo, shopLongitude, shopLatitude } = result || {};
            Object.assign(storeInfo.value, {
                storeSelfOperatedName: shopTitle || "",
                storeSelfOperatedLogo: shopLogo || "",
                storeSelfOperatedLongitude: shopLongitude || "",
                storeSelfOperatedLatitude: shopLatitude || "",
                storeSelfOperatedAddress: result?.shopDetailedAddress || "",
                storeSelfOperatedRegions: result?.shopRegionNames || []
            });
        } else {
            //自营的
            const result = await getSelfShopDetail();
            storeInfo.value = result as unknown as SelfShopDetailResponse;

        }
        radiuCenter.value = [Number(storeInfo.value?.storeSelfOperatedLongitude), Number(storeInfo.value?.storeSelfOperatedLatitude)];
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};
//添加收费规则
const addPricingRule = () => {
    if (formState.value.distancePricingList?.length >= 10) {
        return message.error("最多只能添加10条收费规则");
    }
    formState.value.distancePricingList.push({
        distanceThreshold: 0,
        distanceUnit: 0,
        additionalFee: 0,
        sortOrder: formState.value.distancePricingList?.length + 1
    });
};

// 删除收费规则
const deletePricingRule = (index: number) => {
    if (formState.value.distancePricingList.length === 1) {
        return message.warning("最少需要添加一条收费规则");
    }
    formState.value.distancePricingList.splice(index, 1);

    // 重新校验表单
    nextTick(() => {
        formRef.value?.validateField("distancePricingEnabled");
        // 重新校验所有字段
        formState.value.distancePricingList.forEach((_: any, idx: number) => {
            formRef.value?.validateField(`distancePricingList.${idx}.distanceThreshold`);
            formRef.value?.validateField(`distancePricingList.${idx}.distanceUnit`);
            formRef.value?.validateField(`distancePricingList.${idx}.additionalFee`);
        });
    });
};

// 表单通过验证后提交
const onSubmit = async () => {
    try {
        await formRef.value.validate();
        confirmLoading.value = true;
        const result = await saveIntraCityDeliveryConfig(formState.value);
        message.success("修改成功");
    } catch (error: any) {
        if (error.message) {
            message.error(error.message);
        }
    } finally {
        confirmLoading.value = false;
    }
};
// 更新半径
const updateRadius = (radius: number) => {
    formState.value.deliveryRadius = radius;
};
// 加载列表
onMounted(async () => {
    await loadShopInfo();
    await loadPageData();
    loadFilter();
});

watch(
    () => formState.value.distancePricingList,
    (newVal) => {
        //叠加溢价校验
        if (newVal && newVal.length <= 1) {
            nextTick(() => {
                formRef.value?.validateField("distancePricingEnabled");
            });
        }
    },
    { deep: true }
);
</script>
<style lang="less" scoped>
.base-info {
    display: flex;
    margin-bottom: 20px;
}

.form-item {
    .label {
        font-weight: bold;
    }

    .tips {
        color: #999;
    }
}

.setting-box {
    width: 50%;
    min-height: 400px;
    background-color: #f5f7fa;
    padding: 20px;
}

.pricing-rule-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
}

.pricing-rule-item span {
    white-space: nowrap;
}

// 内联表单项样式
:deep(.pricing-rule-item .el-form-item) {
    margin-bottom: 0 !important;
}

:deep(.pricing-rule-item .el-form-item__error) {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    padding: 2px 5px;
    border-radius: 4px;
    white-space: nowrap;
    margin-top: 3px;
}
</style>
