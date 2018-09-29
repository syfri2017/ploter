<template>
    <Modal
        class="app-ploter-setting-model"
        v-model="showModel"
        title="标绘文件命名"
        width="300"
        :mask-closable="false"
        :closable="false"
        @on-ok="onSaveSetting"
        @on-cancel="onCancel"
        >
        <Form class="app-ploter-home-create-form">
            <FormItem>
                <Row>
                    <Input :min="600" v-model="bhmc"></Input>
                </Row>
            </FormItem>
        </Form>
    </Modal>
</template>

<script>
    export default {
        name: 'AppPloterSettingModel',
        props: {
            show: {
                type: Boolean,
                default: false
            },
            bhname: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                showModel: this.show,
                bhmc: this.bhname
            }
        },
        watch: {
            show (newValue) {
                this.showModel = newValue
            },
            bhname (newVal) {
                this.bhmc = newValue
            }
        },
        methods: {
            onSaveSetting () {
                // localStorage.setItem('plotSetting', JSON.stringify(this.setting))
                this.$emit('evtSaveSetting', this.bhmc)
            },
            onCancel  () {
                this.$emit('evtCancelSetting')
            }
        }
    }
</script>
