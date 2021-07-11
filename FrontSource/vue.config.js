module.exports = {
    publicPath: './',
    outputDir: 'site',
    pages:{
        admin:{
            // 应用入口配置,
            entry: 'src/pages/admin/main.js',
            template: 'public/admin.html',
            filename: 'admin.html',
            title: '用户管理界面'
        },
        user:{
            entry: 'src/pages/user/main.js',
            template: 'public/index.html',
            filename: 'index.html',
            title: '思否'
        },
        login:{
            entry: 'src/pages/login/main.js',
            template: 'public/login.html',
            filename: 'login.html',
            title: '登录'
        }
    },
    devServer: {
        host: '127.0.0.1',
        port: 8080,
        https: false,
        open: true,
        overlay: {
            warning: true,
            errors: true
        }
    },
    configureWebpack: {
        // devtool: 'source-map'
    },
    productionSourceMap: false
}
