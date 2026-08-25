<template>
  <div class="coupon-page">
    <van-nav-bar title="优惠券兑换" left-arrow @click-left="goBack" />

    <!-- 可用积分卡片 -->
    <div class="points-card">
      <div class="label">可用积分</div>
      <div class="value">{{ availablePoints }}</div>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupon-list">
      <div v-if="!coupons || coupons.length === 0" class="empty">暂无可兑换的优惠券</div>
      <div v-for="c in coupons" :key="c.id" class="coupon-item">
        <div class="coupon-body">
          <div class="info">
            <div class="name">{{ c.name }}</div>
            <div class="desc">{{ c.desc }}</div>
          </div>
          <div class="action">
            <div class="cost">{{ c.cost }} 积分</div>
            <van-button
              size="small"
              type="primary"
              :disabled="availablePoints < c.cost"
              @click="exchange(c)"
            >兑换</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'

const router = useRouter()
const store = useStore()
const goBack = () => router.go(-1)

const availablePoints = computed(() => store.state.userInfo?.availablePoints || 0)
const coupons = computed(() => store.state.couponList || [])

const exchange = (c) => {
  if (availablePoints.value < c.cost){
    Toast.fail ('积分不足')
    return
  }
  Dialog.confirm({
    title:'是否确认兑换',
    message:`将消耗${c.cost}积分兑换${c.name}?`
  }).then(async () => {
      try{
        await store.dispatch('exchangeCoupons',{
          couponTemplate:{
            name: c.name,
            type: c.type,
            discountRate: c.discountRate,
            value: (c.discount || 0) * 100,
            threshold: (c.threshold || 0) * 100,
            condition: c.desc || c.condition || '无门槛',
            valueDesc: c.valueDesc,   // 透传券左侧显示文本
            unitDesc: c.unitDesc
          },
          cost: c.cost,
          itemId: c.id,
          itemName: c.name
        })
        Toast.success('兑换成功')
      }catch (error){
        Toast.fail(error.message || '兑换失败')
      }
    }).catch(() => {})
  }

</script>

<style scoped>
.coupon-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.points-card {
  margin: 12px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #1c1c2b 0%, #2a2a45 100%);
  border-radius: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(28, 28, 43, 0.15);
}
.points-card .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
}
.points-card .value {
  font-size: 28px;
  font-weight: 700;
  color: #f7d774;
  letter-spacing: 1px;
}
.coupon-list {
  padding: 4px 12px 24px;
}
.coupon-list .empty {
  text-align: center;
  color: #969799;
  padding: 60px 0;
  font-size: 14px;
}
.coupon-item {
  position: relative;
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.coupon-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: relative;
}
.coupon-body::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 60%;
  border-left: 1px dashed #dcdee0;
}

.coupon-body .info {
  flex: 1;
  min-width: 0;
}
.coupon-body .info .name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 6px;
}
.coupon-body .info .desc {
  font-size: 12px;
  color: #969799;
  line-height: 1.4;
}
.coupon-body .action {
  gap: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-left: 16px;
  min-width: 80px;
}
.coupon-body .action .cost {
  font-size: 13px;
  color: #e67320;
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
}
.coupon-body .action .van-button {
  --van-button-mini-padding: 0 12px;
  --van-button-mini-font-size: 12px;
}
.coupon-body .action .van-button--disabled {
  opacity: 0.5;
}
</style>
