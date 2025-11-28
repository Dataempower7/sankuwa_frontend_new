<template>
    <div class="container">
        <div class="content_wrapper">
            <div class="lyecs-table-list-warp">
                <div class="tabs-box">
                    <el-tabs v-model="activeKey" tab-position="top" @tab-change="onTabChange">
                        <el-tab-pane :name="1" label="开团记录"></el-tab-pane>
                        <el-tab-pane :name="2" label="订单记录"></el-tab-pane>
                    </el-tabs>
                </div>
                <div v-if="activeKey === 1" class="list-table-tool lyecs-search-warp">
                    <el-form :model="filterParams" name="form">
                        <div class="advanced-search-warp list-table-tool-row">
                            <div class="simple-form-warp">
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <div class="control-container">
                                            <TigInput v-model="filterParams.productName" name="keyword"
                                                placeholder="输入商品名称" @keyup.enter="onSearchSubmit" clearable
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
                                        <label class="control-label"><span>开团状态：</span></label>
                                        <div class="control-container">
                                            <el-select placeholder="请选择活动状态" v-model="filterParams.joinStatus" clearable
                                                @clear="onSearchSubmit" @change="onSearchSubmit">
                                                <el-option label="待成团" :value="1" />
                                                <el-option label="拼团成功" :value="2" />
                                                <el-option label="拼团失败" :value="3" />
                                            </el-select>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-warp">
                                    <div class="simple-form-field">
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
                <div v-if="activeKey === 2" class="list-table-tool lyecs-search-warp">
                    <el-form :model="filterParams" name="form">
                        <div class="advanced-search-warp list-table-tool-row">
                            <div class="simple-form-warp">
                                <div class="simple-form-field">
                                    <div class="form-group">
                                        <div class="control-container">
                                            <TigInput v-model="filterParams.keyword" name="keyword" width="300px"
                                                placeholder="请输入商品名称/客户名称/订单编号" @keyup.enter="onSearchSubmit" clearable
                                                @clear="onSearchSubmit">
                                                <template #append>
                                                    <el-button @click="onSearchSubmit"><span
                                                            class="iconfont icon-chakan1"></span></el-button>
                                                </template>
                                            </TigInput>
                                        </div>
                                    </div>
                                </div>
                                <div class="simple-form-warp">
                                    <div class="simple-form-field">
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
                <div v-if="activeKey === 1" class="list-table-tool-row">
                    <div class="list-table-tool-col">
                        <el-space>
                            <el-button type="primary" @click="handleBatchGroup">批量成团</el-button>
                            <span v-if="selectedIds.length > 0">
                                已选择：<b>{{ selectedIds.length }}</b> 项
                            </span>
                        </el-space>
                    </div>
                </div>
                <div v-if="activeKey === 1" class="table-container">
                    <a-spin :spinning="loading">
                        <el-table :data="filterState" row-key="grouponPromotionRecordId"
                            @selection-change="onSelectChange" :total="total" @sort-change="onSortChange"
                            :loading="loading">
                            <el-table-column type="selection" width="32" :selectable="selectable" />
                            <el-table-column label="团ID" prop="grouponPromotionRecordId"
                                min-width="60"></el-table-column>
                            <el-table-column label="开团时间" prop="openGroupTime" width="180">
                                <template #default="{ row }">
                                    {{ formatTimestamp(row.openGroupTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="商品名称" prop="productName"></el-table-column>
                            <el-table-column label="拼团状态" align="center">
                                <template #default="{ row }">
                                    {{ getJoinStatusLabel(row.joinStatus) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="团长名称" prop="groupCaptainName" width="180"></el-table-column>
                            <el-table-column label="成团剩余时间" prop="joinExpirationTime" align="center">
                                <template #default="{ row }">
                                    <el-countdown v-if="!isGroupEnd(row)" title="" :format="getCountDownFormat(row)"
                                        :value="row.joinExpirationTime * 1000" :value-style="{ fontSize: '14px' }">
                                    </el-countdown>
                                    <div v-else>-</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="所需团员数量" prop="minGroupNum" align="center"></el-table-column>
                            <el-table-column :width="210" label="操作" fixed="right">
                                <template #default="{ row }">
                                    <el-space :size="0">
                                        <template v-if="row.joinStatus === 1">
                                            <a class="btn-link" @click="handleMannualGroup(row)">手动成团</a>
                                            <el-divider direction="vertical" />
                                        </template>
                                        <DialogForm isDrawer title="查看团员" width="800px" :show-on-ok="false"
                                            path="promotion/groupon/record/groupMemberList/List"
                                            :params="{ act: 'detail', id: row.grouponPromotionRecordId }">
                                            <a class="btn-link">查看团员</a>
                                        </DialogForm>
                                    </el-space>
                                </template>
                            </el-table-column>
                            <template #empty>
                                <div class="empty-warp">
                                    <div v-if="!loading" class="empty-bg">暂无数据</div>
                                </div>
                            </template>
                        </el-table>
                    </a-spin>
                    <div class="pagination-con" v-if="total > 0">
                        <Pagination v-model:page="filterParams.page" v-model:size="filterParams.size" :total="total"
                            @callback="loadFilter" />
                    </div>
                </div>
                <div v-if="activeKey === 2" class="table-container">
                    <a-spin :spinning="loading">
                        <el-table :data="filterState" @selection-change="onSelectChange" :total="total"
                            @sort-change="onSortChange" :loading="loading">
                            <el-table-column label="用户名称" prop="username">
                                <template #default="{ row }">
                                    <div class="display-col">
                                        <el-tooltip class="box-item" effect="light" :content="row.username"
                                            placement="bottom">
                                            <div class="text">
                                                {{ row.username }}
                                            </div>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="身份" prop="startTimeStr" align="center">
                                <template #default="{ row }">
                                    {{ row.joinType === 1 ? "团长" : "团员" }}
                                </template>
                            </el-table-column>
                            <el-table-column label="团长名称" prop="groupCaptainName"></el-table-column>
                            <el-table-column label="商品名称" prop="productName"></el-table-column>
                            <el-table-column label="订单编号" prop="orderSn" width="180"></el-table-column>
                            <el-table-column label="拼团时间" prop="addTime" width="160"></el-table-column>
                            <el-table-column label="拼团状态" prop="joinStatus" align="center">
                                <template #default="{ row }">
                                    {{ getJoinStatusLabel(row.joinStatus) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="订单状态" prop="orderStatus">
                                <template #default="{ row }">
                                    {{ getOrderStatusLabel(row.orderStatus) }}
                                </template>
                            </el-table-column>
                            <template #empty>
                                <div class="empty-warp">
                                    <div v-if="!loading" class="empty-bg">暂无数据</div>
                                </div>
                            </template>
                        </el-table>
                    </a-spin>
                    <div class="pagination-con" v-if="total > 0">
                        <Pagination v-model:page="filterParams.page" v-model:size="filterParams.size" :total="total"
                            @callback="loadFilter" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import "@/style/css/list.less";
import { DialogForm } from "@/components/dialog";
import { Pagination } from "@/components/list";
import {
    GrouponRecordOpenJoinFilterParams,
    GrouponRecordOpenJoinFilterState,
    GrouponRecordOrderFilterParams,
    GrouponRecordOrderFilterState
} from "@/types/promotion/groupon";
import { getGrouponRecordOpenJoinList, getGrouponRecordOrderList, manualGroup, batchGroup } from "@/api/promotion/groupon";
import { useConfigStore } from "@/store/config";
const config: any = useConfigStore();
import { useListRequest } from "@/hooks/useListRequest";
import { computed, ref } from "vue";
import { formatDuration, formatTimestamp } from "@/utils/time";
import { message, Modal } from "ant-design-vue";
import { format } from "path";
const activeKey = ref<1 | 2>(1);
const apiFunctions = {
    1: getGrouponRecordOpenJoinList, // 开团记录
    2: getGrouponRecordOrderList // 订单记录
};
const props = defineProps<{
    id: number;
}>()
const emit = defineEmits(["close"]);
const joinStatusList = ref([
    { label: "待成团", value: 1 },
    { label: "拼团成功", value: 2 },
    { label: "拼团失败", value: 3 }
]);
/**
 * 获取拼团状态标签
 * @param value 状态值
 * @returns 状态标签
 */
const getJoinStatusLabel = (value: number) => {
    const item = joinStatusList.value.find((item: any) => item.value === value);
    return item ? item.label : "-";
};
const orderStatusList = ref([
    { label: "待确定，待支付", value: 0 },
    { label: "已确定，待发货", value: 1 },
    { label: "处理中，已发货", value: 2 },
    { label: "已取消", value: 3 },
    { label: "无效", value: 4 },
    { label: "已完成", value: 5 }
])
/**
 * 获取订单状态标签
 * @param value 
 */
const getOrderStatusLabel = (value: number) => {
    const item = orderStatusList.value.find((item: any) => item.value === value);
    return item ? item.label : "-";
};
// 使用计算属性返回当前选中的API函数
const currentApiFunction = computed(() => apiFunctions[activeKey.value]);

// 控制选择项是否可以选择
const selectable = (row: GrouponRecordOpenJoinFilterState) => {
    return row.joinStatus === 1;
}
const {
    listData: filterState,
    loading,
    total,
    selectedIds,
    filterParams,
    loadData: loadFilter,
    onSearchSubmit,
    onSortChange,
    onSelectChange,
    onBatchAction,
    resetParams
} = useListRequest<GrouponRecordOpenJoinFilterState | GrouponRecordOrderFilterState, GrouponRecordOpenJoinFilterParams & GrouponRecordOrderFilterParams>({
    apiFunction: currentApiFunction,
    idKey: "grouponPromotionRecordId",
    defaultParams: {
        productName: "",
        keyword: "",
        page: 1,
        size: config.get("pageSize"),
        grouponPromotionId: props.id,
        joinStatus: undefined
    }
});

// 初始化加载
loadFilter();

const onTabChange = (val: 1 | 2) => {
    activeKey.value = val;
    resetParams();
    loadFilter();
};

/**
 * 判断是否已结束
 * @param row 当前行数据
 * @returns 是否已结束
 */
const isGroupEnd = (row: GrouponRecordOpenJoinFilterState) => {
    // if(row.joinStatus === 2||row.joinStatus === 3){
    //     return true;
    // }
    return row.joinExpirationTime * 1000 < Date.now();
};

/**
 * 获取倒计时格式
 * @param row 当前行数据
 * @returns 倒计时格式
 */
const getCountDownFormat = (row: GrouponRecordOpenJoinFilterState) => {
    // 判断时间差是否大于24小时
    if (row.joinExpirationTime * 1000 - Date.now() > 24 * 60 * 60 * 1000) {
        return 'DD[天] HH:mm:ss';
    }
    else {
        return 'HH:mm:ss';
    }
};

/**
 * 手动成团
 * @param row 当前行数据
 */
const handleMannualGroup = (row: GrouponRecordOpenJoinFilterState) => {
    console.log(row);
    Modal.confirm({
        title: "确定将当前团的拼团状态更改为手动成团吗？",
        onOk: async () => {
            try {
                await manualGroup(row.grouponPromotionRecordId);
                message.success("操作成功");
                loadFilter();
            } catch (error: any) {
                message.error(error.message);
            }
        }
    })
};

/**
 * 批量成团
 */
const handleBatchGroup = async () => {
    if (selectedIds.value.length === 0) {
        message.warning('请至少选择一项');
        return;
    }
    Modal.confirm({
        title: "确定将当前选中团的拼团状态更改为手动成团吗？",
        onOk: async () => {
            try {
                await batchGroup(selectedIds.value);
                message.success("操作成功");
                loadFilter();
            } catch (error: any) {
                message.error(error.message);
            }
        }
    })
}
// 表单提交
const onFormSubmit = () => {
    emit("close");
};

defineExpose({ onFormSubmit });
</script>
<style>
/*优惠券列表类型选择*/
.bonus-wrap .card-wrap {
    display: -ms-flexbox;
    display: flex;
    margin-bottom: 24px;
    -ms-flex-pack: start;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    z-index: -1;
}

.bonus-wrap .card-wrap__container {
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
}

.bonus-wrap .item-bg {
    position: relative;
    white-space: nowrap;
    padding: 20px 27px 17px;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    background: rgba(51, 136, 255, 0.07);
    margin-right: 15px;
    text-align: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: justify;
    justify-content: space-between;
    flex: 1;
}

.bonus-wrap .item-bg:last-child {
    margin-right: 0;
    /* 最后一个元素不需要右边距 */
}

.bonus-wrap .coupon-cards-item {
    flex: 1;
    min-width: 402px;
}

.bonus-wrap .coupon-cards-item .title {
    font-size: 16px;
    color: #333;
}

.bonus-wrap .coupon-cards-item .desc {
    padding-top: 10px;
    line-height: 18px;
    font-size: 12px;
    color: #666;
}

.bonus-wrap .coupon-cards-item button {
    margin-top: 15px;
    padding: 0 16px;
}

.bonus-wrap .subtitle {
    font-weight: 500;
    font-size: 14px;
    color: #323233;
    line-height: 20px;
    margin-bottom: 16px;
}

.bonus-wrap .item-bg2 {
    background: #fff;
    border: 1px solid #ebedf0;
    box-sizing: border-box;
}
</style>
