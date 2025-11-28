<template>
    <div class="container" style="position: relative; height: 100%">
        <div class="content_wrapper">
            <div class="" style="display: flex; flex-direction: column; width: 100%; height: 100%; position: absolute">
                <div class="list-table-tool lyecs-search-warp" style="flex: 0">
                    <el-form :model="filterParams" name="form">
                        <div class="advanced-search-warp list-table-tool-row">
                            <div class="simple-form-warp">
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <label class="control-label"><span>活动名称：</span></label>
                                        <div class="control-container">
                                            <TigInput v-model="filterParams.grouponName" name="grouponName"
                                                placeholder="输入活动名称" @keyup.enter="onSearchSubmit" clearable
                                                @clear="onSearchSubmit">
                                                <template #append>
                                                    <el-button @click="onSearchSubmit"><span
                                                            class="iconfont icon-chakan1"></span></el-button>
                                                </template>
                                            </TigInput>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <label class="control-label"><span>活动状态：</span></label>
                                        <div class="control-container">
                                            <el-select v-model="filterParams.status" placeholder="请选择活动状态"
                                                @change="onSearchSubmit">
                                                <el-option label="活动进行中" :value="1" />
                                                <!-- <el-option label="活动已结束" :value="2" /> -->
                                                <el-option label="活动未开始" :value="3" />
                                            </el-select>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-warp">
                                    <div class="simple-form-field">
                                        <label class="control-label"></label>
                                        <div class="control-container">
                                            <el-button type="primary" plain @click="onSearchSubmit">搜索</el-button>
                                            <el-button plain @click="resetParams">重置</el-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </el-form>
                </div>
                <perfect-scrollbar class="table-container" style="flex: 1">
                    <a-spin :spinning="loading">
                        <div style="padding-right: 15px; box-sizing: border-box">
                            <el-table ref="tableRef" class="result-table hide-checkbox" :data="filterState"
                                :loading="loading" :total="total" row-key="grouponPromotionId"
                                @selection-change="onSelectChange">
                                <el-table-column type="selection" width="32" />
                                <el-table-column label="活动名称" prop="name" :width="150"></el-table-column>
                                <el-table-column label="起始日期" prop="startTimeStr"> </el-table-column>
                                <el-table-column label="截止日期" prop="endTimeStr"> </el-table-column>
                                <el-table-column label="拼团类型">
                                    <template #default="{ row }">
                                        {{ row.groupType == 1 ? "普通团" : row.groupType == 2 ? "阶梯团" : "--" }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="状态" prop="statusName"></el-table-column>
                                <template #empty>
                                    <div class="empty-warp">
                                        <div v-if="!loading" class="empty-bg">暂无数据</div>
                                    </div>
                                </template>
                            </el-table>
                        </div>
                    </a-spin>
                </perfect-scrollbar>
                <div v-if="total > 0" class="pagination-con" style="flex-shrink: 0">
                    <Pagination v-model:page="filterParams.page" v-model:size="filterParams.size" :total="total"
                        @callback="loadFilter" layout="slot ,prev, pager, next" :background="false" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import "@/style/css/list.less";
import { onMounted, reactive, ref, useTemplateRef, nextTick, type PropType } from "vue";
import { message } from "ant-design-vue";
import { Pagination } from "@/components/list";
import { useConfigStore } from "@/store/config";
import { GrouponFilterParams, GrouponFilterState } from "@/types/promotion/groupon";
import { getGrouponList } from "@/api/promotion/groupon";
import { TableInstance } from "element-plus";

const props = defineProps({
    selectedItems: {
        type: Array as PropType<Array<GrouponFilterState>>, default: []
    },
    groupType: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(["submitCallback"]);
const selectedItems = ref<GrouponFilterState[]>([]);
const loading = ref(true); //列表加载中
const total = ref<number>(0);
const config = useConfigStore();
const filterState = ref<GrouponFilterState[]>([]);
const filterParams = reactive<GrouponFilterParams>({
    page: 1,
    size: (config as any).get("pageSize"),
    sortField: "",
    sortOrder: "",
    keyword: "",
    groupType: props.groupType,
    status: 1
});

const tableRef = useTemplateRef<TableInstance>("tableRef");

const setTabelDefaultSelect = () => {
    nextTick(() => {
        if (props.selectedItems.length > 0 && tableRef.value) {
            // 清除当前页的所有选中状态
            tableRef.value.clearSelection();
            // 遍历表格数据，根据 props.selectedItems 设置选中状态
            filterState.value.forEach(row => {
                const isSelected = props.selectedItems.some(
                    item => item.grouponPromotionId === row.grouponPromotionId
                );
                if (isSelected) {
                    tableRef.value?.toggleRowSelection(row, true);
                }
            });
        }
    });
}

// 获取列表的查询结果
const loadFilter = async () => {
    loading.value = true;
    try {
        const result = await getGrouponList({ ...filterParams });
        filterState.value = result.records;
        total.value = result.total;
        // 数据加载完成后，设置选中状态
        setTabelDefaultSelect();
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    loadFilter();
});
// 参数查询
const onSearchSubmit = () => {
    loadFilter();
};
const resetParams = () => {
    filterParams.grouponName = "";
    filterParams.status = 1;
    loadFilter();
};

const onSelectChange = (e: GrouponFilterState[]) => {
    if (e.length > 1) {
        let delRow = e.shift();
        tableRef?.value?.toggleRowSelection(delRow, false);
        selectedItems.value = e;
    } else {
        selectedItems.value = e;
    }
};

// 弹窗回调
const onFormSubmit = () => {
    emit("submitCallback", selectedItems.value);
};

defineExpose({
    onFormSubmit
});
</script>
<style lang="less" scoped>
.pagination-con {
    background: #fff;
}

:deep .hide-checkbox .el-table__header-wrapper .el-table__header .el-checkbox {
    display: none;
}
</style>
