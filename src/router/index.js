import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import Cart from '../views/Cart.vue'
import Message from '../views/Message.vue'
import User from '../views/User.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Login from '../views/Login.vue'

// 路由表：声明 path 与组件的映射关系
const routes = [
  { path: '/', component: Home },                                  // 默认进入首页
  { path: '/home', component: Home },                              // 首页
  { path: '/category', component: Category },                      // 商品分类
  { path: '/product/:id', component: ProductDetail },              // 商品详情（动态参数 id）
  { path: '/cart', component: Cart },                              // 购物车
  { path: '/message', component: Message },                        // 消息中心
  { path: '/user', component: User },                              // 个人中心
  { path: '/login', name: 'Login', component: Login },             // 登录页
  // 以下路由采用懒加载（动态 import），按需加载以减小首屏体积
  { path: '/search', name: 'SearchResult', component: () => import('../views/SearchResult.vue') },  // 搜索结果
  { path: '/orders', component: () => import('../views/Orders.vue') },                              // 订单列表
  { path: '/address', component: () => import('../views/Address.vue') },                            // 收货地址
  { path: '/help', component: () => import('../views/Help.vue') },                                  // 帮助/客服
  { path: '/detail/:id', component: ()  => import('../views/BillDetail.vue') },                    //订单详情
  { path: '/refund/:id', component: () => import('../views/RefundDetail.vue') }                     // 售后详情
]

// 创建路由实例：使用 HTML5 History 模式
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
