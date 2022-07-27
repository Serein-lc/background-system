<template>
  <div>
    <!-- 文章标题 -->
    <div class="block">文章标题</div>
    <div style="margin-bootom: 15px">
      <el-input v-model="form.title" placeholder="请输入标题"></el-input>
    </div>

    <!-- 文章编辑 -->
    <div class="block">文章编辑</div>
    <editor
      :initialValue="form.editorText"
      ref="toastuiEditor"
      height="600px"
    />

    <!-- 文章描述 -->
    <div class="block">文章描述</div>
    <el-input type="textarea" v-model="form.description" :rows="6"></el-input>

    <!-- 上传图片 -->
    <Upload uploadTitle="文章头图 " v-model="form.thumb" />

    <!-- 选择文章分类  应该去文章分类里面去拿数据-->
    <div class="block">选择分类</div>
    <el-select
      v-model="form.select"
      slot="prepend"
      placeholder="请选择文章分类"
    >
      <el-option
        v-for="item in blogType"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>

    <div>
      <!-- 发布按钮 -->
      <el-button
        type="primary"
        style="margin: 15px 0"
        @click="addArticleHandle"
        >{{ btnContent }}</el-button
      >
    </div>
  </div>
</template>

<script>
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/vue-editor";
import Upload from "@/components/Upload";
import { getBlogType } from "@/api/blogType.js";
import { addBlog, editBlog, findOneBlog } from "@/api/blog.js";
export default {
  props: ["mode"], //确认是那个模块在使用
  data() {
    return {
      form: {
        title: "", //文章标题
        editorText: "", //用户编辑的内容
        description: "", //文章的描述
        thumb: "", //文章头图地址
        select: "", //选择分类
      },
      blogType: [], //存放博客分类
      imageUrl: "", // 图片在服务器上面的地址
      btnContent: "发布文章", //发布和提交按钮的内容
    };
  },
  components: {
    editor: Editor,
    Upload,
  },
  created() {
    // 一进来就需要拿取分类数据
    getBlogType().then(({ data }) => {
      this.blogType = data;
    });
    if (this.mode === "edit") {
      // 一进来就拿到传递过来的id，根据id获取文章内容，回调表单
      this.id = this.$route.params.id;
      findOneBlog(this.id).then(({ data }) => {
        // 回填数据至表单
        this.form = data;
        // 要根据当前分类是否为空要做处理，有的文章可能未分类
        this.form.select = data.category === null ? "" : data.category.id;
        this.$refs.toastuiEditor.invoke("setHTML", data.htmlContent);
        this.btnContent = "确认修改";
      });
    }
  },
  methods: {
    addArticleHandle() {
      // 添加文章的业务逻辑 ： 1.获取表单内容  2.发送请求
      // 接口文档需要的东西不只是一个form表单，所以我们要组装对象
      let html = this.$refs.toastuiEditor.invoke("getHTML");
      let markdown = this.$refs.toastuiEditor.invoke("getMarkdown");

      // 接下来组装要传递给服务器的对象
      let obj = {
        title: this.form.title,
        description: this.form.description,
        createDate: new Date().getTime(),
        categoryId: this.form.select,
        htmlContent: html,
        thumb: this.form.thumb,
        markdownContent: markdown,
      };
      // 做判断 除了头像 其他的都要有
      if (obj.title && obj.description && obj.htmlContent && obj.categoryId) {
        if (this.mode === "add") {
          //添加文章模块
          addBlog(obj).then((res) => {
            this.$message.success("发布成功");
            this.$router.push("/blogList"); //跳转到文章列表
          });
        } else {
          editBlog({ id: this.form.id, data: obj }).then(() => {
            this.$router.push("/blogList"); //跳转到文章列表
            this.$message.success("文章修改成功");
          });
        }
      } else {
        this.$message.error("请填写所有内容");
      }
    },
  },
};
</script>

<style>
.block {
  margin: 15px 0;
  font-weight: 100;
}
</style>
