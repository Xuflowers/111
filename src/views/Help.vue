<template>
  <div class="page">
    <van-nav-bar title="我的帮助" left-arrow @click-left="goBack" />
    <van-cell-group inset style="margin-top: 10px;">
      <van-cell title="联系在线客服" icon="chat-o" is-link />
      <van-cell title="常见问题解答" icon="question-o" is-link />
      <van-cell title="意见反馈" icon="edit" is-link />
      <van-cell title="关于我们" icon="info-o" is-link />
    </van-cell-group>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.go(-1)
</script>