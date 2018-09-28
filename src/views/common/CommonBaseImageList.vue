<template>
    <div class="common-base-image-list">
        <!-- <div class="common-base-image-list-group">
            <MoftDivided title="从当前灾情"></MoftDivided>
            <div class="common-base-image-list-empty">没有可用底图</div>
            <MoftCard class="common-base-image-list-item">
                <div class="common-base-image-list-item-thumb"></div>
                <div class="common-base-image-list-item-body">
                    <h6 class="common-base-image-list-item-title">灾情标绘资源名称</h6>
                    <div class="common-base-image-list-item-toolbar">
                        <Button type="ghost" size="small" @click="onSelect">使用</Button>
                    </div>
                </div>
            </MoftCard>
        </div> -->
        <div class="common-base-image-list-group">
            <!-- <MoftDivided title="从关键图示"></MoftDivided> -->
            <div
                v-if="listData.length == 0"
                class="common-base-image-list-empty">没有可用图片</div>
            <MoftCard
                v-for="item in listData"
                :key="item.uuid"
                class="common-base-image-list-item"
            >
                <div
                    :style="{backgroundImage: 'url(' + fileDomain + item.thumbnailUrl + ')'}"
                    class="common-base-image-list-item-thumb"
                ></div>
                <div class="common-base-image-list-item-body">
                    <h6 class="common-base-image-list-item-title">
                        {{item.mediaDescription}}
                    </h6>
                    <div class="common-base-image-list-item-toolbar">
                        <Button type="ghost" size="small" @click="onSelect(item)">插入</Button>
                    </div>
                </div>
            </MoftCard>
            <div style="clear: both"></div>
        </div>
        <!-- <div class="common-base-image-list-group">
            <MoftDivided title="从素材库"></MoftDivided>
            <div class="common-base-image-list-empty">没有可用底图</div>
            <MoftCard class="common-base-image-list-item">
                <div class="common-base-image-list-item-thumb"></div>
                <div class="common-base-image-list-item-body">
                    <h6 class="common-base-image-list-item-title">素材名称</h6>
                    <div class="common-base-image-list-item-toolbar">
                        <Button type="ghost" size="small" @click="onSelect">使用</Button>
                    </div>
                </div>
            </MoftCard>
        </div> -->
        <!-- <div class="common-base-image-list-group">
            <MoftDivided title="从这台电脑"></MoftDivided>
            <div class="common-base-image-list-group-body">
                <Button class="common-base-image-list-add-btn"
                    @click="openLocalImageInput"
                >选择图片</Button>
                <input ref="localImageInput" type="file" name="image" accept="image/*"
                    style="display:none"
                    @change="selectedLocalImage"
                />
            </div>
            
        </div> -->
    </div>
</template>

<script>
    import moftCard from '@/components/MoftCard'
    import moftDivided from '@/components/MoftDivided'
    export default {
        name: 'CommonBaseImageList',
        components: {
            'MoftCard': moftCard,
            'MoftDivided': moftDivided
        },
        props: {
            listData: {
                type: Array,
                default: function () {
                    return []
                }
            },
            fileDomain: {
                type: String,
                default: ''
            }
        },
        data () {
            return {}
        },
        mounted () {},
        methods: {
            openLocalImageInput () {
                const input = this.$refs.localImageInput
                input.click()
            },
            selectedLocalImage (e) {
                const file = e.target.files[0]

                if (!file.type.includes('image/')) {
                    alert('请选择图片文件！')
                    return
                }

                if (typeof FileReader === 'function') {
                    const reader = new FileReader()

                    reader.onload = (e) => {
                        this.$emit('evtSelected', e.target.result)
                    }

                    reader.readAsDataURL(file)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            onCancel () {
                this.$emit('evtCancel')
            },
            onSelect (image) {
                this.$emit('evtSelected', image)
            }
        }
    }
</script>
