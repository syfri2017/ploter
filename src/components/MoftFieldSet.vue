<template>
    <fieldset :class="classes">
        <legend class="moft-fieldset-legend">
            {{title}}
            <span
                v-if="collapsable"
                :class="toggleBtnClasses"
                @click="toggle"></span>
        </legend>
        <div
            v-if="!collapsable || collapsable && !isCollapsed"
            class="moft-fieldset-body">
            <slot></slot>
        </div>
    </fieldset>
</template>
<script>
    const prefixCls = 'moft-fieldset'
    export default {
        name: 'MoftFieldset',
        props: {
            collapsable: {
                type: Boolean,
                default: true
            },
            collapsed: {
                type: Boolean,
                default: false
            },
            title: {
                type: String
            // },
            // icon: {
            //     type: String
            }
        },
        data () {
            return {
                isCollapsed: this.collapsed
            }
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-collapsable`]: this.collapsable,
                        [`${prefixCls}-collapsed`]: this.isCollapsed,
                        [`${prefixCls}-expanded`]: !this.isCollapsed
                    }
                ]
            },
            toggleBtnClasses () {
                return [
                    `${prefixCls}-toggle-btn`,
                    {
                        [`${prefixCls}-toggle-btn-collapsed`]: this.isCollapsed,
                        [`${prefixCls}-toggle-btn-expanded`]: !this.isCollapsed
                    }
                ]
            }
        },
        methods: {
            toggle (e) {
                if (this.isCollapsed) {
                    this.isCollapsed = false
                } else {
                    this.isCollapsed = true
                }
            }
        }
    }
</script>

<style scoped>
    .moft-fieldset {
        position: relative;
        margin: 8px 0;
        border-radius: 4px;
        border-color: #ddd;
    }
    .moft-fieldset-collapsable .moft-fieldset-legend {
        padding: 0 32px 0 8px;
    }
    .moft-fieldset-collapsed {
        height: 13px;
    }
    .moft-fieldset-expanded {
        background-color: #fff;
    }
    .moft-fieldset-legend {
        position: relative;
        padding: 0 8px;
        margin-left: 8px;
        font-size: 16px;
        color: #888;
        user-select: none;
    }
    .moft-fieldset-toggle-btn {
        position: absolute;
        top: 2px;
        right: 4px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background: #fafafa;
        text-align: center;
        font-family: Ionicons;
        color: #888;
        cursor: pointer;
        transition: all .2s ease-in-out;
    }
    .moft-fieldset-toggle-btn:focus {
        outline: 0;
    }
    .moft-fieldset-toggle-btn:before {
        content: '\F35F';
    }
    .moft-fieldset-toggle-btn-expanded {
        transform: rotate(180deg)
    }

    .moft-fieldset-body {
        transition: all .2s ease-in-out;
    }
</style>
