<template>
  <!-- 新增地址：从底部弹出，高度占屏幕 80% -->
  <van-popup :show="visible" @update:show="$emit('update:visible', $event)" position="bottom" :style="{ height: '70%' }">
    <div class="address-dialog">
      <!-- 弹层头部 -->
      <div class="dialog-header">
        <div class="dialog-title">新增地址</div>
        <van-icon name="cross" @click="close" />
      </div>

      <div class="dialog-content">
        <!-- 地址信息预览 -->
        <van-cell-group inset>
          <van-field v-model="formData.name" label="联系人" placeholder="请输入姓名" maxlength="20" />
          <van-field v-model="formData.tel" label="联系电话" placeholder="请输入联系电话" maxlength="11"/>
          <van-field v-model="formData.address" label="取件地址" placeholder="请输入地址" type ='textarea' row="3" autosize/>
        </van-cell-group>

        <!-- 地址类型选择 -->
        <van-cell-group inset>
          <van-cell title="是否设为默认地址" />
          <div class="type-options">
            <van-cell
                v-for="option in typeOptions"
                :key="option.value"
                :title="option.label"
                clickable
                @click="addressType = option.value"
                :class="{ active: addressType === option.value }"
            >
              <template #right-icon>
                <van-checkbox :checked="addressType === option.value" :disabled="true" square />
              </template>
            </van-cell>
          </div>
        </van-cell-group>

      <!-- 底部操作按钮 -->
      <div class="dialog-footer">
        <van-button type="default" block @click="close">取消</van-button>
        <van-button type="primary" block @click="submit" :disabled="!canSubmit">保存地址</van-button>
        <van-button type="warning" block @click="handleDelete" v-if="address">删除地址</van-button>
      </div>
    </div>
   </div>
  </van-popup>
</template>

<script setup>
// 新增地址申请弹层组件：用于填写收货地址，收货人和联系电话并上传
import {computed, ref, watch} from 'vue'
import { Toast} from 'vant'

const props = defineProps({
  visible: Boolean,   // 弹层显隐
  address: Object       // 当前申请售后的订单对象
})

const emit = defineEmits(['close','submit','delete'])

const formData = ref({
  name: '',
  tel: '',
  address: '',
  isDefault: false
})
// 表单字段
const addressType = ref('no')       // 是否为默认地址（yes/no）
// 地址类型选项
const typeOptions = [
  { value: 'yes', label: '是' },
  { value: 'no', label: '否' }
]

// 关闭弹层
const close = () => {
  emit('close')
}

watch(() => props.address, (newaddress) =>{
  if (newaddress){
    formData.value = {...newaddress}
    addressType.value = newaddress.isDefault?'yes':'no'
  }else{
    formData.value = {name:'',tel:'',address:"",isDefault: false}
    addressType.value = 'no'
  }
},
    {immediate:true}
)

const canSubmit = computed(()=>{
  const { name, tel, address} = formData.value
  return name.trim()&& tel.trim()&& address.trim()
})

// 提交新增申请：校验通过后向父组件抛出 submit 事件，并重置表单
const submit = () => {
  if (!canSubmit.value) {
    Toast('请填写完整地址信息')
    return
  }
  const submitData = {
    name: formData.value.name.trim(),
    tel: formData.value.tel.trim(),
    address: formData.value.address.trim(),
    isDefault: addressType.value === 'yes'
  }
  emit('submit', submitData)
  // 不再手动重置，由父组件关闭弹窗触发 watch 重置
}

const handleDelete = () =>{
  if(!props.address||!props.address.id){
    Toast('地址信息不存在')
    return
  }
  emit('delete',props.address)
  }


</script>

<style scoped>
.address-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.product-preview {
  display: flex;
  align-items: center;
}

.preview-name {
  font-size: 14px;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.type-options {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.reason-options {
  padding: 0;
}

.description-input {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: none;
  resize: none;
  font-size: 14px;
  background-color: #f7f8fa;
  border-radius: 8px;
  box-sizing: border-box;
}

.dialog-footer {
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
}

.dialog-footer .van-button {
  margin-bottom: 10px;
}
</style>