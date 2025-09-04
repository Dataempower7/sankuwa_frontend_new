<template>
    <div class="page-container">
        <Logo></Logo>
        <!-- <div class="login-page-left">
            <a class="top-bar-btn" target="_blank" href="https://www.tigshop.com" title="起始页" style="padding: 0 3px">
                <img style="margin: 10px" height="40" src="~@/style/images/logo2.png" />
            </a>
        </div> -->
        <div class="login-page-right">
            <div class="login-box">
                <h1 class="login-title">
                    <span class="login-title-welcome">欢迎登录</span
                    ><span class="login-title-intro">{{ landingType ? "商城后台管理系统" : "商家后台管理系统" }}</span>
                </h1>
                <div class="login-tabs-warp">
                    <Transition mode="out-in" name="slide-fade">
                        <el-tabs v-if="!selectShopFlag" v-model="loginType" class="login-tabs">
                            <el-tab-pane name="password" label="密码登录">
                                <el-form ref="passwordFormRef" :model="formState" @keyup.enter="formSubmit(passwordFormRef ?? null)">
                                    <div class="erro-message" v-if="errorMessage"><el-alert type="error" :title="errorMessage" show-icon /></div>
                                    <el-form-item class="login-row" prop="username" :rules="[{ required: true, message: '用户名不能为空!' }]">
                                        <TigInput width="100%" class="login-input" size="large" v-model="formState.username" placeholder="请输入用户名" />
                                    </el-form-item>
                                    <el-form-item class="login-row" prop="password" :rules="[{ required: true, message: '密码不能为空!' }]">
                                        <TigInput
                                            width="100%"
                                            type="password"
                                            show-password
                                            class="login-input"
                                            size="large"
                                            v-model="formState.password"
                                            placeholder="请输入密码"
                                        />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button
                                            ref="submitBtn"
                                            :loading="loading"
                                            class="login-submit-btn"
                                            :disabled="disabled"
                                            type="primary"
                                            @click="formSubmit(passwordFormRef ?? null)"
                                        >
                                            登 录
                                        </el-button>
                                    </el-form-item>
                                    <el-form-item prop="remember">
                                        <div class="flex flex-justify-between" style="width: 100%">
                                            <el-checkbox v-model:checked="formState.remember">记住登录状态</el-checkbox>
                                            <!--                                            <a v-if="landingType" @click="switchLoginType">切换至商家登录</a>-->
                                        </div>
                                    </el-form-item>
                                </el-form>
                                <Verify
                                    ref="verify"
                                    mode="pop"
                                    captchaType="blockPuzzle"
                                    :imgSize="{ width: '310px', height: '155px' }"
                                    @okCallback="okCallback"
                                ></Verify>
                            </el-tab-pane>
                            <el-tab-pane name="mobile" label="手机登录">
                                <el-form ref="mobileFormRef" :model="formState" @keyup.enter="formSubmit(mobileFormRef ?? null)">
                                    <div class="erro-message" v-if="mobileErrorMessage"><el-alert type="error" :title="mobileErrorMessage" show-icon /></div>
                                    <el-form-item class="login-row" prop="mobile" :rules="[{ validator: validateMobile, trigger: 'blur' }]">
                                        <TigInput width="100%" class="login-input" size="large" v-model="formState.mobile" placeholder="请输入手机号" />
                                    </el-form-item>
                                    <el-form-item
                                        class="login-row"
                                        prop="mobileCode"
                                        :rules="[{ required: true, message: '验证码不能为空!', trigger: 'blur' }]"
                                    >
                                        <MobileCode
                                            class="login-input"
                                            v-model:mobile="formState.mobile"
                                            v-model:mobileCode="formState.mobileCode"
                                            :requestApi="sendMobileCode"
                                            @mobileErrorCallback="mobileErrorCallback"
                                        ></MobileCode>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button
                                            ref="submitBtn"
                                            :loading="loading"
                                            class="login-submit-btn"
                                            :disabled="disabled"
                                            type="primary"
                                            @click="formSubmit(mobileFormRef ?? null)"
                                        >
                                            登 录
                                        </el-button>
                                    </el-form-item>
                                    <el-form-item prop="remember">
                                        <el-checkbox v-model:checked="formState.remember">记住登录状态</el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                        </el-tabs>
                        <div v-else>
                            <!-- <SelectShop :username="loginType == 'password' ? formState.username : formState.mobile"></SelectShop> -->
                            <SelectShop v-model:selectShopFlag="selectShopFlag"></SelectShop>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRaw, computed, onMounted, nextTick } from "vue";
