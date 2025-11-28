<template>
    <div class="top-bar-right flex flex-align-center">
        <div class="top-bar-item top-admin_msg" @click="markAsRead" :class="themeInfo.layout">
            <DialogForm
                v-bind:is-drawer="false"
                path="panel/adminMsg/AdminMsg"
                title="消息中心"
                :showFooter="false"
                width="1000px"
                :bodyStyle="{ padding: 0 }"
                @callback="refreshMessageUI"
            >
                <a class="top-bar-btn lyecs-dialogPage" :class="themeInfo.navTheme">
                    <i class="iconfont-admin icon-tongzhi-L"></i>
                    <span v-if="themeInfo.layout !== 'topMenu'">消息</span>
                    <span class="admin_msg-order_count"
                        v-if="message?.orderCount > 0 && themeInfo.layout !== 'topMenu'">新订单 {{ message.orderCount
                        }}</span>
                    <em class="admin_msg-count" v-if="useStore.messageCount > 0">{{ useStore.messageCount }}</em>
                </a>
            </DialogForm>
        </div>
        <div class="top-bar-item top-admin_msg" v-if="(isMerchant() || isPro()) && adminType !== 'vendor'"
            :class="themeInfo.layout">
            <router-link :to="{ path: '/im/index' }" target="_blank">
                <p class="top-bar-btn" :class="themeInfo.navTheme">
                    <i class="iconfont-admin icon-xiaoxi"></i><span v-if="themeInfo.layout !== 'topMenu'">客服</span><em
                        class="admin_msg-count" v-if="message?.imMsgCount > 0">{{ message.imMsgCount }}</em>
                </p>
            </router-link>
        </div>
        <div class="top-bar-item" :class="themeInfo.layout">
            <a class="top-bar-btn" :class="themeInfo.navTheme" :href="urlFormat('/')" target="_blank"><i
                    class="iconfont icon-guanli"></i><span v-if="themeInfo.layout !== 'topMenu'">查看门店</span></a>
        </div>
        <div class="top-bar-item top-bar-user" id="dropdown-memu" :class="themeInfo.layout">
            <a-dropdown :trigger="['click']">
                <div class="admin-user-warp" v-if="userInfo.username">
                    <a class="top-bar-btn" :class="themeInfo.navTheme" v-if="screenWidth >= 900">
                        <span class="admin-user-photo" v-if="adminType !== 'shop'">
                            <template v-if="extractContent(String(userInfo.avatar)) == 'def'">
                                <img :src="returnAvatar(userInfo.avatar)" />
                            </template>
                            <template v-else>
                                <img :src="imageFormat(userInfo.avatar)" />
                            </template>
                        </span>
                        <div class="admin-user-name" v-if="themeInfo.layout !== 'topMenu'">
                            {{ /^1[3-9]\d{9}$/.test(userInfo.username) ? userInfo.username.replace(/(\d{3})\d{4}/,
                                "$1****") : userInfo.username
                            }}
                        </div>
                        <div class="admin-user-name" v-if="adminType == 'shop'">
                            {{ shopInfo.shopTitle }}
                        </div>
                        <i class="iconfont icon-xiala"></i>
                    </a>
                    <a class="top-bar-btn" v-else>
                        <i class="iconfont icon-xiala"></i>
                    </a>
                </div>
                <template #overlay>
                    <div class="dropdown-memu top-bar-memu">
                        <div class="entrance-list">
                            <p class="entrance lyecs-openPage" v-if="isMerchant() || isS2b2c() || isStore()"
                                @click="switchShop">
                                <i class="iconfont-tig icon-shanghu"></i>
                                <span>切换组织</span>
                            </p>
                            <router-link
                                :to="{
                                    path: adminType == 'shop' || adminType == 'vendor' ? '/setting/account-editing/index' : '/authority/account-editing/index'
                                }"
                            >
                                <p class="entrance lyecs-openPage">
                                    <!-- <i class="iconfont icon-gerenshezhi"></i> -->
                                    <i class="iconfont-tig icon-guanlizhanghao"></i>
                                    <span>管理账号</span>
                                </p>
                            </router-link>
                            <p class="entrance" @click="clearCache">
                                <i class="iconfont-tig icon-qingchuhuancun"></i>
                                <span>清除缓存</span>
                            </p>
                            <p class="entrance" @click="onLogout">
                                <i class="iconfont-tig icon-tuichudenglu"></i>
                                <span>退出登录</span>
                            </p>
                        </div>
                    </div>
                </template>
            </a-dropdown>
        </div>
    </div>
    <div class="dialog-box">
        <el-dialog :z-index="12" v-model="dialogVisible">
            <SelectShop v-if="dialogVisible" @closePopup="closePopup" :isIndex="true" :username="userInfo.username">
            </SelectShop>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, onBeforeUnmount } from "vue";
