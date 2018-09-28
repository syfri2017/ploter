<template>
    <div class="app-ploter-feature"
        v-if="currentShape"
        label-position="right"
        slot="content"
    >
        <!-- 图形 -->
        <div class="app-ploter-feature-header">
            <h3 class="app-ploter-feature-title">[ {{shapeName}} ] 属性</h3>
            <!-- <Poptip placement="bottom-end">
                <Button
                    class="app-ploter-feature-header-btn"
                    type="text"
                    size="small"
                >
                    图层顺序
                </Button>
                <ButtonGroup vertical slot="content">
                    <Button long>置顶</Button>
                    <Button long>上移一层</Button>
                    <Button long>下移一层</Button>
                    <Button long>沉底</Button>
                </ButtonGroup>
            </Poptip> -->
        </div>
        <div class="app-ploter-feature-body">
            <MoftFieldset
                v-if="showPos"
                title="位置"
                :collapsable="false">
                <Row>
                    <Col span="4" class="label-col">X</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.x"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    <Col span="4" class="label-col">Y</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.y"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                v-if="showSize"
                title="尺寸"
                :collapsable="false">
                <Row>
                    <template v-if="feature.mainShape.width">
                    <Col span="4" class="label-col">宽度</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.width"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    </template>
                    <template v-if="feature.mainShape.height">
                    <Col span="4" class="label-col">高度</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.height"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    </template>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                v-if="showStroke"
                title="线（边）"
                :collapsable="false">
                <Row>
                    <template v-if="feature.mainShape.stroke">
                    <Col span="4" class="label-col">颜色</Col>
                    <Col span="8">
                        <ColorPicker
                            v-model="feature.mainShape.stroke"
                            size="small"
                            :colors="baseColors"
                            @on-change="onFeatureChange"
                            alpha
                        />
                    </Col>
                    </template>
                    <template v-if="feature.mainShape.strokeWidth">
                    <Col span="4" class="label-col">线宽</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.strokeWidth"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    </template>
                </Row>
                <Row>
                    <Col span="4" class="label-col">
                        虚线
                    </Col>
                    <Col span="2">
                        <Checkbox
                            v-model="feature.mainShape.dashEnabled"
                            @on-change="onFeatureChange"
                        ></Checkbox>
                    </Col>
                    <template v-if="feature.mainShape.dashEnabled">
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.dash[0]"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    <Col span="2"style="text-align:center">-</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.dash[1]"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    </template>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                v-if="showArrow"
                title="箭头"
                :collapsable="false">
                <Row>
                    <Col span="4" class="label-col">尺寸</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.width"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                    <Col span="4" class="label-col">距离</Col>
                    <Col span="8">
                        <InputNumber
                            v-model="feature.mainShape.space"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                        ></InputNumber>
                    </Col>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                v-if="showBackground"
                title="背景"
                :collapsable="false">
                <Row v-if="feature.mainShape.fill">
                    <Col span="4" class="label-col">背景色</Col>
                    <Col span="12">
                        <ColorPicker
                            v-model="feature.mainShape.fill"
                            size="small"
                            :colors="baseColors"
                            @on-change="onFeatureChange"
                            alpha
                        />
                    </Col>
                </Row>
                <template v-if="feature.mainShape.backgroundImage && feature.mainShape.fillPatternRepeat !== 'repeat'">
                <Row>
                    <Col span="5" class="label-col">图案样式</Col>
                    <Col span="4" class="label-col">
                        <img :src="feature.mainShape.backgroundImage.src" style="width:16px; height:16px;">
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">图案X</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.mainShape.backgroundImage.x"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                    <Col span="4" class="label-col">图案Y</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.mainShape.backgroundImage.y"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                </Row>
                    <Row>
                        <Col span="4" class="label-col">宽度</Col>
                        <Col span="8">
                        <InputNumber
                                v-model="feature.mainShape.backgroundImage.width"
                                size="small"
                                :formatter="value => `${value}px`"
                                :parser="value => value.replace('px', '')"
                                @on-change="onFeatureChange"
                        ></InputNumber>
                        </Col>
                        <Col span="4" class="label-col">高度</Col>
                        <Col span="8">
                        <InputNumber
                                v-model="feature.mainShape.backgroundImage.height"
                                size="small"
                                :formatter="value => `${value}px`"
                                :parser="value => value.replace('px', '')"
                                @on-change="onFeatureChange"
                        ></InputNumber>
                        </Col>
                    </Row>
                </template>
            </MoftFieldset>
            <MoftFieldset
                    v-if="showOpacity"
                    title="透明度"
                    :collapsable="false">
                <Row>
                    <Col span="24">
                        <Slider
                            v-model="feature.opacity"
                            show-input
                            :min="0"
                            :max="1"
                            :step="0.1"
                            input-size="small"
                            @on-change="onFeatureChange"
                        ></Slider>
                    </Col>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                v-if="showText"
                title="文本"
                :collapsable="false">
                <Row>
                    <Col span="4" class="label-col">X</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.textShape.x"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                    <Col span="4" class="label-col">Y</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.textShape.y"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">宽度</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.textShape.width"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                    <Col span="4" class="label-col">高度</Col>
                    <Col span="8">
                    <InputNumber
                            v-model="feature.textShape.height"
                            size="small"
                            :formatter="value => `${value}px`"
                            :parser="value => value.replace('px', '')"
                            @on-change="onFeatureChange"
                    ></InputNumber>
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">位置</Col>
                    <Col span="20">
                    <RadioGroup
                            v-model="feature.textShape.align"
                            type="button"
                            size="small"
                            @on-change="onFeatureChange">
                        <Radio label="left">居左</Radio>
                        <Radio label="center">居中</Radio>
                        <Radio label="right">居右</Radio>
                    </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">字体</Col>
                    <Col span="20">
                        <Select
                            v-model="feature.textShape.fontFamily"
                            size="small"
                            @on-change="onFeatureChange"
                        >
                            <Option
                                v-for="item in baseFontOptions.fontFamily"
                                :value="item.value"
                                :key="item.value"
                            >{{item.name}}</Option>
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">颜色</Col>
                    <Col span="8">
                        <ColorPicker
                            v-model="feature.textShape.fill"
                            size="small"
                            :colors="baseColors"
                            @on-change="onFeatureChange"
                            alpha
                        />
                    </Col>
                    <Col span="4" class="label-col">字号</Col>
                    <Col span="8">
                        <Select
                            v-model="feature.textShape.fontSize"
                            size="small"
                            @on-change="onFeatureChange"
                        >
                            <Option
                                v-for="item in baseFontOptions.fontSize"
                                :value="item"
                                :key="item"
                            >{{item}}px</Option>
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span="4" class="label-col">内容</Col>
                    <Col span="20">
                        <Input
                            v-model="feature.textShape.text" 
                            @on-change="onFeatureChange"
                            type="textarea"
                            placeholder="请输入文字内容……"></Input>
                    </Col>
                </Row>
            </MoftFieldset>
            <MoftFieldset
                class="app-ploter-feature-layer-fieldset"
                title="调整图层顺序"
                :collapsable="false">
                <ButtonGroup>
                    <Button @click="layerMove('top')">置顶</Button>
                    <Button @click="layerMove('up')">上移一层</Button>
                    <Button @click="layerMove('down')">下移一层</Button>
                    <Button @click="layerMove('bottom')">沉底</Button>
                </ButtonGroup>
            </MoftFieldset>
        </div>
    </div>
