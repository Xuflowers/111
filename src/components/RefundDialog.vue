<template>
  <!-- 申请售后弹层：从底部弹出，高度占屏幕 80% -->
  <van-popup :show="visible" @update:show="$emit('update:visible', $event)" position="bottom" :style="{ height: '80%' }">
    <div class="refund-dialog">
      <!-- 弹层头部 -->
      <div class="dialog-header">
        <div class="dialog-title">申请售后</div>
        <van-icon name="cross" @click="close" />
      </div>

      <div class="dialog-content">
        <!-- 商品信息预览 -->
        <van-cell-group inset>
          <van-cell title="商品信息">
            <template #right-icon>
              <div class="product-preview">
                <img :src="getProductImage(order.products?.[0])" class="preview-image" />
                <span class="preview-name">{{ order.products?.[0]?.name }}</span>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 退款金额 -->
        <van-cell-group inset>
          <van-cell title="退款金额" :value="'¥' + (order.totalAmount || '0.00')" />
        </van-cell-group>

        <!-- 售后类型选择 -->
        <van-cell-group inset>
          <van-cell title="售后类型" />
          <div class="type-options">
            <van-cell
                v-for="option in typeOptions"
                :key="option.value"
                :title="option.label"
                clickable
                @click="refundType = option.value"
                :class="{ active: refundType === option.value }"
            >
              <template #right-icon>
                <van-checkbox :checked="refundType === option.value" :disabled="true" square />
              </template>
            </van-cell>
          </div>
        </van-cell-group>

        <!-- 售后原因选择 -->
        <van-cell-group inset>
          <van-cell title="售后原因" />
          <div class="reason-options">
            <van-cell
              v-for="reason in reasonOptions"
              :key="reason.value"
              :title="reason.label"
              clickable
              @click="selectedReason = reason.value"
              :class="{ active: selectedReason === reason.value }"
            >
              <template #right-icon>
                <van-checkbox :checked="selectedReason === reason.value" :disabled="true" square />
              </template>
            </van-cell>
          </div>
        </van-cell-group>

        <!-- 问题描述 -->
        <van-cell-group inset>
          <van-cell title="问题描述" />
          <textarea v-model="description" placeholder="请详细描述问题，如商品破损、发错货等..." class="description-input" />
        </van-cell-group>

        <!-- 凭证图片上传 -->
        <van-cell-group inset>
          <van-cell title="上传凭证">
            <template #right-icon>
              <van-uploader :file-list="fileList" multiple @after-read="afterRead" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 底部操作按钮 -->
      <div class="dialog-footer">
        <van-button type="default" block @click="close">取消</van-button>
        <van-button type="primary" block @click="submit" :disabled="!canSubmit">提交申请</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
// 售后申请弹层组件：用于填写售后类型、原因、问题描述并上传凭证
import { ref, computed } from 'vue'
import { Popup, Cell, CellGroup, Uploader, Icon, Button, Toast } from 'vant'

const props = defineProps({
  visible: Boolean,   // 弹层显隐
  order: Object       // 当前申请售后的订单对象
})

const emit = defineEmits(['close', 'submit'])

// ---------- 商品图片映射表 ----------
const productImageMap = {
  100: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20milk%20carton%20dairy%20product%20white%20background&image_size=square',
  101: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20avocado%20fruit%20on%20white%20background&image_size=square',
  102: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=durian%20fruit%20with%20thorn%20shell&image_size=square',
  103: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20cherries%20with%20green%20stem&image_size=square',
  104: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20blueberries%20in%20white%20bowl&image_size=square',
  201: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=potato%20chips%20snack%20package&image_size=square',
  202: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20bar%20dove%20brand&image_size=square',
  203: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mixed%20nuts%20in%20gift%20box&image_size=square',
  301: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=paper%20tissues%20box%20product&image_size=square',
  302: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laundry%20detergent%20bottle&image_size=square',
  303: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plastic%20storage%20box%20with%20lid&image_size=square',
  401: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beer%20bottle%20tsingtao%20brand&image_size=square',
  402: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20wine%20bottle%20cabernet&image_size=square',
  403: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20white%20liquor%20small%20bottle&image_size=square'
}
const DEFAULT_IMAGE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=generic%20product%20placeholder%20white%20background&image_size=square'

// 获取商品图片：优先使用已保存的 image，缺失时按商品 ID 回退
const getProductImage = (product) => {
  if (!product) return DEFAULT_IMAGE
  if (product.image && product.image.startsWith('http')) {
    return product.image
  }
  return productImageMap[product.id] || DEFAULT_IMAGE
}

// 表单字段
const refundType = ref('return')       // 售后类型（仅退货 / 退款退货）
const selectedReason = ref('')         // 选中的售后原因
const description = ref('')            // 问题描述
const fileList = ref([])               // 上传的凭证文件列表

// 售后类型选项
const typeOptions = [
  { value: 'refund', label: '仅退款' },
  { value: 'return', label: '退货退款' }
]
// 售后原因选项
const reasonOptions = [
  { value: 'quality', label: '商品质量问题' },
  { value: 'wrong', label: '发错商品' },
  { value: 'damage', label: '商品破损' },
  { value: 'missing', label: '少发漏发' },
  { value: 'other', label: '其他原因' }
]

// 是否可提交：至少选择一个原因
const canSubmit = computed(() => {
  return selectedReason.value
})

// 关闭弹层
const close = () => {
  emit('close')
}

// 图片读取后的回调：将文件加入列表
const afterRead = (file) => {
  fileList.value.push(file)
}

// 提交售后申请：校验通过后向父组件抛出 submit 事件，并重置表单
const submit = () => {
  if (!canSubmit.value) {
    Toast('请填写完整售后信息')
    return
  }

  emit('submit', {
    refundType: refundType.value,
    reason: selectedReason.value,
    description: description.value.trim(),
    files: fileList.value
  })

  // 重置表单
  refundType.value = 'return'
  selectedReason.value = ''
  description.value = ''
  fileList.value = []
}
</script>

<style scoped>
.refund-dialog {
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

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 10px;
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