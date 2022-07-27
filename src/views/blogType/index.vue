<template>
  <div class="app-container">
    <!-- 搜索框 -->
    <div style="margin-top: 15px">
      <el-input
        placeholder="请输入要添加的分类名称，左边选择等级"
        v-model="input"
        class="input-with-select"
      >
        <el-select v-model="select" slot="prepend" placeholder="请选择">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
          <el-option label="4" value="4"></el-option>
          <el-option label="5" value="5"></el-option>
        </el-select>
      </el-input>
      <el-button
        type="primary"
        style="margin-left: 15px"
        @click="addBlogTypeHandle"
        >添加</el-button
      >
    </div>

    <!-- 表格 -->
    <el-table :data="data" style="margin-top: 20px; width: 100%" border>
      <el-table-column prop="date" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="title" label="文章分类" align="center">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column prop="description" label="文章数量" align="center">
        <template slot-scope="scope">{{ scope.row.articleCount }}</template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-tooltip
            class="item"
            effect="dark"
            content="编辑"
            placement="top"
            :hide-after="2000"
          >
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              size="mini"
              @click="editBlogTypeHandle(scope.row)"
            ></el-button>
          </el-tooltip>

          <!-- 删除按钮 -->
          <el-tooltip
            class="item"
            effect="dark"
            content="删除"
            placement="top"
            :hide-after="2000"
          >
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="deleteBlogTypeHandle(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑文章分类 -->
    <el-dialog title="编辑文章分类" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="分类名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="排序等级">
          <el-select v-model="form.order" placeholder="分类等级">
            <el-option label="1" value="1"></el-option>
            <el-option label="2" value="2"></el-option>
            <el-option label="3" value="3"></el-option>
            <el-option label="4" value="4"></el-option>
            <el-option label="5" value="5"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditBlogTypeHandle"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBlogType,
  addBlogType,
  delBlogType,
  findOneBlogType,
  updateOneBlogType,
} from "@/api/blogType.js";
export default {
  data() {
    return {
      input: "",
      data: [],
      select: "1",
      listLoading: false, //是否在加载中
      isExistence: false, //是否有该分类
      dialogFormVisible: false, //默认编辑dialog不显示
      form: {
        name: "",
        order: "",
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getBlogType().then(({ data }) => {
        this.data = data;
        this.listLoading = false;
      });
    },
    // 添加文章分类
    addBlogTypeHandle() {
      // 用户点击添加之后判断输入框是否有值
      if (this.input) {
        // 判断是否已经存在该分类
        for (const item of this.data) {
          if (item.name === this.input) {
            this.isExistence = true;
          }
        }
        if (this.isExistence) {
          // 进到这个if说明已经有这个分类了
          this.$message.warning("该分类已存在，请重新输入");
          this.isExistence = false;
        } else {
          // 说明该名称没有分类
          addBlogType({ name: this.input, order: this.select }).then(() => {
            this.$message.success("添加成功");
            this.fetchData();
          });
        }
      } else {
        this.$message.error("分类名称不能为空");
      }
    },
    // 编辑文章分类
    editBlogTypeHandle({ id }) {
      // 传过来的是整条数据，我们解构我们需要的id
      // 点开编辑按钮，要做什么事情： 1.数据回填  2.打开dialog
      findOneBlogType(id).then((res) => {
        this.form = res.data;
        this.dialogFormVisible = true;
      });
    },
    // 删除文章分类
    deleteBlogTypeHandle({ id }) {
      // 因为在绑定事件的时候传递过来的参数是整条数据，所以我们可以直接在接受参数这里解构，因为我们只要id
      // element组件 提示是否删除
      this.$confirm(
        "删除该分类后，该分类下面的所有文章将变为未分类状态，是否继续?",
        "是否删除此文章分类",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          // 用户点击确定要删除分类
          delBlogType(id).then(() => {
            this.fetchData(); //删除后重新获取文章内容
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 确认编辑分类
    confirmEditBlogTypeHandle() {
      updateOneBlogType({
        id: this.form.id,
        data: this.form,
      }).then(() => {
        this.fetchData(); //更新数据
        this.$message.success("数据更新成功");
        this.dialogFormVisible = false;
      });
    },
  },
};
</script>

<style>
.input-with-select {
  width: 400px;
}
</style>
