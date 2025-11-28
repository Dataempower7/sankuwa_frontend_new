<template>
    <div class="container">
        <div class="content_wrapper">
            <el-form v-if="!loading" ref="formRef" :model="formState" label-width="auto">
                <el-form-item :rules="[{ required: true, message: '模板名称不能为空!' }]" label="模板名称" prop="templateName">
                    <TigInput width="300px" v-model="formState.templateName" placeholder="请输入模板名称，最多20个字"
                        :maxlength="20" showWordLimit />
                </el-form-item>
                <el-form-item label="预约时间" prop="reservationType"
                    :rules="[{ required: formState.reservationType == 1 ? true : false, validator: validateReservationTime }]">
                    <div class="ml10">
                        <div>
                            <el-radio-group v-model="formState.reservationType">
                                <el-radio :value="0">无需提前</el-radio>
                            </el-radio-group>
                        </div>
                        <div class="flex flex-align-center">
                            <el-radio-group v-model="formState.reservationType">
                                <el-radio :value="1">需提前</el-radio>
                            </el-radio-group>
                            <div class="flex flex-align-center ml10">
                                <TigInput width="160px" v-model="formState.advanceNumber" type="integer"
                                    :disabled="formState.reservationType != 1">
                                    <template #append>
                                        <el-select v-model="formState.advanceUnit" style="width: 80px"
                                            :disabled="formState.reservationType != 1">
                                            <el-option label="天" value="d" />
                                            <el-option label="小时" value="h" />
                                        </el-select>
                                    </template>
                                </TigInput>
                                <p class="ml10">预约</p>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="最长预约" prop="maxDays" :rules="[{ required: true, validator: validateValue }]">
                    <div>
                        <div class="flex flex-align-center ml10">
                            <p class="mr10">最长允许预约</p>
                            <TigInput width="160px" v-model="formState.maxDays" type="integer" :maxNum="30">
                                <template #append> 天 </template>
                            </TigInput>
                            <p class="ml10">内的订单</p>
                        </div>
                        <div class="extra ml10">如：最长预约7天内订单，则买家最早可以选择当天+未来6天内的预约时间</div>
                    </div>
                </el-form-item>
                <el-form-item v-show="!props.isDialog" :wrapper-col="{ offset: 4, span: 16 }">
                    <el-button ref="submitBtn" class="form-submit-btn" type="primary" @click="onSubmit">提交</el-button>
                </el-form-item>
            </el-form>
            <a-spin :spinning="loading" style="width: 100%; margin-top: 100px" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { ReservationTplFilterState } from "@/types/setting/appointmentTpl.d";
import { getReservationTpl, updateReservationTpl } from "@/api/setting/appointmentTpl";
// 父组件回调
const emit = defineEmits(["submitCallback", "update:confirmLoading", "close"]);
const props = defineProps({
    id: {
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
const operation = action.value === "add" ? "create" : "update";
const formRef = shallowRef();
const formState = ref<ReservationTplFilterState>({
    templateName: "",
    reservationType: 0,
    advanceNumber: 0,
    advanceUnit: "d",
    maxDays: 0
});
const fetchShippingTpl = async () => {
    try {
        const result = await getReservationTpl(action.value, { id: id.value });
        Object.assign(formState.value, result);
    } catch (error: any) {
        message.error(error.message);
        emit("close");
    } finally {
        loading.value = false;
    }
};


const validateReservationTime = (rule: any, value: any, callback: any) => {

    let advanceNumber = Number(formState.value.advanceNumber);
    let maxDays: number = Number(formState.value.maxDays);
    if (formState.value.advanceUnit == 'h') {
        maxDays = formState.value.maxDays ? Number(formState.value.maxDays) * 24 : 0;
    }
    //比较advanceNumber和maxDays，校验信息反馈
    if (formState.value.reservationType == 1 && !Number(formState.value.advanceNumber)) {
        callback(new Error("提前预约天数不能为空或为0!"));
    } else if (advanceNumber && maxDays && advanceNumber >= maxDays) {
        callback(new Error("提前预约时间需小于最长预约时间!"));
    } else {
        callback();
    }


};

const validateValue = (rule: any, value: any, callback: any) => {
    //有advanceUnit为h的情况，advanceNumber*24，将天转换成小时来比较
    let advanceNumber = formState.value.advanceNumber;
    let maxDays = formState.value.maxDays;
    if (formState.value.advanceUnit == 'd') {
        advanceNumber = formState.value.advanceNumber ? Number(formState.value.advanceNumber) * 24 : '';
    }
    maxDays = formState.value.maxDays ? Number(formState.value.maxDays) * 24 : '';
    console.log(!Number(formState.value.maxDays));

    //比较advanceNumber和maxDays，校验信息反馈
    if (formState.value.maxDays && !Number(formState.value.maxDays)) {
        callback(new Error("最长预约天数不能为空或为0!"));
    } else if (advanceNumber && maxDays && advanceNumber >= maxDays) {
        callback(new Error("最长预约时间需大于提前预约时间!"));
    } else if (formState.value.maxDays && Number(formState.value.maxDays) > 30) {
        callback(new Error("最长预约天数不能超过30天!"));
    } else {
        callback();
    }
};
// 表单通过验证后提交
const onSubmit = async () => {
    await formRef.value.validate();
    try {
        emit("update:confirmLoading", true);
        const result = await updateReservationTpl(operation, { reservationTplId: id.value, ...formState.value });
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
defineExpose({ onFormSubmit });


onMounted(async () => {
    if (action.value === "detail") {
        // 获取详情数据
        await fetchShippingTpl();
    } else {
        loading.value = false;
    }
});
watch(
    () => formState.value.reservationType,
    (val) => {
        if (val === 0) formState.value.advanceNumber = '';
    }
);
</script>
<style lang="less" scoped>
.content_wrapper {
    :deep(.el-select) {
        min-width: 50px !important;
    }
}
</style>
