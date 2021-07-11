<template>
  <div
      style="width: 100vw;height: 100vh;"
  >
    <el-row
        :gutter="10"
        style="width: 100%;height: 100%;"
    >
      <el-col :span="10">
        <div class="login-wrapper" v-if="isLogin">
          <h1 style="text-align: center;">登录</h1>
          <el-form :model="loginForm" label-width="100px" ref="loginForm" :rules="rules">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="loginForm.userName" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" placeholder="请输入密码" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('loginForm')">提交</el-button>
              <el-button type="danger" @click="resetForm('loginForm')">重置</el-button>
            </el-form-item>
          </el-form>
          <div style="text-align: right;">
            没有账号,点击
            <el-button type="primary" @click="switchStatus">注册</el-button>
          </div>
        </div>
        <div class="register-wrapper" v-else>
          <h1 style="text-align: center;">注册</h1>
          <el-form ref="registerForm" :model="registerForm" label-width="100px" :rules="rules">
            <el-form-item label="头像" prop="avatar">
              <el-upload
                  class="avatar-uploader"
                  :action="`${defaultConfig.baseApiUrl}/uploadImg`"
                  name="blogIllustrations"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
              >
                <img v-if="registerForm.avatar" :src="registerForm.avatar" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="registerForm.userName" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" placeholder="请输入密码" type="password"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" placeholder="请再次输入密码" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('registerForm')">提交</el-button>
              <el-button type="danger" @click="resetForm('registerForm')">重置</el-button>
            </el-form-item>
          </el-form>
          <div style="text-align: right;">
            有账号,点击
            <el-button type="primary" @click="switchStatus">登录</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="14" class="bg-img">

      </el-col>
    </el-row>
  </div>
</template>

<script>
import defaultConfig from "@/config/config.default";
import AuthorService from "@/service/AuthorService";

export default {
  name: "LoginPage",
  data() {
    let vm = this;

    function validatePass(rule, value, cb) {
      if (value === '') {
        cb(new Error('请输入密码'));
      } else {
        if (vm.registerForm.confirmPassword) {
          vm.$refs.registerForm.validateField('confirmPassword');
        }
        cb();
      }
    }

    function validatePass2(rule, value, cb) {
      if (value === '') {
        cb(new Error('请输入密码'));
      } else if (value !== vm.registerForm.password) {
        cb(new Error('两次输入的密码不一样'));
      } else {
        cb();
      }
    }

    return {
      defaultConfig,
      isLogin: true,
      loginForm: {
        userName: '',
        password: ''
      },
      registerForm: {
        userName: '',
        password: '',
        confirmPassword: '',
        avatar: ''
      },
      rules: {
        userName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          }, {
            min: 6,
            max: 10,
            message: '用户名长度在6~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            validator: validatePass,
            trigger: 'blur',
          }, {
            min: 6,
            max: 10,
            message: '密码长度在6~16个字符之间',
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          {
            required: true,
            validator: validatePass2,
            trigger: 'blur',
          }, {
            min: 6,
            max: 10,
            message: '密码长度在6~16个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    switchStatus() {
      this.isLogin = !this.isLogin;
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // this.$message.success('验证成功');
          if (formName === 'loginForm') {
            //
            AuthorService.loginUser(this.loginForm).then(rs => {
              if (rs.data.status === 200) {
                this.$message.success('登录成功')
                sessionStorage.setItem('Authorization', rs.headers.authorization);
                window.location.replace(`${defaultConfig.hostname}/index.html`);
              } else {
                this.$message.error('登录失败:' + rs.data.message);
              }
            })
          } else {
            //
            AuthorService.registerUser(this.registerForm).then(rs => {
              if (rs.data.status === 200) {
                sessionStorage.setItem('Authorization', rs.headers.authorization);
                this.$message.success('注册成功:' + rs.data.message);
                // window.location.replace(`${defaultConfig.hostname}/index.html`);
              } else {
                this.$message.error('注册失败:' + rs.data.message);
              }
            })
          }
        } else {
          this.$message.error('验证失败')
        }
      })

    },
    resetForm(formName) {
      this.$refs[formName].resetFields(); // 重置表单元素的字段
    },
    handleAvatarSuccess(rs) {
      console.log('头像上传成功', rs.data.imgList[0]);
      this.registerForm.avatar = rs.data.imgList[0];
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

.login-wrapper, .register-wrapper {
  width: 80%;
  margin: auto;
}

.bg-img {
  height: 100%;
  background-image: url("./assets/bg.jpg");
  background-size: cover;
  background-position: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px !important;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
