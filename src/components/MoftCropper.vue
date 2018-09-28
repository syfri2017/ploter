<template>
    <div class="moft-cropper">
        <img class="moft-cropper-img" :src="imgSrc" ref="img" :alt="imgAlt"/>
    </div>
</template>
<script>
    import Cropper from 'cropperjs'
    import 'cropperjs/dist/cropper.css'
    export default {
        name: 'MoftCropper',
        props: {
            'imgSrc': {
                type: String,
                default: ''
            },
            'imgAlt': String,

            // CropperJS props
            'viewMode': Number,
            'dragMode': String,
            'aspectRatio': Number,
            'data': Object,
            'preview': String,
            'responsive': {
                type: Boolean,
                default: true
            },
            'restore': {
                type: Boolean,
                default: true
            },
            'checkCrossOrigin': {
                type: Boolean,
                default: true
            },
            'checkOrientation': {
                type: Boolean,
                default: true
            },
            'modal': {
                type: Boolean,
                default: true
            },
            'guides': {
                type: Boolean,
                default: true
            },
            'center': {
                type: Boolean,
                default: true
            },
            'highlight': {
                type: Boolean,
                default: true
            },
            'background': {
                type: Boolean,
                default: true
            },
            'autoCrop': {
                type: Boolean,
                default: true
            },
            'autoCropArea': Number,
            'movable': {
                type: Boolean,
                default: true
            },
            'rotatable': {
                type: Boolean,
                default: true
            },
            'scalable': {
                type: Boolean,
                default: true
            },
            'zoomable': {
                type: Boolean,
                default: true
            },
            'zoomOnTouch': {
                type: Boolean,
                default: true
            },
            'zoomOnWheel': {
                type: Boolean,
                default: true
            },
            'wheelZoomRatio': Number,
            'cropBoxMovable': {
                type: Boolean,
                default: true
            },
            'cropBoxResizable': {
                type: Boolean,
                default: true
            },
            'toggleDragModeOnDblclick': {
                type: Boolean,
                default: true
            },

            // Size limitation
            'minCanvasWidth': Number,
            'minCanvasHeight': Number,
            'minCropBoxWidth': Number,
            'minCropBoxHeight': Number,
            'minContainerWidth': Number,
            'minContainerHeight': Number,

            // callbacks
            'ready': Function,
            'cropstart': Function,
            'cropmove': Function,
            'cropend': Function,
            'crop': Function,
            'zoom': Function
        },
        mounted () {
            this.init()
        },
        methods: {
            init () {
                const props = {}
                // const libraryProps = ['imgSrc', 'imgAlt']

                for (const key in this.$options.props) {
                    // if (libraryProps.indexOf(key) >= 0) {
                    if (this[key] !== undefined) {
                        props[key] = this[key]
                    }
                    // }
                }
                this.cropper = new Cropper(this.$refs.img, props)
            },

            reset () {
                return this.cropper.reset()
            },
            clear () {
                return this.cropper.clear()
            },
            replace (url, onlyColorChanged = false) {
                return this.cropper.replace(url, onlyColorChanged)
            },
            enable () {
                return this.cropper.enable()
            },
            disable () {
                return this.cropper.disable()
            },
            destroy () {
                return this.cropper.destroy()
            },
            move (offsetX, offsetY) {
                return this.cropper.move(offsetX, offsetY)
            },
            moveTo (x, y = x) {
                return this.cropper.moveTo(x, y)
            },
            relativeZoom (ratio, _originalEvent) {
                return this.cropper.zoom(ratio, _originalEvent)
            },
            zoomTo (ratio, _originalEvent) {
                return this.cropper.zoomTo(ratio, _originalEvent)
            },
            rotate (degree) {
                return this.cropper.rotate(degree)
            },
            rotateTo (degree) {
                return this.cropper.rotateTo(degree)
            },
            scaleX (scaleX) {
                return this.cropper.scaleX(scaleX)
            },
            scaleY (scaleY) {
                return this.cropper.scaleY(scaleY)
            },
            scale (scaleX, scaleY = scaleX) {
                return this.cropper.scale(scaleX, scaleY)
            },
            getData (rounded = false) {
                return this.cropper.getData(rounded)
            },
            setData (data) {
                return this.cropper.setData(data)
            },
            getContainerData () {
                return this.cropper.getContainerData()
            },
            getImageData () {
                return this.cropper.getImageData()
            },
            getCanvasData () {
                return this.cropper.getCanvasData()
            },
            setCanvasData (data) {
                return this.cropper.setCanvasData(data)
            },
            getCropBoxData () {
                return this.cropper.getCropBoxData()
            },
            setCropBoxData (data) {
                return this.cropper.setCropBoxData(data)
            },
            getCroppedCanvas (options = {}) {
                return this.cropper.getCroppedCanvas(options)
            },
            setAspectRatio (aspectRatio) {
                return this.cropper.setAspectRatio(aspectRatio)
            },
            setDragMode (mode) {
                return this.cropper.setDragMode(mode)
            }
        }
    }
</script>

<style scoped>
    .moft-cropper {
        position: relative;
    }
</style>
