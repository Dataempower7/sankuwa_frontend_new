<template>
    <a-spin :spinning="loading">
        <div class="content_wrapper">

            <el-form ref="formRef" :model="formState" label-width="auto"
                style="display: flex; gap: 0.75rem; flex-direction: column">
                <el-form-item label="门店名称" prop="storeSelfOperatedName"
                    :rules="[{ required: true, message: '门店名称不能为空!' }]">
                    <TigInput width="30%" v-model="formState.storeSelfOperatedName" showWordLimit :maxlength="20" />
                </el-form-item>
                <el-form-item label="门店地址" prop="storeSelfOperatedAddress"
                    :rules="[{ required: true, message: '请选择门店地址!' }]">
                    <div>
                        <SelectRegion v-model:selectedIds="regionNames" @change="onRegionChange" @clear="onClear"
                            style="width: 260px; margin-bottom: 10px">
                        </SelectRegion>
                        <TigInput width="500px" placeholder="详细地址" v-model="formState.storeSelfOperatedAddress"
                            @Input="updateMapInfo" class="mb20" />
                    </div>
                </el-form-item>

                <el-form-item label=" ">
                    <div class="map-container ">
                        <MapContainer ref="MapRef" :defaultPosition="defaultPosition" @positionChange="updatePosition">
                        </MapContainer>
                    </div>
                </el-form-item>

            </el-form>

        </div>

        <div class="selected-action-warp selected-warp-left"
            :style="{ left: themeInfo.layout !== 'topMenu' ? '23.0625rem' : '16.875rem' }">
            <div class="selected-action">
                <el-button :loading="confirmLoading" class="form-submit-btn" size="large" type="primary"
                    @click="onSubmit">提
                    交</el-button>
            </div>

        </div>
    </a-spin>
</template>

<script lang="ts" setup>
import "@/style/css/list.less";
import MapContainer from "@/components/map/MapContainer.vue";
import { onMounted, ref, shallowRef, nextTick, watch, computed } from "vue";
import { message } from "ant-design-vue";
import { SelfShopDetailResponse } from "@/types/setting/intraCityDelivery";
import {
    getConfigAmapAllSettings,
    saveAllAmapSettings,
    saveSelfShopDetail,
    getSelfShopDetail
} from "@/api/setting/intraCityDelivery";
import { convertNullsToEmptyStrings } from "@/utils/format";
import { useThemeStore } from "@/store/theme";
import SelectRegion from "@/components/select/src/SelectRegion.vue";
//门店用的
import { getShop } from "@/api/shop/shop";
import { getShopType } from "@/utils/storage";

const { themeInfo } = useThemeStore();
const formRef = shallowRef();
const MapRef = ref<any>();
const regionNames = ref<any[]>([]);
const regionText = ref<string>("");

// 基本参数定义
const confirmLoading = ref<boolean>(false);
const formState = ref<SelfShopDetailResponse>({
    storeSelfOperatedName: "",
    storeSelfOperatedLogo: "",
    storeSelfOperatedRegion: "",
    storeSelfOperatedAddress: "",
    storeSelfOperatedLongitude: "",
    storeSelfOperatedLatitude: ""
});

const loading = ref<boolean>(true);



//加载店铺信息
const loadShopInfo = async () => {
    loading.value = true;
    try {
        if (getShopType() && JSON.parse(localStorage.getItem("shopInfo") || "{}").shopId) {
            //门店的
            const result = await getShop(
                "detail", { shopId: JSON.parse(localStorage.getItem("shopInfo") || "{}").shopId })
            const { shopTitle, shopLogo, shopLongitude, shopLatitude } = result || {};
            Object.assign(formState.value, {
                storeSelfOperatedName: shopTitle || "",
                storeSelfOperatedLogo: shopLogo || "",
                storeSelfOperatedLongitude: shopLongitude || "",
                storeSelfOperatedLatitude: shopLatitude || "",
                storeSelfOperatedAddress: result?.shopDetailedAddress || "",

            });
        }
        else {
            //自营的
            const result = await getSelfShopDetail();
            formState.value = result as unknown as SelfShopDetailResponse;
        }
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }

}



//地址联动
const defaultPosition = computed(() => {
    if (formState.value.storeSelfOperatedLatitude && formState.value.storeSelfOperatedLongitude) {
        return formState.value.storeSelfOperatedLongitude + "," + formState.value.storeSelfOperatedLatitude;
    } else {
        return "";
    }
});
//拼接地址
const onRegionChange = (regionIds: number[]) => {
    regionText.value = regionIds.map((item: any) => item.regionName)?.join("");
    MapRef.value.search(regionNames.value?.join(",") + regionText.value);
    formState.value.storeSelfOperatedAddress = ''
};

const onClear = () => {
    regionNames.value = [];
    formState.value.storeSelfOperatedRegion = "";
    formState.value.storeSelfOperatedAddress = "";
    formState.value.storeSelfOperatedLongitude = "";
    formState.value.storeSelfOperatedLatitude = "";
    MapRef.value.clearSearch();

};

const updateMapInfo = () => {
    const address = regionNames.value.join(",") + formState.value.storeSelfOperatedRegion + formState.value.storeSelfOperatedAddress;
    if (address) {
        MapRef.value.search(address);
    }
};
const updatePosition = (data: any) => {
    formState.value.storeSelfOperatedLongitude = data.position[0];
    formState.value.storeSelfOperatedLatitude = data.position[1];
    formState.value.storeSelfOperatedAddress = data.name;
};


// 表单通过验证后提交
const onSubmit = async () => {
    try {
        await formRef.value.validate();
        confirmLoading.value = true;
        const result = await saveSelfShopDetail({
            ...formState.value,
            storeSelfOperatedRegion: regionNames.value?.join(","),
        });
        message.success("修改成功");
    } catch (error: any) {
        if (error && error.message) {
            message.error(error.message);
        }
    } finally {
        confirmLoading.value = false;
    }
};



onMounted(async () => {
    await loadShopInfo();
    formState.value.storeSelfOperatedRegion ? regionNames.value = formState.value.storeSelfOperatedRegion.split(",").map((item: any) => (Number(item))) : regionNames.value = [];
});


</script>
<style lang="less" scoped>
.content_wrapper {
    min-height: calc(100vh - 260px);
}

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
