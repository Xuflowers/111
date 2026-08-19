<template>
  <van-popup
    :show="visible"
    @update:show="$emit('update:visible', $event)"
    position="bottom"
    round
    :style="{ height: '60%' }"
  >
    <div class="pay-dialog">
      <div class="dialog-header">
        <div class="dialog-title">支付订单</div>
        <span v-if="order.status === 'pending_payment' && getRemaining(order.id) !== null" class="countDown">剩余：{{ formattedCountdown(getRemaining(order.id)) }}</span>
        <span v-else-if="order.status === 'overtime' || order.status === 'cancelled'" class="order-expired">已过期</span>
        <van-icon name="cross" @click="close" />
      </div>
      <div class="dialog-amount">
        <span class="pay-amount">¥{{ order.totalAmount || '0.00' }}</span>
      </div>
      <div class="dialog-content">
        <van-cell-group>
          <van-cell>订单号：{{ order.id }}</van-cell>
          <van-cell title="商品："
          :value="order.products?.length > 1 ? `共${order.products.length}件商品` : order.products?.[0]?.name"></van-cell>
          <van-cell
              v-for="payway in payOptions"
              :key="payway.value"
              :title="payway.label"
              clickable
              @click="payType = payway.value"
              :class="{active: payType === payway.value }"
          >
          <template #icon>
            <van-icon :name='payway.icon' size="24" :color="payway.color"></van-icon>
          </template>
          <template #right-icon>
            <van-checkbox :checked="payType === payway.value" :disabled="true" square/>
          </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="dialog-footer">
        <van-button v-if="order.status === 'pending_payment'"
                    type="primary"
                    size="large"
                    @click="confirmPay"
        >确认支付¥{{ order.totalAmount || '0.00' }}</van-button>
        <van-button v-else-if="order.status !== 'pending_payment'"
                    type="default"
                    size="large"
                    @click="confirmOverTime"
        >订单已过期</van-button>
      </div>
    </div>
  </van-popup>
<PassWordDialog v-model:visible="showPassWordDialog"
           :amount="order.totalAmount"
           @verifySuccess="handleVerifySuccess"
></PassWordDialog>
</template>

<script setup>
import {computed, ref} from "vue";
import {Toast} from "vant";
import {useStore} from "vuex";
import PassWordDialog from "@/components/PassWordDialog.vue";

const store = useStore()
const props = defineProps({
  visible: Boolean,
  order: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:visible', 'paySuccess'])

const close = () => {
  emit('update:visible', false)
}
const payType = ref('')
const payOptions = [
  { value: 'shop-money',label:'商城余额支付',icon:'balance-o',color:'#323030'},
  { value: 'bank-money',label:'银行卡支付',icon:'credit-pay',color:'#dcd71f'},
  { value: 'alipay-money',label:'支付宝支付',icon:'alipay',color:'#2b4ddd'},
  { value: 'wechat-money',label:'微信支付',icon:'wechat',color:'#17dc10'}
]
const canSubmit = computed(() => {
  return payType.value && payType.value !== ""
})
const showPassWordDialog = ref(false)

const confirmPay = () =>{
  if(!canSubmit.value){
    Toast.fail("请选择支付方式")
  }else{
    showPassWordDialog.value = true
  }
}
const handleVerifySuccess = () => {
  emit('paySuccess',{
    orderId:props.order.id,
    payType:payType.value
  })
  close()
}
const confirmOverTime = () =>{
  Toast.fail("订单已过期请重新下单")
}
const getRemaining = (orderId) =>store.getters.getRemaining(orderId)
const  formattedCountdown = (seconds) => {
  if(seconds === null || seconds === undefined) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
</script>

<style scoped>
.pay-dialog {
  min-height: 200px;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}
.dialog-amount{
  text-align: center;
  padding: 48px 24px;
  font-size: 36px;
}
.dialog-title {
  font-size: 18px;
  font-weight: 600;
}
.countDown{
  font-size: 14px;
  color: red;
}
.order-expired{
  font-size: 14px;
  color: #666666;
}
.dialog-footer{
  padding: 16px;
}

</style>
