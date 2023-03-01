import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import router from './router'
import App from './App.vue'
import DemoView from './DemoView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: DemoView
    }
  ]
})

createApp(App).use(router).mount('#app')
