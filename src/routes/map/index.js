// 不同功能模块的路由应代码分离
// import home from './home'
// import ploter from './ploter'
export default [
    {
        path: '/',
        component: require('@/views/ploter/plot'),
        props: true,
        // 模块
        meta: {
            requireAuth: true // 声明需要验证权限
        }
    },
    // {
    //     path: '/',
    //     name: 'TheViewport',
    //     redirect: '/home',
    //     component: require('@/views/TheViewport'),
    //     // 模块
    //     meta: {
    //         requireAuth: true // 声明需要验证权限
    //     },
    //     children: [
    //         home,
    //         ploter
    //     ]
    // },
    { // 404
        path: '*',
        component: {
            beforeCreate () {
                console.log('Warn: 404')
                this.$router.replace('/')
            },
            template: '<div></div>'
        }
    }
]