import "@/style/css/login.less";
import { notification } from "ant-design-vue";
import { useRouter } from "vue-router";
import { MobileCode } from "@/components/form";
import type { FormInstance, FormRules } from "element-plus";
import { adminSignin, sendMobileCode } from "@/api/authority/login";
import Verify from "@/components/verifition/Verify.vue";
import SelectShop from "@/components/merchant/SelectShop.vue";
import Logo from "./src/Logo.vue";
const verify = ref();
const landingType = ref(true);
const selectShopFlag = ref(false);
const switchLoginType = () => {
    landingType.value = false;
    formState.value.username = "";
    formState.value.password = "";
};
const router = useRouter();
const fullPath = router.currentRoute.value.fullPath;
const merchantLogin = fullPath.includes("merchantLogin");
const loginType = ref("password");
const errorMessage = ref("");
const passwordErrorMessage = ref("");
const mobileErrorMessage = ref("");
const loading = ref(false);
// 表单参数初使化
const passwordFormRef = ref<FormInstance>(); //表单Ref
const mobileFormRef = ref<FormInstance>(); //表单Ref
let formState = ref<any>({
    username: merchantLogin ? import.meta.env.VITE_DEFAULT_STORE_NAME || "" : import.meta.env.VITE_DEFAULT_USER_NAME || "",
    password: merchantLogin ? import.meta.env.VITE_DEFAULT_STORE_PASSWORD || "" : import.meta.env.VITE_DEFAULT_USER_PASSWORD || "",
    remember: false,
    verifyToken: null
}); //表单数据
const captchaUid = ref("");
export interface SigninResult {
    token?: string;
    adminType?: string;
}
// 提交表单
const formSubmit = async (e: FormInstance | null) => {
    if (!e) {
        return;
    }
    await e.validate();
    loading.value = true;
    try {
        const result = await (<SigninResult>adminSignin({
            loginType: loginType.value,
            captchaUid: captchaUid.value,
            ...formState.value
        }));
        // const userStore = useUserStore() as any;
        // const configStore = useConfigStore();
        // const menusStore = useMenusStore();
        // 设置Token
        localStorage.setItem("accessToken", result.token ?? "");
        localStorage.setItem("adminType", result.adminType ?? "");
        // if(result.adminType=='admin'){
        //     // 更新后台设置项
        //     userStore.updateUserInfo();
        //     await configStore.updateConfig();
        //     notification["success"]({
        //         message: "登录成功",
        //         placement: "top",
        //         duration: 1.5,
        //         description: "您好，欢迎回来"
        //     });
        //     passwordErrorMessage.value = "";
        //     mobileErrorMessage.value = "";
        //     let mainMenu = (await updateMenu()) as MainMenu[];
        //     menusStore.mainMenu = mainMenu;
        //     router.push("/" + (mainMenu ? mainMenu[0].routeLink : ""));
        // }else{
        //选择店铺
        selectShopFlag.value = true;
        // }
    } catch (error: any) {
        console.error(error);
        if (error.code == 1002) {
            verify.value.show();
        } else if (error.code > 0) {
            notification["error"]({
                message: "错误",
                description: error.message
            });
            if (loginType.value == "password") {
                passwordErrorMessage.value = error.message;
            } else {
                mobileErrorMessage.value = error.message;
            }
        }
    } finally {
        setTimeout(() => {
            loading.value = false;
        }, 600);
    }
};
const submitBtn = ref();
const okCallback = (e: any) => {
    formState.value.verifyToken = e.verifyToken;
    if (passwordFormRef.value) {
        formSubmit(passwordFormRef.value);
    }
};
const mobileErrorCallback = () => {
    if (!mobileFormRef.value) return;
    mobileFormRef.value.validateField("mobile");
};
const disabled = computed(() => {
    return false;
    //   return !(formState.username && formState.password);
});
const validateMobile = (rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error("手机号不能为空"));
        return;
    }
    const internationalRegex = /^(\+?[1-9]\d{1,14})$/; // 定义支持的国际手机号格式正则表达式
    const regex = /^(?:\+?86)?1[3-9]\d{9}$/; // 国内手机号正则表达式
    // 判断是否符合国际手机号格式
    if (regex.test(value)) {
        callback();
    } else {
        callback("手机号格式错误");
        // 判断是否符合国内手机号格式  需增加设置项
        // return internationalRegex.test(phoneNumber);
    }
};
onMounted(() => {
    const accessToken = localStorage.getItem("accessToken");
    const shopId = localStorage.getItem("shopId");
    if (accessToken && !shopId) {
        nextTick(() => {
            selectShopFlag.value = true;
        });
    }
});
</script>

<style lang="less" scoped>
.page-container {
    display: flex;
    height: 100%;
}

