<template>
  <div class="message-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="消息中心" />

    <!-- 消息列表 -->
    <div class="message-list">
      <van-cell
          v-for="msg in messageList"
          :key="msg.id"
          :title="msg.title"
          :label="msg.time"
          :value="msg.content"
          :border="false"
          @click="goToChat(msg)"
      >
        <!-- 左侧头像 -->
        <template #icon>
          <van-image
              round
              width="40px"
              height="40px"
              :src="msg.avatar"
              style="margin-right: 10px;"
          />
        </template>
        <!-- 右上角未读消息徽标 -->
        <template #right-icon>
          <van-badge v-if="msg.unread > 0" :content="msg.unread" />
        </template>
      </van-cell>
    </div>

    <!-- 底部导航栏 -->
    <AppTabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppTabBar from '@/components/AppTabBar.vue'

const router = useRouter()

// 模拟消息列表数据（店铺消息、订阅号、客服聊天等）
const messageList = ref([
  {
    id: 1,
    title: '官方店铺客服',
    content: '亲，您的宝贝已经发货啦，请注意查收~',
    time: '10:23',
    avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
    unread: 2
  },
  {
    id: 2,
    title: '生鲜水果福利群',
    content: '[活动] 进口车厘子限时特价，速来抢购！',
    time: '昨天',
    avatar: 'https://img.yzcdn.cn/vant/apple-1.jpg',
    unread: 5
  },
  {
    id: 3,
    title: '订阅号消息',
    content: '本周新品预告：泰国金枕榴莲即将上架...',
    time: '周三',
    avatar: 'https://img.yzcdn.cn/vant/apple-2.jpg',
    unread: 0
  },
  {
    id: 4,
    title: '物流助手',
    content: '您的包裹已到达【福州市】转运中心',
    time: '11月20日',
    avatar: 'https://img.yzcdn.cn/vant/apple-3.jpg',
    unread: 1
  }
])

// 点击消息跳转到具体的聊天/详情页面
const goToChat = (msg) => {
  // 这里可以跳转到一个具体的聊天详情页，例如 /chat/:id
  console.log('准备查看消息：', msg.title)
  // router.push(`/chat/${msg.id}`)
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px; /* 防止内容被底部导航栏遮挡 */
}

.message-list {
  background-color: #fff;
  margin-top: 10px;
}

/* 调整 van-cell 的内部布局，让内容更像一个消息列表 */
:deep(.van-cell__value) {
  flex: 1;
  color: #969799;
  font-size: 13px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 10px;
}

:deep(.van-cell__title) {
  font-size: 15px;
  font-weight: 500;
}

:deep(.van-cell__label) {
  margin-top: 4px;
  font-size: 12px;
  color: #c8c9cc;
}
</style>