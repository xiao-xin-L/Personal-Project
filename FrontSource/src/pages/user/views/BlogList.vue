<template>
  <div>
    <el-page-header
      @back="goBack"
    >
    </el-page-header>
    <div style="display: flex;flex-wrap: wrap;margin-top: 20px;">
      <el-card
          class="box-card"
          v-for="(articleData, index) in blogList"
          :key="index"
          style="width: 45%;margin-bottom: 20px;"
      >
        <div slot="header" class="clearfix" @click="goArticleDetail(articleData)">
          <span>{{ articleData.title }}</span>
        </div>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-image
                style="height: 300px;"
                :src="articleData.cover"
                fit="contain"
            >
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </el-col>
          <el-col :span="16">
            <el-row :gutter="10">
              <el-col :span="24">
                <p>{{ articleData.description }}</p>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="2">
                <el-avatar :src="articleData.author.avatar" size="small"></el-avatar>
              </el-col>
              <el-col :span="6">
                <p>{{ articleData.author.userName }}</p>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <p>{{ articleData.lastModified | transformTime }}</p>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24" style="display: flex;justify-content: space-around;">
                <el-badge :value="articleData.likes" class="item">
                  <el-button size="small">喜欢</el-button>
                </el-badge>
                <el-badge :value="articleData.views" class="item" type="primary">
                  <el-button size="small">阅览</el-button>
                </el-badge>
                <el-badge :value="articleData.comment.length" class="item" type="warning">
                  <el-button size="small">回复</el-button>
                </el-badge>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <div style="display: flex;justify-content: center;">
      <el-pagination
          layout="prev, pager, next"
          :page-size="searchParams.limit"
          :total="totalNum"
          @current-change="changePage"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import BlogService from "@/service/BlogService";

export default {
  name: "BlogList",
  data() {
    return {
      blogList: [],
      searchParams:{
        offset: 0,
        limit: 10,
        searchKey: ''
      },
      totalNum: 0
    }
  },
  mounted() {
    this.searchParams.searchKey = this.$route.params.searchKey;
    this.getBlogData()
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
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    changePage(page){
      this.searchParams.offset = (page-1) * this.searchParams.limit;
      this.getBlogData();
    },
    getBlogData(){
      BlogService.getPublicBlog(this.searchParams).then(rs=>{
        this.blogList = rs.data.data.blogList;
        this.totalNum = rs.data.data.totalNum
      })
    },
    goArticleDetail(articleData) {
      this.$router.push(`/article/${articleData.blogId}`)
    }
  }
}
</script>

<style scoped>

</style>
