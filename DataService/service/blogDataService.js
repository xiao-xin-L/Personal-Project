let express = require('express');
let BlogTables = require('../db/BlogDataDB/blogTable');
let UserTables = require('../db/UserCountDB/userTable');
let UserDetailTables = require('../db/UserDetailDB/userDetailTable');
let {v4} = require('uuid');

let blogApp = express();

blogApp.post('/create', async function (req, res) {
    let newBlogData = {
        title: req.body.title,
        tags: req.body.tags,
        description: req.body.description,
        cover: req.body.cover,
        content: req.body.content,
        comment: [],
        author: {},
        lastModified: new Date(),
        views: 0,
        likes: 0,
        blogId: 1, // 博客id, 一个递增字段, 用于标识一个独一无二的博客文章数据
        approved: false
    };

    // 生成新的博客id, 新的博客id 是最大的值, 比之前存在的大1
    await BlogTables.find({}, {
        blogId: true
    }, {
        sort: {
            blogId: -1
        }
    }).then(rs => {
        if (rs.length) {
            newBlogData.blogId = rs[0].blogId + 1;
        } else {
            newBlogData.blogId = 1;
        }
    })

    // 设置博客作者信息
    UserTables.find({
        token: req.headers.authorization
    }).then(rs => {
        newBlogData.author = {
            userName: rs[0].userName,
            avatar: rs[0].avatar
        }

        // 往用户详情数据里面的文章列表中间 增加该博客id
        UserDetailTables.updateOne({
            key: rs[0].key
        }, {
            $push: {
                articles: newBlogData.blogId
            }
        }).then(rs => {
            console.log('更新用户详情数据里面的博客信息')
        })

        // 往博客数据表里面创建一个新的文章
        BlogTables.create(newBlogData).then(rs1 => {
            console.log('博客创建成功');
            res.send({
                status: 200,
                message: '文章发布成功'
            })
        }).catch(err => {
            res.send({
                status: 500,
                message: '文章发布失败'
            })
        })
    })
})

blogApp.get('/getPublicBlog', async function (req, res) {
    let params = {};
    let {
        offset,
        limit,
        searchKey
    } = req.query;
    // 当用户传过来一个搜索字段的时候
    if (searchKey) {
        params.title = new RegExp(`${searchKey}`)
    }

    // 获取用户的黑名单
    let blackList = [];
    if (req.headers.authorization) {
        // 只有登录的用户才有黑名单
        await UserTables.find({
            token: req.headers.authorization
        }).then(async (userInfos) => {
            await UserDetailTables.find({
                key: userInfos[0].key
            }).then(userDetails => {
                blackList = userDetails[0].blacklist;
            })
        })
    }

    if (blackList.length) {
        // 当用户有拉黑的黑名单的时候
        params['author.name'] = {
            $nin: blackList
        }
    }

    let totalNum = 0; // 博客总数
    await BlogTables.find({
        ...params,
        approved: true
    }).then(rs => {
        totalNum = rs.length; // 获取博客总数
    })

    console.log(params)
    BlogTables.find({
        ...params,
        approved: true
    }, {
        content: false,
        _id: false,
        __v: false
    }, {
        skip: Number(offset),
        limit: Number(limit),
        sort: {
            lastModified: -1
        }
    }).then(blogList => {
        res.send({
            status: 200,
            message: '查询成功',
            data: {
                blogList,
                totalNum
            }
        })
    })
})

blogApp.get('/getBlogDetailById', async function (req, res) {
    let params = {
        blogId: req.query.blogId
    };
    // console.log(params);
    // 当有用户请求了某个id的数据, 那么这个id对于的文章 的views(阅览数)就自增一个1
    // 人次, 请求算一次, 1 访问 10 就算是 10个点击量
    // 人数  一个人无论点击多少次, 都只算一次
    await BlogTables.updateOne(
        params,
        {
            $inc: {
                views: 1
            }
        }
    ).then(() => {
        console.log('博客阅览数自增1')
    });

    BlogTables.find(
        params,
        {
            __v: false,
            _id: false
        }
    ).then(rs => {
        res.send({
            status: 200,
            message: '查询成功',
            data: {
                blogData: rs[0]
            }
        })
    })
})

blogApp.post('/comment/create', function (req, res) {
    let reqData = req.body;
    // console.log({
    //     reqData
    // })
    let commentData = {
        ...reqData.comment,
        lastModified: new Date(),
        commentId: v4()
    }
    UserTables.find({
        token: req.headers.authorization
    }).then((rs) => {
        let key = rs[0].key;
        UserDetailTables.updateOne({
            key: key,
            comments: {
                $elemMatch: {
                    blogId: reqData.blogId
                }
            }
        },{
            $push:{
                'comments.$.commentData':{
                    ...commentData
                }
            }
        }).then(async (rs)=>{
            if (rs.n<1){
                // 在用户详情表里面当前没有这个博客id的评论数据
                let blogData = {} ;// 取出这个博客的一些基本信息
                await BlogTables.find({
                    blogId: reqData.blogId
                },{
                    title: true,
                    author: true,
                    cover: true,
                    description: true,
                    lastModified:true
                }).then(rs => {
                    blogData = rs[0]
                });

                UserDetailTables.updateOne({
                    key
                },{
                    $push: {
                        'comments': {
                            blogId: reqData.blogId,
                            blogData,
                            commentData:[
                                commentData
                            ]
                        }
                    }
                }).then(rs => {
                    console.log('创建新博客id的评论数据');
                });
            }
        })
    })

    if (reqData.fatherId){
        // 往博客里面的某个评论的comment字段添加值
        BlogTables.updateOne({
            blogId: reqData.blogId,
            comment: {
                $elemMatch: {
                    commentId: reqData.fatherId
                }
            }
        }, {
            $push: {
                'comment.$.comment': commentData
            }
        }).then(rs =>{
            console.log('新增一个二级评论');
            res.send({
                status:200,
                message: '评论成功',
                data: {
                    commentData
                }
            })
        })
    }else {
        // 往博客里面的某个评论添加值
        BlogTables.updateOne({
            blogId: reqData.blogId
        }, {
            $push: {
                'comment': commentData
            }
        }).then(rs =>{
            console.log('新增一个二级评论');
            res.send({
                status:200,
                message: '评论成功',
                data: {
                    commentData
                }
            })
        })
    }
})

