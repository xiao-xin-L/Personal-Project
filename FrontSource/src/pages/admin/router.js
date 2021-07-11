import Vue from 'vue';
import VueRouter from "vue-router";

Vue.use(VueRouter);

let projectRouterConfig = [
    {
        path: '/',
        redirect: '/dataView'
    },
    {
        path: '/dataView',
        name: 'Data View',
        component:()=>import('./views/DBA')
    },
    {
        path: '/review',
        name: 'Data review',
        component:()=>import('./views/Review')
    },
    {
        path: '/tipOff',
        name: 'Tip off',
        component:()=>import('./views/TipOff')
    },
    {
        path: '/permission',
        name: 'Permission',
        component:()=>import('./views/Permission')
    },
    {
        path: '/dbmanager',
        name: 'DBManger',
        component:()=>import('./views/DBManager')
    },{
        path: '/article/:id',
        name: 'articleDetail',
        component: () => import('../../components/Article-Detail')
    }
]

export default new VueRouter({
    routes: projectRouterConfig
})
