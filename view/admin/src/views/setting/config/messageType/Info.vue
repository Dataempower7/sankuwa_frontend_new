<template>
    <div class="container">
        <div class="content_wrapper">
            <div class="lyecs-form-table">
                <el-tabs v-model="activeKey" class="lyecs-tabs" tab-position="top" @tab-change="onTabChange">
                    <template v-for="item in tabs">
                        <el-tab-pane v-if="(formState as any)[item.prop] > -1" :label="item.label" :name="item.label"></el-tab-pane>
                    </template>
                </el-tabs>
                <el-form v-if="!loading" ref="formRef" :model="formState" label-width="auto">
                    <div v-if="activeKey === '站内信'">
                        <el-form-item label="通知标题" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.messageData.templateName" />
                        </el-form-item>
                        <el-form-item label="通知内容" prop="content">
                            <div class="tznr">
                                <TigInput
                                    classType="tig-form-input"
                                    v-model="formState.templateMessage.messageData.content"
                                    :autosize="{ minRows: 9, maxRows: 60 }"
                                    class="fl1"
                                    type="textarea"
                                />
                                <div class="fl1 right-div" v-if="messageId !== 2">
                                    <p>请输入模板消息详细内容对应的变量，关键字个数需与添加的模板一致。可以使用如下变量：</p>
                                    <template v-if="messageId == 3">
                                        <p>{orderSn}订单编号</p>
                                        <p>{logisticsName}物流公司</p>
                                        <p>{trackingNo}物流单号</p>
                                    </template>
                                    <template v-else>
                                        <p>{orderSn}订单编号</p>
                                    </template>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isMessage">
                            <el-radio-group v-model="formState.isMessage">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '短信通知'">
                        <el-form-item label="短信模板ID" prop="templateId">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.msgData.templateId" />
                        </el-form-item>
                        <el-form-item label="通知内容" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.msgData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                class="fl1"
                                disabled
                                type="textarea"
                            />
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isMsg">
                            <el-radio-group v-model="formState.isMsg">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '微信模板消息'">
                        <el-form-item label="通知标题" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.wechatData.templateName" disabled />
                        </el-form-item>
                        <el-form-item label="模板ID" prop="templateId">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.wechatData.templateId" disabled />
                        </el-form-item>
                        <el-form-item label="模板" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.wechatData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                class="fl1"
                                disabled
                                type="textarea"
                            />
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isWechat">
                            <el-radio-group v-model="formState.isWechat">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '小程序订阅消息'">
                        <el-form-item label="通知标题" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.miniProgramData.templateName" disabled />
                        </el-form-item>
                        <el-form-item label="模板ID" prop="templateId">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.miniProgramData.templateId" disabled />
                        </el-form-item>
                        <el-form-item label="模板" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.miniProgramData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                class="fl1"
                                disabled
                                type="textarea"
                            />
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isMiniProgram">
                            <el-radio-group v-model="formState.isMiniProgram">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === 'APP'">
                        <el-form-item label="通知标题" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.appData.templateName" />
                        </el-form-item>
                        <el-form-item label="通知内容" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.appData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                class="fl1"
                                type="textarea"
                            />
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isApp">
                            <el-radio-group v-model="formState.isApp">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '邮件'">
                        <el-form-item label="通知标题" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.emailData.templateName" />
                        </el-form-item>
                        <!-- <el-form-item label="模板" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.emailData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                class="fl1"
                                disabled
                                type="textarea"
                            />
                        </el-form-item> -->
                        <el-form-item label="模板" prop="content">
                            <div class="tznr">
                                <TigInput
                                    classType="tig-form-input"
                                    v-model="formState.templateMessage.emailData.content"
                                    :autosize="{ minRows: 9, maxRows: 60 }"
                                    class="fl1"
                                    type="textarea"
                                />
                                <div class="fl1 right-div">
                                    <p>请输入模板消息详细内容对应的变量，关键字个数需与添加的模板一致。可以使用如下变量：</p>
                                    <template v-if="messageId == 11">
                                        <p>{merchantName}商家名称</p>
                                        <p>{shopName}店铺名称</p>
                                    </template>
                                    <template v-if="messageId == 10">
                                        <p>{merchantName}平台名称</p>
                                        <p>{username}账号</p>
                                        <p>{password}初始密码</p>
                                    </template>
                                    <template v-if="messageId == 9">
                                        <p>{userNickName}用户名</p>
                                        <p>{submitTime}提交时间</p>
                                    </template>
                                    <template v-if="messageId == 8">
                                        <p>{code}验证码</p>
                                    </template>
                                    <template v-if="messageId == 4">
                                        <p>{shopTitle}店铺名称</p>
                                        <p>{userName}用户名称</p>
                                        <p>{afterSaleSn}订单售后编码</p>
                                        <p>{totalRefund}退款金额</p>
                                        <p>{refundTime}退款时间</p>
                                    </template>
                                    <template v-if="messageId == 3">
                                        <p>{shippingName}物流名称</p>
                                        <p>{code}物流编号</p>
                                    </template>
                                    <template v-if="messageId == 2">
                                        <p>{shopTitle}店铺名称</p>
                                        <p>{userName}用户名</p>
                                        <p>{productName}商品信息</p>
                                    </template>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isMail">
                            <el-radio-group v-model="formState.isMail">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '钉钉'">
                        <!-- <el-form-item label="选择钉钉成员" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.dingData.templateName" disabled />
                        </el-form-item> -->
                        <!-- <el-form-item label="通知内容" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.dingData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                disabled
                                class="fl1"
                                type="textarea"
                            />
                        </el-form-item> -->
                        <el-form-item label="通知内容" prop="content">
                            <div class="tznr">
                                <TigInput
                                    classType="tig-form-input"
                                    v-model="formState.templateMessage.dingData.content"
                                    :autosize="{ minRows: 9, maxRows: 60 }"
                                    class="fl1"
                                    type="textarea"
                                />
                                <div class="fl1 right-div">
                                    <p>请输入模板消息详细内容对应的变量，关键字个数需与添加的模板一致。可以使用如下变量：</p>
                                    <p>{order} 订单号</p>
                                    <p>{fee} 支付金额</p>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isDing">
                            <el-radio-group v-model="formState.isDing">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-if="activeKey === '企业微信'">
                        <!-- <el-form-item label="机器人地址" prop="templateName">
                            <TigInput classType="tig-form-input" v-model="formState.templateMessage.dingData.templateName" disabled />
                        </el-form-item>
                        <el-form-item label="通知内容" prop="content">
                            <TigInput
                                classType="tig-form-input"
                                v-model="formState.templateMessage.dingData.content"
                                :autosize="{ minRows: 9, maxRows: 60 }"
                                disabled
                                class="fl1"
                                type="textarea"
                            />
                        </el-form-item> -->
                        <el-form-item label="通知内容" prop="content">
                            <div class="tznr">
                                <TigInput
                                    classType="tig-form-input"
                                    v-model="formState.templateMessage.wxWorkData.content"
                                    :autosize="{ minRows: 9, maxRows: 60 }"
                                    class="fl1"
                                    type="textarea"
                                />
                                <div class="fl1 right-div">
                                    <p>请输入模板消息详细内容对应的变量，关键字个数需与添加的模板一致。可以使用如下变量：</p>
                                    <p>{order} 订单号</p>
                                    <p>{fee} 支付金额</p>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="是否开启" prop="isWxWork">
                            <el-radio-group v-model="formState.isWxWork">
                                <el-radio :value="1">是</el-radio>
                                <el-radio :value="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <el-form-item v-show="!props.isDialog" :wrapper-col="{ offset: 4, span: 16 }">
                        <el-button ref="submitBtn" class="form-submit-btn" type="primary" @click="onSubmit">提交</el-button>
                    </el-form-item>
                </el-form>
                <a-spin :spinning="loading" style="width: 100%; margin-top: 100px" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import type { MessageTypeFormState } from "@/types/setting/messageType.d";
