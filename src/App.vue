<template>
  <div id="box">
    <div id="app">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f7f8fa;
  /* 应用占位 */
  min-height: 100vh;
}
body {
  margin: 0;
  padding-bottom: 50px; /* 预留出底部导航栏的高度 */
}
#box {
  max-width: 375px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f7f8fa;
}
.van-tabbar {
  max-width: 375px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
}
.van-submit-bar {
  max-width: 375px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
}
.van-nav-bar {
  max-width: 375px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
}
.van-action-bar {
  max-width: 375px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
}
</style>