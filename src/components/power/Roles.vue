<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true"
        >添加角色</el-button
      >
      <!-- 角色列表区域 -->
      <el-table border :data="rolesList" stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', { bdtop: i1 === 0 }, 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5"
                ><el-tag closable @close="removeRights(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag
                ><i class="el-icon-caret-right"></i
              ></el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[{ bdtop: i2 !== 0 }, 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二三级权限 -->
                  <el-col :span="6"
                    ><el-tag
                      closable
                      type="success"
                      @close="removeRights(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    ><i class="el-icon-caret-right"></i
                  ></el-col>
                  <el-col :span="18"
                    ><el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRights(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    ></el-col
                  >
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSdtRightsDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="resetaddForm"
      >
        <!-- 用户修改内容 -->
        <el-form
          :model="addForm"
          label-width="70px"
          ref="addFormRef"
          :rules="addFormRules"
        >
          <el-form-item label-width="80px" label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="resetEditForm"
      >
        <!-- 用户修改内容 -->
        <el-form
          :model="editRolesInfo"
          label-width="70px"
          ref="editFormRef"
          :rules="addFormRules"
        >
          <el-form-item label-width="80px" label="角色名称" prop="roleName">
            <el-input v-model="editRolesInfo.roleName"></el-input>
          </el-form-item>
          <el-form-item label-width="80px" label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesInfo.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightsDialogVisible"
        width="50%"
        @close="setRightsDialogClosed"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightsList"
          show-checkbox
          :props="treeProps"
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultKey"
          ref="treeRef"
        >
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 当前角色信息
      editRolesInfo: {},
      // 控制修改角色信息对话框的显示与隐藏
      editDialogVisible: false,
      // 所有权限列表数据
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认勾选的权限id
      defaultKey: [],
      rolesId: '',
      // 控制分配权限对话框的显示与隐藏
      setRightsDialogVisible: false,
      // 添加角色表单验证
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //   获取所有的角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rolesList = res.data
    },
    // 监听添加角色对话框的关闭事件
    resetaddForm() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听修改角色对话框的关闭事件
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮添加新角色
    addRoles() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 点击编辑按钮获取当前用户信息并弹框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      this.editRolesInfo = res.data
      this.editDialogVisible = true
    },
    // 点击按钮实现角色修改
    editRoles() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolesInfo.roleId,
          {
            roleName: this.editRolesInfo.roleName,
            roleDesc: this.editRolesInfo.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    // 点击按钮删除当前角色
    async removeRolesById(id) {
      const isConfirm = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果角色点击确认返回的是字符串confirm
      // 如果角色点击取消返回的是字符串cancel
      if (isConfirm !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('成功删除角色')
      this.getRolesList()
    },
    // 点击按钮删除指定权限
    async removeRights(role, rightId) {
      const isConfirm = await this.$confirm(
        '此操作将永久删除该角色权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果角色点击确认返回的是字符串confirm
      // 如果角色点击取消返回的是字符串cancel
      if (isConfirm !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色权限失败')
      }
      this.$message.success('成功删除角色权限')
      role.children = res.data
    },
    // 展开分配权限的对话框
    async showSdtRightsDialog(role) {
      this.rolesId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightsList = res.data
      // 递归获取三级权限的id
      this.getLeafkey(role, this.defaultKey)
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式获取角色下所有的三级权限id 并保存到 defaultKey 数组中
    getLeafkey(node, arr) {
      // 如果node节点不包含children 属性， 则是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafkey(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightsDialogClosed() {
      this.defaultKey = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.rolesId}/rights`,
        {
          rids: idStr
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #ccc;
}
.bdbottom {
  border-bottom: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
