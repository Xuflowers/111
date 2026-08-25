import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite 构建配置
export default defineConfig({
  // 部署到 GitHub Pages 子路径时必须配置 base，否则静态资源路径错误
  // 本地开发时 base 为 '/'，生产构建时 base 为 '/111/'
  base: process.env.NODE_ENV === 'production' ? '/111/' : '/',
  // 插件列表：注册 @vitejs/plugin-vue 以支持 .vue 单文件组件
  plugins: [vue()],
  resolve: {
    alias: {
      // 配置路径别名 '@' 指向 src 目录，方便模块导入
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',   // 监听所有网络接口，方便局域网内手机真机调试
    port: 5173         // 开发服务器端口
  }
})