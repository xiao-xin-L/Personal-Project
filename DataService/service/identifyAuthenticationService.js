let express = require('express');
let crypto = require('crypto');
let {v4} = require('uuid');
let UserTables = require('../db/UserCountDB/userTable');
let UserDetailTables = require('../db/UserDetailDB/userDetailTable');
let BlogTables = require('../db/BlogDataDB/blogTable');

function enCryptData(data, key, algorithm) {
    if (!crypto.getHashes().includes(algorithm)) {
        throw  new Error('不支持此哈希函数')
    }
    const hmac = crypto.createHmac(algorithm, key);
    hmac.update(data);
    return hmac.digest('hex');
}


let authenticationApp = express();

authenticationApp.post('/registerUser', function (req, res) {
    // console.log('注册接口', req.body);
    let key = v4();// 生成一个独一无二的密钥
    let password = enCryptData(req.body.password, key, 'sha256'); // 密码
    let userName = req.body.userName; // 用户名
    let avatar = req.body.avatar; // 头像
    let token = enCryptData(v4(), v4(), 'sha256'); // 生成一个随机令牌
    UserTables.find({
        userName: userName
    }).then(rs => {
        if (rs.length) {
            res.send({
                status: 500,
                message: '该用户名已被使用, 请换一个用户名'
            })
        } else {
            UserTables.create({
                userName,
                password,
                key,
                token,
                avatar,
                isAdmin: false,
                introduction: '',
                approved: false,
                createTime: new Date()
            }).then(() => {
                res.setHeader('Authorization', token);
                res.send({
                    status: 200,
                    message: '注册成功, 请等待审核'
                })
            })

            UserDetailTables.create({
                key,
                comments: [],
                articles: [],
                likes: [],
                attentions: [],
                blacklist: []
            })
        }
    })
})

authenticationApp.post('/loginUser', function (req, res) {
    UserTables.find({
        userName: req.body.userName,
    }).then(rs => {
        if (rs.length) {
            if (rs[0].password === enCryptData(req.body.password, rs[0].key, 'sha256')) {
                if (rs[0].approved) {
                    res.setHeader('Authorization', rs[0].token);
                    res.send({
                        status: 200,
                        message: '登录'
                    })
                } else {
                    res.send({
                        status: 500,
                        message: '该账号正在审核中'
                    })
                }

            } else {
                res.send({
                    status: 500,
                    message: '用户密码错误'
                })
            }
        } else {
            res.send({
                status: 500,
                message: '用户不存在'
            })
        }
    })
})

authenticationApp.get('/checkPermission', function (req, res) {
    UserTables.find({
        token: req.headers.authorization
    }).then(async rs => {
        if (rs.length && rs[0].approved) {
            let userDetail = null;
            let views = 0;// 我的文章的阅览数
            let likes = 0;// 我的文章的点赞数
            await UserDetailTables.find({
                key: rs[0].key
            }, {
                key: false,
                _id: false,
                __v: false
            }).then(userDetails => {
                userDetail = userDetails[0]
            });

            await BlogTables.find({
                'author.userName': rs[0].userName
            }).then(blogList => {
                blogList.forEach(blogData => {
                    // console.log(blogData)
                    views += blogData.views;
                    likes += blogData.likes;
                })
            })

            res.send({
                status: 200,
                message: '用户鉴权成功',
                data: {
                    userData: {
                        userName: rs[0].userName,
                        avatar: rs[0].avatar,
                        introduction: rs[0].introduction,
                        isAdmin: rs[0].isAdmin,
                        userDetail,
                        views,
                        likes
                    }
                }
            })
        } else {
            res.send({
                status: 500,
                message: '用户鉴权失败'
            })
        }
    })
})

authenticationApp.post('/updateUserInfo', function (req, res) {
    UserTables.updateOne({
        token: req.headers.authorization
    }, {
        $set: {
            avatar: req.body.avatar,
            introduction: req.body.introduction
        }
    }).then(async rs => {
        res.send({
            status: 200,
            message: '用户信息更新成功'
        })
    })
})

authenticationApp.get('/unapprovedUser', function (req,res){
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            let {offset, limit} = req.query; // 获取参数
            let totalNum = 0;
            await UserTables.find({
                approved: false
            }).then(unapprovedUsers=>{
                totalNum = unapprovedUsers.length; // 获取未授权用户的总数
            })
            UserTables.find({
                approved: false
            },{
                _id: false,
                __v: false
            },{
                skip: Number(offset),
                limit: Number(limit)
            }).then(unapprovedUsers=>{
                res.send({
                    status: 200,
                    message: '查询成功',
                    data: {
                        totalNum,
                        userList: unapprovedUsers
                    }
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.get('/unAllUser', function (req,res){
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            let {offset, limit} = req.query; // 获取参数
            let totalNum = 0;
            await UserTables.find({
            }).then(unapprovedUsers=>{
                totalNum = unapprovedUsers.length; // 获取未授权用户的总数
            })
            UserTables.find({
            },{
                _id: false,
                __v: false
            },{
                skip: Number(offset),
                limit: Number(limit)
            }).then(unapprovedUsers=>{
                res.send({
                    status: 200,
                    message: '查询成功',
                    data: {
                        totalNum,
                        userList: unapprovedUsers
                    }
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.post('/approvedUser', function (req,res){
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            UserTables.updateOne({
                key: req.body.key
            },{
                $set:{
                    approved: true
                }
            }).then(()=>{
                res.send({
                    status: 200,
                    message: '批准用户注册'
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.post('/unApprovedUser', function (req,res){
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            UserTables.updateOne({
                key: req.body.key
            },{
                $set:{
                    approved: false
                }
            }).then(()=>{
                res.send({
                    status: 200,
                    message: '批准用户注册'
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.post('/deleteUser', function (req,res){
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            await UserTables.find({
                key: req.body.key
            }).then(userInfos => {
                BlogTables.deleteMany({
                    'author.userName': userInfos[0].userName
                }).then(()=>{
                    console.log('删除用户的博客数据')
                })
            })

            await UserDetailTables.deleteOne({
                key: req.body.key
            }).then(()=>{
                console.log('删除用户的详细数据')
            })

            await UserTables.deleteOne({
                key: req.body.key
            }).then(()=>{
                console.log('删除用户的主数据')
            })

            res.send({
                status: 200,
                message: '删除用户成功'
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.post('/setAdmin', function (req, res){
    UserTables.find({
        token: req.headers.authorization
    }).then((rs)=>{
        if (rs.length && rs[0].isAdmin){
            UserTables.updateOne({
                key: req.body.key
            }, {
                $set: {
                    isAdmin: true
                }
            }).then(userInfos => {
                res.send({
                    status: 200,
                    message: '更改用户权限成功'
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.post('/cancelAdmin', function (req, res){
    UserTables.find({
        token: req.headers.authorization
    }).then((rs)=>{
        if (rs.length && rs[0].isAdmin){
            UserTables.updateOne({
                key: req.body.key
            }, {
                $set: {
                    isAdmin: false
                }
            }).then(userInfos => {
                res.send({
                    status: 200,
                    message: '更改用户权限成功'
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})

authenticationApp.get('/userRegisterInfo', function (req, res){
    UserTables.find({
        token: req.headers.authorization
    }).then((rs)=>{
        if (rs.length && rs[0].isAdmin){
            UserTables.find({},{
                createTime: true
            }).then((userInfo)=>{
                res.send({
                    status: 200,
                    data: {
                        userInfo
                    }
                })
            })
        }else{
            res.send({
                status: 401,
                message: '没有操作权限'
            })
        }
    })
})
module.exports = {
    authenticationApp
}
