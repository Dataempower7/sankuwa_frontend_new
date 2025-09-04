export default {
    path: "/content",
    name: "content",
    component: () => import("@/layouts/base/index.vue"),
    meta: { title: "内容" },
    children: [
        {
            path: "",
            name: "articleManagement",
            meta: { title: "文章管理" },
            redirect: "/content/article/list",
            children: [
                {
                    path: "article/list",
                    name: "articleManage",
                    meta: { title: "文章列表" },
                    component: () => import("@/views/content/article/List.vue")
                },
                {
                    path: "article-category/list",
                    name: "articleCategoryManage",
                    meta: { title: "文章分类" },
                    component: () => import("@/views/content/articleCategory/List.vue")
                }
            ]
        }
    ]
};
