<template>
<Layout id="AppViewport">
    <Header class="app-header">
        <!-- 工具栏 -->
        <AppPloterTools
            @evtToolSelected="onToolSelected"
        >
            <!-- 附加工具 - 插入图片 -->
            <AppPloterToolsImportImg
                @evtToolSelected="onToolSelected"
                slot="bodyEnd"
            ></AppPloterToolsImportImg>
            <!-- 单击版系统功能按钮 -->
            <ButtonGroup
                class="app-ploter-tools-after-btns"
                slot="panelAfter"
                size="small"
            >
                <Button type="text" icon="plus" @click="onCreate">新建</Button>
                <!-- <Button type="text" icon="folder" @click="onSelectFile">打开</Button> -->
                <Button type="text" icon="checkmark" @click="openRenameModel">保存</Button>
                <Button type="text" icon="archive" @click="onExport">导出</Button>
                <Button type="text" icon="gear-b" @click="openSettingModel">设置</Button>
            </ButtonGroup>
        </AppPloterTools>
    </Header>
    <Content class="app-body">
        <div class="app-ploter-main">
            <div class="app-ploter-main-body">
                <!-- 画布容器 -->
                <div class="app-ploter-main-canvas" ref="plotStage"></div>
                <div class="app-ploter-main-mask"></div>
            </div>
            <!-- 属性面板 -->
            <AppPloterFeatures
                slot="content"
                :stage="stage"
                :currentShape="currentPlotActiveItem"
                @evtFeatureChange="onFeatureChange"
            ></AppPloterFeatures>
            <!-- <Spin size="large" fix></Spin> -->
        </div>
        <!-- 用于获取本地文件的隐藏元素 -->
        <input ref="loadInput"
            type="file"
            name="mplotFile"
            accept=".mplot"
            style="display:none"
            @change="onSelectedPlotFile"
        />
        <!-- 设置模态窗 -->
        <AppPloterSettingModel
            :show="showSettingModel"
            @evtSaveSetting="onSaveSetting"
            @evtCancelSetting="showSettingModel = false"
        ></AppPloterSettingModel>
        <!-- 标绘命名窗 -->
        <AppPloterRenameModel
            :show="showRenameModel"
            @evtSaveSetting="onSave"
            @evtCancelSetting="showRenameModel = false"
        ></AppPloterRenameModel>
    </Content>
    <Footer class="app-footer app-state-bar">
        <AppPloterBBarMessage
            :plotTool="currentPlotTool"
        ></AppPloterBBarMessage>
        <AppPloterBBarCoordinate
            :coordinate="coordinateSystem"
        ></AppPloterBBarCoordinate>
        <AppPloterBBarStageAttr
            :stage="stage"
            @evtStageCfgChanged="onStageCfgChanged"
        ></AppPloterBBarStageAttr>
    </Footer>
</Layout>
</template>

