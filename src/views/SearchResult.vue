<template>
  <div class="search-result">
    <van-nav-bar title="搜索结果" left-arrow @click-left="goBack" fixed />
    <div class="search-bar-fixed">
      <van-search
          v-model="keyword"
          placeholder="请输入搜索关键词"
          shape="round"
          @search="onSearch"
          @clear="onClear"
          :show-action="false"
      />
    </div>

    <div class="result-list">
      <van-empty v-if="results.length === 0" description="没有找到相关商品" />
      <van-card
          v-for="item in results"
          :key="item.id"
          :title="item.name"
          :price="(item.price / 100).toFixed(2)"
          :thumb="item.image"
          @click="goToDetail(item.id)"
      >
        <template #footer>
          <van-button size="mini" type="warning" @click.stop="addToCart(item)">
            加入购物车
          </van-button>
        </template>
      </van-card>
    </div>
  </div>
</template>

<script setup>
// 搜索结果页：根据关键词模糊匹配商品名称并展示结果列表
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'

// ---------- 商品图片映射表（使用 text_to_image API，保证图片与商品名称对应）----------
const productImages = {
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

// ---------- 商品数据源（与 ProductDetail 保持一致）----------
const productsMap = {
  100: { id: 100, name: '澳洲进口牛奶', price: 1290, image: productImages[100] },
  101: { id: 101, name: '进口牛油果', price: 2990, image: productImages[101] },
  102: { id: 102, name: '泰国金枕榴莲', price: 5990, image: productImages[102] },
  103: { id: 103, name: '智利车厘子', price: 8990, image: productImages[103] },
  104: { id: 104, name: '秘鲁蓝莓', price: 2490, image: productImages[104] },
  201: { id: 201, name: '乐事薯片', price: 890, image: productImages[201] },
  202: { id: 202, name: '德芙巧克力', price: 1890, image: productImages[202] },
  203: { id: 203, name: '三只松鼠坚果', price: 3990, image: productImages[203] },
  301: { id: 301, name: '维达抽纸', price: 2990, image: productImages[301] },
  302: { id: 302, name: '蓝月亮洗衣液', price: 4990, image: productImages[302] },
  303: { id: 303, name: '收纳箱', price: 3990, image: productImages[303] },
  401: { id: 401, name: '青岛啤酒', price: 690, image: productImages[401] },
  402: { id: 402, name: '长城干红', price: 12990, image: productImages[402] },
  403: { id: 403, name: '江小白', price: 2990, image: productImages[403] }
}
// 将对象转为数组，便于遍历筛选
const allProducts = Object.values(productsMap)

const route = useRoute()
const router = useRouter()
const store = useStore()
const keyword = ref('')

// 搜索结果（模糊匹配商品名称，忽略大小写）
const results = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return []
  return allProducts.filter(product => product.name.toLowerCase().includes(kw))
})

// 从 URL 获取初始关键词
onMounted(() => {
  const kw = route.query.keyword
  if (kw) {
    keyword.value = kw
  }
})

// 搜索事件：将关键词同步到 URL query，便于分享与刷新保持
const onSearch = () => {
  if (!keyword.value.trim()) {
    Toast('请输入关键词')
    return
  }
  // 更新 URL 参数，但不重新加载页面
  router.replace({ query: { keyword: keyword.value } })
}

// 清空搜索：同时清除 URL 中的 keyword 参数
const onClear = () => {
  keyword.value = ''
  router.replace({ query: {} })
}

// 加入购物车
const addToCart = (product) => {
  store.dispatch('addToCart', { ...product, count: 1 })
  Toast.success('已加入购物车')
}

// 跳转到商品详情页
const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.search-result {
  padding-top: 46px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
.search-bar-fixed {
  position: fixed;
  top: 46px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: white;
  padding: 8px 12px;
  border-bottom: 1px solid #ebedf0;
  width: 100%;
  max-width: 375px;
}
.result-list {
  margin-top: 70px;
  padding: 12px;
}
.van-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>