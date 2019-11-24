<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- 表格 -->
      <tree-table
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        show-index
        index-text="#"
        border
        :expand-type="false"
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template slot="srot" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="action" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeRolesById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%">
        <el-form
          ref="addCateRef"
          :model="addCateForm"
          label-width="80px"
          :rules="addCateFormRules"
        >
          <el-form-item label="分类名称:" prop="cat_name" label-width="100px">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:" label-width="100px">
            <!-- options 用来指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <el-cascader
              v-model="selectdKeys"
              :options="ParentCateList"
              expandTrigger="hover"
              :props="cascaderProps"
              style="width:100%"
              clearable
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类的对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="editCateDialogVisible"
        width="30%"
      >
        <el-form
          :model="editCateForm"
          :rules="editCateFormRules"
          ref="editCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类Id
        cat_pid: 0,
        // 分类的等级， 默认添加的是1级分类
        cat_level: 0
      },
      // 商品分类列表
      catesList: [],
      // 总的分类条数
      total: 0,
      // 表格列的信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'srot'
        },
        {
          label: '操作',
          type: 'template',
          template: 'action'
        }
      ],
      // 控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      // 父级数据列表
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 添加分类的验证规则
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 选中的父级分类id 数组
      selectdKeys: [],
      // 修改分类的表单数据
      editCateForm: {},
      // 修改分类的表单验证规则
      editCateFormRules: {
        cat_name: {
          required: true,
          message: '请输入分类名称',
          trigger: 'change'
        }
      }
    }
  },
  created() {
    this.getCtesList()
  },
  methods: {
    async getCtesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catesList = res.data.result
      this.total = res.data.total
    },
    // 点击编辑按钮 显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 点击按钮修改分类信息
    async editCate() {
      const { data: res } = await this.$http.put(
        'categories/' + this.editCateForm.cat_id,
        { cat_name: this.editCateForm.cat_name }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改分类名称失败')
      }
      console.log(res)
      this.$message.success('修改分类成功')
      // this.querInfo.type = this.editCateForm.cat_level
      this.getCtesList()
      this.editCateDialogVisible = false
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCtesList()
    },
    // 监听pagenum 改变事件
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCtesList()
    },
    // 点击按钮 显示添加分类的对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.ParentCateList = res.data
    },
    // 选择项发送变化触发这个函数
    handleChange() {
      // 如果selectdKeys的 length 大于 0 则表示选中了父级分类
      // 反之 就说明没有选择任何分类
      if (this.selectdKeys < 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectdKeys.length
      }
    },
    // 点击按钮 添加分类
    async addCate() {
      const { data: res } = await this.$http.post(
        'categories',
        this.addCateForm
      )
      if (res.meta.status !== 201) {
        return this.$message.error('添加分类失败')
      }
      this.$message.success('添加分类成功')
      this.getCtesList()
      this.addDialogVisible = false
    },
    // 点击按钮 删除分类
    async removeRolesById(id) {
      const isConfirm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认返回的是字符串confirm
      // 如果用户点击取消返回的是字符串cancel
      if (isConfirm !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.getCtesList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
</style>
