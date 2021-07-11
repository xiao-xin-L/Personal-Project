<template>
  <div>
    <el-page-header
        @back="goBack"
        :content="blogData.title"
    ></el-page-header>
    <el-card class="box-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <el-row :gutter="10">
          <el-col :span="2">
            <el-avatar
                :src="blogData.author.avatar"
                size="large"
            >
            </el-avatar>
          </el-col>
          <el-col :span="6">
            <span>{{ blogData.author.userName }}</span>
            <br>
            <span>{{ blogData.lastModified | transformTime }}</span>
          </el-col>
          <el-col :span="8" :offset="8">
            <el-button
                type="warning"
                :icon="userData.userDetail.likes.includes(blogId)?'el-icon-star-on':'el-icon-star-off'"
                circle
                @click="switchLike"
            ></el-button>
            <el-button
                type="primary"
                :icon="userData.userDetail.attentions.includes(blogData.author.userName)?'el-icon-check':'el-icon-plus'"
                @click="switchAttentions"
                v-if="!(blogData.author.userName === userData.userName)"
            >关注
            </el-button>
            <el-button
                type="danger"
                icon="el-icon-s-custom"
                @click="switchBlackList"
                v-if="!(blogData.author.userName === userData.userName)"
            >
              {{ userData.userDetail.blacklist.includes(blogData.author.userName) ? '已拉黑' : '拉黑' }}
            </el-button>
            <el-button
                type="danger"
                icon="el-icon-thumb"
                @click="switchTipOff"
            >举报
            </el-button>
          </el-col>
        </el-row>
      </div>
      <div>
        <div v-html="blogData.content"></div>
        <div style="margin-top: 20px;">
          <el-tag type="success" v-for="(tag, index) in blogData.tags" :key="index" style="margin-right: 20px;">{{
              tag
            }}
          </el-tag>
        </div>
        <div style="margin-top: 20px;">
          <el-row>
            <el-col :span="1"><i class="el-icon-star-on"></i>{{ blogData.likes }}</el-col>
            <el-col :span="1"><i class="el-icon-view"></i>{{ blogData.views }}</el-col>
            <el-col :span="1"><i class="el-icon-s-comment"></i>{{ blogData.comment.length }}</el-col>
          </el-row>
        </div>
      </div>
      <el-divider><i class="el-icon-s-comment"></i></el-divider>
      <GlobalComment
          :blog-id="blogId"
          :comment="blogData.comment"
      ></GlobalComment>
    </el-card>
    <el-dialog
        title="举报文章"
        :visible.sync="isShowTipOff"
        width="30%"
    >
      <el-input v-model="tipOffReason" placeholder="请输入举报原因" type="textarea"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowTipOff = false">取 消</el-button>
        <el-button type="primary" @click="switchTipOff">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BlogService from "@/service/BlogService";
import UserDetailService from "@/service/UserDetailService";
import TipOffService from "@/service/TipOffService";
import GlobalComment from '@/components/Global-Comment'
export default {
  name: "Article-Detail",
  components:{
    GlobalComment
  },
  data() {
    return {
      blogId: '',
      blogData: {
        title: '',
        author: {
          userName: '',
          avatar: ''
        },
        description: '',
        comment: [],
        cover: '',
        views: 0,
        likes: 0,
        lastModified: '',
        tags: []
      },
      userData: JSON.parse(sessionStorage.getItem('userData')),
      tipOffReason: '',
      isShowTipOff: false
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    switchTipOff() {
      this.isShowTipOff = !this.isShowTipOff;
      if (!this.isShowTipOff) {
        const data = {
          blogId: this.blogId,
          description: this.blogData.description,
          cover: this.blogData.cover,
          title: this.blogData.title,
          reason: this.tipOffReason
        };
        TipOffService.tipBlog(data).then(() => {
          this.$message.success('举报成功')
        })
      }
    },
    switchBlackList() {
      if (this.userData.userDetail.blacklist.includes(this.blogData.author.userName)) {
        // 取消点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.blacklist.splice(tempData.userDetail.blacklist.indexOf(this.blogData.author.userName), 1);
        // 从本地数据干掉用户名
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.blacklist.splice(this.userData.userDetail.blacklist.indexOf(this.blogData.author.userName), 1);
        // 从本地数据干掉用户名

        UserDetailService.unBlickList({
          userName: this.blogData.author.userName
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('取消拉黑成功')
          } else {
            this.$message.error('取消拉黑失败')
          }
        })

      } else {
        // 点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.blacklist.push(this.blogData.author.userName);
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.blacklist.push(this.blogData.author.userName);

        UserDetailService.setBlackList({
          userName: this.blogData.author.userName
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('拉黑成功')
          } else {
            this.$message.error('拉黑失败')
          }
        })
      }
    },
    switchAttentions() {
      if (this.userData.userDetail.attentions.includes(this.blogData.author.userName)) {
        // 取消点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.attentions.splice(tempData.userDetail.attentions.indexOf(this.blogData.author.userName), 1);
        // 从本地数据干掉用户名
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.attentions.splice(this.userData.userDetail.attentions.indexOf(this.blogData.author.userName), 1);
        // 从本地数据干掉用户名

        UserDetailService.unAttentions({
          userName: this.blogData.author.userName
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('取消关注成功')
          } else {
            this.$message.error('取消关注失败')
          }
        })

      } else {
        // 点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.attentions.push(this.blogData.author.userName);
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.attentions.push(this.blogData.author.userName);

        UserDetailService.setAttentions({
          userName: this.blogData.author.userName
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('关注成功')
          } else {
            this.$message.error('关注失败')
          }
        })
      }
    },
    switchLike() {
      if (this.userData.userDetail.likes.includes(this.blogId)) {
        // 取消点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.likes.splice(tempData.userDetail.likes.indexOf(this.blogId), 1);// 从本地数据干掉点赞的博客id
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.likes.splice(this.userData.userDetail.likes.indexOf(this.blogId), 1);// 从本地数据干掉点赞的博客id

        UserDetailService.unLikes({
          blogId: this.blogId
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('取消点赞成功')
          } else {
            this.$message.error('取消点赞失败')
          }
        })

      } else {
        // 点赞的逻辑
        // 修改本地sessionStorage数据
        let tempData = JSON.parse(sessionStorage.getItem('userData'));
        tempData.userDetail.likes.push(this.blogId);// 从本地数据增加点赞的博客id
        sessionStorage.setItem('userData', JSON.stringify(tempData));

        // 修改组件内数据
        this.userData.userDetail.likes.push(this.blogId);// 从本地数据增加点赞的博客id

        UserDetailService.setLikes({
          blogId: this.blogId
        }).then(rs => {
          if (rs.data.status === 200) {
            this.$message.success('点赞成功')
          } else {
            this.$message.error('点赞失败')
          }
        })
      }
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
    this.blogId = Number(this.$route.params.id)
    BlogService.getBlogById({
      blogId: this.blogId
    }).then(rs => {
      console.log('博客的详细数据', rs.data);
      this.blogData = rs.data.data.blogData;
    })
  }
}
</script>

<style scoped>

</style>
