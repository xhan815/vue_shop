<template>
  <el-container class="home-contaoner">
    <!-- 头部区域 -->
    <el-header>
      <div class="logo-box">
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 菜单栏区域 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EEF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + item2.path"
              v-for="item2 in item.children"
              :key="item2.id"
              @click="saveNavState('/' + item2.path)"
            >
              <i class="el-icon-menu"></i>
              {{ item2.authName }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 菜单列表
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出功能函数
    loginOut() {
      window.sessionStorage.clear()
      this.$router.push('/Login')
    },
    // 获取左侧菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error('获取菜单失败')
      }
      this.menuList = res.data
    },
    // 点击按钮切换菜单折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>
<style lang="less" scope>
.home-contaoner {
  height: 100%;
}
.el-header {
  background-color: #2b3d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0 !important;
  align-items: center;
}
.el-aside {
  background-color: #333744;
  .toggle-button {
    background-color: #4a5a6a;
    color: #ccc;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2em;
  }
  .el-menu {
    border: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.logo-box {
  display: flex;
  align-items: center;
  span {
    padding-left: 10px;
    color: #eaedf1;
    font-size: 22px;
  }
}
.iconfont {
  margin-right: 10px;
}
</style>
