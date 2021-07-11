<template>
  <el-container>
    <el-header style="border-bottom: 1px solid #ccc;">
      <el-row :gutter="10">
        <el-col
            :offset="3"
            :span="18"
            style="display: flex; align-items: center;justify-content: space-between;"
        >
          <img src="@/assets/logo.png" style="height: 30px;" @click="goHome">
          <el-dropdown  @command="handleSelectSetting">
            <el-avatar
                :src="userData.avatar"
                :title="userData.userName"
                fit="scale-down"
                shape="square"
            >
            </el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item disabled>{{userData.userName}}</el-dropdown-item>
              <el-dropdown-item command="signOut">登出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside>
        <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            @select="handleSelect"
        >
          <el-menu-item index="0">
            <i class="el-icon-date"></i>
            <span slot="title">数据总览</span>
          </el-menu-item>
          <el-menu-item index="1">
            <i class="el-icon-s-claim"></i>
            <span slot="title">审核</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-location"></i>
            <span slot="title">举报处理</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-s-custom"></i>
            <span slot="title">用户权限处理</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-s-data"></i>
            <span slot="title">数据库管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import defaultConfig from "@/config/config.default";

export default {
  name: "AdminPage",
  data(){
    return {
      userData: JSON.parse(sessionStorage.getItem('userData')),
      activeIndex: '0'
    }
  },
  watch:{
    $route(){
      switch (this.$route.path) {
        case '/dataView':
          this.activeIndex = '0';
          break;
        case '/review':
          this.activeIndex = '1';
          break;
        case '/tipOff':
          this.activeIndex = '2';
          break;
        case '/permission':
          this.activeIndex = '3';
          break;
        case '/dbmanager':
          this.activeIndex = '4';
          break;
      }
    }
  },
  methods: {
    handleSelectSetting(cmd){
      switch (cmd){
        case 'signOut':
          this.signOut();
          break;
      }
    },
    signOut() {
      sessionStorage.removeItem('Authorization');
      window.location.replace(`${defaultConfig.hostname}/login.html`)
    },
    goHome(){
      window.location.replace(`${defaultConfig.hostname}/index.html`)
    },
    handleSelect(index){
      if (index!==this.activeIndex){
        switch (index) {
          case '0':
            this.$router.push('/dataView');
            this.activeIndex = '0';
            break;
          case '1':
            this.$router.push('/review');
            this.activeIndex = '1';
            break;
          case '2':
            this.$router.push('/tipOff');
            this.activeIndex = '2';
            break;
          case '3':
            this.$router.push('/permission');
            this.activeIndex = '3';
            break;
          case '4':
            this.$router.push('/dbmanager');
            this.activeIndex = '4';
            break;
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
