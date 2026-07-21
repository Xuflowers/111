<template>
  <div class="cart-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="购物车" />

    <!-- 购物车为空时的展示 -->
    <van-empty v-if="cartItems.length === 0" description="购物车空空如也" />

    <!-- 购物车有商品时的展示 -->
    <div v-else class="cart-list">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <!-- 勾选框 -->
        <van-checkbox
            :model-value="item.checked"
            @click="toggleCheck(item.id)"
            icon-size="20px"
        />

        <!-- 商品卡片 -->
        <van-card
            :num="item.count"
            :price="(item.price / 100).toFixed(2)"
            :title="item.name"
            :thumb="item.image"
            class="cart-card"
        >
          <template #tags>
            <van-tag plain type="danger" style="margin-right: 4px;">热销</van-tag>
          </template>
          <template #num>
            <van-stepper
                v-model="item.count"
                theme="round"
                button-size="22"
                disable-input
                @change="onChange(item)"
            />
          </template>
          <template #footer>
            <van-button
                size="mini"
                type="danger"
                @click="handleDelete(item.id)"
            >
              删除
            </van-button>
          </template>
        </van-card>
      </div>
    </div>

    <!-- 底部结算栏 (修改点：添加 class="cart-submit-bar") -->
    <van-submit-bar
        class="cart-submit-bar"
        :price="totalPrice"
        :disabled="checkedCount === 0"
        :button-text="`去结算(${checkedCount})`"
        @submit="onSubmit"
    >
      <van-checkbox :model-value="allChecked" @click="toggleAll">全选</van-checkbox>
    </van-submit-bar>

    <!-- 底部导航 (保持在最底部，无需额外 class) -->
    <AppTabBar />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Dialog } from 'vant'
import AppTabBar from '@/components/AppTabBar.vue'

const store = useStore()

const cartItems = computed(() => store.getters.cartItems)
const totalPrice = computed(() => store.getters.totalPrice)
const checkedCount = computed(() => store.getters.checkedCount)

const allChecked = computed(() =>
    cartItems.value.length > 0 && cartItems.value.every(item => item.checked)
)

const toggleCheck = (id) => {
  store.commit('TOGGLE_CHECK', id)
}

const toggleAll = () => {
  const newVal = !allChecked.value
  store.commit('CHECK_ALL', newVal)
}

const onChange = (item) => {
  store.commit('UPDATE_COUNT', { id: item.id, count: item.count })
}

const handleDelete = (id) => {
  Dialog.confirm({
    title: '确认删除',
    message: '确定要将该商品从购物车中移除吗？',
  }).then(() => {
    store.dispatch('removeFromCart', id)
  }).catch(() => {})
}

// Cart.vue 中修改 onSubmit 方法
const onSubmit = async () => {
  if (checkedCount.value === 0) return
  try {
    await store.dispatch('createOrder', { remark: '来自购物车的订单' })
    // 跳转到订单页面，并默认选中“待付款”标签页
    router.push('/orders?status=pending-payment')
  } catch (error) {
    Toast(error.message)
  }
}
</script>

<style scoped>
.cart-page {
  /* 页面内容底部留出足够的空隙，防止被两个底部栏遮挡 */
  padding-bottom: 110px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.cart-list { padding: 10px; }
.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
}
.cart-card {
  flex: 1;
  margin-left: 10px;
  margin: 0;
}

/* --- 核心修改开始 --- */

/* 1. 结算栏悬浮在导航栏上方 */
:deep(.cart-submit-bar) {
  bottom: 50px !important; /* 假设底部导航栏高度为 50px */
  z-index: 100; /* 确保层级在页面内容之上 */
}

/* 2. 确保底部导航栏在最底部 (如果 AppTabBar 默认不是 bottom:0，可以用这个强制修正) */
:deep(.app-tab-bar),
:deep(nav),
:deep(.tabbar) {
  bottom: 0 !important;
  z-index: 99;
}

/* --- 核心修改结束 --- */
</style>