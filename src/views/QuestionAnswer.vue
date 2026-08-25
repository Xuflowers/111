<template>
  <div class="aboutus-page">
    <!-- 顶部栏：固定不动 -->
    <van-nav-bar class="top-bar" title="常见问题解答" left-arrow @click-left="goBack" />

    <!-- 中间内容区：可滚动查看 -->
    <div class="content-area">
      <van-cell-group inset style="margin-top: 10px">
        <van-cell title="发货时间" is-link @click="wasClick"/>
        <van-cell title="物流服务" is-link @click="wasClick"/>
        <van-cell title="商品质量" is-link @click="wasClick"/>
        <van-cell title="退款/售后" is-link @click="wasClick"/>
      </van-cell-group>
    </div>

    <!-- 底部输入栏：固定不动 -->
    <div class="bottom-input">
      <van-field
        v-model="questionText"
        placeholder="请输入您的问题"
        class="input-field"
      />
      <van-button type="primary" size="small" class="submit-btn" @click="onSubmit">提交</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";
import { Toast } from "vant";

const router = useRouter()
const goBack = () => router.go(-1)
const wasClick = () =>{
  Toast.success("成功点击" )
}

// 底部输入栏：用户输入问题
const questionText = ref('')
const onSubmit = () => {
  if (!questionText.value.trim()) {
    Toast.fail('请输入问题')
    return
  }
  Toast.success('提交成功')
  questionText.value = ''
}
</script>

<style scoped>
/* 页面容器：flex 纵向布局，撑满视口，整体不滚动 */
.aboutus-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f8fa;
  overflow: hidden;
}

/* 顶部栏：固定高度，不滚动 */
.top-bar {
  flex-shrink: 0;
}

/* 中间内容区：占据剩余空间，可纵向滚动 */
.content-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;  /* iOS 平滑滚动 */
}

/* 底部输入栏：固定高度，不滚动 */
.bottom-input {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #f5f5f5;
}

/* 输入框：占据剩余空间，胶囊样式 */
.input-field {
  flex: 1;
  padding: 6px 12px;
  background: #f7f8fa;
  border-radius: 18px;
}

/* 提交按钮：固定宽度 */
.submit-btn {
  flex-shrink: 0;
}
</style>
