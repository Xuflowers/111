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
          <div class="order-countDown"  v-if="order.status==='pending_payment' && getRemaining(order.id) !== null">
            <span class="countdown">剩余{{ formattedCountdown(getRemaining(order.id)) }}</span>
          </div>
          </div>
        <!-- 商品列表 -->
        <div class="order-products">
          <div class="products-card first-product" @click="toggleOrder(order.id)">
            <div v-for="(product, index) in order.products" :key="product.id" class="product-card" v-show="index === 0 ">
              <img :src="getProductImage(product)" class="product-thumb" />
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

          <div class="products-card-others-product" @click="toggleOrder(order.id)" :class="{'is-collapsed': !expandedOrders.has(order.id)}" :ref="(el) => setCollapseRef(el, order.id)" :style="{ maxHeight: getCollapseHeight(order.id) }">
            <div class="others-product">
              <div v-for="product in order.products.slice(1)"
                :key="product.id"
                class="product-card"
              >
                <img :src="getProductImage(product)" class="product-thumb">
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
            <div v-if="!expandedOrders.has(order.id) && order.products.length > 1" class="collapse-mask"></div>
            <span class="expand-hint" @click.stop="toggleOrder(order.id)">
              <Transition name="hint-fade" mode="out-in">
                <span :key="expandedOrders.has(order.id) ? 'collapse' : 'expand'">
                  {{ expandedOrders.has(order.id) ? '收起▲' : `剩余${order.products.length - 1}件商品，点击展开▼` }}
                </span>
              </Transition>
            </span>
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
            <!-- 取消订单按钮：仅待付款状态时显示 -->
            <van-button
                v-if="order.status === 'pending_payment'"
                size="small"
                type="warning"
                plain
                @click="cancelOrder(order)"
            >
              取消订单
            </van-button>
            <!-- 申请售后按钮：非待付款且非售后状态时显示 -->
            <van-button
                v-if="order.status !== 'pending_payment' && order.status !== 'refund' && order.status !== 'overtime' && order.status !== 'cancelled'"
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
import { ref, nextTick, watch } from 'vue'
import { useStore } from "vuex";
import store from "@/store/index.js";
const props = defineProps({
  orders: Array,    // 当前 Tab 下要展示的订单数组
  type: String      // 订单类型（保留字段）
})

// ---------- 商品图片映射表（用于历史订单缺少 image 字段时的回退）----------
const productImageMap = {
  100: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20milk%20carton%20dairy%20product%20white%20background&image_size=square',
  101: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20avocado%20fruit%20on%20white%20background&image_size=square',
  102: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=durian%20fruit%20with%20thorn%20shell&image_size=square',
  103: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20cherries%20with%20green%20stem&image_size=square',
  104: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20blueberries%20in%20white%20bowl&image_size=square',
  201: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=potato%20chips%20snack%20package&image_size=square',
  202: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20bar%20dove%20brand&image_size=square',
  203: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mixed%20nuts%20in%20gift%20box&image_size=square',
  301: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=paper%20tissues%20box%20product&image_size=square',
  302: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laundry%20detergent%20bottle&image_size=square',
  303: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plastic%20storage%20box%20with%20lid&image_size=square',
  401: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beer%20bottle%20tsingtao%20brand&image_size=square',
  402: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20wine%20bottle%20cabernet&image_size=square',
  403: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20white%20liquor%20small%20bottle&image_size=square'
}

// 默认兜底图片：当商品无对应映射时使用
const DEFAULT_IMAGE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=generic%20product%20placeholder%20white%20background&image_size=square'

// 获取商品图片：优先使用订单中保存的 image，缺失时按商品 ID 回退到映射表，最终兜底默认图
const getProductImage = (product) => {
  if (product.image && product.image.startsWith('http')) {
    return product.image
  }
  return productImageMap[product.id] || DEFAULT_IMAGE
}

