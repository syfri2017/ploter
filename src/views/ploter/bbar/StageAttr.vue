<template>
    <div class="app-status-bar-stageattr-wrap" v-if="stage">
        <div class="app-status-bar-stageattr">
            <div style="flex: 1"> </div>
            <Poptip title="画布属性"
                class="app-status-bar-stageattr-poptip"
                placement="top-end"
            >
                <div>
                    当前画布： {{stage.attrs.width}} x {{stage.attrs.height}}
                    <Icon type="arrow-down-b"></Icon>
                </div>
                <Form :model="stageCfg" slot="content" class="app-status-bar-stageattr-form">
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">宽:</Col>
                            <Col span="14">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.width"></InputNumber>
                            </Col>
                            <Col span="2">px</Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">高:</Col>
                            <Col span="14">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.height"></InputNumber>
                            </Col>
                            <Col span="2">px</Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">背景色:</Col>
                            <Col span="16">
                                <ColorPicker
                                    v-model="stageCfg.fill"
                                    :colors="baseColors"
                                />
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button long @click="onApplyCfg">确定</Button>
                    </FormItem>
                </Form>
            </Poptip>
            <!-- <Slider
                class="app-status-bar-stageattr-zoom-slider"
                v-model="zoomLevel"
                :max="400"
                :min="50"
                :step="50"
                input-size="small"
            ></Slider>
            <Button size="small" icon="ios-undo"></Button> -->
        </div>
    </div>
</template>

<script>
    import appPlotBaseColors from '@/store/static/plot/AppPlotBaseColors'
    export default {
        name: 'AppPloterBBarStageAttr',
        props: ['stage'],
        data () {
            return {
                stageCfg: {
                    width: 800,
                    height: 600,
                    fill: '#fff'
                },
                baseColors: appPlotBaseColors,
                zoomLevel: 100
            }
        },
        watch: {
            stage (stage) {
                if (stage) {
                    const background = stage.findOne('#stageBackground')
                    this.stageCfg = {
                        width: stage.getWidth(),
                        height: stage.getHeight(),
                        fill: background.getFill()
                    }
                    console.log(this.stageCfg)
                }
            },
            zoomLevel (level) {
                this.$store.commit('updateStageZoom', level)
            }
        },
        methods: {
            onApplyCfg () {
                this.$emit('evtStageCfgChanged', this.stageCfg)
            }
        }
    }
</script>
