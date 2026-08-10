<template>
  <!-- 帮助/客服页：静态入口列表（客服、常见问题、意见反馈、关于我们） -->
  <div class="page">
    <van-nav-bar title="我的帮助" left-arrow @click-left="goBack" />
    <van-cell-group inset style="margin-top: 10px;">
      <van-cell title="联系在线客服" icon="chat-o" is-link @click="goToHelpServer"/>
      <van-cell title="常见问题解答" icon="question-o" is-link @click="goToQuestionAnswer"/>
      <van-cell title="意见反馈" icon="edit" is-link @click="showFeedBack=true"/>
      <van-cell title="关于我们" icon="info-o" is-link @click="showAboutUs=true"/>
    </van-cell-group>
    <van-popup
        v-model:show="showFeedBack"
        position="center"
        class="feedback-popup"
        duration="0.5"
        closeable
    >
      <div class="feedback">
        <h3>意见反馈</h3>
        <van-field
            v-model="feedbackText"
            type="textarea"
            placeholder="请填写您遇到的问题"
            rows="6"/>
        <van-button type="primary" block @click="submitFeedBack">提交</van-button>
        <van-button type="default" block @click="showFeedBack=false">取消</van-button>
      </div>
    </van-popup>
    <van-popup
        v-model:show="showAboutUs"
        position="bottom"
        :style="{height:'100%'}"
        duration="0.5"
        round
        closeable>
    <div class="AboutUs">
      <div class="title">
        <h2>示例文本</h2>
      </div>
      <div class="body">
        六王毕，四海一，蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。五步一楼，十步一阁；廊腰缦回，檐牙高啄；各抱地势，钩心斗角。盘盘焉，囷囷焉，蜂房水涡，矗不知其几千万落。长桥卧波，未云何龙？复道行空，不霁何虹？高低冥迷，不知西东。歌台暖响，春光融融；舞殿冷袖，风雨凄凄。一日之内，一宫之间，而气候不齐。
        妃嫔媵嫱，王子皇孙，辞楼下殿，辇来于秦。朝歌夜弦，为秦宫人
      </div>
    </div>
    </van-popup>
  </div>
</template>

<script setup>
// 帮助页：仅展示入口，未实现具体跳转逻辑
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { Toast } from 'vant'

const router = useRouter()
const userInfo = ref(null)
const goBack = () => router.go(-1)
// 挂载时从 localStorage 读取用户信息
onMounted(() => {
  const storedUser = localStorage.getItem('user-info')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

// 跳转到联系客服页
const goToHelpServer = () => {
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/helpserver')
}

const goToQuestionAnswer = () =>{
  if (!userInfo.value) {
    alert('请先登录！')
    router.push('/login')
    return
  }
  router.push('/questionanswer')
}

const showFeedBack = ref(false)
const feedbackText = ref('')
const submitFeedBack = () =>{
  if(!feedbackText.value.trim()){
    Toast('请输入您遇到的问题')
    return
  }
  Toast.success('提交成功')
  feedbackText.value=''
  showFeedBack.value= false
}

const showAboutUs =ref(false)

</script>

<style>
.AboutUs{
  width: 80%;
  margin: 0 auto;
  margin-top: 60px;
  padding: 20px;
  text-align: center;
  background-color: #e5e5e6;
  border-radius: 5%;
}

/* ---------- 意见反馈弹窗样式 ---------- */
/* 控制 popup 外层：宽度、圆角、位置 */
/* 注意：van-popup 会 teleport 到 body，不能加 scoped，否则样式不生效 */
.feedback-popup {
  width: 90% !important;             /* 弹窗宽度 */
  border-radius: 16px !important;    /* 自定义圆角 */
  overflow: hidden;                  /* 内容不超出圆角 */
  margin-top: -30%;
}

/* 控制弹窗内部内容：内边距、标题、按钮间距 */
.feedback {
  padding: 20px 20px;
}
.feedback h3 {
  text-align: center;
  margin-bottom: 16px;
  font-size: 18px;
}
.feedback .van-field__control {
  background-color: #e5e8ec;
  border-radius: 16px;
  padding: 10px;
}
.feedback .van-button {
  margin-top: 12px;
  border-radius: 8px;
}
</style>
