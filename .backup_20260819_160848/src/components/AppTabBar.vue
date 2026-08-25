<template>
  <!-- 应用底部导航栏：通过 route 模式自动同步当前激活项 -->
  <van-tabbar v-model="active" route>
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
    <van-tabbar-item icon="chat-o" to="/message">消息</van-tabbar-item>
    <!-- 购物车 Tab：通过 badge 显示购物车商品总件数 -->
    <van-tabbar-item icon="shopping-cart-o" to="/cart" :badge="store.getters.totalNum > 0 ? store.getters.totalNum: null">购物车</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
// 全局底部 Tab 栏组件：在多个主页面中复用
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()
// 当前激活的 Tab 索引（配合 route 模式使用）
const active = ref(0)

// 购物车商品总件数（计算属性）
const cartCount = computed(() => {
  return Object.values(store.state.cartList).reduce((sum, item) => sum + item.count, 0)
})

// 路由路径与 Tab 索引的映射表
const tabbarMap = {
  '/home': 0,
  '/category': 1,
  '/message': 2, // 对应消息页
  '/cart': 3,
  '/user': 4
}

// 监听路由变化，自动同步底部 Tab 激活项
watch(() => route.path, (path) => {
  active.value = tabbarMap[path] || 0
}, { immediate: true })
</script>