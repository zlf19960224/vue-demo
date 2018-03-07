import Vue from 'vue'
import Router from 'vue-router'
import GoodList from '@/views/GoodList'
import Cart from '@/views/cart'
import address from '@/views/address'
import orderConfirm from '@/views/orderConfirm'
import orderSuccess from '@/views/orderSuccess'
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'goodlist',
      component: GoodList
    },{
      path:"/cart",
      name:'Cart',
      component:Cart
    },
    {
      path:"/address",
      name:'address',
      component:address
    },
    {
      path:"/orderConfirm",
      name:'orderConfirm',
      component:orderConfirm
    },
    {
      path:"/orderSuccess",
      name:'orderSuccess',
      component:orderSuccess
    }
  ]
})
