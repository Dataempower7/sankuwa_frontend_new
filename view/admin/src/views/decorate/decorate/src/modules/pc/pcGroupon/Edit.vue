<template>
    <perfect-scrollbar class="decorate-edit-con">
        <div class="dec-edit-title">
            <h3>拼团</h3>
        </div>
        <div class="dec-edit-group">
            <div class="dec-edit-group-title">
                <div class="label">拼团类型</div>
                <div class="value">{{ selectLabel.groupType[module.groupType || ""] }}</div>
            </div>
            <div class="dec-edit-group-con">
                <el-radio-group class="dec-radio-group" v-model="module.groupType">
                    <el-radio-button :value="1">普通拼团</el-radio-button>
                    <el-radio-button :value="2">阶梯拼团</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <div class="dec-edit-group">
            <DialogForm isDrawer @okCallback="handleGrouponActivitySeleted"
                :params="{ selectedItems: grouponActivityItems, groupType: module.groupType }" title="选择活动"
                width="600px" path="promotion/groupon/src/SelectActivity">
                <el-button type="primary">选择活动</el-button>
            </DialogForm>
        </div>
        <div class="dec-edit-group">
            <div class="groupon-activity-list">
                <div class="groupon-activity" v-for="(item, index) in grouponActivityItems">
                    {{ item.name }}
                    <div class="btn-close" @click="removeActivity(index)">
                        <el-icon>
                            <CircleCloseFilled />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>
    </perfect-scrollbar>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { DialogForm } from "@/components/dialog";
import { CircleCloseFilled } from "@element-plus/icons-vue";
import type { ModuleActivityType, ModuleType } from "@/types/decorate/decorate.d";
import type { GrouponFilterState } from "@/types/promotion/groupon";

const module = defineModel<ModuleType & ModuleActivityType>("module", { default: () => ({}) });
console.log(module.value)
const selectLabel = ref<any>({
    groupType: {
        1: "普通拼团",
        2: "阶梯拼团"
    }
});
const grouponActivityItems = ref<GrouponFilterState[]>([]);
const handleGrouponActivitySeleted = async (result: any) => {
    grouponActivityItems.value = result;
    module.value.grouponActivityItem = result.length ? grouponActivityItems.value[0] : null;
};
const removeActivity = (index: number) => {
    grouponActivityItems.value.splice(index, 1);
    module.value.grouponActivityItem = null;
};
onMounted(() => {
    if (module.value.grouponActivityItem) {
        grouponActivityItems.value.push(module.value.grouponActivityItem);
    }
});
</script>
<style lang="scss" scoped>
.groupon-activity-list {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    .groupon-activity {
        width: 100%;
        padding-left: 10px;
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        background-color: rgb(223 225 232 / 40%);
        border-radius: 2px;
        position: relative;

        .btn-close {
            position: absolute;
            right: 15px;
            top: 2px;
            cursor: pointer;
            color: #FB0606;
        }

        &:hover {
            background-color: rgb(223 225 232 / 60%);
        }
    }
}
</style>
