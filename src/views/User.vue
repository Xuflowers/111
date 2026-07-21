<template>
  <div class="user-container">
    <!-- 顶部用户信息区 -->
    <div class="user-header">
      <div v-if="userInfo" class="logged-in">
        <div class="avatar">👤</div>
        <div class="info">
          <div class="username">你好，{{ userInfo.name }}</div>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
      <div v-else class="not-logged-in" @click="goToLogin">
        <div class="avatar">🔒</div>
        <div class="info">
          <div class="username">未登录</div>
          <div class="sub-text">点击前往登录</div>
        </div>
      </div>
    </div>

    <!-- 我的订单入口 -->
    <div class="section">
      <div class="section-title" @click="goToOrders">我的订单 ></div>
      <div class="order-grid">
        <!-- 全部订单放在第一位 -->
        <div class="grid-item" @click="goToOrders">
          <div class="icon">📋</div>
          <span>全部订单</span>
        </div>
        <div class="grid-item" @click="goToOrdersWithStatus('pending_payment')">
          <div class="icon">💰</div>
          <span>待付款</span>
        </div>
        <div class="grid-item" @click="goToOrdersWithStatus('pending_receipt')">
          <div class="icon">📦</div>
          <span>待收货</span>
        </div>
        <div class="grid-item" @click="goToOrdersWithStatus('review')">
          <div class="icon">⭐</div>
          <span>待评价</span>
        </div>
        <div class="grid-item" @click="goToOrdersWithStatus('refund')">
          <div class="icon">🔧</div>
          <span>退货/售后</span>
        </div>
      </div>
    </div>

    <!-- 常用功能列表 -->
    <div class="section">
      <div class="list-item" @click="goToAddress">
        <span>📍 收货地址</span>
        <span>></span>
      </div>
      <div class="list-item" @click="goToHelp">
        <span>❓ 我的帮助/客服</span>
        <span>></span>
      </div>
    </div>

    <!-- 底部导航 -->
    <AppTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppTabBar from "@/components/AppTabBar.vue";

const router = useRouter()
const userInfo = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user-info')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('user-token')
    localStorage.removeItem('user-info')
    userInfo.value = null
    alert('已退出登录')
  }
}

// 跳转到订单页面，默认全部（不传 status）
const goToOrders = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/orders')
}

// 按状态跳转（待付款、待收货等）
const goToOrdersWithStatus = (status) => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  let queryStatus = ''
  if (status === 'pending_payment') queryStatus = 'pending-payment'
  else if (status === 'pending_receipt') queryStatus = 'pending-receipt'
  else if (status === 'review') queryStatus = 'review'
  else if (status === 'refund') queryStatus = 'refund'
  router.push(`/orders?status=${queryStatus}`)
}

const goToAddress = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/address')
}

const goToHelp = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/help')
}
</script>

<style scoped>
.user-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 50px;
}
.user-header {
  background: linear-gradient(to right, #07c160, #06ad56);
  padding: 40px 20px;
  color: white;
  display: flex;
  align-items: center;
}
.avatar {
  font-size: 40px;
  margin-right: 15px;
  background: rgba(255,255,255,0.2);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info {
  flex: 1;
}
.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}
.sub-text {
  font-size: 14px;
  opacity: 0.8;
}
.logout-btn {
  margin-top: 5px;
  padding: 4px 12px;
  background: rgba(255,255,255,0.2);
  border: 1px solid white;
  color: white;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
}
.not-logged-in {
  cursor: pointer;
}
.section {
  background: white;
  margin: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.section-title {
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.order-grid {
  display: flex;
  padding: 15px 0;
  flex-wrap: wrap;
}
.grid-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
  min-width: 20%;
}
.grid-item .icon {
  font-size: 24px;
  margin-bottom: 5px;
}
.grid-item span {
  font-size: 12px;
  color: #666;
}
.list-item {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  color: #333;
}
.list-item:last-child {
  border-bottom: none;
}
</style>