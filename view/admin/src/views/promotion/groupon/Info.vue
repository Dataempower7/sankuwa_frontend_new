<template>
    <div class="container">
        <div class="content_wrapper">
            <div class="lyecs-form-table">
                <el-form v-if="!loading" ref="formRef" :rules="rules" :model="formState" label-width="auto">
                    <div class="group activity-base">
                        <div class="group-header">
                            <div class="group__block"></div>
                            <div class="group__title">基础设置</div>
                        </div>
                        <div class="group-content">
                            <el-form-item required label="活动名称" prop="name">
                                <BusinessData v-model:modelValue="formState.name" placeholder="请输入活动名称" :dataType="4"
                                    :dataId="id"></BusinessData>
                            </el-form-item>
                            <el-form-item required label="活动时间" prop="activityTime">
                                <div class="flex flex-align-center">
                                    <SelectTimeInterval v-model:end-date="formState.endTime"
                                        v-model:start-date="formState.startTime" clearable type="datetime"
                                        value-format="YYYY-MM-DD HH:mm:ss" @callback="changeDateType(-1)">
                                    </SelectTimeInterval>
                                    <el-radio-group class="itemWidth" v-model="dateType" @change="changeDateType">
                                        <el-radio-button :value="0">1天</el-radio-button>
                                        <el-radio-button :value="1">7天</el-radio-button>
                                        <el-radio-button :value="2">15天</el-radio-button>
                                    </el-radio-group>
                                </div>
                            </el-form-item>
                        </div>
                    </div>
                    <div class="group activity-rule">
                        <div class="group-header">
                            <div class="group__block"></div>
                            <div class="group__title">活动规则</div>
                        </div>
                        <div class="group-content">
                            <el-form-item prop="expirationTime" label="成团有效时间">
                                <div>
                                    <div class="flex">
                                        <TigInput class="mr10" type="integer" v-model="days" width="120px">
                                            <template #append>日</template>
                                        </TigInput>
                                        <TigInput class="mr10" type="integer" v-model="hours" width="120px">
                                            <template #append>时</template>
                                        </TigInput>
                                        <TigInput type="integer" v-model="minutes" width="120px">
                                            <template #append>分</template>
                                        </TigInput>
                                    </div>
                                    <div class="extra">拼团有效期需在15分钟至30天之间，若设置1日，用户开团后，需要在1日内成团，超时则拼团失败</div>
                                </div>
                            </el-form-item>
                            <!-- <el-form-item v-if="orgRequired" prop="shopIds" label="适用组织" class="org-select-form-item"
                                :rules="[{ required: orgRequired, message: '请至少选择一个组织' }]">
                                <div class="org-select">
                                    <el-radio-group class="org-radio-group" v-model="useOrgType">
                                        <el-radio :value="0">全部组织</el-radio>
                                        <el-radio :value="1">指定组织(店铺/门店）适用</el-radio>
                                    </el-radio-group>
                                    <div v-if="getAdminType() === 'admin' && useOrgType === 1">
                                        <div v-if="orgSelecteds.length" style="padding-left: 24px;">
                                            <el-tag :disable-transitions="false">
                                                {{ orgSelecteDisplay }}
                                            </el-tag>
                                        </div>
                                        <DialogForm dialogClass="noPadding" :maskClose="false"
                                            :params="{ isSelect: true, selectedIds: orgSelecteds }" isDrawer
                                            path="promotion/groupon/src/OrganizePop" title="选择组织" width="1100px"
                                            @okCallback="handleOrgSelectChange">
                                            <div class="org-select-btn">
                                                <el-button type="primary" link>选择组织</el-button>
                                                <el-icon>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                                        <path fill="currentColor"
                                                            d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z">
                                                        </path>
                                                    </svg>
                                                </el-icon>
                                            </div>
                                        </DialogForm>
                                    </div>
                                </div>
                            </el-form-item> -->
                        </div>
                    </div>
                    <div class="group activity-guide">
                        <div class="group-header">
                            <div class="group__block"></div>
                            <div class="group__title">活动引导</div>
                        </div>
                        <div class="group-content">
                            <el-form-item label="活动图片" prop="grouponImage">
                                <ImgSelect v-model:photo="formState.grouponImage"></ImgSelect>
                                <div class="extra">建议尺寸：750*660或等比图片，将会在默认活动页面顶部展示</div>
                            </el-form-item>
                            <el-form-item label="专题页分享图" prop="shareImage">
                                <ImgSelect v-model:photo="formState.shareImage"></ImgSelect>
                                <div class="extra">建议尺寸：630*504或宽高比为5:4的图片，将会分享活动专题页的时候作为小程序分享图</div>
                            </el-form-item>
                            <el-form-item label="活动规则" prop="grouponExplain">
                                <TigInput classType="tig-form-input" v-model="formState.grouponExplain" :row="3"
                                    type="textarea" />
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
                <a-spin :spinning="loading" style="width: 100%; margin-top: 100px" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref, shallowRef, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import BusinessData from "@/components/multilingual/BusinessData.vue";
import { SelectTimeInterval } from "@/components/select";
import { DialogForm } from "@/components/dialog";
import { GrouponFormState } from "@/types/promotion/groupon";
import { formattedDate } from "@/utils/time";
import { getDays } from "@/utils/util";
import type { FormRules } from "element-plus";
import { message } from "ant-design-vue";
import { getGroupon, updateGroupon } from "@/api/promotion/groupon";
import ImgSelect from "@/views/promotion/groupon/src/ImgSelect.vue";
import { getAdminType } from "@/utils/storage";
import { fromPairs } from "lodash-es";
import { ShopFilterState } from "@/types/shop/shop";
import { ru } from "element-plus/es/locale";

// 父组件回调
const emit = defineEmits(["submitCallback", "update:confirmLoading", "close"]);

const props = defineProps({
    id: {
        type: Number,
        default: 0
    },
    groupType: {
        type: Number,
        default: 0
    },
    act: {
        type: String,
        default: ""
    },
    isDialog: Boolean
});
const loading = ref<boolean>(true);
const query = useRouter().currentRoute.value.query;
const action = ref<string>(props.isDialog ? props.act : String(query.act));
const id = ref<number>(props.isDialog ? props.id : Number(query.id));
const groupType = ref<number>(props.isDialog ? props.groupType : Number(query.groupType));
const operation = action.value === "add" ? "create" : "update";
const formRef = shallowRef();
const days = ref(0);
const hours = ref(24);
const minutes = ref(0);
const orgSelecteds = ref<ShopFilterState[]>([]);
const useOrgType = ref(0);
const adminType = computed(() => getAdminType());
const orgRequired = computed(() => {
    return adminType.value === "admin" && useOrgType.value === 1;
});
const orgSelecteDisplay = computed(() => {
    if (orgSelecteds.value.length === 0) {
        return ""
    }
    if (orgSelecteds.value.length === 1) {
        return orgSelecteds.value[0].shopTitle ?? ""
    }
    else {
        return `${orgSelecteds.value[0].shopTitle}等${orgSelecteds.value.length}个组织(店铺/门店）`;
    }
});
const orgSelectIds = computed(() => orgSelecteds.value.map(v => v.shopId));

const getImageUrl = (type: "groupon" | "share", gType: number): string => {
    const imageUrlMap = {
        groupon: new Map<number, string>([
            [1, "https://oss.tigshop.com/img/gallery/202508/1756438001oGreqNb5OFAuCIJJ4S.jpeg"],
            [2, "https://oss.tigshop.com/img/gallery/202508/1756450144lRbOpyA51VGhJYNw5d.jpeg"]
        ]),
        share: new Map<number, string>([
            [1, "https://oss.tigshop.com/img/gallery/202508/1756438009cgWMViU51p4b7dWX44.jpeg"],
            [2, "https://oss.tigshop.com/img/gallery/202508/1756450125U4O78zVX5s5HlS1hye.jpeg"]
        ])
    };

    return imageUrlMap[type].get(gType) || "";
};
const formState = ref<GrouponFormState>({
    groupType: groupType.value || 0,
    startTime: formattedDate(new Date(), "YYYY-MM-DD HH:mm:ss"),
    endTime: formattedDate(getDays(1, "add"), "YYYY-MM-DD HH:mm:ss"),
    expirationTime: 0,
    grouponImage: getImageUrl("groupon", groupType.value),
    shareImage: getImageUrl("share", groupType.value),
    grouponExplain: "",
});

/**
 * 计算拼团有效期
 */
const expTime = () => {
    // 将天、小时、分钟都转换为毫秒
    const daysInMs = days.value * 24 * 60 * 60;
    const hoursInMs = hours.value * 60 * 60;
    const minutesInMs = minutes.value * 60;
    return daysInMs + hoursInMs + minutesInMs;
};

/**
 * 根据毫秒算出具体的天数和小时和分钟
 */
const getTime = (time: number) => {
    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / (60));
    return { days, hours, minutes };
}

