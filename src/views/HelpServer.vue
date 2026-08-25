<template>
  <div class="chat-page">
    <van-nav-bar title="常见问题解答" left-arrow @click-left="goBack" />
    <div class="chat-messages" ref="messageContainer">
      <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-wrapper"
          :class="msg.role === 'user' ? 'user' : 'assistant'"
      >
        <div class="avatar">
          <van-image round :src="msg.role === 'user' ? userAvatar : assistantAvatar" width="40" height="40" fit="cover" />
        </div>
        <div class="bubble" v-html="msg.content"></div>
        <div class="time" v-if="msg.time">{{ msg.time }}</div>
      </div>
    </div>

    <div class="input-area">
      <!-- 模式切换 -->
      <div class="mode-toggle">
        <van-button
            size="small"
            type="default"
            plain
            @click="toggleMode"
        >
          {{ isQuickMode ? '切换到输入' : '快捷输入' }}
        </van-button>
      </div>

      <!-- 输入模式 -->
      <div v-if="!isQuickMode" class="input-mode">
        <van-field
            v-model="inputText"
            placeholder="请输入消息..."
            @keyup.enter="sendInputMessage"
        />
        <van-button type="primary" @click="sendInputMessage">发送</van-button>
      </div>

      <!-- 快捷模式 -->
      <div v-else class="quick-mode">
        <van-button
            v-for="q in quickQuestions"
            :key="q.text"
            size="small"
            round
            plain
            type="primary"
            @click="sendQuickMessage(q)"
            class="quick-btn"
        >
          {{ q.text }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

const router = useRouter()
const goBack = () => router.go(-1)

// 头像
const userAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'
const assistantAvatar = 'https://img.yzcdn.cn/vant/apple-1.jpg'

// 消息列表
const messages = ref([
  {
    role: 'assistant',
    content: '您好，请问有什么可以帮您？<br>您可以选择快捷问题或自定义输入。'
  }
])

// 快捷问题
const quickQuestions = [
  { text: '发货时间', answer: '我们通常在付款后 48 小时内发货，节假日顺延。' },
  { text: '物流服务', answer: '支持顺丰、中通、圆通等快递，您可在订单中查看物流信息。' },
  { text: '商品质量', answer: '所有商品均经过严格质检，如有质量问题可联系客服退换。' },
  { text: '退货售后', answer:  '支持 7 天无理由退换货，请保持商品完好，联系客服处理。'},
]

// 模式状态
const isQuickMode = ref(false)    // true: 快捷模式, false: 输入模式
const inputText = ref('')

// 消息容器
const messageContainer = ref(null)

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 切换模式
const toggleMode = () => {
  isQuickMode.value = !isQuickMode.value
  // 切换至输入模式时，自动聚焦输入框（可选）
  if (!isQuickMode.value) {
    nextTick(() => {
      const input = document.querySelector('.input-mode .van-field__control')
      if (input) input.focus()
    })
  }
}

// 发送输入框消息
const sendInputMessage = () => {
  const content = inputText.value.trim()
  if (!content) {
    Toast.fail('请输入内容')
    return
  }
  // 添加用户消息
  addUserMessage(content)
  // 清空输入框
  inputText.value = ''
  // 模拟客服回复
  simulateReply('感谢您的反馈，我们会尽快处理。')
}

// 发送快捷消息
const sendQuickMessage = (q) => {
  // 添加用户消息（问题）
  addUserMessage(q.text)
  // 模拟客服回复（使用预设答案）
  setTimeout(() => {
    addAssistantMessage(q.answer)
  }, 500 + Math.random() * 1000)
}

// 辅助方法：添加用户消息
const addUserMessage = (content) => {
  messages.value.push({
    role: 'user',
    content: content,
    time: new Date().toLocaleTimeString()
  })
  scrollToBottom()
}

// 辅助方法：添加客服消息
const addAssistantMessage = (content) => {
  messages.value.push({
    role: 'assistant',
    content: content,
    time: new Date().toLocaleTimeString()
  })
  scrollToBottom()
}

// 模拟通用回复（当输入模式没有预设答案时）
const simulateReply = (answer) => {
  setTimeout(() => {
    addAssistantMessage(answer)
  }, 800 + Math.random() * 1000)
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ededed;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 10px;
  background-color: #ededed;
}
.message-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.message-wrapper.user {
  flex-direction: row-reverse;
}
.message-wrapper.user .bubble {
  background-color: #95ec69;
  color: #000;
  margin-right: 10px;
  margin-left: 0;
}
.message-wrapper.user .avatar {
  margin-left: 0;
  margin-right: 10px;
}
.message-wrapper.user .time {
  flex: 1;
  font-size: 11px;
  color: #999;
  margin-right: 2%;
  margin-top: auto;
  text-align: right;
  width: 100%;
  height: auto;
}
.message-wrapper.assistant {
  flex-direction: row;
}
.message-wrapper.assistant .bubble {
  background-color: #ffffff;
  color: #000;
  margin-left: 10px;
  margin-right: 0;
}
.message-wrapper.assistant .avatar {
  margin-right: 10px;
  margin-left: 0;
}
.message-wrapper.assistant .time {
  flex: 1;
  font-size: 11px;
  color: #999;
  margin-left: 2%;
  margin-top: auto;
  text-align: right;
  width: 100%;
  height: auto;
}
.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}
.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
/* 底部输入区域 */
.input-area {
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background-color: #f7f8fa;
  border-top: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mode-toggle {
  display: flex;
  justify-content: flex-end;
}
.input-mode {
  display: flex;
  gap: 8px;
}
.input-mode .van-field {
  flex: 1;
  background-color: #fff;
  border-radius: 20px;
}
.input-mode .van-button {
  flex-shrink: 0;
  border-radius: 20px;
}
.quick-mode {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 4px 0;
}
.quick-btn {
  flex: 0 0 auto;
  background-color: #fff;
  border: 1px solid #1989fa;
  color: #1989fa;
  font-size: 13px;
  padding: 4px 14px;
}

</style>
