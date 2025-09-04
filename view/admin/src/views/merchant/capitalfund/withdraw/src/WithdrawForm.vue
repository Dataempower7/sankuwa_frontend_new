<template>
    <div class="withdraw-form">
        <el-form v-if="!loading" ref="formRef" :model="formState" class="form-body" label-width="auto">
          <!-- <el-form-item :rules="[{ required: true, message: '请选择出款账户!' }]" label="出款账户：">
              <el-radio-group v-model="formState.type">
                  <el-radio :value="1">店铺余额</el-radio>
              </el-radio-group>
          </el-form-item> -->
          <el-form-item :rules="[{ required: true, message: '请选择提现账户!' }]" label="提现账户：" prop="merchantAccountId">
            <el-select v-model="formState.merchantAccountId" placeholder="请选择提现账户" style="width: 240px" clearable @change="handleChange">
                <el-option
                    v-for="item in cardList"
                    :key="item.accountId"
                    :label="`${item.accountNo}(${item.accountTypeText})`"
                    :value="item.accountId"
                />
            </el-select>
            <router-link :to="{ path: '/account/list' }">
                <el-button style="margin-left: 10px;" type="primary" link>去添加</el-button>
            </router-link>
          </el-form-item>
          <el-form-item label="提现金额：" :rules="moneyRules" prop="amount">
            <div>
                <div>
                    <TigInput
                        v-model="formState.amount"
                        width="240px"
                        placeholder="提现金额"
                        :disabled="accountData.shopMoney <= 0"
                        clearable
                        >
                        <template #prepend>¥</template>
                    </TigInput>
                    <el-button style="margin-left: 10px;" type="primary" link @click="formState.amount = accountData.shopMoney" :disabled="accountData.shopMoney <= 0">全部提现</el-button>
                </div>
                <div class="extra">余额 <span style="color: #333;">{{ priceFormat(accountData.shopMoney) }}</span>, 暂不可提现</div>
            </div>
          </el-form-item>
          <el-form-item label="备注：" prop="remark">
              <TigInput v-model="formState.remark" :rows="4" placeholder="输入提现用途(选填)" type="textarea" width="300px"/>
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
      </el-form>
    </div>
</template>

<script lang="ts" setup>
import '@/style/css/list.less'
import {onMounted, reactive, ref, computed, shallowRef} from 'vue';
import {message} from 'ant-design-vue'
import {useConfigStore} from "@/store/config";
import {getAccountList} from "@/api/merchant/capitalfund/account";
import {AccountFilterState,AccountFilterParams} from "@/types/merchant/capitalfund/account.d";
import {createWithdraw} from "@/api/merchant/capitalfund/withdraw";
import {WithdrawFormState, accountForm} from "@/types/merchant/capitalfund/withdraw.d";
import { priceFormat } from "@/utils/format";
import {getShopAccount} from "@/api/merchant/capitalfund/dashboard";
import {AccountFormState} from "@/types/merchant/capitalfund/dashboard.d";
const config:any = useConfigStore();
const loading = ref<boolean>(false);
const formRef = shallowRef();
const formState = ref<WithdrawFormState>({
    merchantAccountId: '',
    amount: '',
    remark: '',
});

const filterParams = reactive<AccountFilterParams>({   //初使化用于查询的参数
    page: 1,
    size: config.get('pageSize'),
    sortField: '',
    sortOrder: '',
});
const accountData = ref<AccountFormState>({
    shopMoney: 0
})
const cardList = ref<AccountFilterState[]>([])
const loadFilter = async () => {
    loading.value = true;
    try {
        const result1 = await getShopAccount();
        accountData.value = result1;
        const result = await getAccountList({...filterParams});
        cardList.value = result.records;
    } catch (error:any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    loadFilter();
});

const handleChange = (e:any) => {
    formState.value.accountData = cardList.value.find((card: any) => card.accountId === e) as accountForm;
}

const moneyRules = computed(()=>{
  return [
      { required: true, message: '请输入提现金额!', trigger: 'blur' }, // 必填验证
      {
          validator: (rule:any, value:any, callback:any) => {
            if(value > Number(accountData.value.shopMoney)){
                callback(new Error('提现金额不得大于可用余额'));
                return
            }
            if(value <= 0){
                callback(new Error('提现金额不得小于0'));
                return
            }
            callback();
          },
          trigger: 'blur' // 触发方式，可以是 blur、change等
      }
  ];
})
const onSubmit = async () => {
  await formRef.value.validate();
  try {
      const result = await createWithdraw({ ...formState.value });
      await formRef.value.resetFields();
      message.success("操作成功");
      formState.value.amount = '';
      formState.value.merchantAccountId = '';
      formState.value.accountData = {} as accountForm;
      loadFilter()
  } catch (error: any) {
      message.error(error.message);
  } finally {
  }
};
</script>
<style lang="less" scoped>
.withdraw-form{
    margin-top: 30px;
}
</style>