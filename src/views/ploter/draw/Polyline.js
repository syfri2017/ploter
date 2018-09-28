import {isEmpty} from '@/common/utils'
import {
    initShapeWrap,
    // getTargetLayer,
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
    // debugger
    // 准备好一条线
    initLine(cfg, shapeGroup)

    // 建立辅助线(如果是曲线)
    if (cfg.style.shapeType === 'curve') {
        initSubLine(interactiveGroup)
    }

    // 建立锚点
    createAnchor(point, shapeWrap)

    targetLayer.draw()
    update(shapeWrap)

    return shapeGroup
}

function update (wrap) {
    // debugger
    const shapeCfg = wrap.getAttr('_shapeCfg')
    const shapeGroup = wrap.findOne('.shapeGroup')
    const interactiveGroup = wrap.findOne('.interactiveGroup')
    let polyline = shapeGroup.findOne('.mainShape')
    if (!polyline) return
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
        polyline.setPoints(points)
        if (shapeCfg.style.shapeType === 'curve') {
            let subline = interactiveGroup.findOne('.shapeSubline')
            subline.setPoints(points)
        }
        layer.draw()
    }
}

function initLine (cfg, shapeGroup) {
    let polyline = shapeGroup.findOne('.mainShape')
    if (!polyline) {
        polyline = new Konva.Line({
            name: 'mainShape',
            ...cfg.style.mainShape,
            dashEnabled: false,
            draggable: false
        })
        if (cfg.style.shapeType === 'curve') {
            polyline.setAttr('tension', 0.5)
        }
        polyline.on('evt-active', initActive)
        shapeGroup.add(polyline)
    }
}

function initSubLine (interactiveGroup) {
    let subline = interactiveGroup.findOne('.shapeSubline')
    if (!subline) {
        subline = new Konva.Line({
            name: 'shapeSubline',
            dash: [4, 8],
            strokeWidth: 2,
            stroke: '#666',
            lineCap: 'round',
            draggable: false
        })
        interactiveGroup.add(subline)
    }
}

function createAnchor (point, shapeWrap) {
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
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
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    shapeGroup.opacity(option.opacity)

    if (mainShape) {
        mainShape.setAttrs(option.mainShape)
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
    // const shapeCfg = wrap.getAttr('_shapeCfg')
    // debugger
    hideAllInteractiveTools(stage)
    redrawAllLayer(stage)
    switchInteractives(wrap, 'show')
    layer.draw()
    // e.cancelBubble = true
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

export default {
    init,
    applyFeature,
    reloadShape
}
