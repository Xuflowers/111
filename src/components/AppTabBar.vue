<template>
  <van-tabbar v-model="active" route>
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
    <!-- 确保有这一项 -->
    <van-tabbar-item icon="chat-o" to="/message">消息</van-tabbar-item>
    <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

const tabbarMap = {
  '/home': 0,
  '/category': 1,
  '/message': 2, // 对应消息页
  '/cart': 3,
  '/user': 4
}

watch(() => route.path, (path) => {
  active.value = tabbarMap[path] || 0
}, { immediate: true })
</script>