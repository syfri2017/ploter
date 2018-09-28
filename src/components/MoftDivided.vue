<template>
    <div class="moft-divided">
        <div v-if="title" class="moft-divided-line" style="width:8px"></div>
        <div v-if="title" class="moft-divided-title">{{title}}</div>
        <div class="moft-divided-line" style="flex: 1"></div>
    </div>
</template>

<script>
    export default {
        name: 'MoftDivided',
        props: {
            title: {
                type: String
            }
        },
        data () {
            return {
                status: 'expand'
            }
        },
        methods: {
            onToggleCollapse () {
                if (this.status === 'expand') {
                    this.status = 'collapse'
                } else {
                    this.status = 'expand'
                }
            }
        }
    }
</script>

<style scoped>
    .moft-divided {
        display: flex;
    }
    .moft-divided-line {
        padding-top: 12px;
        height: 0;
        border-bottom: 1px solid #ddd;
    }
    .moft-divided-title {
        padding: 0 8px;
        line-height: 24px;
        color: #888;
        font-size: 12px;
        font-weight: 400;
    }
</style>
