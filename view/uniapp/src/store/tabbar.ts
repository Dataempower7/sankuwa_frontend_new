import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getMobileNav } from "@/api/tabbar";
import { useConfigStore } from "@/store/config";
import { urlFormat } from "@/utils/format";

export const useTabbarStore = defineStore("tabbar", () => {
    const tabbarListDefault = ref<any[]>([]);
    const tabbarHeightNum = ref(60);
    const currRoute = ref("");
    const configStore = useConfigStore();
    const tabbarList = computed(() => {
        if (configStore.buyerShowEnabled !== 1) {
            return tabbarListDefault.value.filter((item) => {
                return item?.link?.link !== "/pages/buyerShow/index";
            });
        } else {
            return tabbarListDefault.value;
        }
    });

    const tabbarHeight = computed(() => {
        const configStore = useConfigStore();
        return tabbarHeightNum.value + configStore.safeBottom + "px";
    });

    const formatTabarList = computed(() => {
        return tabbarList.value.map((item) => {
            return urlFormat(item.link).split("?")[0];
        });
    });

    const currentActiveValue = computed(() => {
        const index = formatTabarList.value.findIndex((item) => {
            return `/${currRoute.value}` === item;
        });
        return index;
    });

    async function getTabbarList() {
        try {
            const result = await getMobileNav();
            tabbarListDefault.value = result.data.navList.map((item: any) => {
                return {
                    link: item.picLink,
                    image: item.picThumb,
                    activeImage: item.picActiveThumb,
                    text: item.picTitle
                };
            });
        } catch (error) {
            tabbarListDefault.value = [
                {
                    link: "/pages/index/index",
                  //  image: ico1,
                  //  activeImage: ico1h,
                    text: "首页"
                },
                {
                    link: "/pages/productCate/index",
                   // image: ico2,
                  //  activeImage: ico2h,
                    text: "分类"
                },
                {
                    link: "/pages/cart/index",
                 //   image: ico3,
                 //   activeImage: ico3h,
                    text: "购物车"
                },
                {
                    link: "/pages/user/index",
                //  image: ico4,
                //activeImage: ico4h,
                    text: "我的"
                }
            ];
            console.error(error);
        }
    }

    return {
        tabbarListDefault,
        tabbarList,
        tabbarHeightNum,
        tabbarHeight,
        formatTabarList,
        currentActiveValue,
        currRoute,
        getTabbarList
    };
});
