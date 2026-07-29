<template>
  <div class="address-page">
    <van-nav-bar title="收货地址" left-arrow @click-left="goBack" />

    <van-empty v-if="addressList.length === 0" description="暂无收货地址" />

    <div v-else class="address-list">
      <van-cell-group inset>
        <div
            v-for="item in addressList"
            :key="item.id"
            class="address-item"
            :class="{ active: item.isDefault }">

          <div class="address-top">
            <span class="address-name">{{ item.name }}</span>
            <span class="address-tel">{{ item.tel }}</span>
            <van-tag v-if="item.isDefault" type="primary" plain>默认</van-tag>
          </div>
          <div class="address-detail">{{ item.address }}</div>

          <div class="address-actions">
            <van-button size="mini" type="primary" plain @click="onEdit(item)">编辑</van-button>
            <van-button size="mini" type="danger" plain @click="onDelete(item)">删除</van-button>
            <div class="set-default">
              <van-button class="default" size="mini" type="defalut" plain @click="onSelect(item)" round>设为默认</van-button>
              <van-checkbox v-model="defaultAddressTd" :checked="item.isDefault" @click="onSelect(item)" shape="round"></van-checkbox>
            </div>
            </div>
        </div>
      </van-cell-group>
    </div>

    <div class="bottom-bar">
      <van-button type="primary" block @click="onAdd">+ 新增收货地址</van-button>
    </div>

    <AddressDialog
        :visible="showAddressDialog"
        :address="editingAddress"
        @close="showAddressDialog = false"
        @submit="handleAddressSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast, Dialog } from 'vant'
import AddressDialog from "@/components/AddressDialog.vue"

const router = useRouter()
const store = useStore()

const showAddressDialog = ref(false)
const editingAddress = ref(null)

// 从 Vuex 获取地址列表
const addressList = computed(() => store.state.addressList)

const onAdd = () => {
  editingAddress.value = null
  showAddressDialog.value = true
}

const onEdit = (item) => {
  editingAddress.value = { ...item }
  showAddressDialog.value = true
}

const onDelete = (item) => {
  Dialog.confirm({
    title: '确认删除',
    message: `确定要删除"${item.name}"的收货地址吗？`
  }).then(() => {
    store.dispatch('deleteAddress', item.id)
    Toast.success('删除成功')
  }).catch(() => {})
}

//点击切换默认地址
const onSelect = (item) => {
  if (!item.isDefault) {
    store.dispatch('setDefaultAddress', item.id)
    Toast.success('已设为默认地址')
  }
}

const handleAddressSubmit = (addressData) => {
  if (editingAddress.value) {
    store.dispatch('updateAddress', {
      id: editingAddress.value.id,
      addressData
    })
  } else {
    store.dispatch('addAddress', addressData)
  }
  showAddressDialog.value = false
  Toast.success('地址保存成功')
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.address-list {
  padding: 12px;
}

.address-item {
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.address-item:last-child {
  border-bottom: none;
}

.address-content {
  cursor: pointer;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.address-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

.address-tel {
  font-size: 14px;
  color: #646566;
}

.address-detail {
  font-size: 14px;
  color: #323233;
  line-height: 1.4;
}

.address-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebedf0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 344px;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background-color: white;
  border-top: 1px solid #ebedf0;
}

.set-default{
  display: flex;
  margin-left: auto;
}
</style>