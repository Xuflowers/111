import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vant/lib/index.css'  // Vant 样式（Vant 4 通常使用 'vant/index.css'，但该路径可能仍有效）

// 引入所有需要的 Vant 组件
import {
    Search, Swipe, SwipeItem, Grid, GridItem, Card, Tag, Button, Tabbar, TabbarItem,
    CheckboxGroup, Stepper, SubmitBar, Checkbox, Toast, Sidebar, SidebarItem,
    Image as VanImage, Cell, CellGroup, NavBar, Icon, Empty, Tabs, Tab, Badge,
    ActionBar, ActionBarIcon, ActionBarButton,  // Vant 4 底部操作栏组件
    AddressList                                 // 地址列表组件
} from 'vant'

const app = createApp(App)

// 注册所有组件（链式调用）
app.use(Search).use(Swipe).use(SwipeItem).use(Grid).use(GridItem).use(Card).use(Tag)
    .use(Button).use(Tabbar).use(TabbarItem).use(CheckboxGroup).use(Stepper).use(SubmitBar)
    .use(Checkbox).use(Sidebar).use(SidebarItem).use(VanImage).use(Cell).use(CellGroup)
    .use(NavBar).use(Icon).use(Empty).use(Tabs).use(Tab).use(Badge)
    .use(ActionBar).use(ActionBarIcon).use(ActionBarButton)
    .use(AddressList)  // 注册地址列表组件

app.use(store).use(router).mount('#app')

// 将 Toast 挂载到全局属性，方便在组件中使用
app.config.globalProperties.$toast = Toast