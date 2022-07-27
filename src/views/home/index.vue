<template>
  <div class="app-container">
    <!-- 首页标语展示 -->
    <el-table :data="data" style="width: 100%" border>
      <el-table-column prop="date" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="150" align="center">
        <template slot-scope="scope">{{ scope.row.title }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center">
        <template slot-scope="scope">{{ scope.row.description }}</template>
      </el-table-column>

      <el-table-column label="中图预览" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 100px"
            :src="scope.row.midImg2"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="大图预览" align="center">
        <template slot-scope="scope"
          ><el-image
            style="width: 100px"
            :src="scope.row.bigImg2"
            fit="fill"
          ></el-image
        ></template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
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
              @click="editBannerhandle(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 点击编辑页面出现画面 -->
    <el-dialog title="请编辑信息" :visible.sync="dialogFormVisible" top="5vh">
      <el-form :model="form">
        <!-- 编辑页标题 -->
        <el-form-item label="标题">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>

        <!-- 编辑页描述 -->
        <el-form-item label="描述">
          <el-input v-model="form.description" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <el-row>
        <el-col :span="12">
          <el-form>
            <el-form-item label="首页中图">
              <!-- 中图 -->
              <Upload v-model="form.midImg" />
            </el-form-item>
          </el-form>
        </el-col>

        <el-col :span="12">
          <el-form>
            <el-form-item label="首页大图">
              <!-- 大图 -->
              <Upload v-model="form.bigImg" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editBannerConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBanner, setBanner } from "@/api/banner.js";
import { server_URL } from "@/urlconfig.js";
// 上传图片组件
import Upload from "@/components/Upload/index.vue";
export default {
  components: {
    Upload,
  },

  data() {
    return {
      data: [], //首页标语后端返回的数据
      dialogFormVisible: false, //是否显示编辑页
      form: {
        id: "",
        midImg: "",
        bigImg: "",
        description: "",
        title: "",
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      getBanner().then((res) => {
        this.data = res.data;
        for (var item of this.data) {
          item.midImg2 = server_URL + item.midImg;
          item.bigImg2 = server_URL + item.bigImg;
        }
      });
    },
    // 处理点击编辑按钮
    editBannerhandle(bannerInfo) {
      // 1.将数据回填到编辑表单中，2.打开编辑页
      this.form = { ...bannerInfo };
      this.dialogFormVisible = true;
    },
    editBannerConfirm() {
      //从编辑表单里面拿到用户修改的数据发送给服务器
      // 因为api文档要求三个首页标语都要发送过去，哪怕只改了一个
      let arr = [...this.data];
      console.log(this.data);
      // 找到被修改的
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == this.form.id) {
          arr[i] = this.form;
        }
      }
      // 将数据传递到服务器
      setBanner(arr).then((res) => {
        this.dialogFormVisible = false; //关闭对话框
        this.$message({
          message: "修改成功",
          type: "success",
        });
        this.fetchData(); //重新获取数据
      });
    },
  },
};
</script>

<style></style>
