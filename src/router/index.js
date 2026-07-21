import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import Cart from '../views/Cart.vue'
import Message from '../views/Message.vue'
import User from '../views/User.vue'
import ProductDetail from '../views/ProductDetail.vue'

// 1. 新增：导入 Login 组件 (请确保你的文件名为 Login.vue，如果是 User.vue 请自行修改路径)
import Login from '../views/Login.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/home', component: Home },
    { path: '/category', component: Category },
    { path: '/product/:id', component: ProductDetail },
    { path: '/cart', component: Cart },
    { path: '/message', component: Message },
    { path: '/user', component: User },

    // 2. 新增：添加 /login 路由配置
    {
        path: '/login',
        name: 'Login',
        component: Login
    },

    // 在 routes 数组中添加
    {
        path: '/search',
        name: 'SearchResult',
        component: () => import('../views/SearchResult.vue')
    },

    // --- 补充“我的”页面相关的子路由 ---
    { path: '/orders', component: () => import('../views/Orders.vue') }, // 全部订单
    { path: '/address', component: () => import('../views/Address.vue') }, // 收货地址
    { path: '/help', component: () => import('../views/Help.vue') } // 我的帮助/客服
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router