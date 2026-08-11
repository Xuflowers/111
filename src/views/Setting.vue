<template>
  <!-- 设置页：提供更换头像、修改密码、退出登录等功能 -->
  <div class="setting-page">
    <van-nav-bar title="设置" left-arrow @click="goBack" />

    <van-cell-group inset style="margin-top: 10px;">
      <van-cell title="更换头像" is-link @click="showChangeAvatar = true" />
      <van-cell title="修改密码" is-link @click="showChangePassword = true" />
      <van-cell title="退出登录" is-link @click="handleLogout" />
    </van-cell-group>

    <!-- 更换头像弹窗 -->
    <van-popup
      v-model:show="showChangeAvatar"
      position="bottom"
      round
      closeable
      duration="0.3"
      :style="{ height: '40%' }"
    >
      <div class="avatar-popup-content">
        <h3>更换头像</h3>
        <!-- 使用 van-uploader 处理文件选择 -->
        <van-uploader
          :max-count="1"
          accept="image/*"
          :after-read="afterRead"
          :preview-image="false"
        >
          <div class="avatar-placeholder">
            <img v-if="previewAvatar" :src="previewAvatar" class="preview-img" />
            <span v-else class="placeholder-text">点击选择头像</span>
          </div>
        </van-uploader>
        <van-button
          type="primary"
          block
          :disabled="!previewAvatar"
          @click="confirmAvatar"
          style="margin-top: 20px;"
        >
          确认更换
        </van-button>
      </div>
    </van-popup>

    <!-- 修改密码弹窗 -->
    <van-popup
      v-model:show="showChangePassword"
      position="bottom"
      round
      closeable
      duration="0.3"
      :style="{ height: '45%' }"
    >
      <div class="pwd-popup-content">
        <h3>修改密码</h3>
        <van-field
          v-model="oldPassword"
          type="password"
          label="原密码"
          placeholder="请输入原密码"
        />
        <van-field
          v-model="newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
        />
        <van-button
          type="primary"
          block
          @click="confirmPasswordChange"
          style="margin-top: 20px;"
        >
          确认修改
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
// 设置页：提供更换头像、修改密码、退出登录功能
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'

const router = useRouter()
const store = useStore()

const userInfo = ref(null)
const showChangeAvatar = ref(false)
const showChangePassword = ref(false)

// 头像相关
const previewAvatar = ref('')

// 密码相关
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 挂载时从 localStorage 读取用户信息
onMounted(() => {
  const storedUser = localStorage.getItem('user-info')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

// 文件读取回调：将图片转为 Base64 并预览
const afterRead = (file) => {
  const rawFile = file.file || file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(rawFile)
}

// 确认更换头像
const confirmAvatar = () => {
  if (!previewAvatar.value || !userInfo.value) return

  store.dispatch('updateAccountInfo', {
    username: userInfo.value.name,
    newData: { avatar: previewAvatar.value }
  })

  // 同步更新 localStorage 中的 user-info
  userInfo.value = { ...userInfo.value, avatar: previewAvatar.value }
  localStorage.setItem('user-info', JSON.stringify(userInfo.value))

  Toast.success('头像更换成功')
  showChangeAvatar.value = false
  previewAvatar.value = ''
}

// 确认修改密码
const confirmPasswordChange = () => {
  if (!userInfo.value) {
    Toast.fail('请先登录')
    return
  }

  const currentAccount = store.state.accountList.find(
    a => a.username === userInfo.value.name
  )

  // 校验原密码
  if (!currentAccount || currentAccount.password !== oldPassword.value) {
    Toast.fail('原密码错误')
    return
  }

  // 校验新密码
  if (!newPassword.value) {
    Toast.fail('新密码不能为空')
    return
  }
  if (!confirmPassword.value) {
    Toast.fail('请确认密码')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    Toast.fail('两次输入的新密码不一致')
    return
  }
  if (newPassword.value === oldPassword.value) {
    Toast.fail('新密码不能与旧密码相同')
    return
  }
  // 提交更新
  store.dispatch('updateAccountInfo', {
    username: userInfo.value.name,
    newData: { password: newPassword.value }
  })

  Toast.success('密码修改成功')
  showChangePassword.value = false
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('user-token')
  localStorage.removeItem('user-info')
  Toast.success('已退出登录')
  router.push('/login')
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.setting-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 头像弹窗内容 */
.avatar-popup-content {
  padding: 30px 20px;
  text-align: center;
}
.avatar-popup-content h3 {
  margin-bottom: 20px;
  font-size: 18px;
}
.avatar-placeholder {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #dcdee0;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-text {
  font-size: 14px;
  color: #969799;
}

/* 密码弹窗内容 */
.pwd-popup-content {
  padding: 30px 20px;
}
.pwd-popup-content h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
}
</style>
