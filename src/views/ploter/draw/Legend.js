import {
    isEmpty
} from '@/common/utils'
import {
    initShapeWrap,
    getDrawingGroup,
    exitPlotTool,
    switchInteractives,
    redrawAllLayer,
    hideAllInteractiveTools
} from './utils'

function init (toolCfg, stage) {
    exitPlotTool(stage)

    stage.on('evt-draw', function (e) {
        let point = stage.getPointerPosition()
        draw(stage, point, toolCfg)
        stage.on('mousemove', function (e) {
            var point = stage.getPointerPosition()
            draw(stage, point, toolCfg)
        })
        stage.on('mouseup', function (e) {
            stage.off('mousemove')
            var point = stage.getPointerPosition()
            draw(stage, point, toolCfg, true)
            stage.off('mouseup')
        })
        stage.on('evt_update_legend', function (e) {
            evtUpdateLegend(stage)
        })
    })
}

function evtUpdateLegend (stage) {
    setTimeout(() => {
        const targetLayer = stage.findOne('.legendLayer')
        const shapeWraps = targetLayer.find('.shapeWrap')
        shapeWraps.forEach(shapeWrap => {
            const shapeGroup = shapeWrap.findOne('.shapeGroup')
            let deleteShapes = []
            shapeGroup.children.forEach(shape => {
                if (shape.getAttr('name') !== 'mainShape') {
                    deleteShapes.push(shape)
                }
            })
            for (let i = 0; i < deleteShapes.length; i++) {
                deleteShapes[i].destroy()
            }
            drawLegend(stage, shapeWrap)
        })
        targetLayer.draw()
    }, 100)
}

