<template>
  <div class="login-container">
    <h2>用户登录</h2>

    <!-- 登录表单 -->
    <div class="form-group">
      <label>账号</label>
      <input v-model="form.username" type="text" placeholder="请输入账号" />
    </div>

    <div class="form-group">
      <label>密码</label>
      <input v-model="form.password" type="password" placeholder="请输入密码" />
    </div>

    <!-- 登录按钮 -->
    <button class="login-btn" @click="handleLogin">立即登录</button>

    <div class="register">没有账号？<router-link to="/register">立即注册!</router-link></div>
  </div>
</template>

<script setup>
// 登录页：校验账号密码，登录成功后将 token 与用户信息写入 localStorage
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'

const router = useRouter()
const store = useStore()

// 表单数据
const form = reactive({
  username: '',
  password: ''
})

// 登录逻辑：校验通过后跳转到个人中心
const handleLogin = () => {
  if (!form.username || !form.password) {
    Toast('请输入账号和密码')
    return
  }

  // 从 store 的 accountList 中查找用户
  const user = store.state.accountList.find(
    u => u.username === form.username && u.password === form.password
  )

  if (user) {
    // 登录成功
    localStorage.setItem('user-token', 'fake-token')
    localStorage.setItem('user-info', JSON.stringify({ name: user.username }))
    Toast.success('登录成功')
    router.push('/user')
  } else {
    Toast.fail('账号或密码错误')
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  padding: 20px;
  min-width: 335px;
  margin: 0 auto;
  margin-top: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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

.login-btn {
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

.login-btn:active {
  background-color: #06ad56;
}

.register {
  margin-left: 56%;
  color: #333;
  padding-top: 2%;
  font-size: 15px;
}
</style>
