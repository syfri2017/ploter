import icon from './Icon'
import arrowLine from './ArrowLine'
import line from './Polyline'
import rectangle from './Rectangle'
import ellipse from './Ellipse'
import polygon from './Polygon'
import image from './Image'
import legend from './Legend'
import map from './Map'
import appPlotBaseStage from '@/store/static/plot/AppPlotBaseStage'
import { isEmpty } from '@/common/utils'

function createEmptyStageData (data) {
    let stageData = {
        ...appPlotBaseStage
    }

    let stageCfg = getLocalSetting('stage')
    const backgroundLayer = stageData.children[0]
    let backgroundShape = {
        attrs: {
            name: 'shapeWrap',
            _shapeCfg: {
                name: '底图',
                id: 'background',
                type: 'image',
                style: {}
            },
            activable: true
        },
        className: 'Group',
        children: [{
            attrs: {
                name: 'shapeGroup',
                draggable: false,
                _isDrawn: true,
                x: 0,
                y: 0
            },
            className: 'Group',
            children: [{
                attrs: {
                    id: 'stageBackground',
                    name: 'backgroundShape',
                    x: 0,
                    y: 0,
                    width: stageCfg.width,
                    height: stageCfg.height,
                    fill: stageCfg.fill
                },
                className: 'Rect'
            }]
        }, {
            attrs: {
                name: 'interactiveGroup'
            },
            className: 'Group',
            children: []
        }]
    }

    stageData.attrs.width = stageCfg.width
    stageData.attrs.height = stageCfg.height
    backgroundLayer.children.push(backgroundShape)

    // this.$emit('evtInitPlot', stageData, 'create')
    return stageData
}

function initPlotTool (tool, stage) {
    switch (tool.type) {
    case 'icon':
        icon.init(tool, stage)
        break
    case 'line':
        line.init(tool, stage)
        break
    case 'arrowLine':
        arrowLine.init(tool, stage)
        break
    case 'area':
        const shapeType = tool.style.shapeType
        if (shapeType === 'rectangle') {
            rectangle.init(tool, stage)
        } else if (shapeType === 'ellipse') {
            ellipse.init(tool, stage)
        } else if (shapeType === 'polygon') {
            polygon.init(tool, stage)
        }
        break
    case 'image':
        image.init(tool, stage)
        break
    case 'legend':
        legend.init(tool, stage)
        break
    case 'map':
        map.init(tool, stage)
        break
    }
}

function reloadShapes (stage) {
    const shapesLayer = stage.findOne('.shapesLayer')
    const groups = shapesLayer.children
    // redraw image
    groups.forEach(shapeWrap => {
        const shapeCfg = shapeWrap.getAttr('_shapeCfg')
        if (shapeCfg.type === 'image') {
            image.reloadShape(shapeWrap)
        }
    })
    // redraw other
    setTimeout(() => {
        groups.forEach(shapeWrap => {
            const shapeCfg = shapeWrap.getAttr('_shapeCfg')
            switch (shapeCfg.type) {
            case 'icon':
                icon.reloadShape(shapeWrap)
                break
            case 'line':
                line.reloadShape(shapeWrap)
                break
            case 'arrowLine':
                arrowLine.reloadShape(shapeWrap)
                break
            case 'area':
                const shapeType = shapeCfg.style.shapeType
                if (shapeType === 'rectangle') {
                    rectangle.reloadShape(shapeWrap)
                } else if (shapeType === 'ellipse') {
                    ellipse.reloadShape(shapeWrap)
                } else if (shapeType === 'polygon') {
                    polygon.reloadShape(shapeWrap)
                }
                break
            }
        })
    }, 0)
    // debugger
    const targetLayer = stage.findOne('.legendLayer')
    const shapeWraps = targetLayer.find('.shapeWrap')
    shapeWraps.forEach(shapeWrap => {
        legend.reloadShape(shapeWrap)
    })
}

function resizeCanvas (stage, width, height) {
    stage.setAttrs({
        width: width,
        height: height
    })
}

function applyFeature (stage, shape, option) {
    if (isEmpty(stage)) return
    if (isEmpty(shape)) return
    if (isEmpty(option)) return

    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')

    switch (shapeCfg.type) {
    case 'icon':
        icon.applyFeature(stage, shape, option)
        break
    case 'line':
        line.applyFeature(stage, shape, option)
        break
    case 'arrowLine':
        arrowLine.applyFeature(stage, shape, option)
        break
    case 'area':
        const shapeType = shapeCfg.style.shapeType
        if (shapeType === 'rectangle') {
            rectangle.applyFeature(stage, shape, option)
        } else if (shapeType === 'ellipse') {
            ellipse.applyFeature(stage, shape, option)
        } else if (shapeType === 'polygon') {
            polygon.applyFeature(stage, shape, option)
        }
        break
    case 'image':
        image.applyFeature(stage, shape, option)
        break
    case 'legend':
        legend.applyFeature(stage, shape, option)
        break
    }
}

function applyStageCfg (stage, cfg) {
    const background = stage.findOne('#stageBackground')
    stage.setAttrs({
        width: cfg.width,
        height: cfg.height
    })
    background.setAttrs({
        width: cfg.width,
        height: cfg.height,
        fill: cfg.fill
    })
    stage.draw()
}

function initLocalSetting () {
    const localSettingStr = localStorage.getItem('plotSetting')
    let localSetting = JSON.parse(localSettingStr)
    if (!localSetting) {
        localStorage.setItem('plotSetting', JSON.stringify({
            stage: {
                width: 1200,
                height: 800,
                fill: '#fff'
            },
            icon: {
                width: 48,
                height: 48
            }
        }))
    }
}

function getLocalSetting (key) {
    const localSettingStr = localStorage.getItem('plotSetting')
    let localSetting = JSON.parse(localSettingStr)
    if (key) {
        return localSetting[key]
    } else {
        return localSetting
    }
}

export default {
    initLocalSetting,
    reloadShapes,
    getLocalSetting,
    createEmptyStageData,
    // initBaseImage,
    initPlotTool,
    applyFeature,
    resizeCanvas,
    applyStageCfg
}
