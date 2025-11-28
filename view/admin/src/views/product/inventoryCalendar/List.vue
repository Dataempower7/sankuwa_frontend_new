<template>
    <div class="container">
        <div class="content_wrapper">
            <div class="lyecs-table-list-warp">
                <div class="list-table-tool lyecs-search-warp">
                    <el-form :model="filterParams" @submit.native.prevent="loadFilter">
                        <div class="list-table-tool-row">
                            <div class="simple-form-warp">
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <label class="control-label"><span>商品名称：</span></label>
                                        <div class="control-container">
                                            <TigInput v-model="filterParams.productName" name="productName"
                                                placeholder="输入商品名称" @keyup.enter="loadFilter" clearable
                                                @clear="loadFilter">
                                                <template #append>
                                                    <el-button @click="loadFilter"><span
                                                            class="iconfont icon-chakan1"></span></el-button>
                                                </template>
                                            </TigInput>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <label class="control-label" style="width: 100px"><span>库存查看范围：</span></label>
                                        <div class="control-container">
                                            <el-select v-model="filterParams.shopScopeType" @change="storeChange">
                                                <el-option label="全部门店" :value="0" />
                                                <el-option label="指定门店" :value="1" />
                                            </el-select>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div class=" filter-item">
                                <div class="simple-form-field">
                                    <div class="form-group total-group">
                                        <div class="total">
                                            共{{ total }}条<span v-show="selectedGoods.length">,已选择{{ selectedGoods.length
                                            }}条</span>
                                        </div>
                                        <div class="value">
                                            <el-space>
                                                <DialogForm :params="{}"
                                                    path="product/inventoryCalendar/BatchSetInventory" title="批量设置库存"
                                                    :maskClose="false" :showFooter="true" width="600px"
                                                    @okCallback="loadFilter">
                                                    <el-button type="primary"
                                                        v-if="getAdminType() === 'admin'">统一设置库存</el-button>
                                                </DialogForm>

                                                <DialogForm
                                                    :params="{ productInfo: selectedGoods[0]?.productInfo ?? null, shopInfo: selectedGoods[0]?.shopInfo }"
                                                    path="product/inventoryCalendar/ModifyInventory" title="单个设置库存"
                                                    :maskClose="false" :showFooter="true" width="600px"
                                                    @okCallback="loadFilter">
                                                    <el-button :disabled="!selectedGoods.length"
                                                        @click="checkSelection">按时段设置库存</el-button>
                                                </DialogForm>
                                            </el-space>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-field ">
                                    <el-space>
                                        <el-select v-model="filterParams.timeType" style="width: 90px"
                                            @change="changeTimeType">
                                            <el-option label="按周" value="week" />
                                            <el-option label="按月" value="month" />
                                        </el-select>
                                        <el-button :disabled="isPrevButtonDisabled" @click="changePeriod('prev')">上一{{
                                            filterParams.timeType ==
                                                "week" ? "周" : "月" }}</el-button>
                                        <div class="time-box" v-if="filterParams.timeType == 'week'">
                                            <el-date-picker style="width: 160px" value-format="YYYY-MM-DD"
                                                v-model="filterParams.startDate" type="date"
                                                :disabled-date="disabledWeekDate" @change="changeDatePeriod()" />
                                            <p>~</p>
                                            <el-date-picker disabled style="width: 160px" value-format="YYYY-MM-DD"
                                                v-model="filterParams.endDate" type="date" />
                                        </div>
                                        <div class="time-box" v-if="filterParams.timeType == 'month'">
                                            <el-date-picker style="width: 160px" value-format="YYYY-MM"
                                                v-model="filterParams.startDate" type="month"
                                                :disabled-date="disabledMonthDate" />
                                        </div>
                                        <el-button @click="changePeriod('next')">下一{{ filterParams.timeType ==
                                            "week" ? "周"
                                            : "月"
                                        }}</el-button>
                                    </el-space>
                                </div>
                            </div>
                        </div>
                    </el-form>
                </div>
                <div>
                    <a-spin :spinning="loading">
                        <el-table :data="filterState" @select="selectRow" ref="tableRef" :highlight-current-row="false"
                            :cell-class-name="getCellClassName" border>
                            <el-table-column type="selection" width="35" align="center" class="check-head">
                            </el-table-column>
                            <el-table-column label="商品信息" align="center">
                                <template #default="{ row }">
                                    <div class="product-info">
                                        <Image :src="row.productInfo.productImage" fit="contain" width="40"
                                            height="40" />
                                        <span>{{ row.productInfo?.productName }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="门店" align="center">
                                <template #default="{ row }">
                                    <span>{{ row.shopInfo?.shopName }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-for="(day, index) in dayList" :key="day" align="center">
                                <template #header>
                                    <div class="day">
                                        <div v-if="filterParams.timeType == 'week'" class="week">{{ mapLabel(day) }}
                                        </div>
                                        <div class="date">{{ formatDay(day) }}</div>
                                    </div>
                                </template>
                                <template #default="{ row }">
                                    <template v-if="!getDayData(row, day)?.totalStock">
                                        <DialogForm
                                            :params="{ type: 'set', stockDate: day, shopId: row.shopInfo?.shopId, productId: row.productInfo?.productId }"
                                            path="product/inventoryCalendar/SetInventory" title="设置库存"
                                            :maskClose="false" :showFooter="true" width="600px"
                                            @okCallback="loadFilter">
                                            <el-button
                                                :type="buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] ? 'primary' : 'info'"
                                                :disabled="!buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`]"
                                                @mouseenter="buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] = true"
                                                @mouseleave="buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] = false"
                                                link
                                                :icon="buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] ? Setting : ''">
                                                <span>{{
                                                    buttonHoverStates[`set-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`]
                                                        ? "设置库存" : "未设置"
                                                }}</span>
                                            </el-button>
                                        </DialogForm>
                                    </template>
                                    <template v-else>
                                        <div>
                                            <p>可预约数：{{ getDayData(row, day)?.availableStock }}</p>
                                            <DialogForm
                                                :params="{ type: 'edit', stockDate: day, shopId: row.shopInfo?.shopId, productId: row.productInfo?.productId }"
                                                path="product/inventoryCalendar/SetInventory" title="修改库存"
                                                :maskClose="false" :showFooter="true" width="40%"
                                                @okCallback="loadFilter">
                                                <el-button :type="buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] ? 'primary' : 'info'
                                                    "
                                                    :disabled="!buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`]"
                                                    @mouseenter="buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] = true"
                                                    @mouseleave="buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] = false"
                                                    :icon="buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`] ? Edit : ''"
                                                    link>
                                                    <span>
                                                        {{
                                                            buttonHoverStates[`edit-${row.productInfo?.productId}-${row.shopInfo?.shopId}-${day}`]
                                                                ? "修改库存"
                                                                : `已预约数：${getDayData(row, day)?.usedStock ?? 0}`
                                                        }}
                                                    </span>
                                                </el-button>
                                            </DialogForm>
                                        </div>
                                    </template>
                                </template>
                            </el-table-column>
                        </el-table>
                    </a-spin>
                    <div v-if="total > 0" class="pagination-con">
                        <Pagination v-model:page="filterParams.page" v-model:size="filterParams.size" :total="total"
                            @callback="loadFilter" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Edit, Setting } from "@element-plus/icons-vue";
import "@/style/css/list.less";
import { imageFormat } from "@/utils/format";
import { Image } from "@/components/image";
import { Pagination } from "@/components/list";
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { DialogForm } from "@/components/dialog";
import { PopForm } from "@/components/pop-form";
import { useConfigStore } from "@/store/config";
import { isOverseas, isMerchant } from "@/utils/version";
import { getAdminType } from "@/utils/storage";
import { isStore } from "@/utils/version";
import { getDays } from "@/utils/util";
import { formattedDate } from "@/utils/time";
import { getInventoryCalendarList } from "@/api/product/inventoryCalendar";
import { InventoryCalendarFilterParams, InventoryCalendarFilterDateStock } from "@/types/product/inventoryCalendar";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
const { productName } = useRouter().currentRoute.value.query;
const config: any = useConfigStore();
const loading = ref<boolean>(true);
const total = ref<number>(0);
const selectedIds = ref<any>([]);
const selectedGoods = ref<any>([]);
const tableRef = ref();
// 为每个按钮单独管理 hover 状态
const buttonHoverStates = ref<Record<string, boolean>>({});
const dayList = ref<string[]>([]);
const filterParams = ref<InventoryCalendarFilterParams>({
    page: 1,
    size: 10,
    shopScopeType: 0,
    shopIds: "",
    productName: "",
    timeType: "week", // week,month
    startDate: formattedDate(new Date(), "YYYY-MM-DD"),
    endDate: formattedDate(getDays(6, "add"), "YYYY-MM-DD")
});
const filterState = ref([]);
const settingDialog = ref({
    visible: false,
    title: "设置库存",
    type: "set"
});

// 判断上一周期按钮是否禁用
const isPrevButtonDisabled = computed(() => {
    if (filterParams.value.timeType === "week") {
        // 按周显示时，如果开始时间是今天，则禁用上一周按钮
        const today = formattedDate(new Date(), "YYYY-MM-DD");
        return filterParams.value.startDate === today;
    } else {
        // 按月显示时，如果开始时间是当月，则禁用上一月按钮
        const currentMonth = formattedDate(new Date(), "YYYY-MM");
        return filterParams.value.startDate === currentMonth;
    }
});

// 处理周期变更（上一周期/下一周期）
const changePeriod = (direction: "prev" | "next") => {
    if (filterParams.value.timeType === "week") {
        // 周模式处理
        const startDate = dayjs(filterParams.value.startDate);
        const offset = direction === "prev" ? -7 : 7;
        const newStartDate = startDate.add(offset, "day");
        filterParams.value.startDate = newStartDate.format("YYYY-MM-DD");
        filterParams.value.endDate = newStartDate.add(6, "day").format("YYYY-MM-DD");
    } else {
        // 月模式处理
        const startDate = dayjs(filterParams.value.startDate);
        const offset = direction === "prev" ? -1 : 1;
        const newStartDate = startDate.add(offset, "month");
        filterParams.value.startDate = newStartDate.format("YYYY-MM");
    }
    loadFilter();
};
// 禁用本周之前的日期
const disabledWeekDate = (date: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
};

// 禁用本月之前的月份
const disabledMonthDate = (date: any) => {
    const currentMonth = new Date();
    currentMonth.setDate(1); // 设置为当月第一天
    currentMonth.setHours(0, 0, 0, 0);
    return date.getTime() < currentMonth.getTime();
};

const changeTimeType = () => {
    if (filterParams.value.timeType == "week") {
        filterParams.value.startDate = formattedDate(new Date(), "YYYY-MM-DD");
        filterParams.value.endDate = formattedDate(getDays(6, "add"), "YYYY-MM-DD");
    } else {
        filterParams.value.startDate = formattedDate(new Date(), "YYYY-MM");
    }
    loadFilter();
};
//时间选择器时间发生变化时，重新加载数据
const changeDatePeriod = () => {
    if (filterParams.value.timeType == "week" && filterParams.value.startDate) {
        filterParams.value.endDate = dayjs(filterParams.value.startDate).add(6, "day").format("YYYY-MM-DD");
        loadFilter();
    }

};

const changeSelectedId = (ids: any) => {
    selectedIds.value = ids;
    filterParams.value.shopIds = ids.map((i: any) => i.shopId).join(",");
    loadFilter();
};
//切换门店类型
const storeChange = () => {
    if (filterParams.value.shopScopeType === 0) {
        filterParams.value.shopIds = "";
        selectedIds.value = [];
    }
    loadFilter();
};
const loadFilter = async () => {
    loading.value = true;
    try {
        const result = await getInventoryCalendarList({ ...filterParams.value });
        // 规范化每行数据，构建按日期快速索引的映射
        const normalizedRecords = result.records.map((record: any) => {
            const dayMap: any = {};
            record.dateStockList?.forEach((item: InventoryCalendarFilterDateStock) => {
                dayMap[item.stockDate] = item;
            });
            return { ...record, _dayMap: dayMap };
        });
        filterState.value = normalizedRecords;

        dayList.value = normalizedRecords[0]?.dateStockList.map((i: InventoryCalendarFilterDateStock) => i.stockDate);

        total.value = result.total;
        selectedGoods.value = [];
    } catch (error: any) {
        message.error(error.message);
    } finally {
        loading.value = false;
    }
};

// 取某一行在指定日期的库存数据
const getDayData = (row: any, day: string) => {
    return row?._dayMap?.[day];
};

// 根据索引返回周几（表头插槽用）
const mapLabel = (day: string) => {
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return weekDays[dayjs(day).day()];
};

// 表头显示MM-DD
const formatDay = (day: string) => {
    return dayjs(day).format("MM-DD");
};

// const onSelectChange = (selected: any) => {
//     selectedGoods.value = selected;
// };

const selectRow = (selection: any, val: any) => {
    tableRef.value.clearSelection();
    if (selection.length == 0) {
        selectedGoods.value = []; // 清空data中绑定的selectedRow
        return;
    }
    tableRef.value.toggleRowSelection(val, true);
    selectedGoods.value.length = 0;
    selectedGoods.value.push(val);
};

const isSelectable = (row: any, index: number) => {
    // 排除重复项
};

const checkSelection = () => {
    if (!selectedGoods.value || selectedGoods.value.length === 0) {
        message.error("请至少选择一项商品");
        return false;
    }
    return true;
};

// 针对动态渲染的日期列应用hover效果
const getCellClassName = ({ row, column, rowIndex, columnIndex }: any): string => {
    if (columnIndex >= 3) {
        return "day-cell";
    }
    return "";
};
onMounted(() => {

    if (productName) {
        filterParams.value.productName = productName as string;
    }
    loadFilter();
});

</script>
<style scoped lang="less">
.filter-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .total-group {
        display: flex;
        align-items: center;
        gap: 15px;
        color: #9598a6;
    }

    .time-box {
        display: flex;
        align-items: center;

        p {
            margin: 0 5px;
        }
    }
}


.search-item {
    justify-content: start;
}

.content_wrapper {
    :deep(.el-select) {
        min-width: 50px !important;
    }
}

.day {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 16px;
}

.product-info {
    display: flex;
    align-items: center;

    span {
        margin-left: 15px;
    }
}

//隐藏表头复选框
:deep(.el-table__header-wrapper) {
    .el-table-column--selection>.cell {
        display: none;
    }
}

// 动态列的单元格hover高亮效果
:deep(.day-cell) {
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
        border: 2px solid transparent;
        border-radius: 4px;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1;
        pointer-events: none;
    }

    &:hover {
        background-color: #f0f9ff !important;
        z-index: 10;

        &::after {
            opacity: 1;
            border-color: #409eff;
        }
    }
}
</style>
