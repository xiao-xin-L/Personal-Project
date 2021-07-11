<template>
  <div>
    <div
        v-for="(commentItem, index) in localComment"
        :key="index"
        class="comment-card"
        style="margin-bottom: 20px;"
    >
      <el-row :gutter="10">
        <el-col :span="2">
          <el-avatar :src="commentItem.userData.avatar" size="large"></el-avatar>
        </el-col>
        <el-col :span="6" style="font-size: 12px;">
          <span>{{ commentItem.userData.userName }}</span>
          <br>
          <span>{{ commentItem.lastModified | transformTime }}</span>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24" style="text-indent: 2em;">
          {{ commentItem.content }}
        </el-col>
        <el-col :span="24" style="border-left: 2px solid #cccccc; margin-top: 20px;">
          <div
              v-for="(sonCommentItem, index) in commentItem.comment"
              :key="index"
              style="margin: 20px;border-bottom: 1px dashed #c0c4cc"
          >
            <el-row :gutter="10">
              <el-col :span="2">
                <el-avatar :src="sonCommentItem.userData.avatar" size="large"></el-avatar>
              </el-col>
              <el-col :span="6" style="color: #3a8ee6;font-size: 12px;">
                <span>{{ sonCommentItem.userData.userName }}</span>
                <br>
                <span>{{ sonCommentItem.lastModified | transformTime }}</span>
              </el-col>
              <el-col :span="16" style="color: #ea4d95;text-indent: 2em;">
                {{ sonCommentItem.content }}
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-button
              type="text"
              icon="el-icon-s-comment"
              @click="switchComment(commentItem)"
          >回复
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="10" v-if="commentItem.isComment">
        <el-col :span="24">
          <el-input v-model="commentStr" placeholder="请输入评论内容"></el-input>
        </el-col>
        <el-col :span="24" style="text-align: right;margin-top: 20px;">
          <el-button type="primary" @click="cancelComment(commentItem,'son')">取消</el-button>
          <el-button type="primary" @click="addComment(commentItem,'son')">回复</el-button>
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="10" v-if="isComment">
      <el-col :span="24">
        <el-input v-model="articleCommentStr" placeholder="请输入评论内容"></el-input>
      </el-col>
      <el-col :span="24" style="text-align: right;margin-top: 20px;">
        <el-button type="primary" @click="cancelComment(localComment,'father')">取消</el-button>
        <el-button type="primary" @click="addComment(localComment,'father')">回复</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BlogService from "@/service/BlogService";

export default {
  name: "Global-Comment",
  props: {
    comment: {
      type: Array,
      default() {
        return []
      }
    },
    blogId: {
      type: Number,
      default: 0
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
  watch:{
    comment:{
      handler(){
        this.localComment = this.comment.slice(0);
      },
      immediate:true
    }
  },
  data() {
    return {
      articleCommentStr: '',
      commentStr: '',
      localComment: [],
      isComment: true,
      userData: JSON.parse(sessionStorage.getItem('userData')),
    }
  },
  methods: {
    switchComment(commentItem) {
      // 关闭之前开启的所有回复框
      this.localComment.forEach((item) => {
        if (item !== commentItem) {
          item.isComment = false;
        }
      })
      // 切换当前这个评论的回复状态
      commentItem.isComment = !commentItem.isComment;
      if (commentItem.isComment) {
        this.isComment = false;// 如果我们在对某个回复框做评论, 那么关掉它
      } else {
        this.isComment = true;// 如果我们在对某个回复框做评论, 那么打开它
      }
    },
    cancelComment(target, type) {
      switch (type) {
        case 'father':
          this.articleCommentStr = '';
          break;
        case  'son':
          this.commentStr = '';
          target.isComment = false;
          this.isComment = true;
          break;
      }
    },
    addComment(target, type) {
      let commentData = {
        fatherId: undefined,
        blogId: this.blogId,
        comment: {}
      }
      switch (type) {
        case 'father':
          commentData.comment = {
            userData: {
              userName: this.userData.userName,
              avatar: this.userData.avatar
            },
            content:this.articleCommentStr,
            isComment: false,
            comment: []
          }
          this.articleCommentStr = '';
          break;
        case  'son':
          commentData.fatherId = target.commentId;
          commentData.comment = {
            userData: {
              userName: this.userData.userName,
              avatar: this.userData.avatar
            },
            content:this.commentStr,
          }
          this.commentStr = '';
          target.isComment = false;
          this.isComment = true;
          break;
      }
      BlogService.createBlogComment(commentData).then(rs => {
        switch (type) {
          case 'father':
            target.push(rs.data.data.commentData)
            break;
          case  'son':
            target.comment.push(rs.data.data.commentData);
            target.isComment = false;
            break;
        }
      })
    }
  }
}
</script>

<style scoped>
.comment-card {
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 6px rgba(0, 0, 0, 0.1);
}
</style>