blogApp.get('/getMyBlog', async function (req, res) {
    let params = {};
    let {
        offset,
        limit,
        searchKey
    } = req.query;
    // 当用户传过来一个搜索字段的时候
    if (searchKey) {
        params.title = searchKey;
    }
    // 设置博客作者信息
    UserTables.find({
        token: req.headers.authorization
    }).then(async  (rs) => {
        let totalNum = 0; // 博客总数
        await BlogTables.find({
            'author.userName':rs[0].userName,
        }).then(blogList => {
            totalNum = blogList.length; // 获取博客总数
        })

        BlogTables.find({
            'author.userName':rs[0].userName,
            ...params
        }, {
            content: false,
            _id: false,
            __v: false
        }, {
            skip: Number(offset),
            limit: Number(limit),
            sort: {
                lastModified: -1
            }
        }).then(blogList => {
            res.send({
                status: 200,
                message: '查询成功',
                data: {
                    blogList,
                    totalNum
                }
            })
        })
    })
})

blogApp.get('/getMyLikeBlog', async function (req, res) {
    let params = {};
    let {
        offset,
        limit,
        searchKey
    } = req.query;
    // 当用户传过来一个搜索字段的时候
    if (searchKey) {
        params.title = searchKey;
    }
    // 设置博客作者信息
    UserTables.find({
        token: req.headers.authorization
    }).then(async  (rs) => {
        let totalNum = 0; // 博客总数
        let likes = []; //用户喜欢的博客id们
        await UserDetailTables.find({
            key: rs[0].key
        }).then(userDetails=>{
            totalNum = userDetails[0].likes.length;
            likes = userDetails[0].likes;
        })

        BlogTables.find({
            blogId:{
                $in: likes
            },
            ...params
        }, {
            content: false,
            _id: false,
            __v: false
        }, {
            skip: Number(offset),
            limit: Number(limit),
            sort: {
                lastModified: -1
            }
        }).then(blogList => {
            res.send({
                status: 200,
                message: '查询成功',
                data: {
                    blogList,
                    totalNum
                }
            })
        })
    })
})

blogApp.get('/getUnapprovedBlog', async function (req, res) {
    let params = {};
    let {
        offset,
        limit,
        searchKey
    } = req.query;
    // 当用户传过来一个搜索字段的时候
    if (searchKey) {
        params.title = new RegExp(`${searchKey}`)
    }

    let totalNum = 0; // 博客总数
    await BlogTables.find({
        ...params,
        approved: false
    }).then(rs => {
        totalNum = rs.length; // 获取博客总数
    })

    console.log(params)
    BlogTables.find({
        ...params,
        approved: false
    }, {
        _id: false,
        __v: false
    }, {
        skip: Number(offset),
        limit: Number(limit),
        sort: {
            lastModified: -1
        }
    }).then(blogList => {
        res.send({
            status: 200,
            message: '查询成功',
            data: {
                blogList,
                totalNum
            }
        })
    })
})

blogApp.get('/getAllBlog', async function (req, res) {
    let params = {};
    let {
        offset,
        limit,
        searchKey
    } = req.query;
    // 当用户传过来一个搜索字段的时候
    if (searchKey) {
        params.title = new RegExp(`${searchKey}`)
    }

    let totalNum = 0; // 博客总数
    await BlogTables.find({
        ...params,
    }).then(rs => {
        totalNum = rs.length; // 获取博客总数
    })

    console.log(params)
    BlogTables.find({
        ...params,
    }, {
        _id: false,
        __v: false
    }, {
        skip: Number(offset),
        limit: Number(limit),
        sort: {
            lastModified: -1
        }
    }).then(blogList => {
        res.send({
            status: 200,
            message: '查询成功',
            data: {
                blogList,
                totalNum
            }
        })
    })
})

blogApp.post('/approvedBlog', async function (req, res) {
    let params = {
        blogId: req.body.blogId
    };
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            BlogTables.updateOne(
                params,
                {
                    $set:{
                        approved: true
                    }
                }
            ).then(rs => {
                res.send({
                    status: 200,
                    message: '批准成功'
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

blogApp.post('/deleteBlog', async function (req, res) {
    let params = {
        blogId: req.body.blogId
    };
    UserTables.find({
        token: req.headers.authorization
    }).then(async (rs)=>{
        if (rs.length && rs[0].isAdmin){
            BlogTables.deleteOne(params).then(rs => {
                res.send({
                    status: 200,
                    message: '删除用户成功'
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

blogApp.get('/getBlogInfo', function (req, res){
    UserTables.find({
        token: req.headers.authorization
    }).then((rs)=>{
        if (rs.length && rs[0].isAdmin){
            BlogTables.find({},{
                lastModified: true
            }).then((blogInfo)=>{
                res.send({
                    status: 200,
                    data: {
                        blogInfo
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
    blogApp
}
