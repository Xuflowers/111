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
              :desc="item.desc"
              :thumb="item.image"
              @click="$router.push('/product/' + item.id)"
          >
            <template #tags>
              <van-tag plain type="danger" v-if="item.tag">热销</van-tag>
            </template>
            <template #footer>
              <van-button
                  size="mini"
                  type="warning"
                  @click.stop="handleAddToCart(item)"
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
// 商品分类页：左侧分类菜单 + 右侧商品列表，支持点击菜单滚动定位、滚动同步高亮
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'
import AppTabBar from '@/components/AppTabBar.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const activeKey = ref(0)            // 当前激活的分类索引
const mainContent = ref(null)       // 右侧内容容器的 ref，用于滚动控制

// 加入购物车
const handleAddToCart = (item) => {
  store.dispatch('addToCart', item)
  Toast.success('已加入购物车')
}

// ---------- 商品图片映射表 ----------
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

// ---------- 分类数据（生鲜、零食、百货、酒水）----------
const categories = [
  {
    name: '生鲜',
    products: [
      { id: 100, name: '澳洲进口牛奶',desc: '澳洲直采，醇香浓郁', price: 1290, image: productImages[100], tag:true},
      { id: 101, name: '进口牛油果', desc: '新鲜采摘', price: 2990, image: productImages[101], tag:true },
      { id: 102, name: '泰国金枕榴莲', desc: '果肉饱满', price: 5990, image: productImages[102], tag:true},
      { id: 103, name: '智利车厘子', desc: '颗颗饱满，脆甜多汁', price: 8990, image: productImages[103], tag:false },
      { id: 104, name: '秘鲁蓝莓', desc: '花青素丰富，酸甜可口', price: 2490, image: productImages[104], tag:false }
    ]
  },
  {
    name: '零食',
    products: [
      { id: 201, name: '乐事薯片', desc: '薄脆香酥', price: 890, image: productImages[201], tag:true },
      { id: 202, name: '德芙巧克力', desc: '丝滑浓郁，纵享丝滑', price: 1890, image: productImages[202], tag:false },
      { id: 203, name: '三只松鼠坚果', desc: '混合果仁，科学配比', price: 3990, image: productImages[203], tag:false }
    ]
  },
  {
    name: '百货',
    products: [
      { id: 301, name: '维达抽纸', desc: '柔韧不易破，湿水不易烂', price: 2990, image: productImages[301], tag:false },
      { id: 302, name: '蓝月亮洗衣液', desc: '深层洁净，低泡易漂', price: 4990, image: productImages[302], tag:true },
      { id: 303, name: '收纳箱', desc: '加厚耐用，带滑轮', price: 3990, image: productImages[303], tag:false }
    ]
  },
  {
    name: '酒水',
    products: [
      { id: 401, name: '青岛啤酒', desc: '麦香浓郁，泡沫细腻', price: 690, image: productImages[401], tag:false },
      { id: 402, name: '长城干红', desc: '赤霞珠干红，单宁柔和', price: 12990, image: productImages[402], tag:false },
      { id: 403, name: '江小白', desc: '单纯年轻，表达真我', price: 2990, image: productImages[403], tag:true }
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