watchEffect(() => {
    formState.value.expirationTime = expTime();
});

watch(orgSelectIds, (value) => {
    formState.value.shopIds = orgSelectIds.value;
})

const dateType = ref(0);
const changeDateType = (event: number) => {
    if (event === -1) {
        dateType.value = event;
        return;
    }
    formState.value.startTime = formattedDate(new Date(), "YYYY-MM-DD HH:mm:ss");
    if (event === 0) {
        //1
        formState.value.endTime = formattedDate(getDays(1, "add"), "YYYY-MM-DD HH:mm:ss");
    }
    if (event === 1) {
        //7
        formState.value.endTime = formattedDate(getDays(7, "add"), "YYYY-MM-DD HH:mm:ss");
    }
    if (event === 2) {
        //15
        formState.value.endTime = formattedDate(getDays(15, "add"), "YYYY-MM-DD HH:mm:ss");
    }
};

/**
 * 选择组织
 */
const handleOrgSelectChange = (value: ShopFilterState[]) => {
    console.log(value);
    orgSelecteds.value = value;
};

onMounted(() => {
    if (action.value === "detail") {
        // 获取详情数据
        fetchGroupon()
    } else {
        loading.value = false;
    }
});

const fetchGroupon = async () => {
    try {
        const result = await getGroupon(action.value, {
            grouponPromotionId: id.value
        });
        // console.log(result);
        Object.assign(formState.value, result);
        const timespan = getTime(formState.value.expirationTime || 0); {
            days.value = timespan.days;
            hours.value = timespan.hours;
            minutes.value = timespan.minutes;
        }
        if (result.shops && result.shops.length > 0) {
            orgSelecteds.value = result.shops;
            if (orgSelectIds.value.length > 0) {
                useOrgType.value = 1;
            }
        }
    } catch (error: any) {
        message.error(error.message);
        emit("close");
    } finally {
        loading.value = false;
    }
};

