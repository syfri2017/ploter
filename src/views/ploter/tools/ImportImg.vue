<template>
    <div class="app-ploter-tools-graphs">
        <Poptip
            v-if="extendPoptip"
            placement="bottom-start"
            trigger="hover"
        >
            <Button
                class="app-ploter-tools-graphs-btn"
                type="text"
                size="small"
            >
                图片
            </Button>
            <div
                class="app-ploter-tools-graphs-menu"
                style="padding-top:8px"
                slot="content">
                <Button
                    @click="importLocalImage"
                    class="app-ploter-tools-graphs-menu-item"
                >
                    <img
                        class="app-ploter-tools-graphs-menu-item-icon"
                        src="static/images/plot/import/image/computer.png"
                    />
                    <h6>从这台电脑</h6>
                </Button>
                <Button
                    v-for="importBtn in wrapExtendTools.importImg"
                    :key="importBtn.name"
                    @click="openMaterialModel(importBtn)"
                    class="app-ploter-tools-graphs-menu-item"
                >
                    <img
                        class="app-ploter-tools-graphs-menu-item-icon"
                        :src="importBtn.icon"
                    />
                    <h6>{{importBtn.name}}</h6>
                </Button>
            </div>
        </Poptip>
        <Button
            v-else
            class="app-ploter-tools-graphs-btn"
            @click="importLocalImage"
            type="text"
            size="small"
        >
            图片
        </Button>
        <input ref="localImageInput"
            type="file"
            name="image"
            accept="image/*"
            style="display:none"
            @change="selectedLocalImage"
        />
        <Modal
            class-name="app-ploter-cropper-model"
            v-model="cropperModel"
            title="选择图片区域"
            width="80%"
            :mask-closable="false">
            <AppPloterCropper
                ref="cropper"
                :imageData="selectedImage"
                @evtCropped="onCropped"
            ></AppPloterCropper>
            <div class="app-ploter-cropper-model-footer-size" slot="footer">
                图片尺寸：
                <RadioGroup v-model="importSize">
                    <Radio label="auto">自动</Radio>
                    <Radio label="image">原始尺寸</Radio>
                    <Radio label="canvas">适应画布</Radio>
                </RadioGroup>
            </div>
            <Button type="primary" slot="footer" @click="selectedImageArea">确定</Button>
        </Modal>
        <Modal
            class="app-ploter-material-model"
            v-model="materialModel"
            :title="materialModelTitle"
            width="760">
            <CommonBaseImageList
                :list-data="materialList"
                :file-domain="materialModelFileDomain"
                @evtSelected="onSelectedMaterial"
            ></CommonBaseImageList>
            <Spin size="large" fix v-if="materialModelSpinShow"></Spin>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import commonBaseImageList from '../../common/CommonBaseImageList'
    // import appPloterImageList from '../ImageList'
    import appPloterCropper from '../Cropper'

    export default {
        name: 'AppPloterToolsImportImg',
        components: {
            'CommonBaseImageList': commonBaseImageList,
            // 'AppPloterImageList': appPloterImageList,
            'AppPloterCropper': appPloterCropper
        },
        data () {
            return {
                cropperModel: false,
                importSize: 'auto',
                selectedImage: null,
                croppedImage: null,
                extendPoptip: false,
                materialModel: false,
                materialModelTitle: null,
                materialList: [],
                materialModelSpinShow: false,
                materialModelFileDomain: null
            }
        },
        computed: {
            ...mapGetters({
                wrapExtendTools: 'wrapExtendTools'
            })
        },
        watch: {
            wrapExtendTools (newValue, oldValue) {
                if (newValue.importImg) {
                    this.extendPoptip = true
                }
            }
        },
        methods: {
            importLocalImage () {
                this.$refs.localImageInput.click()
            },
            selectedLocalImage (e) {
                const file = e.target.files[0]

                if (!file.type.includes('image/')) {
                    alert('请选择图片文件！')
                    return
                }

                if (typeof FileReader === 'function') {
                    const reader = new FileReader()

                    reader.onload = (e) => {
                        this.selectedImage = e.target.result
                        this.cropperModel = true
                        this.$refs.localImageInput.value = ''
                    }

                    reader.readAsDataURL(file)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            openMaterialModel (tool) {
                const me = this
                me.materialModel = true
                me.materialModelSpinShow = true
                me.materialModelTitle = tool.name + '插入图片'
                // todo:
                // debugger
                // 获取车辆列表

                let parameter = {
                    url: tool.dataApi,
                    params: {}
                }
                tool.params.forEach(param => {
                    parameter.params[param.name] = param.value
                })
                me.$store.dispatch('getImportImgData', parameter).then((result) => {
                    if (result.success) {
                        me.materialModelFileDomain = tool.fileDomain
                        me.materialList = result.contents
                        me.materialModelSpinShow = false
                        // debugger
                    }
                }, (error) => {
                    console.log('网络异常：' + error)
                })
            },
            onSelectedMaterial (selected) {
                // debugger
                const me = this
                let imageUrl = me.materialModelFileDomain + selected.mediaUrl
                me.selectedImage = imageUrl
                me.materialModel = false
                me.cropperModel = true
            },
            // onImageListCancel () {
            //     debugger
            // },
            onCropped (imgData) {
                this.croppedImage = imgData
            },
            selectedImageArea () {
                let tool = {
                    name: '图片',
                    id: 'image_base',
                    type: 'image',
                    style: {
                        importSize: this.importSize,
                        mainShape: {
                            src: this.croppedImage
                        }
                    }
                }
                this.$emit('evtToolSelected', tool)
                this.selectedImage = null
                this.croppedImage = null
                this.cropperModel = false
            }
        }
    }
</script>
