import Vue from 'vue';
import VueRouter from "vue-router";

Vue.use(VueRouter);

let projectRouterConfig = [
    {
        path: '/',
        redirect: '/home/article'
    },{
        path: '/home/:module',
        name: 'home',
        component: () => import('./views/Home')
    },{
        path: '/chatHome',
        name: 'chatHome',
        component: () => import('./views/Chathome')
    },{
        path: '/editArticle',
        name: 'ArticleEdit',
        component: () => import('./views/Article-Edit')
    },{
        path: '/article/:id',
        name: 'articleDetail',
        component: () => import('../../components/Article-Detail')
    },{
        path: '/blogList/:searchKey',
        name: 'blogList',
        component: () => import('./views/BlogList')
    }
]

export default new VueRouter({
    routes: projectRouterConfig
})
