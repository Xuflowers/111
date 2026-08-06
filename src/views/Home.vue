<template>
  <div class="home">
    <!-- 顶部搜索栏 -->
    <van-search
        v-model="searchText"
        placeholder="请输入搜索关键词"
        @search="onSearch"
        shape="round"
        class="search-bar"
    />

    <!-- 轮播图 -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(image, index) in bannerImages" :key="index">
        <img :src="image" alt="Banner Image" style="width: 100%; height: 150px; object-fit: cover;" />
      </van-swipe-item>
    </van-swipe>

    <!-- 功能按钮区 (宫格) -->
    <van-grid clickable :border="false" column-num="4" class="func-grid">
      <van-grid-item icon="photo-o" text="生鲜" @click="goToCategory(0)" />
      <van-grid-item icon="photo-o" text="零食" @click="goToCategory(1)" />
      <van-grid-item icon="photo-o" text="百货" @click="goToCategory(2)" />
      <van-grid-item icon="photo-o" text="酒水" @click="goToCategory(3)" />
    </van-grid>

    <!-- 商品信息展示区 -->
    <div class="product-list">
      <h3>热销商品</h3>
      <van-card
          v-for="item in hotProducts"
          :key="item.id"
          :num="item.sales"
          :price="(item.price / 100).toFixed(2)"
          :desc="item.desc"
          :title="item.name"
          :thumb="item.image"
          @click="goToDetail(item.id)"
      >
        <template #tags>
          <van-tag plain type="danger" v-if="item.tag">热销</van-tag>
        </template>
        <template #footer>
          <van-button size="mini" type="warning" @click.stop="addToCart(item)">加入购物车</van-button>
        </template>
      </van-card>
    </div>

    <!-- 底部导航 -->
    <AppTabBar />
  </div>
</template>

<script>
// 首页：包含搜索栏、轮播图、分类入口、热销商品列表
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'
import AppTabBar from '../components/AppTabBar.vue'

export default {
  name: 'HomeView',
  components: { AppTabBar },
  setup() {
    const store = useStore()
    const router = useRouter()
    const searchText = ref('')

    // 商品图片映射表
    const productImages = {
      101: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20avocado%20fruit%20on%20white%20background&image_size=square',
      102: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=durian%20fruit%20with%20thorn%20shell&image_size=square',
      201: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=potato%20chips%20snack%20package&image_size=square'
    }

    // 轮播图图片地址
    const bannerImages = [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grocery%20shopping%20banner%20fresh%20fruits&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20shopping%20promotion%20sale&image_size=landscape_16_9'
    ]

    // 修正：商品 ID 与 ProductDetail 页 allProducts 键保持一致
    const hotProducts = [
      { id: 101, name: '进口牛油果', price: 2990, sales: 1200, desc: '新鲜采摘', image: productImages[101], tag: true },
      { id: 102, name: '泰国金枕榴莲', price: 5990, sales: 800, desc: '果肉饱满', image: productImages[102], tag: true },
      { id: 201, name: '乐事薯片', price: 890, sales: 2000, desc: '薄脆香酥', image: productImages[201], tag: false }
    ]

    // 搜索：跳转到搜索结果页并携带关键词
    const onSearch = (val) => {
      if (val && val.trim()) {
        router.push(`/search?keyword=${encodeURIComponent(val.trim())}`)
      } else {
        Toast('请输入搜索关键词')
      }
    }

    // 跳转到对应分类页（携带分类索引）
    const goToCategory = (index) => {
      router.push(`/category?index=${index}`)
    }

    // 跳转到商品详情页
    const goToDetail = (id) => {
      router.push(`/product/${id}`)
    }

    // 加入购物车
    const addToCart = (product) => {
      // 注意：product 的 price 已经是“分”，直接传入即可
      store.dispatch('addToCart', {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        count: 1
      })
      Toast.success('已加入购物车')
    }

    return {
      searchText,
      bannerImages,
      hotProducts,
      onSearch,
      goToCategory,
      goToDetail,
      addToCart
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}
.search-bar {
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}
.banner img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.func-grid {
  margin: 10px 0;
}
.product-list h3 {
  padding-left: 16px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>