import { getMessageType, updateMessageType } from "@/api/setting/messageType";
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
const messageId = ref<number>(props.id);
const formState = ref<MessageTypeFormState>({
    templateMessage: {
        wechatData: {},
        appData: {},
        messageData: {},
        miniProgramData: {},
        msgData: {},
        emailData: {}, //邮件
        dingData: {}, // 钉钉
        wxWorkData: {} // 企业微信
    }
});
const activeKey = ref<string>("站内信");
const onTabChange = (val: number) => {
    console.log(val);
};
let tabs = ref([
    { prop: "isMessage", label: "站内信" },
    { prop: "isMsg", label: "短信通知" },
    { prop: "isWechat", label: "微信模板消息" },
    { prop: "isMiniProgram", label: "小程序订阅消息" },
    { prop: "isMail", label: "邮件" },
    { prop: "isDing", label: "钉钉" },
    { prop: "isWxWork", label: "企业微信" }
]);
const fetchMessageType = async () => {
    try {
        const result = await getMessageType(action.value, { id: id.value });
        Object.assign(formState.value, result);
        for (const item of tabs.value) {
            const propValue = (formState.value as any)[item.prop];
            if (typeof propValue === "number" && propValue > -1) {
                activeKey.value = item.label;
                break;
            }
        }
    } catch (error: any) {
        message.error(error.message);
        emit("close");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (action.value === "detail") {
        // 获取详情数据
        fetchMessageType();
    } else {
        loading.value = false;
    }
});

// 表单通过验证后提交
const onSubmit = async () => {
    await formRef.value.validate();
    try {
        emit("update:confirmLoading", true);
        const result = await updateMessageType(operation, { id: id.value, ...formState.value });
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
</script>
<style lang="less" scoped>
.tznr {
    display: flex;
    flex-direction: row;

    width: 100%;

    .fl1 {
        flex: 1;
    }

    .right-div {
        margin-left: 20px;
        background-color: #f2f2f2;
        padding: 10px;
        border-radius: 3px;
        color: #999999;
        line-height: 2;
    }
}
</style>
