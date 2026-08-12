<template>
  <div class="favorites-page">
    <van-nav-bar title="我的收藏" left-arrow @click-left="goUser">
      <template #right>
        <span
            class="manage-btn"
            @click="toggleManageMode"
        >
          {{ isManaging ? '完成' : '管理'}}
        </span>
      </template>
    </van-nav-bar>
    <div v-if="favorites.length === 0" class="empty-tip">
      <van-empty description="暂无收藏商品" />
    </div>
    <div v-else class="favorites-list">
      <div v-for="item in favorites" :key="item.id" class="favorites-item">
        <van-checkbox
          :model-value="item.checked"
          @click="toggleFavChecked(item.id)"
          icon-size="20px"
        ></van-checkbox>
        <van-card
            :key="item.id"
            :title="item.name"
            :price="(item.price / 100).toFixed(2)"
            :thumb="item.image"
            :desc="item.desc"
            @click="goToDetail(item.id)"
            class="favorites-card"
        >
          <template #tags>
            <van-tag plain type="danger" v-if="item.tag">热销</van-tag>
          </template>
        </van-card>
      </div>
    </div>
  </div>
  <van-submit-bar v-if="!isManaging"
      :button-text="`加入购物车(${checkedFavCount})`"
      @submit="handleAddToCart"
  ></van-submit-bar>
  <van-submit-bar v-else
      :button-text="`删除(${checkedFavCount})`"
      @submit="handleDeleteFav"
  ></van-submit-bar>
</template>

<script setup>
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import { computed, ref} from "vue";
  import {Toast, Checkbox, CheckboxGroup} from "vant";

  const router = useRouter();
  const store = useStore();
  // 从 Vuex store 获取收藏列表
  const favorites = computed(() => store.state.favoriteList);
  const checkedFavCount = computed(() => store.getters.checkedFavCount)

  const goToDetail = (id) => {
    router.push(`/product/${id}`);
  };
  const goUser =() => {
    router.push('/user')
  }

  const handleAddToCart = () => {
    const checkedItems = store.state.favoriteList.filter(item => item.checked)
    if (checkedItems.length === 0) {
      Toast('请先选择商品')
      return
    }
    checkedItems.forEach(item => {
      store.dispatch('addToCart', item)
    })
    Toast.success('已加入购物车')
  }
  const handleDeleteFav = (item) =>{
    const checkedItem = store.state.favoriteList.filter(item => item.checked)
    if (checkedItem.length === 0) {
      Toast('请先选择商品')
      return
    }
    checkedItem.forEach(item => {
      store.dispatch('toggleFavorite',item)
    })
    Toast.success('已取消收藏')
  }
  const isManaging = ref (false)
  const toggleManageMode = () =>{
    isManaging.value = !isManaging.value
  }
  const toggleFavChecked = (id) =>{
    store.commit('TOGGLE_FAVCHECK',id)
  }
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
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}
.favorites-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 8px;
}
.manage-btn{

}
</style>
