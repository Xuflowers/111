<template>
  <div class="completed-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="goBack" />

    <div class="completed-status" :class="orderStatusClass">
      <div class="status-icon">
        <van-icon :name="statusIcon" size="48" />
      </div>
      <div class="status-text">{{ orderStatusText }}</div>
    </div>

    <van-cell-group inset>
      <van-cell title="商家名称" value="精选旗舰店" />
    </van-cell-group>

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

    <van-cell-group inset>
      <van-cell title="下单时间" :value="formatTime(order.createTime)" />
      <van-cell v-if="order.extra?.payTime" title="支付时间" :value="formatTime(order.extra.payTime)" />
      <van-cell v-if="order.extra?.reviewTime" title="评价时间" :value="formatTime(order.extra.reviewTime)" />
      <van-cell title="订单编号" :value="order.id" label="点击复制" @click="copyOrderId" />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="订单金额" :value="'¥' + totalAmount" />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="订单备注" :value="order.remark || '用户未填写'" />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="支付方式" value="在线支付" v-if="order.status === 'completed' || order.status === 'refund'"/>
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="物流公司" value="顺丰速运" v-if="order.status === 'completed' || order.status === 'refund'"/>
    </van-cell-group>

    <div class="bottom-actions">
      <van-button v-if="order.status === 'refund'" type="warning" block @click="cancelRefund">取消售后</van-button>
      <van-button v-else type="default" block @click="goBack">返回订单列表</van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { NavBar, Cell, CellGroup, Button, Icon, Toast, Dialog } from 'vant'

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

const order = computed(() => {
  const orderId = route.params.id
  const orders = store.state.orderList
  return orders.find(o => o.id == orderId) || {}
})

const totalAmount = computed(() => order.value.totalAmount || '0.00')

const orderStatusText = computed(() => {
  const status = order.value.status
  if (status === 'pending_payment') return '待付款'
  if (status === 'pending_receipt') return '待发货'
  if (status === 'review') return '待评价'
  if (status === 'refund') return '售后中'
  if (status === 'completed') return '已完成'
  if (status === 'cancelled') return '已取消'
  if (status === 'overtime') return '已超时'
  return '未知状态'
})

const orderStatusClass = computed(() => {
  const status = order.value.status
  if (status === 'pending_payment') return 'status-pending'
  if (status === 'refund') return 'status-refund'
  if (status === 'cancelled') return 'status-cancelled'
  if (status === 'overtime') return 'status-overtime'
  return 'status-completed'
})

const statusIcon = computed(() => {
  const status = order.value.status
  if (status === 'pending_payment') return 'balance-o'
  if (status === 'pending_receipt') return 'logistics'
  if (status === 'review') return 'edit'
  if (status === 'refund') return 'service-circle-o'
  if (status === 'cancelled') return 'close'
  if (status === 'overtime') return 'clock-o'
  return 'passed'
})

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const copyOrderId = () => {
  if (order.value.id) {
    navigator.clipboard.writeText(order.value.id)
    Toast.success('已复制')
  }
}

const cancelRefund = () => {
  Dialog.confirm({ message: '确定要取消售后申请吗？' }).then(async () => {
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
    router.push('/all')
  }).catch(() => {})
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.completed-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}
.completed-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
}
.status-pending {
  background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
}
.status-refund {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 80%;
  max-width: 360px;
  padding: 20px;
  margin-left: 5%;
  border-radius: 8px;
  margin-top: 10px;
}
.status-completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  width: 80%;
  max-width: 360px;
  padding: 20px;
  margin-left: 5%;
  border-radius: 8px;
  margin-top: 10px;
}
.status-cancelled {
  background: linear-gradient(135deg, #f32d4f 0%, #ea9550 100%);
  width: 80%;
  max-width: 360px;
  padding: 20px;
  margin-left: 5%;
  border-radius: 8px;
  margin-top: 10px;
}
.status-overtime {
  background: linear-gradient(135deg, #817e7e 0%, #cac9c9 100%);
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
