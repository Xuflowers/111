<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    closeable
    :style="{ height: '80%' }"
    @update:show="$emit('update:visible', $event)"
  >
    <div class="evaluate-dialog">
      <div class="dialog-header">
        <div class="dialog-title"><h3>发表真实评价</h3></div>
      </div>
      <div class="dialog-content">
        <van-cell-group>
          <van-cell>
            <van-field
              v-model="evaluatebackText"
              type="textarea"
              placeholder="为大家写下你的真实评价吧"
              rows="6"/>
          </van-cell>
          <van-cell>
            <div class="rate-row">
              <span class="rate-label">商品评价</span>
              <van-rate
                  v-model="rates.product"
                  :size="24"
                  color="#ffd21e"
                  void-color="#eee"
                  allow-half
              />
            </div>
          </van-cell>
          <van-cell>
            <div class="rate-row">
              <span class="rate-label">商品符合度</span>
              <van-rate
                  v-model="rates.match"
                  :size="24"
                  color="#ffd21e"
                  void-color="#eee"
                  allow-half
              />
            </div>
          </van-cell>
          <van-cell>
            <div class="rate-row">
              <span class="rate-label">物流速度</span>
              <van-rate
                  v-model="rates.logistics"
                  :size="24"
                  color="#ffd21e"
                  void-color="#eee"
                  allow-half
              />
            </div>
          </van-cell>
          <van-cell>
            <div class="rate-row">
              <span class="rate-label">包装评价</span>
              <van-rate
                  v-model="rates.package"
                  :size="24"
                  color="#ffd21e"
                  void-color="#eee"
                  allow-half
              />
            </div>
          </van-cell>
          <van-cell>
            <div class="rate-row">
              <span class="rate-label">商家评价</span>
              <van-rate
                  v-model="rates.merchant"
                  :size="24"
                  color="#ffd21e"
                  void-color="#eee"
                  allow-half
              />
            </div>
          </van-cell>
          <div class="button-group">
            <van-button type="default" block @click="$emit('update:visible', false)">取消</van-button>
            <van-button type="primary" block @click="handleSubmit">提交</van-button>
          </div>
        </van-cell-group>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {Toast} from "vant";

const props = defineProps<{
  visible: boolean
  order: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'review-success', order: any): void
}>()

// 评价文本
const evaluatebackText = ref('')

const rates = reactive({
  product: 0,      // 商品评价
  match: 0,        // 商品符合度
  logistics: 0,    // 物流速度
  package: 0,      // 包装评价
  merchant: 0      // 商家评价
})

// 提交评价：通知父组件评价完成，并清空输入
const handleSubmit = () => {
  if (!evaluatebackText.value.trim()) {
    Toast.fail('请完整评价')
    return
  }
  // 把评分数据合并到订单对象一起传出
  emit('review-success', {
    ...props.order,
    review: {
      content: evaluatebackText.value,
      rates: { ...rates }
    }
  })
  // 清空表单
  evaluatebackText.value = ''
  Object.keys(rates).forEach(k => rates[k] = 0)
}
</script>

<style scoped>
.evaluate-dialog {
  padding: 1px 10px;
}
.evaluate-dialog h3 {
  text-align: center;
  margin-bottom: 16px;
  font-size: 18px;
}
.evaluate-dialog :deep(.van-field__control) {
  background-color: #e5e8ec;
  border-radius: 16px;
  padding: 10px;
}
.rate-row{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  width: 100%;
}
.rate-label{
  font-size: 14px;
  flex-shrink: 0;
}
.button-group{
  width: 100%;
  display: inline-flex;
}
.van-button{
  margin: 12px;
  border-radius: 8px;
  width: 100%;
}
</style>