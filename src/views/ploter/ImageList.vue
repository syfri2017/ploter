<template>
    <Layout class="app-ploter-image-list">
        <!-- <Header class="app-sub-header">
            <Button class="app-sub-header-btn" @click="onCancel">取消</Button>
            <Breadcrumb separator="<i class='ivu-icon ivu-icon-ios-arrow-right'></i>">
                <BreadcrumbItem><Icon type="home"></Icon> 大连万达中心</BreadcrumbItem>
                <BreadcrumbItem>新增作战部署图</BreadcrumbItem>
                <BreadcrumbItem>选择底图</BreadcrumbItem>
            </Breadcrumb>
        </Header> -->
        <Content class="app-ploter-image-list-body">
            <CommonBaseImageList
                :list-data="imageList"
                @evtCancel="onCancel"
                @evtSelected="onSelect"
            ></CommonBaseImageList>
        </Content>
    </Layout>
</template>

<script>
    import commonBaseImageList from '../common/CommonBaseImageList'
    export default {
        name: 'AppPloterImageList',
        components: {
            'CommonBaseImageList': commonBaseImageList
        },
        data () {
            return {
                imageList: []
            }
        },
        mounted () {},
        methods: {
            onCancel () {
                this.$emit('evtCancel')
            },
            onSelect (image) {
                this.$emit('evtSelected', image)
            }
        }
    }
</script>
