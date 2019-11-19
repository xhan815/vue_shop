import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
  .use(Form)
  .use(FormItem)
  .use(Input)
// 把弹框组件挂载到vue 原型上
Vue.prototype.$message = Message
