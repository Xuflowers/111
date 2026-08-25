<template>
  <!-- 售后详情页：展示售后申请信息、商品、退款金额、处理进度等 -->
  <div class="refund-detail">
    <van-nav-bar title="售后详情" left-arrow @click-left="goBack" />

    <!-- 顶部状态展示 -->
    <div class="refund-status" :class="orderRefundStatus">
      <div class="status-icon">
        <van-icon name="service-o" size="48" />
      </div>
      <div class="status-text">{{ refundStatusText }}</div>
    </div>

    <!-- 售后基本信息 -->
    <van-cell-group inset>
      <van-cell title="售后类型" :value="refundTypeText" />
      <van-cell title="申请时间" :value="formatTime(order.extra?.refundTime)" />
      <van-cell title="售后原因" :value="order.extra?.refundReason || '用户申请售后'" />
      <van-cell title="订单编号" :value="order.id" label="点击复制" @click="copyOrderId" />
    </van-cell-group>

    <!-- 商品信息 -->
    <van-cell-group inset>
      <van-cell title="商品信息" />
      <div v-for="product in order.products" :key="product.id" class="product-info">
        <img :src="getProductImage(product)" class="product-image" />
        <div class="product-detail">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">¥{{ (product.price / 100).toFixed(2) }}</div>
          <div class="product-count">数量：{{ product.count }}</div>
        </div>
      </div>
    </van-cell-group>

    <!-- 退款金额 -->
    <van-cell-group inset>
      <van-cell title="退款金额" :value="'¥' + totalAmount" />
    </van-cell-group>

    <!-- 处理进度：4 个步骤，根据 refundStep 高亮当前进度 -->
    <van-cell-group inset>
      <van-cell title="处理进度">
        <template #right-icon>
          <div class="progress-list">
            <div class="progress-item" :class="{ active: refundStep >= 1 }">
              <div class="progress-dot"></div>
              <div class="progress-label">申请已提交</div>
            </div>
            <div class="progress-item" :class="{ active: refundStep >= 2 }">
              <div class="progress-dot"></div>
              <div class="progress-label">商家审核中</div>
            </div>
            <div class="progress-item" :class="{ active: refundStep >= 3 }">
              <div class="progress-dot"></div>
              <div class="progress-label">审核通过</div>
            </div>
            <div class="progress-item" :class="{ active: refundStep >= 4 }">
              <div class="progress-dot"></div>
              <div class="progress-label">退款成功</div>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 售后备注 -->
    <van-cell-group inset>
      <van-cell title="售后备注" :value="order.extra?.refundRemark || '无'" />
    </van-cell-group>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <van-button v-if="order.status === 'refund'" type="primary" block @click="cancelRefund">取消售后</van-button>
      <van-button v-else type="default" block @click="goBack">返回订单列表</van-button>
    </div>
  </div>
</template>

<script setup>
// 售后详情页：根据订单 id 从 store 中读取订单信息并展示
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast, Dialog } from 'vant'

const route = useRoute()
const router = useRouter()
const store = useStore()

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

// 默认兜底图片
const DEFAULT_IMAGE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=generic%20product%20placeholder%20white%20background&image_size=square'

// 获取商品图片：优先使用订单中保存的 image，缺失时按商品 ID 回退到映射表，最终兜底默认图
const getProductImage = (product) => {
  if (product.image && product.image.startsWith('http')) {
    return product.image
  }
  return productImageMap[product.id] || DEFAULT_IMAGE
}

// 从 store 中读取订单列表（注意字段名为 orderList）
const order = computed(() => {
  const orderId = route.params.id
  const orders = store.state.orderList   // 修复：原来是 orders
  return orders.find(o => o.id == orderId) || {}   // 使用 == 兼容数字/字符串
})

// 第一个商品（安全访问）
const firstProduct = computed(() => order.value.products?.[0] || {})

// 总金额（字段是 totalAmount）
const totalAmount = computed(() => order.value.totalAmount || '0.00')

// 售后类型文字
const refundTypeText = computed(() => {
  const type = order.value.extra?.refundType
  if (type === 'refund') return '仅退款'
  if (type === 'return') return '退货退款'
  return '退货退款'   // 默认
})

// 售后状态样式类（与订单详情保持一致：refund→紫色卡片，completed→绿色卡片）
const orderRefundStatus = computed(() => {
  return order.value.status === 'refund' ? 'status-refund' : 'status-completed'
})

// 售后状态文案
const refundStatusText = computed(() => {
  const status = order.value.status
  if (status === 'refund') return '待处理'
  if (status === 'completed') return '已完成'
  return '未知状态'
})

// 处理进度步骤（1~4）
const refundStep = computed(() => {
  const status = order.value.status
  if (status === 'refund') return 2
  if (status === 'completed') return 4
  return 1
})

// 时间格式化：ISO 字符串 → YYYY-MM-DD HH:mm
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 复制订单号到剪贴板
const copyOrderId = () => {
  if (order.value.id) {
    navigator.clipboard.writeText(order.value.id)
    Toast.success('已复制')
  }
}

// 取消售后：二次确认后恢复订单到售后前状态，更新退款记录，并跳转回订单列表
const cancelRefund = () => {
  Dialog.confirm({message: '确定要取消售后申请吗？'}).then(async () => {
    await store.dispatch('updateOrderStatus', {
      orderId: order.value.id,
      status: order.value.extra?.previousStatus || 'completed',
      extra: { refundStatus: 'cancelled' }
    })
    const refundRecord = store.state.refundRecords.find(r => r.orderId == order.value.id)
    if (refundRecord) {
      await store.dispatch('updateRefundStatus', {
        refundId: refundRecord.refundId,
        status: 'cancelled'
      })
    }
    Toast.success('已取消售后')
    router.push('/orders')
  }).catch(() => {})
}

const goBack = () => router.go(-1)
</script>

<style scoped>
/* 与之前相同，保留样式 */
.refund-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}
/* 顶部状态卡片（与订单详情样式一致） */
.refund-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
}
/* 售后中：紫色渐变 + 卡片式布局 */
.status-refund {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 80%;
  max-width: 360px;
  padding: 20px;
  margin-left: 5%;
  border-radius: 8px;
  margin-top: 10px;
}
/* 已完成：绿色渐变 + 卡片式布局 */
.status-completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  width: 80%;
  max-width: 360px;
  padding: 20px;
  margin-left: 5%;
  border-radius: 8px;
  margin-top: 10px;
}
.status-icon { margin-bottom: 10px; }
.status-text { font-size: 18px; font-weight: bold; }
.product-info {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.product-info:last-child {
  border-bottom: none;
}
.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
}
.product-detail {
  flex: 1;
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
.product-price {
  font-size: 14px;
  color: #ee0a24;
  font-weight: bold;
}
.product-count {
  font-size: 12px;
  color: #969799;
}
.progress-list {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ebedf0;
  margin-bottom: 4px;
}
.progress-item.active .progress-dot {
  background-color: #667eea;
}
.progress-label {
  font-size: 10px;
  color: #969799;
}
.progress-item.active .progress-label {
  color: #667eea;
}
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 320px;
  padding: 8px 8px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background-color: white;
  border-top: 1px solid #ebedf0;
  border-radius: 8px;
}
</style>