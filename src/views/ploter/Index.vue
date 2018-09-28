<template>
    <Layout id="AppViewport">
        <Header class="app-header">
        </Header>
        <Content class="app-body">
            <div class="app-ploter">
                <!-- <appPloterImageList
                    ref="select"
                    v-if="activeItem == 'select'"
                    key="select"
                    @evtCancel="onCancel"
                    @evtSelected="onSelectedBaseImage"
                ></appPloterImageList>
                <AppPloterCropper
                    ref="cropper"
                    v-if="activeItem == 'cropper'"
                    key="cropper"
                    :baseImage="baseImage"
                    @evtCropped="onCropped"
                    @evtCancel="onCancel"
                ></AppPloterCropper> -->
                <AppPloterHome
                    ref="plot"
                    v-if="activeItem == 'home'"
                    key="home"
                    @evtInitPlot="onInitPlot"
                ></AppPloterHome>
                <AppPloterMain
                    ref="plot"
                    v-else-if="activeItem == 'plot'"
                    key="plot"
                    :stageData="stageData"
                    :initAction="initAction"
                    @evtCancel="onCancel"
                ></AppPloterMain>
            </div>
        </Content>
    </Layout>
</template>

<script>
    import appPloterMain from './Plot'
    import appPloterHome from './Home'
    // import appPloterCropper from './Cropper'
    // import appPloterImageList from './ImageList'
    // import { isEmpty } from '@/common/utils'
    export default {
        name: 'AppPloter',
        components: {
            'AppPloterHome': appPloterHome,
            'AppPloterMain': appPloterMain
            // 'AppPloterImageList': appPloterImageList
        },
        // props: {
        //     mode: {
        //         type: String,
        //         default: 'create'
        //     }
        // },
        data () {
            return {
                activeItem: 'home',
                stageData: null,
                initAction: null
            }
        },
        computed: {
        },
        watch: {
        },
        // mounted () {
        //     if (this.mode === 'modify') {
        //         this.activeItem = 'plot'
        //     } else if (this.mode === 'create') {
        //         this.activeItem = 'select'
        //     }
        // },
        methods: {
            // onSelectedBaseImage (image) {
            //     if (!isEmpty(image)) {
            //         this.baseImage = image
            //         this.activeItem = 'cropper'
            //     }
            // },
            // onCropped (image) {
            //     this.baseImage = image
            //     this.activeItem = 'plot'
            //     // debugger
            // },
            onInitPlot (stageCfg, action) {
                this.stageData = stageCfg
                this.initAction = action
                this.activeItem = 'plot'
            },
            onCancel () {
                // this.$router.go(-1)
            }
        }
    }
</script>