// 与父组件通信：分别对应支付、取消订单、确认收货、评价、申请售后、取消售后、查看详情
const emit = defineEmits(['pay', 'cancelOrder', 'confirm', 'review', 'apply', 'cancel', 'completed'])

// 订单状态 → 中文文案
const statusTextMap = {
  pending_payment: '待付款',
  pending_receipt: '待收货',
  review: '待评价',
  refund: '待处理',
  completed: '已完成',
  overtime: '已过期',
  cancelled:'已取消',
}

// 订单状态 → 主要按钮文案
const actionTextMap = {
  pending_payment: '去支付',
  pending_receipt: '确认收货',
  review: '去评价',
  refund: '查看详情',
  completed: '查看详情',
  overtime:'查看详情',
  cancelled:'查看详情'
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
  else if (status === 'overtime') emit('completed',order)
  else if (status === 'cancelled') emit('completed',order)
}

// 取消订单（待付款时）
const cancelOrder = (order) => {
  emit('cancelOrder', order)
}

// 申请售后
const applyRefund = (order) => {
  emit('apply', order)
}

// 取消售后
const cancelRefund = (order) => {
  emit('cancel', order)
}
//订单折叠
const expandedOrders = ref(new Set())
const collapseHeights = ref({})
const collapseRefs = {}

// 函数式 ref：为每个订单收集 DOM 元素引用
const setCollapseRef = (el, orderId) => {
  if (el) {
    collapseRefs[orderId] = el
  } else {
    delete collapseRefs[orderId]
  }
}

const getCollapseHeight = (orderId) => {
  return collapseHeights.value[orderId] || '50px'
}

const updateCollapseHeight = async (orderId) => {
  await nextTick()
  const el = collapseRefs[orderId]
  if (!el) return
  if (expandedOrders.value.has(orderId)) {
    collapseHeights.value[orderId] = el.scrollHeight + 'px'
  } else {
    collapseHeights.value[orderId] = '50px'
  }
}

const toggleOrder = async (orderId) => {
  const next = new Set(expandedOrders.value)
  next.has(orderId) ? next.delete(orderId) : next.add(orderId)
  expandedOrders.value = next
  await updateCollapseHeight(orderId)
}

const getRemaining = (orderId) => {
  return store.getters.getRemaining(orderId)
}

const  formattedCountdown = (seconds) => {
  if(seconds === null || seconds === undefined) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
// 切换 Tab 时重置折叠状态和高度缓存
watch(() => props.orders, () => {
  expandedOrders.value = new Set()
  collapseHeights.value = {}
  Object.keys(collapseRefs).forEach(k => delete collapseRefs[k])
})

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
.order-products .van-button{
  width: 100%;
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
  margin-bottom: 10px;
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
  background-color: white;
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
.order-countDown{
  font-size: 10px;
  color: #ee0a24;
  margin-top: auto;
}
.order-status{
  display: flex !important;
  margin-left: 15% !important;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px solid #f5f5f5;
}
.order-footer .total{
  font-size: 12px;
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
.first-product{
  cursor: pointer;
}
.products-card-others-product{
  max-height: 2000px;
  position: relative;
  overflow: hidden;
  transition: max-height 0.8s ease;
}
.products-card-others-product.is-collapsed{
  max-height: 50px;
}
.collapse-mask{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgb(255,255,255,0.9));
  display:flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 120px;
  pointer-events: none;
}
.expand-hint{
  width: 160px;
  position: absolute;
  bottom: 0%;
  left: 20%;
  color: #666;
  padding: 4px 20px;
  font-size: 13px;
  text-align: center;
  pointer-events: auto;
  cursor: pointer;
  white-space: nowrap;
}
.expand-hint:active{
  opacity: 0.7;
}
.hint-fade-enter-active,
.hint-fade-leave-active{
  transition: opacity 0.5s ease;
}
.hint-fade-enter-from,
.hint-fade-leave-to{
  opacity: 0;
}
</style>