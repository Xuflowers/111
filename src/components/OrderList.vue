<template>
  <!-- 订单列表组件：根据父组件传入的订单数组渲染订单卡片列表 -->
  <div class="order-list">
    <!-- 空状态 -->
    <van-empty v-if="orders.length === 0" description="暂无订单" />
    <div v-else class="order-cards">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <!-- 订单头部：订单号 + 状态 -->
        <div class="order-header">
          <span class="order-no">订单号：{{ order.id }}</span>
          <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
        </div>
        <!-- 商品列表 -->
        <div class="order-products">
          <div v-for="product in order.products" :key="product.id" class="product-card">
            <img :src="product.image" class="product-thumb" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-desc">单价：¥{{ (product.price / 100).toFixed(2) }}</div>
              <div class="product-footer">
                <span class="product-price">¥{{ (product.price / 100).toFixed(2) }}</span>
                <span class="product-count">x{{ product.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 售后信息：仅当订单处于售后中且存在售后原因时显示 -->
        <div v-if="order.status === 'refund' && order.extra?.refundReason" class="refund-info">
          <div class="refund-reason">
            <span class="label">售后原因：</span>
            <span class="value">{{ getReasonText(order.extra.refundReason) }}</span>
          </div>
          <div v-if="order.extra?.refundDescription" class="refund-desc">
            <span class="label">问题描述：</span>
            <span class="value">{{ order.extra.refundDescription }}</span>
          </div>
        </div>

        <!-- 订单底部：实付金额 + 操作按钮 -->
        <div class="order-footer">
          <span class="total">实付：¥{{ order.totalAmount }}</span>
          <div class="action-buttons">
            <!-- 主要操作按钮：根据状态显示"去支付/确认收货/去评价/查看详情" -->
            <van-button size="small" :type="getActionType(order.status)" @click="handleOrderAction(order)">
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
            <!-- 取消售后按钮：售后待处理时显示 -->
            <van-button
                v-if="order.status === 'refund'"
                size="small"
                type="default"
                plain
                @click="cancelRefund(order)"
            >
              取消售后
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 订单列表组件：可复用于"全部/待付款/待收货/待评价/售后"等不同 Tab
const props = defineProps({
  orders: Array,    // 当前 Tab 下要展示的订单数组
  type: String      // 订单类型（保留字段）
})

// 与父组件通信：分别对应支付、确认收货、评价、申请售后、取消售后、查看详情
const emit = defineEmits(['pay', 'confirm', 'review', 'apply', 'cancel', 'completed'])

// 订单状态 → 中文文案
const statusTextMap = {
  pending_payment: '待付款',
  pending_receipt: '待收货',
  review: '待评价',
  refund: '待处理',
  completed: '已完成'
}

// 订单状态 → 主要按钮文案
const actionTextMap = {
  pending_payment: '去支付',
  pending_receipt: '确认收货',
  review: '去评价',
  refund: '查看详情',
  completed: '查看详情'
}

// 售后原因 → 中文文案
const reasonTextMap = {
  quality: '商品质量问题',
  wrong: '发错商品',
  damage: '商品破损',
  missing: '少发漏发',
  other: '其他原因'
}

// 以下为一系列工具函数：根据状态/原因返回对应文案或样式类名
const getStatusText = (status) => statusTextMap[status] || ''
const getActionText = (status) => actionTextMap[status] || '查看详情'
// 订单状态 → 主要按钮类型
const getActionType = (status) => status === 'refund' ? 'warning' : 'primary'
const getStatusClass = (status) => status === 'refund' ? 'status-refund' : ''
const getReasonText = (reason) => reasonTextMap[reason] || reason

// 主按钮点击事件：根据订单状态派发对应事件给父组件
const handleOrderAction = (order) => {
  const status = order.status
  if (status === 'pending_payment') emit('pay', order)
  else if (status === 'pending_receipt') emit('confirm', order)
  else if (status === 'review') emit('review', order)
  else if (status === 'refund') emit('apply', order)
  else if (status === 'completed') emit('completed',order)
}

// 申请售后
const applyRefund = (order) => {
  emit('apply', order)
}

// 取消售后
const cancelRefund = (order) => {
  emit('cancel', order)
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
  overflow: visible;
}
.order-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #666;
}
.order-products {
  display: flex;
  flex-direction: column;
}
.order-no {
  font-weight: 500;
}
.order-status {
  color: #ee0a24;
}
.order-status.status-refund {
  color: #667eea;
}
.product-card {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  min-height: 100px;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
}
.product-card:last-child {
  border-bottom: none;
}
.product-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-name {
  font-size: 14px;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-desc {
  font-size: 12px;
  color: #969799;
}
.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-price {
  font-size: 14px;
  color: #ee0a24;
  font-weight: bold;
}
.product-count {
  font-size: 12px;
  color: #969799;
}
.refund-info {
  padding: 10px 12px;
  background-color: #f7f8fa;
  font-size: 13px;
}
.refund-info .label {
  color: #969799;
}
.refund-info .value {
  color: #323233;
}
.refund-desc {
  margin-top: 4px;
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