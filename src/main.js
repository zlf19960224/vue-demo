// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import infiniteScroll from'vue-infinite-scroll'
import {currency} from './util/currency'
import Vuex from 'vuex';
Vue.config.productionTip = false
Vue.use(infiniteScroll)
Vue.use(Vuex);
const store =new Vuex.Store({
  state:{
    cartCount:0
  },
  mutations:{
    updateCartCount(state,cartCount){
      state.cartCount+=cartCount;
    },
    initCartCount(state,cartCount){
      state.cartCount=cartCount;
    }
  }
})
/* eslint-disable no-new */
Vue.filter("currency",currency);
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