// 表单通过验证后提交
const onSubmit = async () => {
    await formRef.value.validate();
    try {
        emit("update:confirmLoading", true);
        // 如果选择的是全部组织
        if (useOrgType.value === 0) {
            formState.value.shopIds = [-1];
        }
        const result = await updateGroupon(operation, { id: id.value, ...formState.value });
        emit("submitCallback", result);
        message.success("操作成功");
    } catch (error: any) {
        message.error(error.message);
    } finally {
        emit("update:confirmLoading", false);
    }
};
// 表单提交
const onFormSubmit = () => {
    onSubmit();
};

/**
 * 验证活动时间
 * @param rule 
 * @param value 
 * @param callback 
 */
const validActivityTime = (rule: any, value: any, callback: any) => {
    if (!formState.value.startTime && !formState.value.endTime) {
        callback(new Error("请输入活动时间"));
        return;
    }
    callback();
};
/**
 * 验证成团有效时间 只能在15分钟到30天之间
 * @param rule 
 * @param value 
 * @param callback 
 */
const validExpirationTime = (rule: any, value: any, callback: any) => {
    if (!formState.value.expirationTime) {
        callback(new Error("成团有效时间不能为空!"));
        return;
    }
    if (formState.value.expirationTime < (15 * 60) || formState.value.expirationTime > (30 * 24 * 60 * 60)) {
        callback(new Error("成团有效时间需在15分钟到30天之间"));
        return;
    }
    callback();
}

interface RuleForm {
    name: string;
    activityTime: number;
    groupType: number;
    expirationTime: number;
}

const rules = reactive<FormRules<RuleForm>>({
    name: [{ required: true, message: "活动名称不能为空!", trigger: "blur" }],
    activityTime: [{ required: true, validator: validActivityTime, trigger: "blur" }],
    groupType: [{ required: true, message: "请至少选择一个组织", trigger: "blur" }],
    expirationTime: [{ required: true, validator: validExpirationTime, trigger: "blur" }],
});

defineExpose({ onFormSubmit });
</script>
<style lang="less" scoped>
.container {
    --color-title: #101010;

    .itemWidth {
        margin-left: 10px;
    }

    .radio-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
}

:deep(.el-form-item__label) {
    color: var(--color-title);
}

.group {
    .group-header {
        display: flex;
        align-items: center;
        border-radius: 3px;
        background-color: rgba(245, 247, 250, 1);
        padding: 6px 0 6px 14px;
    }

    .group__block {
        width: 4px;
        height: 16px;
        border-radius: 22px;
        background-color: rgba(20, 86, 240, 1);
    }

    .group__title {
        color: var(--color-title);
        padding-left: 6px;
    }



    .extra {
        padding-top: 11px;
    }

    &.activity-base .group-content {
        padding: 26px 0 18px 0;
    }

    &.activity-rule .group-content {
        padding-top: 22px;

        .el-form-item {
            margin-bottom: 19px;
        }
    }

    &.activity-guide .group-content {
        padding: 24px 0;
    }
}

.org-select-form-item {
    :deep(.el-form-item__error) {
        padding-left: 24px;
    }
}

.org-select {
    display: flex;
    flex-direction: column;
}

.org-radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}

.org-select-btn {
    padding-left: 24px;
    display: flex;
    align-items: center;
    color: #1456F0;
}
</style>