<script>
    // import { mapGetters } from 'vuex'
    import drawLib from './draw'
    import plotundo from '@/plugins/plotundo'
    import {
        exitPlotTool,
        deleteShape,
        pasteShape,
        downloadURI
    } from './draw/utils'
    import {
        Base64
    } from 'js-base64'
    import { deepClone } from '@/common/utils'
    // 共通组件
    import moftPanel from '@/components/panel/MoftPanel'
    import moftPanelWrap from '@/components/panel/MoftPanelWrap'
    // 标绘组件
    import appPloterBBarMessage from './bbar/Message'
    import appPloterBBarCoordinate from './bbar/Coordinate'
    import appPloterBBarStageAttr from './bbar/StageAttr'

    import appPloterSettingModel from './Setting'
    import appPloterRenameModel from './rename'

    import appPloterPanelLayers from './panel/Layers'
    import appPloterFeatures from './panel/Features'

    import appPloterTools from './Tools'
    import appPloterToolsImportImg from './Tools/ImportImg'
    import API from '../../api/api'
    export default {
        name: 'AppPloterMain',
        components: {
            'MoftPanel': moftPanel,
            'MoftPanelWrap': moftPanelWrap,
            'AppPloterFeatures': appPloterFeatures,
            'AppPloterPanelLayers': appPloterPanelLayers,
            'AppPloterBBarMessage': appPloterBBarMessage,
            'AppPloterBBarCoordinate': appPloterBBarCoordinate,
            'AppPloterBBarStageAttr': appPloterBBarStageAttr,
            'AppPloterSettingModel': appPloterSettingModel,
            'AppPloterRenameModel': appPloterRenameModel,
            'AppPloterTools': appPloterTools,
            'AppPloterToolsImportImg': appPloterToolsImportImg
        },
        data () {
            return {
                bhname: '',
                stage: null,
                currentPlotTool: null,
                currentPlotActiveItem: null,
                currentPasteItem: null,
                coordinateSystem: {
                    system: '像素',
                    x: 0,
                    y: 0
                },
                showSettingModel: false,
                showRenameModel: false,
                stageOriginalSize: null
            }
        },
        // computed: {
        //     ...mapGetters({
        //         stageZoom: 'stageZoom'
        //     })
        // },
        created () {
            drawLib.initLocalSetting()
            var _this = this
            // 接收主页面传来的标绘信息
            window.addEventListener('message', function (event) {
                // debugger
                ewbhData = event.data
                _this.bhmc = ewbhData.wjm
                if (ewbhData.type === 'editInit') {
                    let param1 = new FormData() // 创建form对象
                    param1.append('uuid', ewbhData.uuid)
                    param1.url = 'http://localhost/dpapi/ewbh/findByUuid'
                    API.getImportImgData(param1).then((res) => {
                        // debugger
                        editbhnr = res.result.bhnr
                        _this.onCreate()
                    }, (err) => {
                        console.log(err)
                    })
                } else if (ewbhData.type === 'addInit') {
                    _this.onCreate()
                }
            }, false)
        },
        mounted () {
            const me = this
            const postmate = new Postmate.Model({
                saveHandler: me.emitSaveData,
                exportHandler: me.onExport,
                settingModelHandler: me.openSettingModel
            })

            postmate.then(function (handshake) {
                console.log('ploter:', '确认握手请求。')
                window.wrapHandshake = handshake
                handshake.emit('evtHello', 'Hello Wrap. this is ploter v0.8')

                const stageData = handshake.model.stageData
                me.$store.commit('updateStageData', stageData)
                const extendTools = handshake.model.extendTools
                if (extendTools) {
                    me.$store.commit('updateExtendTools', extendTools)
                }

                if (stageData) {
                    me.initStageData(stageData)
                } else {
                    me.onCreate()
                }
            })
            plotundo.init()
        },
        watch: {
            // stageZoom (zoomLevel) {
            //     this.doStageZoom(zoomLevel)
            // }
            currentPlotActiveItem (item) {
                this.setStageLayout()
            }
        },
        methods: {
            onCreate () {
                // debugger
                if (ewbhData !== '' && ewbhData.type !== 'addInit' && ewbhData.type !== 'editInit') {
                    if (this.stage) {
                        const warn = confirm('现在执行新建操作将放弃对当前画布做出的修改，\n点击确认按钮前请确认您的标绘成果已经保存。')
                        if (warn === true) {
                            this.stage.destroy()
                        }
                    }
                }
                const stageData = drawLib.createEmptyStageData()
                const stage = Konva.Node.create(stageData, '.app-ploter-main-canvas')
                this.stage = stage
                this.initPloterEvent()
                this.setStageLayout()
                if (ewbhData.type === 'editInit') {
                    this.onOpenBhnr(editbhnr)
                    ewbhData.type = 'BJ'
                } else if (ewbhData.type === 'addInit') {
                    ewbhData.type = 'XZ'
                }
            },
            onSelectFile () {
                this.$refs.loadInput.click()
            },
            onSelectedPlotFile (e) {
                const me = this
                const file = e.target.files[0]
                if (typeof FileReader === 'function') {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const content = e.target.result.replace('data:;base64,', '')
                        const stageData = JSON.parse(Base64.decode(content))
                        if (!stageData.attrs.mplot) {
                            alert('文件无效，请选择.mplot后缀的标绘文件')
                            return
                        }
                        if (me.stage) {
                            const warn = confirm('现在打开标绘文件将放弃对当前画布做出的修改，\n点击确认按钮前请确认您的标绘成果已经保存。')
                            if (warn === true) {
                                me.initStageData(stageData)
                            }
                        }
                        this.$refs.loadInput.value = ''
                    }
                    reader.readAsDataURL(file)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            onOpenBhnr (val) {
                // debugger
                const stageData = JSON.parse(Base64.decode(val))
                const me = this
                if (typeof FileReader === 'function') {
                    if (me.stage) {
                        me.initStageData(stageData)
                    }
                    this.$refs.loadInput.value = ''
                    // reader.readAsDataURL(bhnr)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            onSave (val) {
                this.stage.fire('evt-stop')
                exitPlotTool(this.stage)
                this.currentPlotTool = null
                this.currentPlotActiveItem = null
                const jsonData = this.stage.toJSON()
                // debugger
                let param = new FormData() // 创建form对象
                param.append('wjm', val + '.mplot')// 通过append向form对象添加数据
                param.append('kzm', '.mplot')
                param.append('zddwid', ewbhData.zddwid)
                param.append('bhnr', jsonData)
                if (ewbhData.type === 'XZ') {
                    param.append('cjrid', ewbhData.cjrid)
                    param.append('cjrmc', ewbhData.cjrmc)
                    param.append('jdh', ewbhData.jdh)
                    param.append('datasource', ewbhData.datasource)
                    param.url = 'http://localhost/dpapi/ewbh/save'
                } else if (ewbhData.type === 'BJ' || ewbhData.type === 'editInit') {
                    param.append('uuid', ewbhData.uuid)
                    param.append('xgrid', ewbhData.xgrid)
                    param.append('xgrmc', ewbhData.xgrmc)
                    param.url = 'http://localhost/dpapi/ewbh/edit'
                }
                API.getImportImgData(param).then((res) => {
                    this.showRenameModel = false
                    if (res.result > 0) {
                        alert('保存成功')
                    }
                }, (err) => {
                    console.log(err)
                })
                // downloadBlob(jsonData, '消防标绘-原稿.mplot')
            },
            onExport () {
                this.stage.fire('evt-stop')
                exitPlotTool(this.stage)
                this.currentPlotTool = null
                this.currentPlotActiveItem = null
                const dataUrl = this.stage.toDataURL()
                downloadURI(dataUrl, '消防标绘-导出.png')
            },
            openSettingModel () {
                this.showSettingModel = true
            },
            openRenameModel () {
                this.showRenameModel = true
            },
            onSaveSetting (setting) {
                this.showSettingModel = false
            },
            onToolSelected (tool) {
                if (this.stage) {
                    this.stage.fire('evt-stop')
                    this.currentPlotTool = tool
                    this.initPlotTool()
                }
            },
            onFeatureChange (newFeature, oldFeature) {
                drawLib.applyFeature(this.stage, this.currentPlotActiveItem, newFeature)
            },
            onStageCfgChanged (cfg) {
                drawLib.applyStageCfg(this.stage, cfg)
            },
            initStageData (stageData) {
                const me = this
                if (me.stage) {
                    me.stage.destroy()
                }
                const stage = Konva.Node.create(stageData, '.app-ploter-main-canvas')
                me.stage = stage
                drawLib.reloadShapes(stage)
                me.initPloterEvent()
                me.setStageLayout()
            },
            initPlotTool () {
                if (!this.currentPlotTool) return
                const toolCfg = {...deepClone(this.currentPlotTool)}
                const stage = this.stage
                drawLib.initPlotTool(toolCfg, stage)
            },
            initPloterEvent () {
                const me = this
                const stage = me.stage

                stage.on('mousedown', (e) => {
                    const mouseButton = e.evt.button
                    const targetShape = e.target
                    const targetShapeName = targetShape.getAttr('name')
                    // ===============
                    // 事件转发部分
                    // ===============
                    // 如果鼠标左键落下处不是交互工具，
                    // 那基本不是要标绘就是要激活或取消激活交互工具
                    if (mouseButton === 0) { // 左键单击
                        if (targetShapeName !== 'shapeAnchor' && targetShape.parent.className !== 'Transformer') {
                            // 如果当前有激活的标绘工具，
                            // 那么所有在底图上的左键单击都是画图
                            if (me.currentPlotTool) {
                                stage.fire('evt-draw', e)
                                // }
                            } else {
                            // 如果当前没有激活的标绘工具，
                            // 那么所有在画布上的左键单击都是选取(除了画布本身)
                                if (targetShape.nodeType !== 'Stage' && targetShape.getId() !== 'stageBackground') {
                                    targetShape.fire('evt-active', targetShape)
                                    me.currentPlotActiveItem = targetShape
                                }
                            }
                        }
                    } else { // 右/中键单击
                    // 如果鼠标右/中键落下，
                    // 那就是要取消激活标绘工具和交互工具
                        stage.fire('evt-stop')
                        exitPlotTool(stage)
                        me.currentPlotTool = null
                        me.currentPlotActiveItem = null
                    }
                })
                // debugger
                const plotStageEl = me.$refs.plotStage.querySelector('.konvajs-content')
                plotStageEl.addEventListener('mousemove', (e) => {
                    const point = stage.getPointerPosition()
                    this.coordinateSystem.x = point.x
                    this.coordinateSystem.y = point.y
                })
                plotStageEl.addEventListener('mouseout', (e) => {
                    this.coordinateSystem.x = null
                    this.coordinateSystem.y = null
                })
                // 屏蔽画布上的浏览器右键菜单
                me.$refs.plotStage.oncontextmenu = function () {
                    return false
                }
                // 键盘事件
                document.addEventListener('keydown', (event) => {
                    if (event.keyCode === 46) { // del键：删除选中
                        // debugger
                        deleteShape(me.currentPlotActiveItem)
                        me.currentPlotActiveItem = null
                    } else if (event.keyCode === 27) { // ESC键：中断绘制
                        stage.fire('evt-stop')
                        me.currentPlotActiveItem = null
                    } else if (event.keyCode === 67 && event.ctrlKey) { // Ctrl+C
                        if (me.currentPlotActiveItem && me.currentPlotActiveItem.className === 'MoftArrowLine') {
                            alert('当前元素不支持复制粘贴操作')
                        } else {
                            me.currentPasteItem = me.currentPlotActiveItem
                        }
                    } else if (event.keyCode === 86 && event.ctrlKey) { // Ctrl+V
                        if (me.currentPasteItem) {
                            pasteShape(me.currentPasteItem)
                        }
                    } else if (event.keyCode === 90 && event.ctrlKey) { // Ctrl+Z
                        if (window.plotstack.canUndo()) {
                            window.plotstack['undo']()
                        } else {
                            alert('无可撤销内容')
                        }
                    } else if (event.keyCode === 89 && event.ctrlKey) { // Ctrl+Y
                        if (window.plotstack.canRedo()) {
                            window.plotstack['redo']()
                        } else {
                            alert('无可恢复内容')
                        }
                    }
                })
                // 浏览器调整大小后，重设画布布局
                window.addEventListener('resize', (e) => {
                    me.setStageLayout()
                })
            },
            setStageLayout () {
                const me = this
                const plotStageEl = this.$refs.plotStage
                const stage = this.stage
                let wrapWidth = window.innerWidth
                console.log('win', window.innerWidth)
                if (me.currentPlotActiveItem) {
                    wrapWidth = window.innerWidth - 320
                }
                // debugger
                if (wrapWidth > stage.width()) {
                    plotStageEl.setAttribute('data-layout-center', true)
                } else {
                    plotStageEl.removeAttribute('data-layout-center')
                }
            },
            // 发射画布数据
            emitSaveData () {
                const jsonData = this.stage.toJSON()
                const dataUrl = this.stage.toDataURL()
                const data = {
                    jsonData: jsonData,
                    picData: dataUrl
                }
                window.wrapHandshake.emit('evtSaveDataReady', data)
            }
            // doStageZoom (zoomLevel) {
            //     const me = this
            //     const stage = me.stage
            //     // const stageBackground = stage.findOne('#stageBackground')
            //     // const canvasWrap = me.$refs.plotStage
            //     // const konvajsContent = canvasWrap.querySelector('.konvajs-content')
            //     let transformScale = zoomLevel / 100
            //     if (!me.stageOriginalSize) {
            //         me.stageOriginalSize = {
            //             width: stage.getAttr('width'),
            //             height: stage.getAttr('height')
            //         }
            //     }
            //     // debugger
            //     stage.scale({
            //         x: transformScale,
            //         y: transformScale
            //     })
            //     stage.setAttrs({
            //         width: Math.round(me.stageOriginalSize.width * transformScale),
            //         height: Math.round(me.stageOriginalSize.height * transformScale)
            //     })
            //     stage.draw()

            //     // konvajsContent.style.width = stage.getWidth() * transformScale + 'px'
            //     // konvajsContent.style.height = stage.getHeight() * transformScale + 'px'
            //     me.setStageLayout()
            // }
        }
    }
    var ewbhData = {}
    var editbhnr = ''
</script>
