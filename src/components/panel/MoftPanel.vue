<template>
    <div :class="itemClasses">
        <h3
            @click="toggle"
            class="moft-panel-base-header"
        >
            {{title}}
            <div class="moft-panel-base-header-toggle-handler">
                <Icon type="arrow-left-b"></Icon>
            </div>
        </h3>
        <collapse-transition>
            <div :class="contentClasses" v-show="isActive">
                <div :class="boxClasses"><slot name="content"></slot></div>
            </div>
        </collapse-transition>
    </div>
</template>

<script>
    import CollapseTransition from './CollapseTransition'
    const prefixCls = 'moft-panel-base'
    export default {
        name: 'MoftPanel',
        components: { CollapseTransition },
        props: {
            name: {
                type: String
            },
            title: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                index: 0,
                isActive: false
            }
        },
        computed: {
            itemClasses () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-active`]: this.isActive
                    }
                ]
            },
            contentClasses () {
                return `${prefixCls}-content`
            },
            boxClasses () {
                return `${prefixCls}-content-box`
            }
        },
        methods: {
            toggle () {
                this.$parent.toggle({
                    name: this.name || this.index,
                    isActive: this.isActive
                })
            }
        }
    }
</script>

<style lang="scss">
    .moft-panel-base {
        background-color: #fff;
        border-radius: 4px;
        // box-shadow: 0 0 4px rgba(0,0,0,0.2);
        // &:hover {
        //     box-shadow: 0 0 16px rgba(0,0,0,0.2);
        // }
    }
    .moft-panel-base-header {
        height: 24px;
        line-height: 24px;
        padding-left: 8px;
        border-bottom: 1px solid #ccc;
        border-top-right-radius: 4px;
        border-top-left-radius: 4px;
        background-color: #ccc;
        cursor: pointer;

        .moft-panel-base-header-toggle-handler{
            float: right;
            width: 16px;
            height: 16px;
            line-height: 24px;
            margin-right: 4px;
            text-align: center;
            i {
                transition: transform .2s;
            }
        }
    }
    .moft-panel-base-active .moft-panel-base-header-toggle-handler i {
        transform: rotate(-90deg);
    }

    .moft-panel-base-content{
        padding: 4px;
        background-color: #fff;

        .moft-panel-base-content-box {
            position: relative;
        }
    }
</style>
