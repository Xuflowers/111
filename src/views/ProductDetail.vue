<template>
  <div class="product-detail">
    <!-- 顶部导航栏 -->
    <van-nav-bar
        title="商品详情"
        left-text="返回分类"
        left-arrow
        @click-left="$router.push('/category')"
        fixed
    />

    <!-- 商品轮播图 -->
    <van-swipe class="goods-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(image, index) in product.images" :key="index">
        <img :src="image" class="swipe-img" />
      </van-swipe-item>
    </van-swipe>

    <!-- 商品基本信息 -->
    <div class="product-info">
      <div class="title-row">
        <h2 class="title">{{ product.name }}</h2>
        <van-tag v-if="product.isNew" type="danger" plain>新品</van-tag>
      </div>
      <div class="price-row">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ (product.price / 100).toFixed(2) }}</span>
      </div>
      <div class="meta-row">
        <span>运费：免运费</span>
        <span>剩余库存：{{ product.stock }} 件</span>
      </div>
    </div>

    <!-- 发货地 & 保障 & 参数 区块 -->
    <van-cell-group class="info-group">
      <van-cell title="发货" :value="product.origin" />
      <van-cell title="保障" :value="product.guarantees.join(' ')" />
      <van-cell title="参数">
        <template #value>
          <div class="params">
            <span v-for="(value, key) in product.specs" :key="key">{{ key }}：{{ value }}</span>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 宝贝详情区块 -->
    <div class="detail-section">
      <div class="section-title">宝贝详情</div>
      <div class="detail-content">
        <img v-for="(img, idx) in product.detailImages" :key="idx" :src="img" class="detail-img" />
        <div class="detail-text" v-html="product.detailText"></div>
      </div>
    </div>

    <!-- 底部操作栏（Vant 4 写法，若使用 Vant 2 请改为 van-goods-action） -->
    <van-action-bar>
      <van-action-bar-icon icon="chat-o" text="客服" @click="onContact" />
      <van-action-bar-icon icon="cart-o" text="购物车" @click="$router.push('/cart')" :badge="cartBadge" />
      <van-action-bar-button type="warning" text="加入购物车" @click="addToCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="onBuy" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'

const route = useRoute()
const router = useRouter()
const store = useStore()

