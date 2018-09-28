<template>
    <div class="app-ploter-tools">
        <div class="app-ploter-tools-graphs-wrap" slot="content">
            <div
            v-for="group in tools"
            :key="group.type"
            class="app-ploter-tools-graphs"
            >
            <Poptip
                v-if="group.category && group.category.length > 0"
                placement="bottom-start"
                trigger="hover"
            >
                <Button
                    class="app-ploter-tools-graphs-btn"
                    type="text"
                    size="small"
                >
                    {{group.typeName}}
                </Button>
                <div class="app-ploter-tools-graphs-menu" slot="content">
                    <Tabs size="small" :animated="false">
                        <TabPane
                            v-for="category in group.category"
                            :key="category.name"
                            :label="category.title"
                            :name="category.name"
                        >
                                <Button
                                    v-for="item in category.children"
                                    :key="item.id"
                                    @click="onToolsItemClick(item)"
                                    class="app-ploter-tools-graphs-menu-item"
                                >
                                    <img
                                        class="app-ploter-tools-graphs-menu-item-icon"
                                        :src="item.src + '.png'"
                                        />
                                    <h6>{{item.name}}</h6>
                                </Button>
                        </TabPane>
                    </Tabs>
                </div>
            </Poptip>
            </div>
            <slot name="bodyEnd"></slot>
        </div>
        <slot name="panelAfter"></slot>
    </div>
</template>

<script>
    import moftPanel from '@/components/panel/MoftPanel'
    import moftPanelWrap from '@/components/panel/MoftPanelWrap'
    import moftDivided from '@/components/MoftDivided'
    import {
        appPlotToolsBase,
        appPlotToolsBattle,
        appPlotToolsDisaster,
        appPlotToolsEquipments,
        appPlotToolsFacilities,
        appPlotToolsHazards,
        appPlotToolsPersonnel,
        appPlotToolsVehicles,
        appPlotToolsLegend
    } from '@/store/static/plot/Index'

    export default {
        name: 'AppPloterTools',
        components: {
            'MoftPanel': moftPanel,
            'MoftPanelWrap': moftPanelWrap,
            'MoftDivided': moftDivided
        },
        data () {
            return {
                tools: [
                    ...appPlotToolsBase,
                    ...appPlotToolsBattle,
                    ...appPlotToolsDisaster,
                    ...appPlotToolsEquipments,
                    ...appPlotToolsFacilities,
                    ...appPlotToolsHazards,
                    ...appPlotToolsPersonnel,
                    ...appPlotToolsVehicles,
                    ...appPlotToolsLegend
                ]
            }
        },
        methods: {
            onToolsItemClick (tool) {
                const me = this
                me.$emit('evtToolSelected', tool)
            }
        }
    }
</script>
