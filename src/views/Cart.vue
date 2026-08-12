<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />

    <van-empty v-if="cartItems.length === 0" description="购物车空空如也" />

    <div v-else class="cart-list">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <van-checkbox
            :model-value="item.checked"
            @click="toggleCheck(item.id)"
            icon-size="20px"
        />

        <van-card
            :num="item.count"
            :price="(item.price / 100).toFixed(2)"
            :title="item.name"
            :desc="item.desc"
            :thumb="getCartItemImage(item)"
            class="cart-card"
        >
          <template #tags>
            <van-tag plain type="danger" v-if="item.tag">热销</van-tag>
          </template>
          <template #num>
            <van-stepper
                v-model="item.count"
                theme="round"
                button-size="22"
                disable-input
                @change="onChange(item)"
            />
          </template>
          <template #footer>
            <van-button
                size="mini"
                type="danger"
                @click="handleDelete(item.id)"
            >
              删除
            </van-button>
          </template>
        </van-card>
      </div>
    </div>
    <van-submit-bar
        :price="finalPrice"
        :disabled="checkedCount === 0"
        :button-text="`去结算(${checkedCount})`"
        @submit="onSubmit"
    >
      <span v-if="discountPrice > 0" class="discount-tip">已优惠 ¥{{ (discountPrice / 100).toFixed(2) }}</span>
      <van-coupon-cell
          :coupons="coupons"
          :chosen-coupon="chosenCoupon"
          @click="showList = true"
      />
      <van-checkbox :model-value="allChecked" @click="toggleAll">全选</van-checkbox>
    </van-submit-bar>
    <van-popup
        v-model:show="showList"
        round
        position="bottom"
        style="height: 60%;
          padding-top: 4px;">
      <van-coupon-list
          :coupons="coupons"
          :chosen-coupon="chosenCoupon"
          :disabled-coupons="disabledCoupons"
          @change="onCouponChange"
          @exchange="onExchange"/>
    </van-popup>
    <AppTabBar />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted} from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Dialog, Toast, CouponCell, CouponList} from 'vant'
import AppTabBar from '@/components/AppTabBar.vue'

const store = useStore()
const router = useRouter()

