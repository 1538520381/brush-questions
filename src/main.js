import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import emoji from 'node-emoji'
import 'element-ui/lib/theme-chalk/index.css'
import '@/icons'

Vue.use(ElementUI)
Vue.prototype.emoji = emoji

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