import SelectShop from "@/components/merchant/SelectShop.vue";
import { extractContent } from "@/utils/util";
import { returnAvatar } from "@/utils/avatar";
import { getAdminMsgCount } from "@/api/common/common";
import { DialogForm } from "@/components/dialog";
import { useConfigStore } from "@/store/config";
import { useMenusStore } from "@/store/menu";
import { isMerchant, isPro, isS2b2c, isStore } from "@/utils/version";
import { useThemeStore } from "@/store/theme";
import { useUserStore } from "@/store/user";
import { urlFormat, imageFormat } from "@/utils/format";
import { cleanUp } from "@/api/common/common";
import { notification } from "ant-design-vue";
import { updateMenu } from "@/utils/menus";
import type { MainMenu } from "@/types/common/common.d";
import { requestUrl } from "@/utils/request";
const { themeInfo } = useThemeStore();
const adminType = ref(localStorage.getItem("adminType"));
const useStore = useUserStore();
const menusStore = useMenusStore();
const { logout, updateUserInfo } = useUserStore();
const userInfo = computed(() => useUserStore().userInfo);
const shopInfo = computed(() => useUserStore().shopInfo);
import dayjs from "dayjs";
const config: any = useConfigStore();
const message = ref<any>(null);
// 删除轮询相关变量
// let pollingInterval: any = null;

// 添加SSE相关变量
let eventSource: EventSource | null = null;

const refreshMessageUI = () => {
    // 只更新UI，不发送网络请求
    // 依赖SSE提供的实时数据
    if (message.value) {
        // 强制更新界面显示
        message.value = { ...message.value };
    }
};

const fetchMessage = async () => {
    try {
        const response = await getAdminMsgCount({ startTime: localStorage.getItem("lastOpenTime") });
        message.value = response;
        useStore.messageCount = response.unreadMsgCount;
    } catch (error) {
        console.error("请求消息失败:", error);
    }
};

// 初始化SSE连接
const initSSE = () => {
    // 关闭已有的连接
    if (eventSource) {
        eventSource.close();
    }
    fetchSSEPolyfill();
};

// 使用Fetch API实现的SSE Polyfill
const fetchSSEPolyfill = () => {
    const headers = requestUrl.headers();
    const startTime = localStorage.getItem("lastOpenTime") || "";
    // 使用fetch流式API模拟SSE
    fetch(`${requestUrl.prefix}/msg/adminMsg/msgCount?startTime=${startTime}`, {
        headers: headers
    })
        .then((response) => {
            // 检查响应是否成功
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            function read() {
                reader
                    ?.read()
                    .then(({ done, value }) => {
                        if (done) {
                            setTimeout(() => initSSE(), 5000);
                            return;
                        }
                        const text = decoder.decode(value);
                        try {
                            const data = JSON.parse(text);
                            if (data.code === 0) {
                                message.value = data.data;
                                useStore.messageCount = data.data.unreadMsgCount;
                            }
                        } catch (parseError) {
                            const lines = text.split("\n");
                            lines.forEach((line) => {
                                if (line.startsWith("data:")) {
                                    try {
                                        const jsonData = line.substring(5).trim();

                                        const start = jsonData.indexOf("{");
                                        const end = jsonData.lastIndexOf("}");

                                        if (start !== -1 && end !== -1 && end > start) {
                                            const jsonString = jsonData.substring(start, end + 1);
                                            const data = JSON.parse(jsonString);
                                            if (data.code === 0) {
                                                message.value = data.data;
                                                useStore.messageCount = data.data.unreadMsgCount;
                                            }
                                        } else {
                                            console.error("未能找到有效的JSON结构");
                                        }
                                    } catch (error) {
                                        console.error("解析SSE消息失败:", error);
                                        console.log("原始行数据:", line);
                                    }
                                } else if (line.trim() !== "") {
                                    console.log("收到其他类型的数据:", line);
                                }
                            });
                        }

                        read();
                    })
                    .catch((error) => {
                        console.error("SSE读取错误:", error);
                        // 出错后重新连接
                        setTimeout(() => initSSE(), 5000);
                    });
            }

            read();
        })
        .catch((error) => {
            console.error("SSE连接失败:", error);
            // 连接失败后重新连接
            setTimeout(() => initSSE(), 5000);
        });
};

// 关闭SSE连接
const closeSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
};

const markAsRead = () => {
    if (message.value) {
        message.value.orderCount = 0;
        message.value.imMsgCount = 0;
        message.value.unreadMsgCount = 0;
    }
    useStore.messageCount = 0;
    localStorage.setItem("lastOpenTime", String(dayjs().unix()));
};

// 删除轮询相关函数
// const startPolling = () => {
//     pollingInterval = setInterval(fetchMessage, 30000); // 每15秒请求一次
// };

