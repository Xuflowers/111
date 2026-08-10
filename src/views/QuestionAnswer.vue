<template>
  <div class="aboutus-page">
    <van-nav-bar title="常见问题解答" left-arrow @click-left="goBack" />
    <van-cell-group inset style="margin-top: 10px">
      <van-cell title="发货时间" is-link @click="wasClick"/>
      <van-cell title="物流服务" is-link @click="wasClick"/>
      <van-cell title="商品质量" is-link @click="wasClick"/>
      <van-cell title="退款/售后" is-link @click="wasClick"/>
    </van-cell-group>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {Toast} from "vant";

const router = useRouter()
const goBack = () => router.go(-1)
const wasClick = () =>{
Toast.success("成功点击" )
}

</script>

<style scoped>
.aboutus-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}
</style>