<template>
  <div class="register-container">
    <h2>账户注册</h2>
    <div class="form-group">
      <label>账号</label>
      <input type="text" v-model="form.username" placeholder="请输入账号" />
    </div>

    <div class="form-group">
      <label>密码</label>
      <input type="password" v-model="form.password" placeholder="请设置密码" />
    </div>

    <div class="form-group">
      <label>确认密码</label>
      <input type="password" v-model="form.confirmPassword" placeholder="请再次输入密码" />
    </div>

    <button class="register-btn" @click="handleRegister">立即注册</button>

    <div class="login">已有账号？<router-link to="/login">返回登录</router-link></div>
  </div>
</template>

<script setup>
// 注册页：校验表单后将账户信息存入 Vuex store
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'

const store = useStore()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = () => {
  // 表单完整性校验
  if (!form.username || !form.password || !form.confirmPassword) {
    Toast('请填写完整的注册信息')
    return
  }
  if (form.username.length < 3) {
    Toast('账号最少为3位')
    return
  }
  if (form.password.length < 6) {
    Toast('密码最少为6位')
    return
  }
  if (form.password !== form.confirmPassword) {
    Toast('两次输入的密码不一致')
    return
  }

  // 检查账号是否已存在
  const exists = store.state.accountList.some(u => u.username === form.username)
  if (exists) {
    Toast('该账号已被注册')
    return
  }

  // 添加账户到 store
  store.commit('ADD_TO_ACCOUNT', {
    username: form.username,
    password: form.password
  })

  Toast.success('注册成功，请登录')
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);   /* 完美居中 */
  width: 90%;                         /* 宽度占屏幕 90%，最大 360px */
  max-width: 360px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;             /* 确保 padding 不撑大宽度 */
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

input:focus {
  border-color: #07c160;
  outline: none;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.register-btn:active {
  background-color: #06ad56;
}

.login {
  margin-left: 48%;
  color: #333;
  padding-top: 2%;
  font-size: 15px;
}
</style>