// const stopPolling = () => {
//     if (pollingInterval) {
//         clearInterval(pollingInterval);
//         pollingInterval = null;
//     }
// };

// 清除缓存
const clearCache = async () => {
    try {
        const result = await cleanUp();
        const configStore = useConfigStore();
        // 更新后台设置项
        updateUserInfo();
        configStore.updateConfig();
        notification["success"]({
            message: "缓存已清除",
            description: "缓存清除后可刷新页面更新效果"
        });
    } catch (error: any) { }
};
const onLogout = async () => {
    logout();
};
const dialogVisible = ref(false);
const switchShop = () => {
    dialogVisible.value = true;
};
const closePopup = () => {
    dialogVisible.value = false;
};
const screenWidth = ref(window.innerWidth);
const handleResize = () => {
    screenWidth.value = window.innerWidth;
};
onMounted(() => {
    updateUserInfo();
    fetchMessage(); // 组件挂载时立即请求一次
    initSSE(); // 初始化SSE连接
    // startPolling(); // 开始轮询 - 删除这行
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    // stopPolling(); // 组件卸载时停止轮询 - 删除这行
    closeSSE(); // 组件卸载时关闭SSE连接
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
});
</script>

<style scoped lang="less">
.top-bar-right {
    gap: 10px;
    margin-right: 10px;
}

/* 你的组件样式 */
.top-bar-item {
    position: relative;
    display: flex;
    align-items: center;
}

.default {
    .top-bar-btn {
        display: block;
        height: 40px;
        padding: 0 12px;
        font-size: 14px;
        color: #788d9b;
        text-align: center;
        transition:
            background 0.2s ease 0s,
            color 0.2s ease 0s;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;

        &:hover {
            background: #f7f7f7;
        }
    }
}

.topMenu {
    .top-bar-btn {
        display: block;
        height: 40px;
        padding: 0 10px !important;
        font-size: 14px;
        text-align: center;
        transition:
            background 0.2s ease 0s,
            color 0.2s ease 0s;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        position: relative;
        color: var(--tig-menu-text-color);
    }

    .top-bar-btn:hover {
        background: #9c9c9c2e !important;
    }

    .light {
        color: #788d9b;
    }

    .light:hover {
        background: #f7f7f7 !important;
    }
}

.top-bar-item .top-bar-btn .admin-user-photo img {
    width: 26px;
    height: 26px;
    border-radius: 26px;
    margin-right: 10px;
}

.top-bar-item .top-bar-btn i {
    font-size: 18px;
}

.top-bar-item .top-bar-btn i.fs-18 {
    font-size: 18px;
}

.top-bar-item .top-bar-btn .noc_count {
    background: #ff9900;
    padding: 4px 7px;
    border-radius: 6px;
    vertical-align: top;
    margin-left: 4px;
}

.top-bar-item .top-bar-btn .admin_msg-count {
    position: absolute;
    left: 10px;
    top: 1px;
    font-size: 12px;
    color: #fff;
    background-color: #f33;
    line-height: 14px;
    padding: 0 5px;
    border-radius: 8px;
}

.admin_msg-order_count {
    font-size: 10px;
    color: #fff;
    background-color: #ffb53e;
    line-height: 14px;
    padding: 2px 8px;
    border-radius: 14px;
    margin-left: 5px;
}

.dropdown-memu {
    background-color: #ffffff;
    box-shadow:
        0 6px 16px 0 rgba(0, 0, 0, 0.08),
        0 3px 6px -4px rgba(0, 0, 0, 0.12),
        0 9px 28px 8px rgba(0, 0, 0, 0.05);
    font-size: 12px;
    border-radius: 9px;
    overflow: hidden;
    width: 130px !important;

    .entrance-list {
        display: flex;
        flex-direction: column;

        p {
            border-radius: 2px;
            color: #333;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 6px 0 6px 16px;
            color: #999;
            column-gap: 8px;
            cursor: pointer;

            &:hover {
                background: #f5f5f5;
            }
        }

        span {
            color: #323233;
            font-weight: 700;
            font-size: 14px;
        }

        i {
            font-size: 20px;
            margin-top: 1px;
        }
    }

    .admin_exit {
        border-top: 1px solid #f5f5f5;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;

        a {
            line-height: 40px;
            padding: 0 10px;
            flex: 1;
            text-align: center;
        }
    }
}

@media only screen and (max-width: 767px) {
    .top-bar-item {
        span {
            display: none;
        }
    }
}
</style>
<style scoped lang="less">
.dialog-box {
    :deep(.el-dialog__header) {
        display: none;
    }

    :deep(.el-dialog) {
        width: 760px;
    }
}

@media only screen and (max-width: 767px) {
    .dialog-box {
        :deep(.el-dialog) {
            width: 80%;
        }
    }
}
</style>
