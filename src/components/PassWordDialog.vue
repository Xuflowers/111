<template>
  <van-popup
      :show="visible"
      @update:show="$emit('update:visible',$event)"
      position="bottom"
      round
      :style="{height:'100%'}"
      :z-index="2001"
      @opened="onPopupOpened"
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
          @focus="showKeyboard=true"
      />
      <van-number-keyboard
          v-model="password"
          :show="showKeyboard"
          :z-index="3000"
          :maxlength="6"
          @blur="showKeyboard = false"
      />
    </div>
  </van-popup>
</template>

<script setup>
import {ref, watch} from "vue";
import {Toast} from "vant";

const props = defineProps({
  visible: Boolean,
  amount: String,
  order: {type: Object, default:() => ({})}
})

const emit = defineEmits(['update:visible', 'verifySuccess'])

const password = ref('')
const showKeyboard = ref(false)
const verifying = ref(false)
const retryCount = ref(0)
const close = () => emit('update:visible',false)

// 弹窗过渡动画完成后自动聚焦：弹出键盘，密码输入框获得焦点
const onPopupOpened = () => {
  showKeyboard.value = true
}

// 监听弹窗显隐：关闭时重置状态
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    showKeyboard.value = false
    password.value = ''
    retryCount.value = 0
    verifying.value = false
  }
})

watch(password, (newVal)=> {
  if (newVal.length === 6 && !verifying.value){
    verifying.value = true
    verifyPassword()
  }
})

const verifyPassword = () =>{
  setTimeout(() => {
    if(password.value === '123456'){
      Toast.success("支付成功")
      emit('verifySuccess',{
        orderId: props.order.id
      })
      password.value = ''
      close()
    }else{
      Toast.fail('密码错误，请重试')
      password.value = ''
      verifying.value = false
    }
  },500)
}

</script>

<style scoped>
.password-dialog{
  min-width: 200px;
  min-height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.password-dialog :deep(.van-password-input){
  margin: 32px auto;
  width: 80%;
}
.password-dialog :deep(.van-password-input__item){
  border: 2px solid #dcdee0;
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
  padding: 5% 20px;
  font-size: 36px;
}
.password-title{
  font-size: 18px;
  font-weight: 600;
}
</style>
