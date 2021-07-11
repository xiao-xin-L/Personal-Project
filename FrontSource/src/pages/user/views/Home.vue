<template>
  <el-container>
    <el-header
      style="border-bottom: 1px solid #ccc; padding: 10px 0;margin-bottom: 20px;"
    >
      <el-row :gutter="10">
        <el-col
            :offset="3"
            :span="18"
            style="display: flex; align-items: center;justify-content: space-between;"
        >
          <img src="@/assets/logo.png" style="height: 30px;">
          <el-input
              v-model="searchStr"
              placeholder="请输入博客的标题"
              style="width: 60%;"
              @keypress.enter.native="goBlogListPage"
          >
            <el-button type="primary" slot="append" icon="el-icon-search" @click="goBlogListPage"></el-button>
          </el-input>
          <el-dropdown v-if="hasPermission" @command="handleSelectSetting">
            <el-avatar
              :src="userData.avatar"
              :title="userData.userName"
              fit="scale-down"
              shape="square"
            >
            </el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item disabled>{{userData.userName}}</el-dropdown-item>
              <el-dropdown-item command="setting">设置</el-dropdown-item>
              <el-dropdown-item command="signOut">登出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-link type="primary" href="login.html" v-if="!hasPermission">登录</el-link>
          <el-button type="text" icon="el-icon-s-home" v-if="hasPermission" @click="goChartHome">小树洞</el-button>
          <el-button type="text" icon="el-icon-edit" v-if="hasPermission" @click="goEditArticle">写文章</el-button>
          <el-button type="text" icon="el-icon-s-data" v-if="isAdmin" @click="goAdmin">站点管理系统</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="300px" v-if="hasPermission">
        <UserInfo :user-data="userData"></UserInfo>
      </el-aside>
      <el-main>
        <el-tabs v-model="activeName" @tab-click="switchTab">
          <el-tab-pane label="广场" name="article">
            <Community></Community>
          </el-tab-pane>
          <el-tab-pane label="我的文章" name="myself">
            <MyBlog></MyBlog>
          </el-tab-pane>
          <el-tab-pane label="喜欢" name="like">
            <MyLikeBlog></MyLikeBlog>
          </el-tab-pane>
          <el-tab-pane label="评论" name="comment">
            <MyComment></MyComment>
          </el-tab-pane>
          <el-tab-pane label="关注" name="attention">
            <MyAttentions></MyAttentions>
          </el-tab-pane>
          <el-tab-pane label="黑名单" name="blacklist">
            <MyBlacklist></MyBlacklist>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
    <el-dialog
        title="更新用户信息"
        :visible.sync="isShowSetting"
        width="60%"
      >
      <UserSetting></UserSetting>
    </el-dialog>
  </el-container>
</template>

<script>
import AuthorService from "@/service/AuthorService";
import UserInfo from "@/pages/user/components/UserInfo";
import Community from "@/pages/user/components/Community";
import MyBlog from "@/pages/user/components/MyBlog";
import MyLikeBlog from "@/pages/user/components/MyLikeBlog";
import MyComment from "@/pages/user/components/MyComment";
import MyAttentions from "@/pages/user/components/MyAttentions";
import MyBlacklist from "@/pages/user/components/MyBlacklist";
import UserSetting from "@/pages/user/components/UserSetting";
import defaultConfig from "@/config/config.default";
export default {
  name: "Home",
  components:{
    UserInfo,
    Community,
    MyBlog,
    MyLikeBlog,
    MyComment,
    MyAttentions,
    MyBlacklist,
    UserSetting
  },
  data(){
    return {
      searchStr: '',
      hasPermission: false,
      isAdmin:false,
      userData: {},
      activeName: '',
      isShowSetting: false
    }
  },
  created() {
    AuthorService.checkPermission().then(rs=>{
      if (rs.data.status === 200){
        this.hasPermission = true;
        this.userData = rs.data.data.userData;
        this.isAdmin = this.userData.isAdmin;
        sessionStorage.removeItem('userData');
        sessionStorage.setItem('userData', JSON.stringify(this.userData));
      }else {
        window.location.replace(`${defaultConfig.hostname}/login.html`);
      }
    })
    this.activeName = this.$route.params.module?this.$route.params.module:'article'
  },
  methods:{
    goAdmin(){
      window.location.replace(`${defaultConfig.hostname}/admin.html`)
    },
    goBlogListPage(){
      if (this.searchStr){
        this.$router.push(`/blogList/${this.searchStr}`)
      }
    },
    goChartHome(){
      this.$router.push('/chatHome')
    },
    goEditArticle(){
      this.$router.push('/editArticle')
    },
    switchTab(tab) {
      this.$router.push(`/home/${tab.name}`)
    },
    handleSelectSetting(command){
      switch (command){
        case "setting":
          this.isShowSetting = !this.isShowSetting;
          break;
        case "signOut":
          this.signOut();
          break;
      }
    },
    signOut() {
      sessionStorage.removeItem('Authorization');
      window.location.replace(`${defaultConfig.hostname}/login.html`)
    }
  }
}
</script>

<style scoped>

</style>
