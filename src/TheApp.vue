<template>
    <transition name="bounce">
        <router-view></router-view>
    </transition>
</template>

<script>
import theViewport from './views/TheViewport'
export default {
    name: 'TheApp',
    components: {
        'TheViewport': theViewport
    }
}
</script>

<style>
body {
    overflow-x: hidden;
}
</style>
