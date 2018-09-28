export default {
    path: '/home',
    meta: {
        requireAuth: true // 声明需要验证权限
    },
    component: require('@/views/home')
}
