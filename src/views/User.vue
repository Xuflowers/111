<template>
  <div class="user-container">
    <!-- 顶部用户信息区 -->
    <div class="user-header">
      <div v-if="userInfo" class="logged-in">
        <div class="left">
          <div class="avatar">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-img" />
            <span v-else>👤</span>
          </div>
          <span class="viplevel">{{levelName}}</span>
        </div>
        <div class="info">
          <div class="center">
            <div class="username"
                 @click="showsetUserName=true"
            >你好，{{ userInfo.nickname || '用户123' }}</div>
            <span class="vip-point">积分：{{userInfo?.availablePoints || 0}}</span>
          </div>
        </div>

        <button class="logout-btn" @click="handleLogout">退出登录</button>

      </div>
      <div v-else class="not-logged-in" @click="goToLogin">
        <div class="left">
          <div class="avatar">🔒</div>
        </div>
        <div class="info">
          <div class="center">
            <div class="username">未登录</div>
            <span class="vip-point">点击前往登录</span>
          </div>
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
      <div class="list-item" @click="goToVip">
        <span>💎 会员尊享</span>
        <span class="vip-pointshow">可用积分：{{userInfo?.availablePoints || 0}}</span>
        <span>></span>
      </div>
      <div class="list-item" @click="goToAddress">
        <span>📍 收货地址</span>
        <span>></span>
      </div>
      <div class="list-item" @click="goToHelp">
        <span>❓ 我的帮助/客服</span>
        <span>></span>
      </div>
      <div class="list-item" @click="goToFavorites">
        <span>❤️ 我的收藏</span>
        <span>></span>
      </div>
      <div class="list-item" @click="goToSetting">
        <span>⚙️ 设置</span>
        <span>></span>
      </div>
    </div>
    <van-popup
      v-model:show="showsetUserName"
      position="center"
      round
      closeable
      duration="0.3"
      class="changeUserName"
    >
      <div class="changeUserName-popup">
        <h3>填写您的名称</h3>
        <van-field
            class="names"
            v-model="newUserName"
            type="textarea"
            label="新昵称"
            placeholder="请输入新昵称"/>
        <div class="popup-footer">
          <van-button class="cancel" @click="showsetUserName=false">取消</van-button>
          <van-button class="confirm"type="primary" @click="setUserName">确定</van-button>
        </div>
      </div>
    </van-popup>
    <!-- 底部导航 -->
    <AppTabBar />
  </div>
</template>

<script setup>
// 个人中心页：展示用户信息、订单入口、收货地址/帮助等常用功能
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {Toast} from "vant";
import AppTabBar from "@/components/AppTabBar.vue";
import { getLevelByPoints } from '@/store/index.js'
// 未登录或未注册会员时显示"还未注册"；已注册返回对应等级名
const levelName = computed(() => {
  if (!userInfo.value) return '未注册会员'
  if (userInfo.value.isVip !== true) return '未注册会员'
  return getLevelByPoints(userInfo.value.levelPoints ?? 0).name
})
const router = useRouter()
const store = useStore()
// 当前登录用户信息（未登录时为 null），用 computed 关联 store，
// 任何页面 commit 修改后这里会自动响应式更新
const userInfo = computed(() => store.state.userInfo)
const showsetUserName = ref(false)
const newUserName = ref('')

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
// 修改昵称：走 store mutation，保证跨页面同步并自动持久化
const setUserName = () =>{
  if (!newUserName.value.trim()){
    Toast.fail('请输入正确的昵称')
    return
  }
  store.commit('UPDATE_USER_INFO', { nickname: newUserName.value.trim() })
  Toast.success('修改成功')
  newUserName.value=''
  showsetUserName.value=false
}
// 退出登录：清除本地存储并重置用户信息
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('user-token')
    store.commit('CLEAR_USER_INFO')
    Toast.success('已退出登录')
  }
}

// 跳转到订单页面，默认全部（不传 status）
const goToOrders = () => {
  if (!userInfo.value) {
    Toast.fail('请先登录！')
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
  // 将内部状态名转换为 URL query 参数格式
  let queryStatus = ''
  if (status === 'pending_payment') queryStatus = 'pending-payment'
  else if (status === 'pending_receipt') queryStatus = 'pending-receipt'
  else if (status === 'review') queryStatus = 'review'
  else if (status === 'refund') queryStatus = 'refund'
  router.push(`/orders?status=${queryStatus}`)
}
const goToVip = () => {
  if (!userInfo.value) {
    alert('请先登录')
    router.push('/login')
    return
  }
  router.push('/vip')
}

// 跳转到收货地址页
const goToAddress = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/address')
}

// 跳转到帮助/客服页
const goToHelp = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/help')
}

const goToFavorites = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/favorites')
}

const  goToSetting = () => {
  router.push('/setting')
}
</script>

<style scoped>
.avatar {
  font-size: 40px;
  margin-bottom: 10px;
  margin-right: 18px;
  margin-left: 16px;
  background: rgba(255,255,255,0.2);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.viplevel{
  font-size: 16px;
}
.user-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 50px;
}
.user-header {
  background: linear-gradient(to right, #393838, rgba(8, 11, 12, 0.94));
  padding: 40px 20px;
  color: white;
  display: flex;
  border-radius: 16px;
  align-items: center;
}
.center{
  height: 90px;
}
.changeUserName-popup{
  text-align: center;
}
.changeUserName-popup .popup-footer{
  padding:10px;
  display:inline-flex;
  gap: 8px;
  max-width: 340px;
  width: 100%;
}
.changeUserName-popup  .popup-footer .van-button{
  flex: 1;
}
.changeUserName-popup .names{
  height: 50px;
}
.info {
  flex: 1;
}
.username {
  font-size: 20px;
  font-weight: bold;
  padding-top: 20px;
  margin-bottom: 24px;
}
.vip-point{
  margin-left: 10px;
  font-size: 14px;
}
.vip-pointshow{
  margin-top: 4px;
  font-size: 12px;
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
.logged-in {
  display: flex;
  align-items: center;
  width: 100%;
}
.not-logged-in {
  display: flex;
  align-items: center;
  width: 100%
}
.logged-in .avatar {
  flex-shrink: 0;
}
.not-logged-in .avatar {
  flex-shrink: 0;
}
.logged-in .username {
  flex-shrink: 0;
  margin-left: 10px;
}
.not-logged-in .username {
  flex-shrink: 0;
  margin-left: 10px;
}
.logged-in .logout-btn {
  margin-left: auto;
  flex-shrink: 0;
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
.viplevel{
  isplay: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f7d774, #e0b94a);
  color: #1c1c2b;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 32px;
}
</style>