<template>
    <Layout class="app-ploter-cropper">
        <!-- <Header class="app-sub-header">
            <Button class="app-sub-header-btn" @click="onNext">开始标绘</Button>
            <Button class="app-sub-header-btn" @click="onCancel">取消</Button>
            <Breadcrumb separator="<i class='ivu-icon ivu-icon-ios-arrow-right'></i>">
                <BreadcrumbItem><Icon type="home"></Icon> 大连万达中心</BreadcrumbItem>
                <BreadcrumbItem>新增作战部署图</BreadcrumbItem>
                <BreadcrumbItem>选择底图</BreadcrumbItem>
                <BreadcrumbItem>选择使用的区域</BreadcrumbItem>
            </Breadcrumb>
        </Header> -->
        <Content class="app-ploter-cropper-body"
            v-if="imageData != ''"
        >
            <MoftCropper
                ref="cropper"
                :guides="true"
                :view-mode="2"
                drag-mode="crop"
                :auto-crop-area="1"
                :background="true"
                :rotatable="true"
                :imgSrc="imageData"
                :cropmove="cropImage"
            ></MoftCropper>
            <Spin size="large" fix v-if="spinShow"></Spin>
        </Content>
    </Layout>
</template>

<script>
    import moftCropper from '@/components/MoftCropper'
    // import {isEmpty} from '@/common/utils'
    export default {
        name: 'AppPloterCropper',
        components: {
            'MoftCropper': moftCropper
        },
        props: {
            imageData: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                // pendingImg: null,
                cropImg: null,
                spinShow: true
            }
        },
        // mounted () {
        //     debugger
        // },
        watch: {
            imageData (n, o) {
                this.initImageData()
            }
        },
        methods: {
            // onNext () {
            //     this.$emit('evtCropped', this.cropImg)
            // },
            // onCancel () {
            //     this.$emit('evtCancel')
            // },
            cropImage () {
                this.cropImg = this.$refs.cropper.getCroppedCanvas().toDataURL()
                this.$emit('evtCropped', this.cropImg)
            },
            initImageData () {
                const me = this
                const cropper = this.$refs.cropper
                let imageObj = new Image()
                me.spinShow = true
                imageObj.onload = function () {
                    cropper.destroy()
                    cropper.init()
                    me.spinShow = false
                    setTimeout(() => {
                        me.cropImage()
                    }, 200)
                }
                imageObj.src = this.imageData
            }
        }
    }
</script>
