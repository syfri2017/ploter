<template>
    <Layout class="app-ploter-home">
        <Content class="app-ploter-home-body">
            <canvas id="appPloterHomeBackground" class="app-ploter-home-background"></canvas>
            <Button @click="createModel = true">新建标绘</Button>
            <Button @click="loadFile">读取本地标绘</Button>
            <input ref="fileInput"
                type="file"
                name="image"
                accept=".mplot"
                style="display:none"
                @change="selectedFile"
            />
            <Modal
                class="app-ploter-home-create-model"
                v-model="createModel"
                title="新建画布"
                width="400"
                :mask-closable="false"
                :closable="false"
                @on-ok="onCreatePlot">
                <Form :model="stageCfg" class="app-ploter-home-create-form">
                    <FormItem>
                        <Row>
                            <Col span="4" class="app-ploter-home-create-form-label">宽:</Col>
                            <Col span="7">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.width"></InputNumber>
                            </Col>
                            <Col span="1">px</Col>
                            <Col span="4" class="app-ploter-home-create-form-label">高:</Col>
                            <Col span="7">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.height"></InputNumber>
                            </Col>
                            <Col span="1">px</Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span="4" class="app-ploter-home-create-form-label">背景色:</Col>
                            <Col span="20">
                                <ColorPicker
                                    v-model="stageCfg.fill"
                                    :colors="baseColors"
                                    alpha
                                />
                            </Col>
                        </Row>
                    </FormItem>
                </Form>
            </Modal>
        </Content>
    </Layout>
</template>

<script>
    import appPlotBaseColors from '@/store/static/plot/AppPlotBaseColors'
    import appPlotBaseStage from '@/store/static/plot/AppPlotBaseStage'
    import {Base64} from 'js-base64'
    export default {
        name: 'AppPloterImageList',
        data () {
            return {
                createModel: false,
                stageCfg: {
                    width: 800,
                    height: 600,
                    fill: '#ffffff'
                },
                baseColors: appPlotBaseColors
            }
        },
        mounted () {
            this.initBackground()
        },
        methods: {
            onCreatePlot: function () {
                let stageData = {
                    ...appPlotBaseStage
                }
                const backgroundLayer = stageData.children[0]
                let backgroundShape = {
                    attrs: {
                        name: 'shapeWrap',
                        _shapeCfg: {
                            name: '底图',
                            id: 'background',
                            type: 'image',
                            style: {
                                backgroundShape: {
                                    ...this.stageCfg
                                }
                            }
                        },
                        activable: true
                    },
                    className: 'Group',
                    children: [{
                        attrs: {
                            name: 'shapeGroup',
                            draggable: false,
                            _isDrawn: true,
                            x: 0,
                            y: 0
                        },
                        className: 'Group',
                        children: [{
                            attrs: {
                                name: 'backgroundShape',
                                x: 0,
                                y: 0,
                                ...this.stageCfg
                            },
                            className: 'Rect'
                        }]
                    }, {
                        attrs: {
                            name: 'interactiveGroup'
                        },
                        className: 'Group',
                        children: []
                    }]
                }

                stageData.attrs.width = this.stageCfg.width
                stageData.attrs.height = this.stageCfg.height
                backgroundLayer.children.push(backgroundShape)

                this.$emit('evtInitPlot', stageData, 'create')
            },
            loadFile () {
                this.$refs.fileInput.click()
            },
            selectedFile (e) {
                const file = e.target.files[0]

                if (typeof FileReader === 'function') {
                    const reader = new FileReader()

                    reader.onload = (e) => {
                        const content = e.target.result.replace('data:;base64,', '')
                        const stageData = JSON.parse(Base64.decode(content))
                        if (!stageData.attrs.mplot) {
                            alert('文件无效，请选择.mplot后缀的云帆标绘文件')
                        }
                        this.$emit('evtInitPlot', stageData, 'load')
                    }

                    reader.readAsDataURL(file)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            initBackground () {
                var lastTime = 0
                let width = window.innerWidth
                let height = window.innerHeight - 50

                let canvas = document.getElementById('appPloterHomeBackground')
                canvas.width = width
                canvas.height = height
                let ctx = canvas.getContext('2d')

                // create particles
                let circles = []
                for (var x = 0; x < width * 0.5; x++) {
                    var c = new Circle()
                    circles.push(c)
                }
                animate()

                window.addEventListener('resize', (e) => {
                    width = window.innerWidth
                    height = window.innerHeight - 50
                    canvas.width = width
                    canvas.height = height
                })

                function animate () {
                    ctx.clearRect(0, 0, width, height)
                    for (var i in circles) {
                        circles[i].draw()
                    }
                    function requestAnimationFrame (callback) {
                        var currTime = new Date().getTime()
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime))
                        var id = window.setTimeout(function () { callback(currTime + timeToCall) },
                            timeToCall)
                        lastTime = currTime + timeToCall
                        return id
                    }
                    requestAnimationFrame(animate)
                }

                function Circle () {
                    var _this = this

                    _this.pos = {}
                    init()

                    function init () {
                        _this.pos.x = Math.random() * width
                        _this.pos.y = height + Math.random() * 100
                        _this.alpha = 0.1 + Math.random() * 0.3
                        _this.scale = 0.1 + Math.random() * 0.3
                        _this.velocity = Math.random()
                    }

                    this.draw = function () {
                        if (_this.alpha <= 0) {
                            init()
                        }
                        _this.pos.y -= _this.velocity
                        _this.alpha -= 0.0005
                        ctx.beginPath()
                        ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false)
                        ctx.fillStyle = 'rgba(160,160,160,' + _this.alpha + ')'
                        ctx.fill()
                    }
                }
            }
        }
    }
</script>
