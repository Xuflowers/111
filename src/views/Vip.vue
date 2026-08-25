<template>
  <div class="vip-page">
    <van-nav-bar title="会员尊享" left-arrow @click-left="goBack" />
    <div class="vip-content">
      <div class="head">
        <div class="vip-hero">
          <div class="vip-badge">VIP：{{ levelName }}</div>
          <!-- 未注册会员：显示开通按钮 -->
          <div v-if="!isVipRegistered" class="vip-register">
            <p class="register-tip">您还不是会员，开通即可享受专属特权</p>
            <van-button type="primary" round block @click="registerVip">开通会员</van-button>
          </div>
          <!-- 已注册会员：显示等级进度条 -->
          <div v-else class="vip-level-list">
            <div class="line-box">
              <div class="line-wrapper">
                <div class="active-line" :style="{ width: linestate + '%' }"></div>
              </div>
              <div class="state-box">
                <div
                  class="state"
                  :class="index <= state ? 'activestate' : ''"
                  v-for="(item, index) in 4"
                  :key="index"
                ></div>
              </div>
            </div>
            <div class="state-text">
              <div
                class="text"
                :class="index <= state ? 'activetext' : ''"
                v-for="(item, index) in 4"
                :key="index"
              >
                Lv.{{ index + 1 }}
              </div>
            </div>
          </div>
        </div>
        <div class="level-point">
          <span class="vip-next" v-if="isVipRegistered && state < 3">距 {{ nextLevelName }} 还差 {{ nextLevelNeed }} 积分</span>
        </div>
      </div>
      <div class="body">
        <span class="body-title">积分专区</span>
          <div class="list-item" @click="goToCoupon">
            <span class="coupon">优惠券兑换</span>
            <span>></span>
          </div>
        <div class="list-item" @click="goToGift">
          <span class="gift">礼品兑换</span>
          <span>></span>
        </div>
        <div class="list-item" @click="goToPointsDetail">
          <span class="point-list">积分明细</span>
          <span>></span>
        </div>
        <div class="list-item" @click="showPointsInfo = true">
          <span class="point-message">积分说明</span>
          <span>></span>
        </div>
      </div>
    </div>
    <van-popup
      v-model:show="showPointsInfo"
      position="center"
      class="pointsinfo-popup"
      duration="0.5"
      round
      closeable
    >
      <div class="pointsinfo">
        <div class="title"><h2>积分详情说明</h2></div>
        <div class="body">
          本积分仅作为优惠券或礼品兑换等方式消费，不提供现金兑换，退还操作。积分由用户日常在购物时产生积攒，即每单订单支付后，根据订单支付金额，系统对用户发放对应的积分，比例为1：1
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import store, {getLevelByPoints} from "@/store/index.js";

const router = useRouter()
const goBack = () => router.go(-1)
const isVipRegistered = computed(() => store.state.userInfo?.isVip === true)
const showPointsInfo = ref(false)
const registerVip = () => {
  store.commit('UPDATE_USER_INFO', { isVip: true, points: 0 })
  Toast.success('恭喜您已开通会员，等级：青铜会员')
}
const levelName = computed(() => {
  if (!store.state.userInfo) return '还未注册'
  if (store.state.userInfo.isVip !== true) return '还未注册'
  return getLevelByPoints(points.value).name
})
const state = computed(() => getLevelByPoints(points.value).index ?? -1)
const levelCount = 4
const points = computed(() => store.state.userInfo?.levelPoints || 0)
const availablePoints = computed(() => store.state.userInfo?.availablePoints || 0)
const linestate = computed(() => {
  if (state.value < 0) return 0
  if (state.value === 0) return 8
  return (state.value / (levelCount - 1)) * 100
})
const LEVELS = [
  { name: '青铜会员', min: 0,    max: 500,      index: 0 },
  { name: '白银会员', min: 500,  max: 1500,     index: 1 },
  { name: '黄金会员', min: 1500, max: 3000,     index: 2 },
  { name: '钻石会员', min: 3000, max: Infinity, index: 3 }
]
const currentLevel = computed(() => getLevelByPoints(points.value))
const nextLevelName = computed(() => LEVELS[currentLevel.value.index + 1]?.name || '')
const nextLevelNeed = computed(() => currentLevel.value.max - points.value)
const goToCoupon = () => {
  if(!isVipRegistered.value){
    Toast.fail('您还不是会员，请先开通会员')
    return
  }
  router.push('/coupon-exchange')
}
const goToGift = () => {
  if(!isVipRegistered.value){
    Toast.fail('您还不是会员，请先开通会员')
    return
  }
  Toast.fail('礼品兑换即将上线')
}
const goToPointsDetail = () => {
  router.push('/points-detail')
}
</script>

<style scoped>
.vip-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.vip-content {
  padding: 12px 8px;
}

.head {
  background: linear-gradient(180deg, #1c1c2b 0%, #2a2a45 100%);
  border-radius: 16px;
  padding: 24px 16px 32px;
  color: #fff;
}
.vip-hero {
  text-align: center;
}

.vip-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f7d774, #e0b94a);
  color: #1c1c2b;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 32px;
}

/* 未注册会员开通卡片 */
.vip-register {
  padding: 24px 16px 8px;
}
.vip-next{
  padding:18px;
}
.register-tip {
  margin: 0 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 1.6;
}

.vip-level-list {
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
}

.line-box {
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
}

.line-wrapper {
  position: absolute;
  top: 50%;
  left: -15px;
  right: -15px;
  height: 2px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1px;
}
.active-line {
  height: 100%;
  background:#e67320;
  border-radius: 1px;
  transition: width 0.3s ease;
}

.state-box {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 1;
}
.state {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 3px #1c1c2b;
  transition: background 0.3s ease;
}
.state.activestate {
  background: #e67320;
}

.state-text {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
.text {
  width: 30px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
.text.activetext {
  color: #e67320;
  font-weight: 600;
}
.body {
  background: white;
  margin: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.body-title {
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
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
/* 积分详情弹窗：控制整体宽度和定位 */
.pointsinfo-popup {
  width: 85%;
  max-width: 360px;
}

/* 弹窗内容容器 */
.pointsinfo {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 标题区：金色渐变与 VIP 徽章风格保持一致 */
.pointsinfo .title {
  padding: 20px 16px 14px;
  color: #1c1c2b;
}
.pointsinfo .title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
}
.pointsinfo .body {
  padding: 20px 20px 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  text-align: justify;
  text-indent: 2em;
}
</style>
