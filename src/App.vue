<template>
  <!-- 根容器：所有页面通过 router-view 渲染 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script>
// 应用根组件：仅承担路由出口与全局容器样式职责
export default {
  name: 'App'
}
</script>

<style>
/* 全局容器：限制最大宽度为 375px（移动端设计稿宽度），居中显示 */
#app {
  max-width: 375px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/*
 * 固定类组件（底部导航、提交栏、导航栏、操作栏、弹层）全局样式覆盖：
 * 限制宽度并居中，使其在宽屏（PC）中也能与 375px 容器对齐
 */
.van-tabbar,
.van-submit-bar,
.van-nav-bar,
.van-nav-popup,
.van-action-bar,
.van-popup{
  max-width: 375px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
}

/* Toast 样式：限制宽度不超出屏幕 */
.van-toast {
  max-width: 80vw !important;
  width: max-content !important;
  box-sizing: border-box;
  @media (min-width: 376px) {
    max-width: 300px !important;
  }
}

.van-toast__text {
  word-break: break-word;
  white-space: normal;
  text-align: center;
}
</style>
