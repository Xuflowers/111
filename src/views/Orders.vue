<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="goBack" />
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部" name="all">
        <OrderList :orders="allOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" />
      </van-tab>
      <van-tab title="待付款" name="pending_payment">
        <OrderList :orders="pendingPaymentOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" />
      </van-tab>
      <van-tab title="待收货" name="pending_receipt">
        <OrderList :orders="pendingReceiptOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" />
      </van-tab>
      <van-tab title="待评价" name="review">
        <OrderList :orders="reviewOrders" @pay="handlePay" @confirm="handleConfirm" @review="handleReview" @apply="handleApply" />
      </van-tab>
      <van-tab title="退货/售后" name="refund">
        <OrderList :orders="refundOrders" @apply="handleApply" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast, Dialog } from 'vant'
import OrderList from '@/components/OrderList.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const activeTab = ref('all')

const allOrders = computed(() => store.getters.allOrders)
const pendingPaymentOrders = computed(() => store.getters.pendingPaymentOrders)
const pendingReceiptOrders = computed(() => store.getters.pendingReceiptOrders)
const reviewOrders = computed(() => store.getters.reviewOrders)
const refundOrders = computed(() => store.getters.refundOrders)

const onTabChange = (name) => {
  activeTab.value = name
}

const handlePay = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'pending_receipt',
    extra: { payTime: new Date().toISOString() }
  })
  Toast('支付成功，商品将尽快发货')
}

const handleConfirm = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'review',
    extra: { finishTime: new Date().toISOString() }
  })
  Toast('已确认收货，欢迎评价')
}

const handleReview = (order) => {
  store.dispatch('updateOrderStatus', {
    orderId: order.id,
    status: 'completed',
    extra: { reviewTime: new Date().toISOString() }
  })
  Toast('感谢您的评价')
}

const handleApply = async (order) => {
  // 如果已经是售后状态，可跳转详情（此处仅提示）
  if (order.status === 'refund') {
    Toast('查看售后详情')
    return
  }
  const { value: reason } = await Dialog.prompt({
    title: '申请售后',
    message: '请填写售后原因',
    placeholder: '例如：商品破损、发错货等',
    confirmButtonText: '提交申请',
    cancelButtonText: '取消'
  })
  if (reason && reason.trim()) {
    // 调用更新状态为 refund
    await store.dispatch('updateOrderStatus', {
      orderId: order.id,
      status: 'refund',
      extra: {
        refundReason: reason.trim(),
        refundTime: new Date().toISOString(),
        previousStatus: order.status
      }
    })
    Toast('售后申请已提交，客服将尽快处理')
    // 可选：自动切换到“退货/售后”标签页
    activeTab.value = 'refund'
  } else if (reason === '') {
    Toast('请填写售后原因')
  }
}

const goBack = () => router.go(-1)

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