<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />

    <van-empty v-if="cartItems.length === 0" description="购物车空空如也" />

    <div v-else class="cart-list">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <van-checkbox
            :model-value="item.checked"
            @click="toggleCheck(item.id)"
            icon-size="20px"
        />

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

    <van-submit-bar
        :price="totalPrice"
        :disabled="checkedCount === 0"
        :button-text="`去结算(${checkedCount})`"
        @submit="onSubmit"
    >
      <van-checkbox :model-value="allChecked" @click="toggleAll">全选</van-checkbox>
    </van-submit-bar>

    <AppTabBar />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Dialog, Toast } from 'vant'
import AppTabBar from '@/components/AppTabBar.vue'

const store = useStore()
const router = useRouter()

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
  store.commit('CHECK_ALL', !allChecked.value)
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

const onSubmit = async () => {
  if (checkedCount.value === 0) {
    Toast('请选择要结算的商品')
    return
  }
  try {
    await store.dispatch('createOrder', { remark: '来自购物车的订单' })
    Toast.success('订单创建成功')
    router.push('/orders?status=pending-payment')
  } catch (error) {
    Toast(error.message)
  }
}
</script>

<style scoped>
.cart-page {
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
}

:deep(.van-submit-bar) {
  bottom: 50px !important;
  z-index: 100;
}
</style>