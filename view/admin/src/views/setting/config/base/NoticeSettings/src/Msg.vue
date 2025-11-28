<template>
    <div class="container">
        <a-spin :spinning="loading">
            <el-form ref="formRef" :model="formState" label-width="140px">
                <div class="content_wrapper">
                    <div class="title">短信通知设置</div>
                    <el-form-item label="服务商" required>
                        <div>
                            <el-radio-group v-model="value" class="itemWidth">
                                <el-radio :value="1">阿里云</el-radio>
                            </el-radio-group>
                        </div>
                    </el-form-item>
                    <el-form-item label="短信帐户用户名" prop="smsKeyId">
                        <div>
                            <TigInput classType="tig-form-input" v-model="formState.smsKeyId" />
                            <div class="extra">您所申请的短信服务用户名，不填则表示不开通</div>
                        </div>
                    </el-form-item>
                    <el-form-item label="短信帐户密码" prop="smsKeySecret">
                        <div>
                            <div class="flex flex-align-center" style="gap: 10px">
                                <div class="secret-txt line1" style="max-width: 380px">
                                    {{ formState.smsKeySecret }}
                                </div>
                                <DialogForm
                                    :maskClose="false"
                                    :isDrawer="false"
                                    :params="{ title: '短信帐户密码', content: formState.smsKeySecret }"
                                    path="setting/config/src/EditSecret"
                                    title="短信帐户密码"
                                    width="600px"
                                    @okCallback="formState.smsKeySecret = $event"
                                >
                                    <el-button style="margin-top: 3px" link type="primary"> 编辑 </el-button>
                                </DialogForm>
                            </div>
                            <div class="extra">您所申请的短信服务密码，编辑完成后，点击下方提交按钮确认修改，请确保填写正确的短信帐户密码</div>
                        </div>
                    </el-form-item>
                    <el-form-item label="短信签名" prop="smsSignName">
                        <div>
                            <TigInput classType="tig-form-input" v-model="formState.smsSignName" />
                            <div class="extra">阿里短信这里填短信签名，其它的根据具体短信接口填写</div>
                        </div>
                    </el-form-item>
                    <el-form-item label="商家短信号码" prop="smsShopMobile">
                        <div>
                            <TigInput classType="tig-form-input" type="integer" v-model="formState.smsShopMobile" />
                            <div class="extra">用于接收会员订单等信息</div>
                        </div>
                    </el-form-item>
                </div>
            </el-form>
            <div style="height: 20px"></div>
        </a-spin>
    </div>
    <div class="selected-action-warp selected-warp-left" :style="{ left: themeInfo.layout !== 'topMenu' ? '369px' : '270px' }">
        <div class="selected-action">
            <el-button :loading="confirmLoading" class="form-submit-btn" size="large" type="primary" @click="onSubmit">提 交</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import "@/style/css/list.less";
import { DialogForm } from "@/components/dialog";
import { onMounted, ref, shallowRef } from "vue";
import { message } from "ant-design-vue";
import { BaseNotice } from "@/types/setting/config";
import { getConfigNotify, saveConfigNotify } from "@/api/setting/config";
import { useRoute } from "vue-router";
import { convertNullsToEmptyStrings } from "@/utils/format";
import { useThemeStore } from "@/store/theme";
const { themeInfo } = useThemeStore();
const value = ref<number>(1);
const formRef = shallowRef();
// 基本参数定义
const confirmLoading = ref<boolean>(false);
const formState = ref<Partial<BaseNotice>>({
    smsKeyId: "",
    smsKeySecret: "",
    smsSignName: "",
    smsShopMobile: "",
});

// 加载列表
onMounted(async () => {
    await loadFilter();
});
const loading = ref<boolean>(true);
const loadFilter = async () => {
    try {
        const result = await getConfigNotify();
        Object.assign(formState.value, convertNullsToEmptyStrings(result));
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};
// 表单通过验证后提交
const onSubmit = async () => {
    confirmLoading.value = true;
    try {
        const result = await saveConfigNotify(formState.value);
        message.success("修改成功");
    } catch (error: any) {
        message.error(error.message);
    } finally {
        confirmLoading.value = false;
    }
};
</script>
<style lang="less" scoped>
.title {
    font-weight: bold;
    padding-bottom: 30px;
    font-size: 16px;
    line-height: 24px;
}
.subtitle {
    color: #999;
    font-weight: normal;
    font-size: 12px;
}

.mr8 {
    margin-right: 8px;
}

.width60 {
    width: 60px;
}

.ml8 {
    margin-left: 8px;
}

.itemWidth {
    width: 100%;
}
.error {
    color: red;
}

.notice-warp {
    background-color: #eef2ff;
    border-radius: 9px;
    padding: 15px;
    margin-bottom: 20px;
    line-height: 24px;
}
</style>