.login-page-left {
    background: url("@/style/images/login-page-bg.png") center;
    background-size: cover;
    flex: 1.5;
    position: relative;
    height: 100%;
}

.login-page-right {
    -webkit-box-flex: 2;
    -webkit-flex: 2;
    -ms-flex: 2;
    flex: 2;
}

.login-box {
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
}

.login-title {
    text-align: left;
    width: 456px;
    margin: 30px auto;
}

.login-title-welcome {
    font-family: PingFangSC-Medium;
    font-size: 30px;
    color: #111;
    letter-spacing: 0;
    margin-right: 17px;
}

.login-tabs-warp {
    width: 460px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #dee0e3;
    padding-top: 20px;
    min-height: 460px;
    -webkit-box-shadow:
        0 4px 8px rgba(31, 35, 41, 0.03),
        0 3px 6px -6px rgba(31, 35, 41, 0.05),
        0 6px 18px 6px rgba(31, 35, 41, 0.03);
    box-shadow:
        0 4px 8px rgba(31, 35, 41, 0.03),
        0 3px 6px -6px rgba(31, 35, 41, 0.05),
        0 6px 18px 6px rgba(31, 35, 41, 0.03);
    position: relative;
    :deep(.el-tabs__nav-wrap::after) {
        display: none;
    }
}

.login-tabs {
    :deep(.el-tabs__nav) {
        margin: 0 33px;
    }

    :deep(.el-form) {
        margin: 33px;
    }

    :deep(.login-row) {
        margin-bottom: 35px;
    }

    :deep(.el-tabs__item) {
        font-size: 18px;
        font-weight: 600;
        height: 50px;
    }
}

.erro-message {
    margin-bottom: 20px;
}

.login-submit-btn {
    width: 100%;
    height: 50px;
    font-size: 16px;
    margin-top: 5px;
}

.captcha-img {
    margin-left: 15px;
    width: 200px;
    height: 58px;
}

.login-tabs {
    :deep(.el-input__wrapper) {
        background: #f7f8fa;
        height: 60px;
        border-radius: 9px;
        box-shadow: 0 0 0 1px #f7f8fa inset;
    }

    :deep(.el-form-item.is-error .el-input__wrapper) {
        box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }

    :deep(.el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
    }
}

.login-form {
    margin-top: 20px;
    padding: 0 33px;
}

.login-form li {
    margin-bottom: 35px;
    display: flex;
}

.fm-button {
    background-color: #ff9000;
    background-image: -webkit-gradient(linear, left top, right top, from(#ff9000), to(#ff9000));
    background-image: linear-gradient(90deg, #ff9000, #ff9000);
    border: 1px solid #ff9000;
    border-radius: 3px;
    font-size: 20px;
    height: 42px;
    line-height: 42px;
    outline: none;
    display: block;
    color: #fff;
    width: 100%;
    cursor: pointer;
}

.login-form .fm-button {
    background: #3d7fff;
    border-radius: 30px;
    border: none;
    margin-top: 14px;
    height: 60px;
    line-height: 60px;
    margin-bottom: 20px;
}

.login-form .fm-button:hover {
    color: #fff;
}

.sendMobileMsg {
    align-items: center;
}

.code-button {
    background: #3d7fff;
    border-radius: 20px;
    border: none;
    height: 40px;
    line-height: 40px;
    color: #fff;
    width: 150px;
    vertical-align: middle;
    margin-left: 10px;
}

.code-button:hover {
    color: #fff;
}

.error-info {
    width: 389px;
    background: #ffe6e6;
    border-radius: 6px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: red;
    align-items: center;
    font-size: 14px;
    text-indent: 10px;
    text-align: left;
    margin-bottom: 15px;
    padding: 10px 0;
}

.other_info {
    text-align: left;
}

.remember {
    margin-right: 20px;
}

.login-title-intro {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #666;
    font-weight: normal;
    letter-spacing: 0;
}

@media only screen and (max-width: 767px) {
    .page-container {
        flex-wrap: wrap;
        display: block;
        .login-page-left {
            height: 80px;
            background: #fff;
            padding-top: 20px;
            text-align: center;
            img {
                height: 50px;
            }
        }
    }
    .login-title {
        width: 100%;
        box-sizing: border-box;
        padding: 20px 20px 0;
        .login-title-welcome {
            font-size: 26px;
        }
    }
    .login-tabs-warp {
        width: 100%;
        box-sizing: border-box;
        box-shadow: none;
        padding: 20px;
        border: 0;
    }
    .login-tabs :deep(.el-tabs__nav) {
        margin: 0;
    }
    .login-tabs .el-form {
        margin: 0;
    }
}

.slide-fade-enter-active {
    transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