</template>

<script>

    import appPlotBaseColors from '@/store/static/plot/AppPlotBaseColors'
    import appPlotBaseFontOptions from '@/store/static/plot/AppPlotBaseFontOptions'
    // 共通组件
    import moftPanel from '@/components/panel/MoftPanel'
    import moftPanelWrap from '@/components/panel/MoftPanelWrap'
    import moftFieldset from '@/components/MoftFieldset'
    import moftDivided from '@/components/MoftDivided'
    import { isEmptyObj } from '@/common/utils'

    let isInitFeature = false

    export default {
        name: 'AppPloterFeatures',
        components: {
            'MoftPanel': moftPanel,
            'MoftPanelWrap': moftPanelWrap,
            'MoftFieldset': moftFieldset,
            'MoftDivided': moftDivided
        },
        props: ['stage', 'currentShape'],
        data () {
            return {
                shapeName: null,
                shapeCfg: null,
                feature: {
                    modified: false,
                    opacity: 1,
                    mainShape: {},
                    textShape: {}
                },
                baseColors: appPlotBaseColors,
                baseFontOptions: appPlotBaseFontOptions
            }
        },
        computed: {
            showPos () {
                let result = true
                if (this.currentShape) {
                    if (this.shapeCfg.type === 'line' || this.shapeCfg.type === 'arrowLine' ||
                        this.shapeCfg.style.shapeType === 'polygon') {
                        result = false
                    }
                }
                return result
            },
            showOpacity () {
                let result = true
                if (this.currentShape) {
                    if (this.shapeCfg.type === 'arrowLine') {
                        result = false
                    }
                }
                return result
            },
            showSize () {
                let result = false
                if (this.currentShape) {
                    if (this.shapeCfg.type !== 'line' && this.shapeCfg.type !== 'arrowLine') {
                        result = true
                    }
                    if (this.shapeCfg.type === 'area' && this.shapeCfg.style.shapeType === 'polygon') {
                        result = false
                    }
                }
                return result
            },
            showStroke () {
                let result = false
                if (this.currentShape) {
                    if (this.shapeCfg.type !== 'icon' && this.shapeCfg.type !== 'image') {
                        result = true
                    }
                    if (this.shapeCfg.id.startsWith('battle_line')) {
                        result = false
                    }
                }
                return result
            },
            showArrow () {
                let result = false
                if (this.currentShape) {
                    if (this.shapeCfg.type === 'arrowLine') {
                        result = true
                    }
                }
                return result
            },
            showBackground () {
                let result = false
                if (this.currentShape) {
                    if (this.shapeCfg.type === 'area' && this.shapeCfg.style.mainShape.fillPriority === 'color') {
                        result = true
                    }
                    if (this.shapeCfg.type === 'legend') {
                        result = true
                    }
                }
                return result
            },
            showText () {
                let result = false
                if (this.currentShape) {
                    if (!isEmptyObj(this.shapeCfg.style.textShape)) {
                        result = true
                    }
                    if (this.shapeCfg.type === 'legend') {
                        result = false
                    }
                }
                return result
            }
        },
        watch: {
            currentShape (shape) {
                if (!shape || shape.parent.className === 'Transformer') return

                const shapeWrap = shape.findAncestor('.shapeWrap')
                const shapeCfg = shapeWrap.getAttr('_shapeCfg')
                const shapeGroup = shapeWrap.findOne('.shapeGroup')
                const mainShape = shapeGroup.findOne('.mainShape')
                const textShape = shapeGroup.findOne('.textShape')

                this.shapeName = shapeCfg.name
                this.shapeCfg = shapeCfg

                this.feature.opacity = shapeGroup.getAttr('opacity')
                this.feature.mainShape = {}
                this.feature.textShape = {}

                if (mainShape) {
                    if (mainShape.getAttr('x')) {
                        this.feature.mainShape.x = mainShape.getAttr('x')
                    }
                    if (mainShape.getAttr('y')) {
                        this.feature.mainShape.y = mainShape.getAttr('y')
                    }
                    if (mainShape.getAttr('width')) {
                        this.feature.mainShape.width = Math.round(mainShape.getAttr('width'))
                    }
                    if (mainShape.getAttr('height')) {
                        this.feature.mainShape.height = Math.round(mainShape.getAttr('height'))
                    }
                    if (mainShape.getAttr('stroke')) {
                        this.feature.mainShape.stroke = mainShape.getAttr('stroke')
                    }
                    if (mainShape.getAttr('strokeWidth')) {
                        this.feature.mainShape.strokeWidth = mainShape.getAttr('strokeWidth')
                    }
                    if (mainShape.getAttr('dashEnabled')) {
                        this.feature.mainShape.dashEnabled = mainShape.getAttr('dashEnabled')
                    } else {
                        this.feature.mainShape.dashEnabled = false
                    }
                    this.feature.mainShape.dash = mainShape.getAttr('dash') || [4, 8]
                    if (mainShape.getAttr('fill')) {
                        this.feature.mainShape.fill = mainShape.getAttr('fill')
                    }

                    let backgroundImage = mainShape.getAttr('backgroundImage')
                    if (backgroundImage) {
                        if (this.shapeCfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
                            const fillicon = shapeGroup.findOne('.fillicon')
                            if (fillicon) {
                                if (!this.feature.mainShape.backgroundImage) {
                                    this.feature.mainShape.backgroundImage = {}
                                }
                                this.feature.mainShape.backgroundImage.x = Math.round(fillicon.getAttr('x'))
                                this.feature.mainShape.backgroundImage.y = Math.round(fillicon.getAttr('y'))
                                this.feature.mainShape.backgroundImage.width = Math.round(fillicon.getAttr('width'))
                                this.feature.mainShape.backgroundImage.height = Math.round(fillicon.getAttr('height'))
                                this.feature.mainShape.backgroundImage.src = this.shapeCfg.style.mainShape.backgroundImage.src
                            }
                        }
                    }
                    if (this.showArrow) {
                        let arrowLineStyle = mainShape.getAttr('moftArrowStyle')
                        this.feature.mainShape.width = arrowLineStyle.width
                        this.feature.mainShape.space = arrowLineStyle.space
                    }
                }
                if (textShape) {
                    this.feature.textShape.fontFamily = textShape.getAttr('fontFamily')
                    this.feature.textShape.fill = textShape.getAttr('fill')
                    this.feature.textShape.fontSize = textShape.getAttr('fontSize')
                    this.feature.textShape.align = textShape.getAttr('align')
                    this.feature.textShape.text = textShape.getAttr('text')
                    this.feature.textShape.width = Math.round(textShape.getAttr('width'))
                    this.feature.textShape.height = Math.round(textShape.getAttr('height'))
                    this.feature.textShape.x = Math.round(textShape.getAttr('x'))
                    this.feature.textShape.y = Math.round(textShape.getAttr('y'))
                }
                setTimeout(() => {
                    isInitFeature = true
                })
            }
        },
        methods: {
            onFeatureChange (newFeature) {
                if (isInitFeature === true) {
                    this.$emit('evtFeatureChange', this.feature)
                }
            },
            layerMove (action) {
                const me = this
                let shapeWrap = me.currentShape.findAncestor('.shapeWrap')
                let shapesLayer = shapeWrap.findAncestor('.shapesLayer')

                switch (action) {
                case 'top':
                    shapeWrap.moveToTop()
                    break
                case 'up':
                    shapeWrap.moveUp()
                    break
                case 'down':
                    shapeWrap.moveDown()
                    break
                case 'bottom':
                    shapeWrap.moveToBottom()
                    break
                }
                shapesLayer.draw()
            }
        }
    }
</script>
