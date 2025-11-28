<template>
    <div class="container">
        <div class="content_wrapper">
            <a-spin :spinning="loading">
                <el-tabs v-model="activeTab" class="simple-tabs">
                    <el-tab-pane v-for="tab in tabList" :key="tab.name" :label="tab.label" :name="tab.name">
                        <div class="tab-content">
                            <component :is="tab.component" v-bind="tab.props" />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </a-spin>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingStore from './settingStore.vue';
import SettingPlatStore from './settingPlatStore.vue';

// 当前激活的tab
const activeTab = ref('basic');

// 加载状态
const loading = ref(false);

// tab配置列表
const tabList = ref([
    {
        name: 'basic',
        label: '门店配置',
        component: SettingStore,
        props: {
            // 可以传递props给组件
        }
    },
    {
        name: 'advanced',
        label: '平台门店设置',
        component: SettingPlatStore,
        props: {
            // 可以传递props给组件
        }
    }
]);

// 暴露给父组件的方法
defineExpose({
    activeTab
});
</script>

<style lang="less" scoped>
.tab-content {
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    // min-height: 200px;
    height: 100%;

    h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
    }

    p {
        margin: 0;
        color: #606266;
        line-height: 1.6;
    }
}
</style>
