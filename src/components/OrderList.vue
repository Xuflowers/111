<template>
  <div class="order-list">
    <van-empty v-if="orders.length === 0" description="暂无订单" />
    <div v-else class="order-cards">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号：{{ order.id }}</span>
          <span class="order-status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-products">
          <van-card
              v-for="product in order.products"
              :key="product.id"
              :thumb="product.image"
              :title="product.name"
              :price="(product.price / 100).toFixed(2)"
              :num="product.count"
              :desc="`单价：¥${(product.price / 100).toFixed(2)}`"
          />
        </div>
        <div class="order-footer">
          <span class="total">实付：¥{{ order.totalAmount }}</span>
          <div class="action-buttons">
            <!-- 主要操作按钮 -->
            <van-button size="small" type="primary" @click="handleOrderAction(order)">
              {{ getActionText(order.status) }}
            </van-button>
            <!-- 申请售后按钮：非待付款且非售后状态时显示 -->
            <van-button
                v-if="order.status !== 'pending_payment' && order.status !== 'refund'"
                size="small"
                type="warning"
                plain
                @click="applyRefund(order)"
            >
              申请售后
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  orders: Array,
  type: String
})

const emit = defineEmits(['pay', 'confirm', 'review', 'apply'])

const statusTextMap = {
  pending_payment: '待付款',
  pending_receipt: '待收货',
  review: '待评价',
  refund: '退货/售后',
  completed: '已完成'
}

const actionTextMap = {
  pending_payment: '去支付',
  pending_receipt: '确认收货',
  review: '去评价',
  refund: '查看详情'
}

const getStatusText = (status) => statusTextMap[status] || ''
const getActionText = (status) => actionTextMap[status] || '查看详情'

const handleOrderAction = (order) => {
  const status = order.status
  if (status === 'pending_payment') emit('pay', order)
  else if (status === 'pending_receipt') emit('confirm', order)
  else if (status === 'review') emit('review', order)
  else if (status === 'refund') emit('apply', order)  // 查看售后详情
}

const applyRefund = (order) => {
  emit('apply', order)
}
</script>

<style scoped>
.order-list {
  padding: 12px;
}
.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}
.order-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #666;
}
.order-no {
  font-weight: 500;
}
.order-status {
  color: #ee0a24;
}
.order-products .van-card {
  margin: 0;
  background: white;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px solid #f5f5f5;
}
.total {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
</style>