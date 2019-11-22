import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/Login' },
    { path: '/Login', component: Login },
    {
      path: '/Home',
      component: Home,
      redirect: '/Welcome',
      children: [
        { path: '/Welcome', component: Welcome },
        { path: '/Users', component: Users },
        { path: '/Rights', component: Rights },
        { path: '/Roles', component: Roles }
      ]
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, form, next) => {
  // to 将要访问的路径
  // form 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //  next()  放行   nexgt('/Login') 强制跳转
  if (to.path === '/Login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/Login')
  next()
})
export default router
