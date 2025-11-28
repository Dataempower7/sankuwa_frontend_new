<template>
    <div class="table-container">
        <a-spin :spinning="loading">
            <el-table :data="filterState" row-key="buyerShowCommentId" tooltip-effect="dark myTooltips" :total="total" :loading="loading" @selection-change="onSelectChange">
                <el-table-column v-if="showSelection" type="selection" width="32" :selectable="isSelectable" />
                <el-table-column label="评论内容" prop="content" show-overflow-tooltip>
                    <template #default="{ row }">
                        <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">{{row.content}}</div>
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" prop="addTime"></el-table-column>
                <el-table-column label="发布人" prop="userName"></el-table-column>
                <el-table-column label="状态" prop="statusText"></el-table-column>
                <el-table-column label="操作" fixed="right" :width="240">
                    <template #default="{ row }">
                        <div class="flex">
                            <DialogForm
                                v-if="showRelatedComments"
                                :params="{ act: 'add', buyerShowId: row.buyerShowId }"
                                isDrawer
                                :delayed="20000"
                                path="promotion/buyerShow/buyerShowComments/commentManagementList"
                                title="相关评论"
                                width="900px"
                                @okCallback="loadFilter"
                                @closeCallback="loadFilter"
                                :showClose="false"
                                :showOnOk="false"
                            >
                                <a class="btn-link mr10">相关评论</a>
                            </DialogForm>
                            <div v-if="row.statusText === '待审核'">
                                <a class="btn-link mr10" @click="changeBuyerShowPassOrReject({ buyerShowCommentId: row.buyerShowCommentId, status: 1})">
                                    通过
                                </a>
                                <a class="btn-link mr10" v-if="row.statusText === '待审核'" @click="changeBuyerShowPassOrReject({ buyerShowCommentId: row.buyerShowCommentId, status: 2})">
                                    拒绝
                                </a>
                            </div>
                            <a class="btn-link mr10" v-if="['隐藏', '公开'].includes(row.statusText)" @click="changeBuyerShowShowOrHide({ buyerShowCommentId: row.buyerShowCommentId, isShow: row.statusText === '隐藏' ? 1 : 0})">
                                {{ row.statusText === '隐藏' ? '公开' : '隐藏'}}
                            </a>
                            <a class="btn-link" @click="changeBuyerShowTop({ buyerShowCommentId: row.buyerShowCommentId, isTop: row.isTop === 1 ? 0 : 1})">{{ row.isTop === 1 ? '取消置顶' : '置顶'}}</a>
                        </div>
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
            <Pagination v-model:page="filterParams.page" v-model:size="filterParams.size" :total="total" @callback="loadFilter" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Pagination } from "@/components/list";
import { DialogForm } from "@/components/dialog";
import { useConfigStore } from "@/store/config";
import { ElMessageBox } from "element-plus";
import { WarningFilled } from '@element-plus/icons-vue'
import { message } from "ant-design-vue";
import { defineModel, markRaw, defineProps } from 'vue'
import { commentInfoAudit, commentInfoShowOrHide, commentInfoTop } from "@/api/promotion/buyShow";

const filterParams = defineModel('filterParams', {});
const filterState = defineModel('filterState', {});
const loading = defineModel('loading', false);
const total = defineModel('total', 0);
const props = defineProps({
    // 是否显示复选框
    showSelection: {
        type: Boolean,
        default: true
    },
    // 是否展示相关评论按钮
    showRelatedComments: {
        type: Boolean,
        default: true
    }
});

const config: any = useConfigStore();

// 评论显示隐藏
const changeBuyerShowShowOrHide = async (data: any) => {
    ElMessageBox.confirm(
        data.isShow == 0 ? '隐藏后，该评论仅创建人自己可见' : '公开后，该评论将变为公开状态，所有客户可见',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            icon: markRaw(WarningFilled),
            customClass: 'buyShowHide',
        }
    ).then(async () => {
        await commentInfoShowOrHide(data);
        message.success("操作成功");
        loadFilter();
    })
        .catch(() => {
            message.error("取消操作");
        })
}

// 评价通过或拒绝
const changeBuyerShowPassOrReject = async (data: any) => {
    ElMessageBox.confirm(
        data.status == 1 ? '通过后，该买家秀将变为公开状态，所有客户可见' : '拒绝后，该买家秀将变为隐藏状态，所有客户不可见',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            icon: markRaw(WarningFilled),
            customClass: 'buyShowHide',
        }
    ).then(async () => {
        await commentInfoAudit(data);
        message.success("操作成功");
        loadFilter();
    })
        .catch(() => {})
}

// 评论置顶
const changeBuyerShowTop = async (data: object) => {
    commentInfoTop(data).then(() => {
        message.success("操作成功");
        loadFilter();
    })
}
const emit = defineEmits(['okCallback', 'onSelectChange']);
const loadFilter = () => {
    emit('okCallback')
}
const onSelectChange = (val: any) => {
    emit('onSelectChange', val)
};

// 判断是否可选 (待审核才能勾选)
const isSelectable = (row: any, index: number) => {
    return row.status === 0
};

</script>


<style lang="scss" scoped>
.el-table{
    :deep(.el-popper.is-dark) {
        max-width: 50%;
    }
}
</style>
