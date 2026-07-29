<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="goBack" />
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部" name="all">
        <OrderList :orders="allOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" @cancel="handleCancelRefund" @completed="handleViewDetail"/>
      </van-tab>
      <van-tab title="待付款" name="pending_payment">
        <OrderList :orders="pendingPaymentOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" @cancel="handleCancelRefund" @completed="handleViewDetail"/>
      </van-tab>
      <van-tab title="待收货" name="pending_receipt">
        <OrderList :orders="pendingReceiptOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" @cancel="handleCancelRefund" @completed="handleViewDetail"/>
      </van-tab>
      <van-tab title="待评价" name="review">
        <OrderList :orders="reviewOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" @cancel="handleCancelRefund" @completed="handleViewDetail"/>
      </van-tab>
      <van-tab title="退货/售后" name="refund">
        <OrderList :orders="refundOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" @cancel="handleCancelRefund" @completed="handleViewDetail"/>
      </van-tab>
    </van-tabs>
    
    <RefundDialog 
      :visible="showRefundDialog" 
      :order="currentOrder"
      @close="showRefundDialog = false"
      @submit="handleRefundSubmit"
    />
  </div>
</template>

<script setup>
// 订单页：使用 Tabs 切换"全部/待付款/待收货/待评价/售后"列表，并承载售后弹层
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'
import OrderList from '@/components/OrderList.vue'
import RefundDialog from '@/components/RefundDialog.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const activeTab = ref('all')               // 当前激活的 Tab
const showRefundDialog = ref(false)        // 是否显示售后申请弹层
const currentOrder = ref({})               // 当前操作售后申请的订单

// 通过 getters 计算各 Tab 下的订单列表
const allOrders = computed(() => store.getters.allOrders)
const pendingPaymentOrders = computed(() => store.getters.pendingPaymentOrders)
const pendingReceiptOrders = computed(() => store.getters.pendingReceiptOrders)
const reviewOrders = computed(() => store.getters.reviewOrders)
const refundOrders = computed(() => store.getters.refundOrders)

// Tab 切换回调
const onTabChange = (name) => {
  activeTab.value = name
}

// 支付：将订单状态从"待付款"改为"待收货"
const handlePay = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'pending_receipt',
    extra: { payTime: new Date().toISOString() }
  })
  Toast('支付成功，商品将尽快发货')
}

// 确认收货：将订单状态从"待收货"改为"待评价"
const handleConfirm = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'review',
    extra: { finishTime: new Date().toISOString() }
  })
  Toast('已确认收货，欢迎评价')
}

// 评价完成：将订单状态改为"已完成"
const handleReview = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'completed',
    extra: { reviewTime: new Date().toISOString() }
  })
  Toast('感谢您的评价')
}

// 申请售后：仅允许已付款的订单申请售后
const handleApply = async (order) => {
  if (order.status === 'refund') {
    router.push(`/refund/${order.id}`)
    return
  }
  if (order.status === 'pending_payment') {
    Toast('请先完成支付再申请售后')
    return
  }
  currentOrder.value = order
  showRefundDialog.value = true
}

// 查看订单详情：已完成订单跳转到订单详情页
const handleViewDetail = async (order) => {
  if (order.status === 'completed') {
    router.push(`/detail/${order.id}`)
    return
  }
}

// 售后申请提交回调：更新订单状态并创建售后记录
const handleRefundSubmit = async (data) => {
  await store.dispatch('updateOrderStatus', {
    orderId: currentOrder.value.id,
    status: 'refund',
    extra: {
      refundReason: data.reason,
      refundDescription: data.description,
      refundType: data.refundType,
      refundTime: new Date().toISOString(),
      previousStatus: currentOrder.value.status   // 记录售后前状态，便于取消时恢复
    }
  })

  await store.dispatch('createRefundRecord', {
    orderId: currentOrder.value.id,
    order: currentOrder.value,
    refundType: data.refundType,
    reason: data.reason,
    description: data.description,
    amount: currentOrder.value.totalAmount
  })

  showRefundDialog.value = false
  Toast.success('售后申请已提交，客服将尽快处理')
  activeTab.value = 'refund'    // 自动切换到售后 Tab
}

// 取消售后：恢复订单到售后前的状态，同时更新退款记录状态
const handleCancelRefund = async (order) => {
  await store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: order.extra?.previousStatus || 'completed',
    extra: {
      refundStatus: 'cancelled'
    }
  })
  const refundRecord = store.state.refundRecords.find(r => r.orderId == order.id)
  if (refundRecord) {
    await store.dispatch('updateRefundStatus', {
      refundId: refundRecord.refundId,
      status: 'cancelled'
    })
  }
  Toast.success('已取消售后')
}

// 返回上一页
const goBack = () => router.go(-1)

// 挂载时根据 URL query 参数自动激活对应 Tab
onMounted(() => {
  const status = route.query.status
  if (status === 'pending-payment') activeTab.value = 'pending_payment'
  else if (status === 'pending-receipt') activeTab.value = 'pending_receipt'
  else if (status === 'review') activeTab.value = 'review'
  else if (status === 'refund') activeTab.value = 'refund'
  else activeTab.value = 'all'
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>