// ---------- 扩展商品数据，适配 Category 模块所有商品 ----------
const allProducts = {
  // 生鲜类 (ID 101-104)
  101: {
    id: 101,
    name: '进口牛油果',
    price: 2990,
    stock: 100,
    isNew: false,
    origin: '墨西哥',
    guarantees: ['坏单包赔', '极速退款'],
    specs: { 品牌: '牛油果先生', 规格: '6个装' },
    images: [
      'https://img.yzcdn.cn/vant/apple-1.jpg',
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailText: '新鲜采摘，富含多种维生素，健康轻食首选。'
  },
  102: {
    id: 102,
    name: '泰国金枕榴莲',
    price: 5990,
    stock: 50,
    isNew: true,
    origin: '泰国',
    guarantees: ['坏单包赔', '假一赔四', '极速退款'],
    specs: { 品牌: '金枕头', 重量: '2-3kg' },
    images: [
      'https://img.yzcdn.cn/vant/apple-2.jpg',
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-2.jpg',
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailText: '果肉饱满，香甜软糯，冷冻后口感更佳。'
  },
  103: {
    id: 103,
    name: '智利车厘子',
    price: 8990,
    stock: 80,
    isNew: true,
    origin: '智利',
    guarantees: ['坏单包赔', '假一赔四'],
    specs: { 品牌: '樱桃谷', 规格: 'JJ级 2斤装' },
    images: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailText: '颗颗饱满，脆甜多汁，产地直发。'
  },
  104: {
    id: 104,
    name: '秘鲁蓝莓',
    price: 2490,
    stock: 120,
    isNew: false,
    origin: '秘鲁',
    guarantees: ['坏单包赔', '极速退款'],
    specs: { 品牌: '蓝精灵', 规格: '125g/盒' },
    images: [
      'https://img.yzcdn.cn/vant/apple-4.jpg',
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailText: '花青素丰富，保护视力，酸甜可口。'
  },
  // 零食类 (ID 201-203)
  201: {
    id: 201,
    name: '乐事薯片',
    price: 890,
    stock: 200,
    isNew: false,
    origin: '中国上海',
    guarantees: ['极速退款'],
    specs: { 品牌: '乐事', 口味: '经典原味', 净含量: '70g' },
    images: [
      'https://img.yzcdn.cn/vant/apple-1.jpg',
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailText: '薄脆香酥，休闲零食必备。'
  },
  202: {
    id: 202,
    name: '德芙巧克力',
    price: 1890,
    stock: 150,
    isNew: false,
    origin: '中国北京',
    guarantees: ['假一赔四', '极速退款'],
    specs: { 品牌: '德芙', 类型: '牛奶巧克力', 净含量: '43g' },
    images: [
      'https://img.yzcdn.cn/vant/apple-2.jpg',
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailText: '丝滑浓郁，纵享新丝滑。'
  },
  203: {
    id: 203,
    name: '三只松鼠坚果',
    price: 3990,
    stock: 90,
    isNew: true,
    origin: '安徽芜湖',
    guarantees: ['坏单包赔', '极速退款'],
    specs: { 品牌: '三只松鼠', 种类: '每日坚果', 净含量: '750g/箱' },
    images: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailText: '混合果仁，科学配比，健康美味。'
  },
  // 百货类 (ID 301-303)
  301: {
    id: 301,
    name: '维达抽纸',
    price: 2990,
    stock: 500,
    isNew: false,
    origin: '广东江门',
    guarantees: ['极速退款'],
    specs: { 品牌: '维达', 规格: '3层100抽*16包' },
    images: [
      'https://img.yzcdn.cn/vant/apple-1.jpg',
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailText: '柔韧不易破，湿水不易烂。'
  },
  302: {
    id: 302,
    name: '蓝月亮洗衣液',
    price: 4990,
    stock: 80,
    isNew: false,
    origin: '广东广州',
    guarantees: ['假一赔四'],
    specs: { 品牌: '蓝月亮', 香型: '自然清香', 容量: '3kg' },
    images: [
      'https://img.yzcdn.cn/vant/apple-2.jpg',
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailText: '深层洁净，低泡易漂。'
  },
  303: {
    id: 303,
    name: '收纳箱',
    price: 3990,
    stock: 60,
    isNew: true,
    origin: '浙江台州',
    guarantees: ['坏单包赔', '极速退款'],
    specs: { 品牌: '空间大师', 尺寸: '45L', 材质: 'PP' },
    images: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailText: '加厚耐用，带滑轮，居家收纳好帮手。'
  },
  // 酒水类 (ID 401-403)
  401: {
    id: 401,
    name: '青岛啤酒',
    price: 690,
    stock: 300,
    isNew: false,
    origin: '山东青岛',
    guarantees: ['极速退款'],
    specs: { 品牌: '青岛', 酒精度: '≥4.0%vol', 容量: '500ml' },
    images: [
      'https://img.yzcdn.cn/vant/apple-1.jpg',
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-1.jpg'
    ],
    detailText: '麦香浓郁，泡沫细腻，聚会畅饮。'
  },
  402: {
    id: 402,
    name: '长城干红',
    price: 12990,
    stock: 40,
    isNew: false,
    origin: '河北张家口',
    guarantees: ['假一赔四', '极速退款'],
    specs: { 品牌: '长城', 年份: '2018', 容量: '750ml' },
    images: [
      'https://img.yzcdn.cn/vant/apple-2.jpg',
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-2.jpg'
    ],
    detailText: '赤霞珠干红，单宁柔和，适合佐餐。'
  },
  403: {
    id: 403,
    name: '江小白',
    price: 2990,
    stock: 100,
    isNew: false,
    origin: '重庆',
    guarantees: ['极速退款'],
    specs: { 品牌: '江小白', 酒精度: '40%vol', 容量: '100ml' },
    images: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg'
    ],
    detailText: '单纯高粱酒，表达真我。'
  },
  // 保留原有的苹果商品 (ID 3，兼容可能的历史入口)
  3: {
    id: 3,
    name: '陕西甜富士冰糖心苹果（约680g/3个）',
    price: 2680,
    stock: 19,
    isNew: true,
    origin: '陕西宝鸡',
    guarantees: ['坏单包赔', '假一赔四', '极速退款'],
    specs: { 品牌: '枝纯', 价格: '100-200' },
    images: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailImages: [
      'https://img.yzcdn.cn/vant/apple-3.jpg',
      'https://img.yzcdn.cn/vant/apple-4.jpg'
    ],
    detailText: '2022季度嘎啦苹果新鲜当季水果整箱陕西甜富士冰糖心脆甜苹果'
  }
}

// 获取当前商品，若 ID 不存在则显示第一个商品作为兜底
const product = computed(() => {
  const id = parseInt(route.params.id)
  return allProducts[id] || allProducts[101] // 默认显示牛油果
})

// 购物车徽标数量
const cartBadge = computed(() => {
  const state = store.state
  const item = state.cartList[product.value.id]
  return item ? item.count : 0
})

const onContact = () => Toast('客服功能暂未接入')
const onBuy = () => Toast('即将跳转支付')

const addToCart = () => {
  store.dispatch('addToCart', {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.images[0]
  })
  Toast.success('已加入购物车')
}

onMounted(() => {
  if (!route.params.id) {
    Toast.fail('商品ID缺失')
    router.push('/category')
  }
})
</script>

<style scoped>
/* 样式保持与之前一致，可复用 */
.product-detail {
  padding-top: 46px;
  background-color: #f7f8fa;
  padding-bottom: 60px;
}
.goods-swipe {
  height: 300px;
  background-color: #f7f8fa;
}
.swipe-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}
.product-info {
  background: white;
  margin: 10px 12px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #333;
}
.price-row {
  margin: 8px 0;
  color: #ee0a24;
}
.price-symbol {
  font-size: 14px;
  vertical-align: top;
}
.price-value {
  font-size: 28px;
  font-weight: bold;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #969799;
  margin-top: 6px;
}
.info-group {
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}
.params {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #666;
}
.detail-section {
  background: white;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}
.section-title {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}
.detail-content {
  padding: 12px;
}
.detail-img {
  width: 100%;
  margin-bottom: 10px;
  border-radius: 8px;
}
.detail-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>