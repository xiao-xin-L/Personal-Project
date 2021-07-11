<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="文章管理" name="article">
        <el-table
            :data="blogList"
            style="width: 100%">
          <el-table-column
              type="expand"
          >
            <template slot-scope="scope">
              <div v-html="scope.row.content"></div>
            </template>
          </el-table-column>
          <el-table-column
              prop="title"
              label="标题"
              width="180"
          >
          </el-table-column>
          <el-table-column
              prop="blogId"
              label="博客id"
          >
          </el-table-column>
          <el-table-column
              prop="author.userName"
              label="作者"
          >
          </el-table-column>
          <el-table-column
              label="封面"
          >
            <template slot-scope="scope">
              <el-image
                  fit="fill"
                  :src="scope.row.cover"
                  style="width: 100px;"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="发布时间"
          >
            <template slot-scope="scope">
              {{ scope.row.lastModified |transformTime }}
            </template>
          </el-table-column>
          <el-table-column
              prop="description"
              label="简介"
          >
          </el-table-column>
          <el-table-column
              label="tags"
          >
            <template slot-scope="scope">
              <el-tag
                  type="success"
                  v-for="(tag, index) in scope.row.tags"
                  :key="index" style="margin-right: 10px;margin-bottom: 10px"
              >{{tag}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              width="180"
          >
            <template slot-scope="scope">
              <el-button type="danger" @click="rejectedBlog(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="新用户管理" name="user">
        <el-table
            :data="userList"
            style="width: 100%">
          <el-table-column
              prop="userName"
              label="用户名"
              width="180"
          >
          </el-table-column>
          <el-table-column
              prop="avatar"
              label="头像"
          >
            <template slot-scope="scope">
              <el-image
                  fit="fill"
                  :src="scope.row.avatar"
                  style="width: 100px;"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column
              prop="introduction"
              label="用户简介"
          >
          </el-table-column>
          <el-table-column
              label="是否通过审核"
          >
            <template slot-scope="scope">
              <el-switch v-model="scope.row.approved" active-color="#13ce66" inactive-color="#ff4949" disabled></el-switch>
            </template>
          </el-table-column>
          <el-table-column
              label="是否为管理员"
          >
            <template slot-scope="scope">
              <el-switch v-model="scope.row.isAdmin" active-color="#13ce66" inactive-color="#ff4949" disabled></el-switch>
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              width="180"
          >
            <template slot-scope="scope">
              <el-button type="danger" @click="rejectedUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <el-pagination
              layout="prev, pager, next"
              :total="userTotalNum"
              :page-size="searchUserParams.limit"
              @current-change="handleUserCurrentChange"
          >
          </el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AuthorService from "@/service/AuthorService";
import BlogService from "@/service/BlogService";

export default {
  name: "DBManger",
  data() {
    return {
      searchUserParams: {
        limit: 10,
        offset: 0
      },
      userTotalNum: 0,
      userList: [],
      searchBlogParams: {
        limit: 10,
        offset: 0
      },
      BlogTotalNum: 0,
      blogList: [],
      activeName: 'article'
    }
  },
  filters: {
    transformTime(time) {
      let blogCreateTime = new Date(time); // 获取博客发布的时间
      let currentTime = new Date(); //当前时间
      let offsetTime = currentTime - blogCreateTime; // 时间差 单位是ms
      let offsetST = offsetTime / 1000; // 转成s
      let offsetMT = offsetST / 60; // min
      let offsetHT = offsetMT / 60; // 转成h
      let offsetDT = offsetHT / 24; // days
      if (offsetDT >= 365) {
        return `发表于${Math.floor(offsetDT / 365)} 年之前`;
      } else if (offsetDT >= 30 && offsetDT < 365) {
        return `发表于${Math.floor(offsetDT / 30)} 月之前`;
      } else if (offsetDT >= 7 && offsetDT < 30) {
        return `发表于${Math.floor(offsetDT / 7)} 周之前`;
      } else if (offsetDT >= 1 && offsetDT < 7) {
        return `发表于${Math.floor(offsetDT)} 天之前`;
      } else if (offsetHT >= 1) {
        return `发表于${Math.floor(offsetHT)} 小时之前`;
      } else if (offsetMT >= 1) {
        return `发表于${Math.floor(offsetMT)} 分钟之前`;
      } else if (offsetST >= 0) {
        return `发表于${Math.floor(offsetST)} 秒钟之前`;
      }
    }
  },
  created() {
    this.getUserList();
    this.getBlogList();
  },
  methods: {
    getBlogList() {
      BlogService.getAllBlog(this.searchBlogParams).then(rs => {
        this.blogTotalNum = rs.data.data.blogTotalNum;
        this.blogList = rs.data.data.blogList;
      })
    },
    rejectedBlog(article) {
      BlogService.deleteUser({
        blogId: article.blogId
      }).then(rs => {
        if (rs.status === 200) {
          this.$message.success('删除成功');
          this.getBlogList();
        }
      })
    },
    handleBlogCurrentChange(page) {
      this.searchBlogParams.offset = (page - 1) * this.searchBlogParams.limit;
      this.getBlogList();
    },
    getUserList() {
      AuthorService.getAllUserList(this.searchUserParams).then(rs => {
        this.userTotalNum = rs.data.data.userTotalNum;
        this.userList = rs.data.data.userList;
      })
    },
    rejectedUser(user) {
      this.$confirm('此操作将永久删除该用户以及其所有博客, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        AuthorService.deleteUser({
          key: user.key
        }).then(rs => {
          if (rs.status === 200) {
            this.$message.success('删除成功');
            this.getUserList();
          }
        })
      }).catch(() => {
      });

    },
    handleUserCurrentChange(page) {
      this.searchUserParams.offset = (page - 1) * this.searchUserParams.limit;
      this.getUserList();
    }
  }
}
</script>

<style scoped>

</style>
