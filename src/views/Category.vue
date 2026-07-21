<template>
  <div class="category">
    <van-nav-bar title="商品分类" />

    <div class="content">
      <!-- 左侧菜单 -->
      <van-sidebar v-model="activeKey" class="sidebar">
        <van-sidebar-item
            v-for="(category, index) in categories"
            :key="index"
            :title="category.name"
            @click="onClickNav(index)"
        />
      </van-sidebar>

      <!-- 右侧内容 -->
      <div class="main-content" ref="mainContent" @scroll="onScroll">
        <div
            v-for="(category, index) in categories"
            :key="index"
            :id="'category-' + index"
            class="category-section"
        >
          <h3>{{ category.name }}</h3>
          <van-card
              v-for="item in category.products"
              :key="item.id"
              :title="item.name"
              :price="(item.price / 100).toFixed(2)"
              :thumb="item.image"
              @click="$router.push('/product/' + item.id)"
          >
            <template #footer>
              <van-button
                  size="mini"
                  type="warning"
                  @click.stop="$store.dispatch('addToCart', item)"
              >
                加入购物车
              </van-button>
            </template>
          </van-card>
        </div>
      </div>
    </div>

    <AppTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppTabBar from '@/components/AppTabBar.vue'

const route = useRoute()
const router = useRouter()
const activeKey = ref(0)
const mainContent = ref(null)

// ---------- 分类数据（生鲜、零食、百货、酒水）----------
const categories = [
  {
    name: '生鲜',
    products: [
      { id: 101, name: '进口牛油果', price: 2990, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 102, name: '泰国金枕榴莲', price: 5990, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 103, name: '智利车厘子', price: 8990, image: 'https://img.yzcdn.cn/vant/apple-3.jpg' },
      { id: 104, name: '秘鲁蓝莓', price: 2490, image: 'https://img.yzcdn.cn/vant/apple-4.jpg' }
    ]
  },
  {
    name: '零食',
    products: [
      { id: 201, name: '乐事薯片', price: 890, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 202, name: '德芙巧克力', price: 1890, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 203, name: '三只松鼠坚果', price: 3990, image: 'https://img.yzcdn.cn/vant/apple-3.jpg' }
    ]
  },
  {
    name: '百货',
    products: [
      { id: 301, name: '维达抽纸', price: 2990, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 302, name: '蓝月亮洗衣液', price: 4990, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 303, name: '收纳箱', price: 3990, image: 'https://img.yzcdn.cn/vant/apple-3.jpg' }
    ]
  },
  {
    name: '酒水',
    products: [
      { id: 401, name: '青岛啤酒', price: 690, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 402, name: '长城干红', price: 12990, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 403, name: '江小白', price: 2990, image: 'https://img.yzcdn.cn/vant/apple-3.jpg' }
    ]
  }
]

// 点击左侧菜单，滚动到对应区域
const onClickNav = (index) => {
  activeKey.value = index
  const target = document.getElementById('category-' + index)
  if (target && mainContent.value) {
    mainContent.value.scrollTop = target.offsetTop
  }
}

// 滚动时自动高亮当前可见的分类菜单（增强体验）
const onScroll = () => {
  if (!mainContent.value) return
  const scrollTop = mainContent.value.scrollTop
  // 获取所有分类区块的 offsetTop
  const sections = categories.map((_, idx) => {
    const el = document.getElementById('category-' + idx)
    return el ? el.offsetTop : 0
  })
  // 找到最接近 scrollTop 的区块索引
  let current = 0
  for (let i = 0; i < sections.length; i++) {
    if (scrollTop >= sections[i] - 100) {
      current = i
    } else {
      break
    }
  }
  if (current !== activeKey.value) {
    activeKey.value = current
  }
}

// 从首页跳转时，根据 query 参数自动激活对应分类
onMounted(async () => {
  const indexParam = route.query.index
  if (indexParam !== undefined) {
    const idx = parseInt(indexParam)
    if (!isNaN(idx) && idx >= 0 && idx < categories.length) {
      activeKey.value = idx
      await nextTick()
      const target = document.getElementById('category-' + idx)
      if (target && mainContent.value) {
        mainContent.value.scrollTop = target.offsetTop
      }
    }
  }
})
</script>

<style scoped>
.category {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}
.content {
  display: flex;
  height: calc(100vh - 96px);
}
.sidebar {
  width: 100px;
  flex-shrink: 0;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f7f8fa;
}
.category-section {
  margin-bottom: 20px;
}
.category-section h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.van-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
}
</style>