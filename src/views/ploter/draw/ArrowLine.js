import '@/plugins/konva/MoftArrowLine.js'
import {isEmpty, deepClone} from '@/common/utils'
import {
    initShapeWrap,
    getDrawingGroup,
    exitPlotTool,
    stopDraw,
    hideAllInteractiveTools,
    switchInteractives,
    redrawAllLayer
} from './utils'

function init (toolCfg, stage) {
    let shapeGroup = null
    exitPlotTool(stage)
    stage.on('evt-draw', function (e) {
        const point = stage.getPointerPosition()
        shapeGroup = draw(toolCfg, point, stage)
        stage.fire('evt_update_legend')
    })
    stage.on('evt-stop', (e) => {
        stopDraw(stage)

        window.plotstack.execute(new window.InsertCommand(stage, '.shapesLayer', shapeGroup))
    })
}

function draw (cfg, point, stage) {
    // let targetLayer = getTargetLayer(cfg, stage)
    let targetLayer = stage.findOne('.shapesLayer')
    // 创建组
    let shapeGroup = getDrawingGroup(stage)
    let shapeWrap = null
    let interactiveGroup = null
    if (isEmpty(shapeGroup)) {
        shapeWrap = initShapeWrap(cfg)
        shapeGroup = shapeWrap.findOne('.shapeGroup')
        interactiveGroup = shapeWrap.findOne('.interactiveGroup')
        shapeGroup.setAttr('_isDrawn', false)
        targetLayer.add(shapeWrap)
    } else {
        shapeWrap = shapeGroup.findAncestor('.shapeWrap')
        interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    }

    // 准备好一条线
    initArrowLine(cfg, shapeGroup)
    // 建立锚点
    let anchor = new Konva.Circle({
        name: 'shapeAnchor',
        x: point.x,
        y: point.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true
    })
    anchor.on('dragend', function (evt) {
        update(shapeWrap)
    })
    anchor.on('dragmove', function (evt) {
        update(shapeWrap)
    })
    interactiveGroup.add(anchor)

    const maxPointCount = cfg.style.mainShape.maxPointCount
    if (maxPointCount) {
        if (interactiveGroup.children.length === maxPointCount) {
            shapeGroup.setAttr('_isDrawn', true)
        }
    }

    targetLayer.draw()
    update(shapeWrap)

    return shapeGroup
}

function update (wrap) {
    const shapeGroup = wrap.findOne('.shapeGroup')
    const interactiveGroup = wrap.findOne('.interactiveGroup')
    let arrowLine = shapeGroup.findOne('MoftArrowLine')
    if (!arrowLine) return
    // debugger
    let anchors = interactiveGroup.find('Circle')
    let layer = wrap.findAncestor('Layer')
    let points = []
    if (anchors.length > 1) {
        for (let i = 0; i < anchors.length; i++) {
            const x = anchors[i].getX()
            const y = anchors[i].getY()
            points.push(x)
            points.push(y)
        }
        arrowLine.setPoints(points)
        layer.draw()
    }
}

function initArrowLine (cfg, shapeGroup) {
    let arrowLine = shapeGroup.findOne('MoftArrowLine')
    if (!arrowLine) {
        arrowLine = new Konva.MoftArrowLine({
            name: 'mainShape',
            moftArrowStyle: {...deepClone(cfg.style.mainShape)},
            dashEnabled: false,
            draggable: false
        })
        arrowLine.on('evt-active', initActive)
        shapeGroup.add(arrowLine)
    }
}

function reloadShape (shapeWrap) {
    // debugger
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const shapeAnchor = interactiveGroup.find('.shapeAnchor')
    mainShape.on('evt-active', initActive)
    shapeAnchor.on('dragend', function (evt) {
        update(shapeWrap)
    })
    shapeAnchor.on('dragmove', function (evt) {
        update(shapeWrap)
    })
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    if (mainShape && mainShape.getAttr('moftArrowStyle')) {
        let attr = mainShape.getAttr('moftArrowStyle')
        attr.width = option.mainShape.width
        attr.space = option.mainShape.space
    }
    let targetLayer = stage.findOne('.shapesLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (line) {
    // debugger
    const stage = line.getStage()
    const layer = line.getLayer()
    const wrap = line.findAncestor('.shapeWrap')
    const shapeCfg = wrap.getAttr('_shapeCfg')
    // debugger
    hideAllInteractiveTools(stage)
    redrawAllLayer(stage)
    if (shapeCfg.type === 'arrowLine') {
        switchInteractives(wrap, 'show')
        layer.draw()
        // e.cancelBubble = true
    }
}

export default {
    init,
    applyFeature,
    reloadShape
}
