<template>
  <div class="address-page">
    <van-nav-bar title="收货地址" left-arrow @click-left="goBack" />

    <van-address-list
        v-model="chosenAddressId"
        :list="addressList"
        default-tag-text="默认"
        @add="onAdd"
        @edit="onEdit"
        @delete="onDelete"
    />

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
import AddressDialog from '@/components/AddressDialog.vue'

const router = useRouter()
const store = useStore()

const showAddressDialog = ref(false)
const editingAddress = ref(null)

// 当前选中的地址 ID（用于 v-model）
const chosenAddressId = ref('')

// 从 Vuex 获取地址列表
const addressList = computed(() => store.state.addressList)

// 新增地址
const onAdd = () => {
  editingAddress.value = null
  showAddressDialog.value = true
}

// 编辑地址
const onEdit = (item) => {
  editingAddress.value = { ...item }
  showAddressDialog.value = true
}

// 删除地址
const onDelete = (item) => {
  Dialog.confirm({
    title: '确认删除',
    message: `确定要删除"${item.name}"的收货地址吗？`
  }).then(() => {
    store.dispatch('deleteAddress', item.id)
    Toast.success('删除成功')
  }).catch(() => {})
}

// 地址提交（新增/编辑）
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

/* 可选：调整底部按钮宽度，与您之前的样式一致 */
:deep(.van-address-list__add) {
  max-width: 344px;
  margin: 0 auto;
  margin-top: 80px;
  bottom: 70px !important;

}

/* 如果希望地址项与您之前的样式更接近，可覆盖 */
:deep(.van-address-item) {
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
}
:deep(.van-address-item:last-child) {
  border-bottom: none;
}
</style>