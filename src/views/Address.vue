<template>
  <div class="page">
    <van-nav-bar title="收货地址" left-arrow @click-left="goBack" />
    <van-address-list
        v-model="chosenAddressId"
        :list="addressList"
        default-tag-text="默认"
        @add="onAdd"
        @edit="onEdit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

const router = useRouter()
const chosenAddressId = ref('1')

// 模拟地址数据
const addressList = ref([
  {
    id: '1',
    name: '张三',
    tel: '13000000000',
    address: '福建省福州市鼓楼区某某街道某某小区 1 号楼',
    isDefault: true,
  },
  {
    id: '2',
    name: '李四',
    tel: '13100000000',
    address: '福建省福州市台江区某某路某某大厦 10 层',
  },
])

const onAdd = () => Toast('点击了新增地址')
const onEdit = (item) => Toast('点击了编辑地址：' + item.name)
const goBack = () => router.go(-1)
</script>

<style scoped>
.page {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.popup-header {
  text-align: center;
  padding: 16px 0 8px;
  border-bottom: 1px solid #ebedf0;
}
.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.form-container {
  padding: 16px;
  height: calc(100% - 56px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.button-group {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-direction: column;
}
</style>