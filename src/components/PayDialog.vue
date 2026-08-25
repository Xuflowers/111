<template>
  <van-popup
    :show="visible"
    @update:show="$emit('update:visible', $event)"
    position="bottom"
    round
    :style="{ height: '80%' }"
  >
    <div class="pay-dialog">
      <!--支付方式的选择-->
      <div v-if="step === 'select'" class="step-container">
        <div class="dialog-header">
          <div class="dialog-title">支付订单</div>
          <van-icon name="cross" class="dialog-close" @click="close" />
        </div>
        <div class="dialog-amount">
          <span class="pay-amount">¥{{ order.totalAmount || '0.00' }}</span>
        </div>
        <div class="dialog-content">
          <van-cell-group>
            <van-cell>订单号：{{ order.id }}</van-cell>
            <van-cell>
              <span v-if="order.status === 'pending_payment' && getRemaining(order.id) !== null" class="countDown">剩余支付时间：{{ formattedCountdown(getRemaining(order.id)) }}</span>
              <span v-else-if="order.status === 'overtime' || order.status === 'cancelled'" class="order-expired">已过期</span>
            </van-cell>
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
                      :disabled="true"
          >确认支付¥{{ order.totalAmount || '0.00' }}</van-button>
        </div>
      </div>
      <!--密码输入-->
      <div v-else-if="step === 'password'" class="step-container">
        <div class="dialog-header">
          <div class="dialog-title">请输入密码</div>
          <van-icon name="cross" class="dialog-close" @click="closePassword"/>
        </div>
        <div class="password-amount">¥{{ order.totalAmount || '0.00' }}</div>
        <van-password-input
            :value="password"
            :length="6"
            :focused="showKeyboard"
            @focus="showKeyboard = true"
        />
        <div class="password-error" v-if="passwordError">
          {{ passwordError }}
        </div>
        <van-number-keyboard
            v-model="password"
            :show="showKeyboard"
            :z-index="3000"
            :maxlength="6"
            @blur="showKeyboard = false"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import {computed, ref, watch, nextTick} from "vue";
import {Toast} from "vant";
import {useStore} from "vuex";

const store = useStore()
const props = defineProps({
  visible: Boolean,
  order: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:visible', 'paySuccess'])
const step = ref('select')

const payType = ref('')
const payOptions = [
  { value: 'shop-money',label:'商城余额支付',icon:'balance-o',color:'#323030'},
  { value: 'bank-money',label:'银行卡支付',icon:'credit-pay',color:'#dcd71f'},
  { value: 'alipay-money',label:'支付宝支付',icon:'alipay',color:'#2b4ddd'},
  { value: 'wechat-money',label:'微信支付',icon:'wechat',color:'#17dc10'}
]

const password = ref('')
const showKeyboard = ref(false)
const passwordError = ref('')
const verifying = ref(false)

watch(password,(val) => {
  if (val.length >0 && passwordError.value){
    passwordError.value = ''
  }
  if (val.length === 6 && !verifying.value){
    verifying.value = true
    setTimeout(() => {
      if (val === '123456'){
        Toast.success('支付成功')
        emit('paySuccess',{
          orderId:props.order.id,
          payType:payType.value
        })
        close()
      } else {
        passwordError.value = "密码错误，请重试"
        password.value = ''
        verifying.value = false
      }
    },600)
  }
})

const canSubmit = computed(() => payType.value !== '' )

const confirmPay = () =>{
  if(!canSubmit.value){
    Toast.fail("请选择支付方式")
  }else{
    step.value = 'password'
    // 切换到密码步骤后，等 DOM 更新完成再弹出键盘（自动聚焦）
    nextTick(() => {
      showKeyboard.value = true
    })
  }
}

const getRemaining = (orderId) =>store.getters.getRemaining(orderId)
const  formattedCountdown = (seconds) => {
  if(seconds === null || seconds === undefined) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const closePassword = () =>{
  step.value = 'select'
  password.value = ''
  passwordError.value = ''
  showKeyboard.value = false
  verifying.value = false
  Toast.fail('已取消支付')
}

const close = () => {
  step.value = 'select'
  payType.value = ''
  password.value = ''
  passwordError.value = ''
  showKeyboard.value = false
  verifying.value = false
  emit('update:visible',false)
}

watch(() => props.visible,(newVal) =>{
  if (!newVal){
    step.value = 'select'
    payType.value = ''
    password.value = ''
    passwordError.value = ''
    showKeyboard.value = false
    verifying.value = false
  }
})
</script>

<style scoped>
.pay-dialog {
  min-height: 200px;
  position: relative;
  overflow: hidden;
}
.password-amount{
  text-align: center;
  padding: 48px 24px;
  font-size: 36px;
}
.password-error{
  text-align: center;
  color: red;
}
.dialog-header {
  position: relative;
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
}
.dialog-close {
  margin-left: auto;
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
