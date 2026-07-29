<template>
  <div class="login-container">
    <h2>用户登录</h2>

    <!-- 登录表单 -->
    <div class="form-group">
      <label>账号</label>
      <input v-model="form.username" type="text" placeholder="请输入账号（admin）" />
    </div>

    <div class="form-group">
      <label>密码</label>
      <input v-model="form.password" type="password" placeholder="请输入密码（123456）" />
    </div>

    <!-- 登录按钮 -->
    <button class="login-btn" @click="handleLogin">立即登录</button>
  </div>
</template>

<script setup>
// 登录页：仅用于演示，账号密码硬编码（admin / 123456）
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 1. 定义表单数据（预填默认账号，方便调试）
const form = reactive({
  username: 'admin',
  password: '123456'
})

// 2. 处理登录逻辑：校验通过后将 token 与用户信息写入 localStorage，并跳转到个人中心
const handleLogin = () => {
  const validUser = {username: "admin", password: "123456"}
  // 简单验证
  if (!form.username || !form.password) {
    alert("请输入账密")
    return
  }

  if (form.username === validUser.username && form.password === validUser.password) {
    localStorage.setItem('user-token', 'fake-token-123')
    localStorage.setItem('user-info', JSON.stringify({name: form.username}))
    alert('登录成功！')
    router.push('/user')
  } else {
    alert('账密不匹配')
  }
}

</script>

<style scoped>
.login-container {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 50px;
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
  box-sizing: border-box; /* 确保padding不撑大宽度 */
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
</style>