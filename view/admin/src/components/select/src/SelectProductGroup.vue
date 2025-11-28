<template>
    <el-select
        v-model="productGroupId"
        :allowClear="true"
        :fieldNames="fieldNames"
        :filter-option="filterOption"
        clearable
        filterable
        placeholder="选择商品分组"
        popper-class="brand-select"
        show-search
        @change="onChange"
        @visible-change="loadProductGroupClientList"
    >
        <template #default>
            <div class="option">
                <div class="right">
                    <div class="scroll-container">
                        <el-option v-for="item in options" :key="item.productGroupId" :label="item.productGroupName" :value="item.productGroupId">
                            {{ item.productGroupName }}
                        </el-option>
                    </div>
                </div>
            </div>
        </template>
        <template #empty>
            <a-spin :spinning="!loaded" size="small" style="width: 100%; padding-top: 150px" />
        </template>
    </el-select>
</template>
<script lang="ts" setup>
import { onMounted, ref, defineModel } from "vue";
import { message } from "ant-design-vue";
import { getProductGroupClientList } from "@/api/product/productGroup";
import { ProductGroupFilterState } from "@/types/product/productGroup";

const emit = defineEmits(["update:productGroupId", "update:productGroupIds", "update:productGroupForm", "onChange"]);
const productGroupId = defineModel<number | string | number[]>("productGroupId");
const brandForm = defineModel<any>("productGroupForm");
const fieldNames = { label: "productGroupName", value: "productGroupId" };
const filterOption = (input: string, option: any) => {
    return option.brandName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const onChange = (e: any) => {
    options.value.map((subArray: any) => {
        if (subArray.brandId == e) {
            brandForm.value = subArray;
        }
    });
    emit("update:productGroupIds", e);
    emit("onChange", e);
};
onMounted(() => {
    loadProductGroupClientList();
});

const loaded = ref(false);

// 实际数据
const options = ref<ProductGroupFilterState[]>([]);
const allProductGroupList = ref<ProductGroupFilterState[]>([]);
const loadProductGroupClientList = async () => {
    try {
        const result = await getProductGroupClientList();
        options.value = result;
        allProductGroupList.value = result;
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loaded.value = true;
    }
};
</script>

<style lang="less" scoped>
.option {
    display: flex;
    overflow: hidden;
    /* 确保所有溢出都在子元素中处理 */
    max-height: 590px !important;
    height: 320px;

    .right {
        overflow: auto;
        flex: 1;
    }
}

</style>