function draw (stage, point, cfg, drawn) {
    let targetLayer = stage.findOne('.legendLayer')
    let shapeGroup = getDrawingGroup(stage)
    let shapeWrap = null
    if (isEmpty(shapeGroup)) {
        shapeWrap = initShapeWrap(cfg)
        shapeWrap.setAttr('activable', true)
        shapeGroup = shapeWrap.findOne('.shapeGroup')
        shapeGroup.setAttr('_isDrawn', false)
        targetLayer.add(shapeWrap)
    } else {
        shapeWrap = shapeGroup.findAncestor('.shapeWrap')
    }
    let rect = shapeGroup.findOne('.mainShape')
    if (!rect) {
        rect = new Konva.Rect({
            x: point.x,
            y: point.y,
            width: 0,
            height: 0,
            ...cfg.style.mainShape
        })
        rect.on('evt-active', initActive)
        shapeGroup.add(rect)
    } else {
        const rectSize = {
            width: Math.abs(point.x - rect.getX()),
            height: Math.abs(point.y - rect.getY())
        }
        rect.setAttrs(rectSize)

        if (drawn) {
            if (rect.getWidth() < 40 || rect.getHeight() < 40) {
                shapeWrap.destroy()
                console.log('图形尺寸过小，取消绘制')
            } else {
                drawLegend(stage, shapeWrap)
                shapeGroup.setAttr('_isDrawn', true)

                window.plotstack.execute(new window.InsertCommand(stage, '.legendLayer', shapeGroup))
            }
        }
    }
    targetLayer.draw()
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    let editCmd = new window.EditCommand(stage, '.legendLayer')
    editCmd.setOldValue(shapeGroup)

    if (mainShape.getPosition().x !== option.mainShape.x || mainShape.getPosition().y !== option.mainShape.y) {
        resizeLegend(stage, shape, option)
    }
    if (mainShape.getWidth() !== option.mainShape.width || mainShape.getHeight() !== option.mainShape.height) {
        relayoutLegend(stage, shape, option)
    }

    mainShape.setAttrs(option.mainShape)
    shapeGroup.opacity(option.opacity)

    let targetLayer = stage.findOne('.legendLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (rect) {
    const stage = rect.getStage()
    const shapeWrap = rect.findAncestor('.shapeWrap')
    const shapeGroup = rect.findAncestor('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    if (!shapeWrap.getAttr('activable') || shapeWrap.getAttr('actived')) {
        return
    }
    hideAllInteractiveTools(stage)
    let transformer = new Konva.Transformer({
        rotateHandlerOffset: 20,
        enabledHandlers: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
}

function reloadShape (shapeWrap) {
    const stage = shapeWrap.getStage()
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    mainShape.on('evt-active', initActive)
    const icons = shapeGroup.find('.fillicon')
    icons.forEach(icon => {
        let imageObj = new Image()
        imageObj.onload = function () {
            icon.image(imageObj)
            shapeGroup.draw()
        }
        imageObj.src = icon.getAttr('imagesrc')
    })
    stage.on('evt_update_legend', function (e) {
        evtUpdateLegend(stage)
    })
}

function drawLegend (stage, shapeWrap) {
    const shapeGroup = shapeWrap.findOne('.shapeGroup')

    const cfg = shapeWrap.getAttr('_shapeCfg')
    const rect = shapeGroup.findOne('.mainShape')

    const lineHeight = cfg.style.lineHeight
    const paddingLeftIcon = cfg.style.paddingLeftIcon
    const paddingLeftText = cfg.style.paddingLeftText
    const iconWidth = cfg.style.iconShape.width
    const iconHeight = cfg.style.iconShape.height
    const fontSize = cfg.style.textShape.fontSize
    const tuliX = rect.getPosition().x
    const tuliY = rect.getPosition().y

    let rowCount = 0
    let colCount = Math.floor(rect.getWidth() / cfg.style.lineMaxWidth)
    if (colCount === 0) {
        colCount = 1
    }

    let iconX = 0
    let iconY = 0
    let textX = 0
    let textY = 0
    let curLine = 0
    let curCol = 0

    let legends = new HashMap()
    let legendsMid = new HashMap()

    let shapesLayer = stage.findOne('.shapesLayer')
    const groups = shapesLayer.children
    groups.forEach(shapeW => {
        const shapeCfg = shapeW.getAttr('_shapeCfg')

        if (shapeCfg.id.indexOf('base_') === -1 && shapeCfg.name !== '图片') {
            let key = shapeCfg.src + '.png'

            if (legendsMid.containsKey(key)) {
                let legValue = legendsMid.get(key)
                legValue.count += 1
            } else {
                let level = 0
                if (shapeCfg.id.startsWith('disaster_')) {
                    level = 1
                } else if (shapeCfg.id.startsWith('hazards_')) {
                    level = 2
                } else if (shapeCfg.id.startsWith('facilities_')) {
                    level = 3
                } else if (shapeCfg.id.startsWith('equipments_')) {
                    level = 4
                } else if (shapeCfg.id.startsWith('vehicles_')) {
                    level = 5
                } else if (shapeCfg.id.startsWith('personnel_')) {
                    level = 6
                } else if (shapeCfg.id.startsWith('battle_')) {
                    level = 7
                }

                let legValue = {
                    'imageSrc': key,
                    'count': 1,
                    'level': level,
                    'name': shapeCfg.name
                }
                legendsMid.put(key, legValue)
            }
        }
    })
    if (!legendsMid.isEmpty()) {
        let legendsSort = legendsMid.values().slice()
        legendsSort.sort(by('level'))

        rowCount = Math.ceil(legendsSort.length / colCount)

        let curTuliX = 0
        legendsSort.forEach(legend => {
            let firstLineMargin = 10

            curTuliX = tuliX + curCol * cfg.style.lineMaxWidth
            iconX = curTuliX + paddingLeftIcon
            iconY = tuliY + curLine * lineHeight + firstLineMargin

            textX = curTuliX + paddingLeftIcon + iconWidth + paddingLeftText
            textY = tuliY + curLine * lineHeight + (iconHeight - fontSize) / 2 + firstLineMargin

            let legValue = {
                'iconX': iconX,
                'iconY': iconY,
                'textX': textX,
                'textY': textY,
                'imageSrc': legend.imageSrc,
                'count': legend.count,
                'name': legend.name
            }
            legends.put(legend.imageSrc, legValue)

            curLine++
            if (curLine >= rowCount) {
                curLine = 0
                curCol++
            }
        })
    }

    if (!legends.isEmpty()) {
        legends.values().forEach(legend => {
            var imageObj = new Image()
            imageObj.onload = function () {
                var icon = new Konva.Image({
                    x: legend.iconX,
                    y: legend.iconY,
                    image: imageObj,
                    imagesrc: legend.imageSrc,
                    ...cfg.style.iconShape
                })
                shapeGroup.add(icon)
                icon.draw()
            }
            imageObj.src = legend.imageSrc

            var tuti1Text = new Konva.Text({
                x: legend.textX,
                y: legend.textY,
                text: legend.name + '【' + legend.count + '】',
                ...cfg.style.textShape
            })
            shapeGroup.add(tuti1Text)
        })
    }
}

function by (name) {
    return function (o, p) {
        var a, b
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
            a = o[name]
            b = p[name]
            if (a === b) {
                return 0
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1
            }
            return typeof a < typeof b ? -1 : 1
        } else {
        }
    }
}

function resizeLegend (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    let xx = mainShape.getPosition().x - option.mainShape.x
    let yy = mainShape.getPosition().y - option.mainShape.y
    let iconShapes = shapeGroup.find('.fillicon')
    iconShapes.forEach(shape => {
        let xN = shape.getPosition().x - xx
        let yN = shape.getPosition().y - yy
        shape.setAttrs({
            'x': xN,
            'y': yN
        })
    })
    let textShapes = shapeGroup.find('.textShape')
    textShapes.forEach(shape => {
        let xN = shape.getPosition().x - xx
        let yN = shape.getPosition().y - yy
        shape.setAttrs({
            'x': xN,
            'y': yN
        })
    })
}

function relayoutLegend (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')

    const lineHeight = shapeCfg.style.lineHeight
    const paddingLeftIcon = shapeCfg.style.paddingLeftIcon
    const paddingLeftText = shapeCfg.style.paddingLeftText
    const iconWidth = shapeCfg.style.iconShape.width
    const iconHeight = shapeCfg.style.iconShape.height
    const fontSize = shapeCfg.style.textShape.fontSize
    const tuliX = mainShape.getPosition().x
    const tuliY = mainShape.getPosition().y

    let rowCount = 0
    let colCount = Math.floor(option.mainShape.width / shapeCfg.style.lineMaxWidth)
    if (colCount === 0) {
        colCount = 1
    }
    let iconX = 0
    let iconY = 0
    let textX = 0
    let textY = 0
    let curLine = 0
    let curCol = 0

    let curTuliX = 0

    let iconShapes = shapeGroup.find('.fillicon')
    rowCount = Math.ceil(iconShapes.length / colCount)
    iconShapes.forEach(shape => {
        let firstLineMargin = 10

        curTuliX = tuliX + curCol * shapeCfg.style.lineMaxWidth
        iconX = curTuliX + paddingLeftIcon
        iconY = tuliY + curLine * lineHeight + firstLineMargin

        shape.setAttrs({
            'x': iconX,
            'y': iconY
        })

        curLine++
        if (curLine >= rowCount) {
            curLine = 0
            curCol++
        }
    })

    curLine = 0
    curCol = 0
    let textShapes = shapeGroup.find('.textShape')
    rowCount = Math.ceil(textShapes.length / colCount)
    textShapes.forEach(shape => {
        let firstLineMargin = 10

        curTuliX = tuliX + curCol * shapeCfg.style.lineMaxWidth

        textX = curTuliX + paddingLeftIcon + iconWidth + paddingLeftText
        textY = tuliY + curLine * lineHeight + (iconHeight - fontSize) / 2 + firstLineMargin
        shape.setAttrs({
            'x': textX,
            'y': textY
        })

        curLine++
        if (curLine >= rowCount) {
            curLine = 0
            curCol++
        }
    })
}

function HashMap () {
    // 定义长度
    var length = 0
    // 创建一个对象
    var obj = {}

    /**
     * 判断Map是否为空
     */
    this.isEmpty = function () {
        return length === 0
    }

    /**
     * 判断对象中是否包含给定Key
     */
    this.containsKey = function (key) {
        return (key in obj)
    }

    /**
     * 判断对象中是否包含给定的Value
     */
    this.containsValue = function (value) {
        for (var key in obj) {
            if (obj[key] === value) {
                return true
            }
        }
        return false
    }

    /**
     *向map中添加数据
     */
    this.put = function (key, value) {
        if (!this.containsKey(key)) {
            length++
        }
        obj[key] = value
    }

    /**
     * 根据给定的Key获得Value
     */
    this.get = function (key) {
        return this.containsKey(key) ? obj[key] : null
    }

    /**
     * 根据给定的Key删除一个值
     */
    this.remove = function (key) {
        if (this.containsKey(key) && (delete obj[key])) {
            length--
        }
    }

    /**
     * 获得Map中的所有Value
     */
    this.values = function () {
        var _values = []
        for (var key in obj) {
            _values.push(obj[key])
        }
        return _values
    }

    /**
     * 获得Map中的所有Key
     */
    this.keySet = function () {
        var _keys = []
        for (var key in obj) {
            _keys.push(key)
        }
        return _keys
    }

    /**
     * 获得Map的长度
     */
    this.size = function () {
        return length
    }

    /**
     * 清空Map
     */
    this.clear = function () {
        length = 0
        obj = {}
    }
}

export default {
    init,
    applyFeature,
    reloadShape
}

