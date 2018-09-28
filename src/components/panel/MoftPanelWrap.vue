<template>
    <div :class="classes">
        <slot></slot>
    </div>
</template>
<script>
    const prefixCls = 'moft-panel-wrap'
    export default {
        name: 'MoftPanelWrap',
        props: {
            accordion: {
                type: Boolean,
                default: false
            },
            value: {
                type: [Array, String]
            }
        },
        data () {
            return {
                currentValue: this.value
            }
        },
        computed: {
            classes () {
                return `${prefixCls}`
            }
        },
        mounted () {
            this.setActive()
        },
        methods: {
            setActive () {
                const activeKey = this.getActiveKey()
                this.$children.forEach((child, index) => {
                    const name = child.name || index.toString()
                    let isActive = false
                    if (self.accordion) {
                        isActive = activeKey === name
                    } else {
                        isActive = activeKey.indexOf(name) > -1
                    }
                    child.isActive = isActive
                    child.index = index
                })
            },
            getActiveKey () {
                let activeKey = this.currentValue || []
                const accordion = this.accordion
                if (!Array.isArray(activeKey)) {
                    activeKey = [activeKey]
                }
                if (accordion && activeKey.length > 1) {
                    activeKey = [activeKey[0]]
                }
                for (let i = 0; i < activeKey.length; i++) {
                    activeKey[i] = activeKey[i].toString()
                }
                return activeKey
            },
            toggle (data) {
                const name = data.name.toString()
                let newActiveKey = []
                if (this.accordion) {
                    if (!data.isActive) {
                        newActiveKey.push(name)
                    }
                } else {
                    let activeKey = this.getActiveKey()
                    const nameIndex = activeKey.indexOf(name)
                    if (data.isActive) {
                        if (nameIndex > -1) {
                            activeKey.splice(nameIndex, 1)
                        }
                    } else {
                        if (nameIndex < 0) {
                            activeKey.push(name)
                        }
                    }
                    newActiveKey = activeKey
                }
                this.currentValue = newActiveKey
                this.$emit('input', newActiveKey)
                this.$emit('on-change', newActiveKey)
            }
        },
        watch: {
            value (val) {
                setTimeout(() => {
                    this.currentValue = val
                }, 0)
            },
            currentValue () {
                this.setActive()
            }
        }
    }
</script>

<style lang="scss">
    .moft-panel-wrap {
        background-color: #fff;
        border-radius: 4px;
        // box-shadow: 0 0 4px rgba(0,0,0,0.2);
        // &:hover {
        //     box-shadow: 0 0 16px rgba(0,0,0,0.2);
        // }
        .moft-panel-base {
            border-top: 1px solid #ccc;
            border-radius: 0;
            box-shadow: none;
            &:hover {
                box-shadow: none;
            }
            &:first-child {
                border-top-right-radius: 4px;
                border-top-left-radius: 4px;
                border-top: 0;
                .moft-panel-base-header {
                    border-top-right-radius: 4px;
                    border-top-left-radius: 4px;
                }
            }
            &:last-child {
                border-bottom-right-radius: 4px;
                border-bottom-left-radius: 4px;
                .moft-panel-base-header {
                    border-bottom-right-radius: 4px;
                    border-bottom-left-radius: 4px;
                }
                &.moft-panel-base-active {
                    .moft-panel-base-header {
                        border-bottom-right-radius: 0px;
                        border-bottom-left-radius: 0px;
                    }
                    .moft-panel-base-content {
                        border-bottom-right-radius: 4px;
                        border-bottom-left-radius: 4px;
                    }
                }
            }
        }
        // .moft-panel-base-header {
        //     border-radius: 0;
        // }

        // .moft-panel-base-active .moft-panel-base-content{
        //     //display: block;
        // }
    }
</style>
