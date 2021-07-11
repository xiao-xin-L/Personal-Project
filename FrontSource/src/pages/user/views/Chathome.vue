<template>
  <div>
    <div class="chat-wrapper">
      <el-page-header
          @back="goBack"
      >
      </el-page-header>
      <div class="content-area" ref="contentArea">
        <div
            v-for="(msgItem ,index) in msgList"
            :key="index"
            class="msg-item"
        >
          <div
              :style="{
              float: msgItem.type==='other'?'left':'right'
            }"
          >
            <div
                :style="{
                  float: msgItem.type==='other'?'left':'right',
                  margin: '10px',
                  textAlign: 'center'
                }"
            >
              <el-avatar :size="40" :src="msgItem.avatar" style="display: block;"></el-avatar>
              <span style="font-size: 12px;">{{ msgItem.userName }}</span>
            </div>
            <el-card
                class="box-card"
                style="margin: 0 10px;"
                :style="{
                  float: msgItem.type==='other'?'left':'right'
                }"
            >
              <span v-if="msgItem.msg.type==='text'">{{ msgItem.msg.content }}</span>
              <el-image v-else :src="msgItem.msg.content"></el-image>
            </el-card>
          </div>
        </div>
      </div>
      <div class="tool-bar">
        <el-row style="text-align: center;">
          <el-col :span="2">
            <div class="select-img" style="width: 100%;text-align: center;">
              <i class="el-icon-picture-outline"></i>
              <input
                  @change="sendImg"
                  type="file"
                  ref="selectImg"
                  style="position: absolute;z-index: 10;top: 0;left: 0;opacity: 0"
              >
            </div>
          </el-col>
          <el-col :span="20">
            <el-input v-model="msgText" @keypress.enter.native="sendText"></el-input>
          </el-col>
          <el-col :span="2">
            <el-button type="text" icon="el-icon-s-promotion" @click="sendText"></el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>

import defaultConfig from "@/config/config.default";

async function cutImageBase64(files, width, quality) {
  return new Promise((resolve) => {
    const file = files[0];
    let URL = window.URL || window.webkitURL;
    const blog = URL.createObjectURL(file);
    let base64;
    const img = new Image();
    img.src = blog;
    img.onload = function () {
      const that = this;
      let w = that.width;
      let h = that.height;
      let scale = w / h;
      w = width || w;
      h = w / scale;
      const canvas = document.createElement('canvas');
      const canCon = canvas.getContext('2d');
      canvas.width = w;
      canvas.height = h;
      canCon.drawImage(that, 0, 0, w, h);
      base64 = canvas.toDataURL('image/jpeg', quality || 0.8);
      resolve(base64);
    }
  })
}

export default {
  name: "Chathome",
  data() {
    return {
      socket: null,
      msgText: '',
      message: {
        userName: '',
        avatar: '',
        msg: {
          type: '',
          content: ''
        }
      },
      userData: JSON.parse(sessionStorage.getItem('userData')),
      msgList: []
    }
  },
  watch: {
    userData: {
      handler() {
        this.message.userName = this.userData.userName;
        this.message.avatar = this.userData.avatar;
      },
      immediate: true
    }
  },
  mounted() {
    this.socket = new WebSocket(`${defaultConfig.wssApiUrl}`);
    let vm = this;
    this.socket.addEventListener('open', function () {
      vm.$message.success('加入聊天室');
    })
    this.socket.addEventListener('message', function (event) {
      vm.msgList.push({
        ...JSON.parse(event.data),
        type: 'other'
      })
      vm.$nextTick(function (){
        vm.$refs.contentArea.scrollTop = vm.$refs.contentArea.scrollHeight;
      })
    })
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    sendImg() {
      console.log(this.$refs.selectImg.files);
      cutImageBase64(this.$refs.selectImg.files, 400, 0.6).then(rs => {
        this.message.msg.type = 'img';
        this.message.msg.content = rs;
        this.socket.send(JSON.stringify(
            this.message
        ));
        this.msgList.push({
          ...JSON.parse(JSON.stringify(this.message)),
          type: 'me'
        });
        this.message.msg.type = '';
        this.message.msg.content = '';
        this.$nextTick(function (){
          this.$refs.contentArea.scrollTop = this.$refs.contentArea.scrollHeight;
        })
      })
    },
    sendText() {
      if (this.msgText) {
        this.message.msg.type = 'text';
        this.message.msg.content = this.msgText;
        this.socket.send(JSON.stringify(
            this.message
        ));
        this.msgText = '';
        this.msgList.push({
          ...JSON.parse(JSON.stringify(this.message)),
          type: 'me'
        });
        this.message.msg.type = '';
        this.message.msg.content = '';
        this.$nextTick(function (){
          this.$refs.contentArea.scrollTop = this.$refs.contentArea.scrollHeight;
        })
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

.chat-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.content-area {
  width: 100vw;
  height: calc(100vh - 64px);
//background-color: #d0335f; overflow-y: scroll;
}

.select-img {
  position: relative;
  line-height: 40px;
  overflow: hidden;
}

.tool-bar {
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  left: 0;
  height: 40px;
  width: 100%;
}
.msg-item{
  margin-bottom: 20px;
}
.msg-item::after{
  content: '';
  display: block;
  clear: both;
}
</style>

