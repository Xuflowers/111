<template>
  <van-popup
      :show="visible"
      @update:show="$emit('update:visible',$event)"
      position="bottom"
      round
      :style="{height:'60%'}"
  >
    <div class="password-dialog">
      <div class="password-header">
        <span class="password-title">请输入密码</span>
        <van-icon name="cross" @click="close"/>
      </div>
      <div class="password-amount">¥{{ amount || '0.00' }}</div>
      <van-password-input
          :value="password"
          :length="6"
          :focused="showKeyboard"
          @focus="showKeyboard"
      />
      <van-number-keyboard
          v-model="password"
          :show="showKeyboard"
          :maxlength="6"
          @blur="showKeyboard = false"
      />
    </div>
  </van-popup>
</template>

<script setup>
import {ref, watch} from "vue";
import {Toast} from "vant";

const showPassword = ref(false)
const paying = ref(false)
const payType = ref('')

const props = defineProps({
  visible: Boolean,
  amount: String,
  order: String
})

const password = ref('')
const showKeyboard = ref(false)
const close = () => emit('update:visible',false)
watch(password, (newVal)=> {
  if (newVal.length === 6){
    verifyPassword()
  }
})

const verifyPassword = () =>{
  paying.value = true
  setTimeout(() => {
    paying.value = false
    if(password.value === '123456'){
      Toast.success("支付成功")
      emit('paySuccess',{
        orderId: props.order.id,
        payType:payType.value
      })
      showPassword.value = false
      password.value = ''
      close()
    }else{
      Toast.fail('密码错误，请重试')
      password.value=""
    }
  },1000)
}
const emit = defineEmits(['update:visible', 'verifySuccess'])

</script>

<style scoped>
.password-dialog{
  min-width: 200px;
}
.password-dialog :deep(.van-password-input){
  margin: 32px auto;
  width: 80%;
}
.password-dialog :deep(.van-password-input__item){
  border: 2px solid #dcdee0;
  width: 60px;
}
.password-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}
.password-amount{
  text-align: center;
  padding: 40px 20px;
  font-size: 36px;
}
.password-title{
  font-size: 18px;
  font-weight: 600;
}
</style>