// ---------- 商品图片映射表（用于历史购物车数据缺少 image 字段时的回退）----------
const productImageMap = {
  100: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20milk%20carton%20white%20background&image_size=square',
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

// 获取购物车商品图片：优先使用已保存的 image，缺失时按商品 ID 回退
const getCartItemImage = (item) => {
  if (item.image && item.image.startsWith('http')) {
    return item.image
  }
  return productImageMap[item.id] || DEFAULT_IMAGE
}

const cartItems = computed(() => store.getters.cartItems)
const totalPrice = computed(() => store.getters.totalPrice)
const checkedCount = computed(() => store.getters.checkedCount)

const allChecked = computed(() =>
    cartItems.value.length > 0 && cartItems.value.every(item => item.checked)
)

const toggleCheck = (id) => {
  store.commit('TOGGLE_CHECK', id)
}

const toggleAll = () => {
  store.commit('CHECK_ALL', !allChecked.value)
}

const onChange = (item) => {
  store.commit('UPDATE_COUNT', { id: item.id, count: item.count })
}

const handleDelete = (id) => {
  Dialog.confirm({
    title: '确认删除',
    message: '确定要将该商品从购物车中移除吗？',
  }).then(() => {
    store.dispatch('removeFromCart', id)
  }).catch(() => {})
}

    // ---------- 优惠券基础数据 ----------
    // 默认优惠券模板
    const defaultCoupon = {
      available: 1,
      threshold: 0,
      condition: '无门槛\n最多优惠120元',
      reason: '',
      value: 1500,
      name: '优惠劵',
      startAt: Math.floor(Date.now() / 1000),
      endAt: Math.floor(Date.now() / 1000) + 86400 * 30,
      valueDesc: '15.0',
      unitDesc: '元'
    };

    // ---------- 优惠券持久化 ----------
    // 从 localStorage 读取已选优惠券索引
    const loadChosenCoupon = () => {
      const stored = localStorage.getItem('chosen-coupon')
      return stored !== null ? parseInt(stored, 10) : -1
    }
    // 保存已选优惠券索引到 localStorage
    const saveChosenCoupon = (index) => {
      localStorage.setItem('chosen-coupon', index.toString())
    }
    // 从 localStorage 读取优惠券列表
    const loadCoupons = () => {
      const stored = localStorage.getItem('coupon-list')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          return [defaultCoupon]
        }
      }
      return [defaultCoupon]
    }

    const coupons = ref(loadCoupons())
    const disabledCoupons = ref([])
    const showList = ref(false)
    const chosenCoupon = ref(loadChosenCoupon())

    // 根据当前购物车金额自动分类优惠券到可用/不可用列表
    const classifyCoupons = () => {
      const availableList = []
      const disabledList = []

      // 记录当前选中券的名称（用于分类后找回索引）
      const currentSelected = chosenCoupon.value >= 0 ? coupons.value[chosenCoupon.value] : null
      const selectedName = currentSelected?.name || null

      // 合并所有优惠券进行判断
      const allCoupons = [...coupons.value, ...disabledCoupons.value]

      allCoupons.forEach(c => {
        if (totalPrice.value >= c.threshold) {
          availableList.push({ ...c, available: 1, reason: '' })
        } else {
          // 差额 = 门槛 - 当前已选金额
          const diff = (c.threshold - totalPrice.value) / 100
          disabledList.push({
            ...c,
            available: 0,
            reason: `还差¥${diff.toFixed(2)}可用`
          })
        }
      })

      coupons.value = availableList
      disabledCoupons.value = disabledList

      // 根据名称找回选中券的新索引
      if (selectedName) {
        const newIndex = availableList.findIndex(c => c.name === selectedName)
        if (newIndex !== -1) {
          chosenCoupon.value = newIndex
        } else {
          // 券变为不可用或不存在，清除选中
          chosenCoupon.value = -1
          saveChosenCoupon(-1)
        }
      } else if (chosenCoupon.value >= 0) {
        // 索引越界（如刷新后券数量变化），清除选中
        chosenCoupon.value = -1
        saveChosenCoupon(-1)
      }
    }

    const onCouponChange = (index) => {
      chosenCoupon.value = index;
      saveChosenCoupon(index);
      showList.value = false;
    };

    // 当前选中的优惠券对象
    const selectedCoupon = computed(() => {
      return chosenCoupon.value >= 0 ? coupons.value[chosenCoupon.value] : null
    })
    // 优惠金额
    const discountPrice = computed(() => {
      if (!selectedCoupon.value) return 0
      return Math.min(selectedCoupon.value.value, totalPrice.value)
    })
    // 实付金额 = 原价 - 优惠（最低为 0）
    const finalPrice = computed(() => Math.max(0, totalPrice.value - discountPrice.value))

    // 监听购物车商品变化，自动重新分类优惠券
    watch(totalPrice, () => {
      classifyCoupons()
    })

    // 监听优惠券列表变化，自动保存到 localStorage
    watch(coupons, () => {
      localStorage.setItem('coupon-list', JSON.stringify(coupons.value))
    }, { deep: true })

    // 组件挂载时初始化分类（确保刷新后选中状态正确）
    onMounted(() => {
      classifyCoupons()
    })

    const onExchange = (code) => {
      const newCoupon = {
        available: 1,
        threshold: 50000,
        condition: '满500元可用\n最多优惠200元',
        reason: '',
        value: 20000,
        name: '兑换券',
        startAt: Math.floor(Date.now() / 1000),
        endAt: Math.floor(Date.now() / 1000) + 86400 * 30,
        valueDesc: '200.0',
        unitDesc: '元'
      }
      coupons.value.push(newCoupon)
      // 兑换后立即根据当前金额分类
      classifyCoupons()
      Toast.success('兑换成功')
    }
    const onSubmit = async () => {
      if (checkedCount.value === 0) {
        Toast('请选择要结算的商品')
        return
      }
      try {
        await store.dispatch('createOrder', {
          remark: '来自购物车的订单',
          discount: discountPrice.value,
          couponName: selectedCoupon.value?.name || ''
        })
        const usedCoupon = selectedCoupon.value
        if (usedCoupon){
          const removeCouponFrom = (arr) => {
            const idx = arr.findIndex(c => c.name === usedCoupon.name && c.value === usedCoupon.value)
            if (idx !==  -1){
              arr.splice(idx,1)
            }
          }
          removeCouponFrom(coupons.value)
          removeCouponFrom(disabledCoupons.value)
          localStorage.setItem('coupon-list',JSON.stringify(coupons.value))
          chosenCoupon.value = -1
          saveChosenCoupon(-1)
          classifyCoupons()
        }
        Toast.success({
          message:'订单创建成功',
          forbidClick:true,
        }),
        setTimeout(()=>{
          Toast.loading({
            message:'正在跳转订单界面',
            forbidClick:true,
          });
        },1500)
        setTimeout(()=>{
          router.push('/orders?status=pending-payment')
        },2000)
      } catch (error) {
        Toast(error.message)
      }
    }
</script>

<style scoped>
.cart-page {
  padding-bottom: 110px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.cart-list { padding: 10px; }
.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
}
.cart-card {
  flex: 1;
  margin-left: 10px;
}

:deep(.van-submit-bar) {
  bottom: 50px !important;
  z-index: 100;
}

:deep(.van-submit-bar__bar) {
  min-height: 110px;
  flex-wrap: wrap !important;
}

.discount-tip {
  color: #ee0a24;
  font-size: 12px;
  width: 100%;
  padding: 4px 16px 0;
}

</style>