<template>
    <transition name="bounce">
        <router-view></router-view>
    </transition>
</template>

<script>
    export default {
        name: 'TheViewport',
        data () {
            return {

            }
        }
    }
</script>
