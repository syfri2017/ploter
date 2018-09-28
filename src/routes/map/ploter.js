export default {
    path: '/ploter/:mode/',
    // redirect: 'designer/setting',
    component: require('@/views/ploter'),
    props: true,
    meta: {
        requireAuth: true
    }
}
