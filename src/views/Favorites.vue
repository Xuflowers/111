<template>
  <div class="favorites-page">
    <van-nav-bar title="我的收藏" left-arrow @click="goBack" />
    <div v-if="favorites.length === 0" class="empty-tip">
      <van-empty description="暂无收藏商品" />
    </div>
    <div class="favorites-list">
      <van-card
          v-for="item in favorites"
          :key="item.id"
          :title="item.name"
          :price="(item.price / 100).toFixed(2)"
          :thumb="item.image"
          :desc="item.desc"
          @click="goToDetail(item.id)"
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
</template>

<script setup>
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import { computed } from "vue";
  import {Toast} from "vant";

  const router = useRouter();
  const store = useStore();

  // 从 Vuex store 获取收藏列表
  const favorites = computed(() => store.state.favoriteList);

  const goToDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const handleAddToCart = (item) =>{
    store.dispatch('addToCart',item)
    Toast.success('已加入购物车')
  }

  const goBack = () => router.go(-1);
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}
.empty-tip {
  padding-top: 100px;
}
.favorites-list{
  padding: 12px;
}
.van-card{
  background-color: white;
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>
