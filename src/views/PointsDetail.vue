<template>
  <div class="points-detail-page">
    <van-nav-bar title="积分明细" left-arrow @click-left="goBack"/>
    <div class="points-card">
      <div class="label">剩余可用积分</div>
      <div class="value">{{ availablePoints }}</div>
    </div>
    <div class="records-list">
      <van-empty class="empty" v-if="records.length === 0">暂无记录</van-empty>
      <div v-for="r in records" :key="r.id" class="record-item">
        <div class="icon" :class="r.type">{{ r.type === 'earn' ? '+' : '-' }}</div>
        <div class="content">
          <div class="title">{{ sourceText(r) }}</div>
          <div class="time">{{ formatTime(r.time) }}</div>
        </div>
        <div class="amount" :class="r.type">{{ r.type === 'earn' ? '+' : '-' }}{{r.amount}}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {computed} from "vue";
  import {useStore} from "vuex";
  import {useRouter} from "vue-router";

  const router = useRouter()
  const store = useStore()
  const goBack = () => router.go(-1)
  const availablePoints = computed(() => store.state.userInfo?.availablePoints || 0)
  const records = computed(() => store.state.userInfo?.pointsRecords || [])
  const sourceText = (r) => {
    if (r.type === 'earn') {
      return r.source === 'order' ? '订单支付获得积分' : '积分增加'
    }
    if (r.type === 'spend') {
      if (r.source === 'coupon') return `兑换优惠券${r.itemName ? '·' + r.itemName : ''}`
      if (r.source === 'gift') return `兑换礼品${r.itemName ? '·' + r.itemName : ''}`
      return '消耗积分'
    }
    return '积分变动'
  }
  const formatTime = (time) => {
    if (!time)
      return ''
    const d =new Date(time)
    const pad = (n) => String(n).padStart(2,'0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
</script>

<style scoped>
.points-detail-page {
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
  color: rgba(255,255,255,0.7);
  letter-spacing: 1px;
}
.points-card .value {
  font-size: 22px;
  font-weight: 700;
  color: #f7d774;
}

.records-list {
  padding: 4px 12px 24px;
}
.records-list .empty {
  text-align: center;
  color: #969799;
  padding: 60px 0;
  font-size: 14px;
}
.record-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.record-item .icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  margin-right: 12px;
  flex-shrink: 0;
}
.record-item .icon.earn {
  background: rgba(7,193,96,0.1); color: #07c160;
}
.record-item .icon.spend {
  background: rgba(238,101,35,0.1);
  color: #ee6523;
}
.record-item .content {
  flex: 1;
  min-width: 0;
}
.record-item .content .title {
  font-size: 14px;
  color: #323233;
  font-weight: 500;
  margin-bottom: 4px;
}
.record-item .content .time {
  font-size: 12px;
  color: #969799;
}
.record-item .amount {
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0; }
.record-item .amount.earn {
  color: #07c160;
}
.record-item .amount.spend {
  color: #ee6523;
}
</style>