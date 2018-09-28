<template>
    <Modal
        class="app-ploter-setting-model"
        v-model="showModel"
        title="设置"
        width="600"
        :mask-closable="false"
        :closable="false"
        @on-ok="onSaveSetting"
        @on-cancel="onCancel">
        <Form :model="setting" :label-width="80" class="app-ploter-home-create-form">
            <FormItem label="画布预设">
                <Row>
                    <Col span="4" class="app-ploter-home-create-form-label">宽度:</Col>
                    <Col span="6">
                        <InputNumber
                        :min="320"
                        :step="10"
                        v-model="setting.stage.width"></InputNumber>
                    </Col>
                    <Col span="2">px</Col>
                    <Col span="4" class="app-ploter-home-create-form-label">高度:</Col>
                    <Col span="6">
                        <InputNumber
                        :min="320"
                        :step="10"
                        v-model="setting.stage.height"></InputNumber>
                    </Col>
                    <Col span="2">px</Col>
                </Row>
                <Row>
                    <Col span="4" class="app-ploter-home-create-form-label">底色:</Col>
                    <Col span="8">
                        <ColorPicker
                            v-model="setting.stage.fill"
                            :colors="baseColors"
                        />
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="图标预设">
                <Row>
                    <Col span="4" class="app-ploter-home-create-form-label">宽度:</Col>
                    <Col span="6">
                        <InputNumber
                        :min="16"
                        :max="160"
                        :step="8"
                        v-model="setting.icon.width"></InputNumber>
                    </Col>
                    <Col span="2">px</Col>
                    <Col span="4" class="app-ploter-home-create-form-label">高度:</Col>
                    <Col span="6">
                        <InputNumber
                        :min="16"
                        :max="160"
                        :step="8"
                        v-model="setting.icon.height"></InputNumber>
                    </Col>
                    <Col span="2">px</Col>
                </Row>
            </FormItem>
        </Form>
    </Modal>
</template>

<script>
    import drawLib from './draw'
    import appPlotBaseColors from '@/store/static/plot/AppPlotBaseColors'
    export default {
        name: 'AppPloterSettingModel',
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                showModel: this.show,
                setting: {
                    stage: {
                        width: 1200,
                        height: 800,
                        fill: '#fff'
                    },
                    icon: {
                        width: 24,
                        height: 24
                    }
                },
                baseColors: appPlotBaseColors
            }
        },
        mounted () {
            const localSetting = drawLib.getLocalSetting()
            this.setting = localSetting
        },
        watch: {
            show (newValue) {
                this.showModel = newValue
            }
        },
        methods: {
            onSaveSetting () {
                localStorage.setItem('plotSetting', JSON.stringify(this.setting))
                this.$emit('evtSaveSetting', this.setting)
            },
            onCancel  () {
                this.$emit('evtCancelSetting')
            }
        }
    }
</script>
