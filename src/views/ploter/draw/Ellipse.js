import {
    isEmpty
} from '@/common/utils'
import {
    initShapeWrap,
    getDrawingGroup,
    exitPlotTool,
    switchInteractives,
    redrawAllLayer,
    hideAllInteractiveTools,
    getRotation360
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
            stage.fire('evt_update_legend')
        })
    })
}

function draw (stage, point, cfg, drawn) {
    let targetLayer = stage.findOne('.shapesLayer')

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
    let ellipse = shapeGroup.findOne('.mainShape')
    if (!ellipse) {
        ellipse = new Konva.Ellipse({
            name: 'mainShape',
            x: point.x,
            y: point.y,
            radius: {
                x: 0,
                y: 0
            },
            opacity: 0.3,
            dashEnabled: false,
            draggable: false,
            ...cfg.style.mainShape
        })
        ellipse.on('evt-active', initActive)
        shapeGroup.add(ellipse)
    } else {
        const radius = {
            x: Math.abs(point.x - ellipse.getX()),
            y: Math.abs(point.y - ellipse.getY())
        }
        ellipse.setRadius(radius)

        if (drawn) {
            if (cfg.style.mainShape.backgroundImage) {
                let imageObj = new Image()
                imageObj.onload = function () {
                    ellipse.setAttr('fillPatternImage', imageObj)
                    if (cfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
                        setFillImageOffset(shapeGroup)
                    }
                    shapeGroup.draw()
                }
                imageObj.src = cfg.style.mainShape.backgroundImage.src
            }
            if (cfg.style.textShape) {
                initTextShape(shapeWrap, cfg)
            }

            const ellipseSize = ellipse.getRadius()
            if (ellipseSize.x < 8 || ellipseSize.y < 8) {
                shapeWrap.destroy()
                console.log('图形尺寸过小，取消绘制')
            } else {
                ellipse.setOpacity(1)
                ellipse.setFillPriority('pattern')
                shapeGroup.setAttr('_isDrawn', true)

                window.plotstack.execute(new window.InsertCommand(stage, '.shapesLayer', shapeGroup))
            }
        }
    }
    targetLayer.draw()
}

function initTextShape (shapeWrap, cfg) {
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    var text = new Konva.Text({
        name: 'textShape',
        align: 'center',
        draggable: false,
        ...cfg.style.textShape
    })
    text.on('evt-active', initActive)
    text.on('dblclick', activeTextEditor)
    shapeGroup.add(text)
    setTextOffset(shapeGroup)
}

function activeTextEditor (e) {
    const textShape = e.target
    const shapeGroup = textShape.findAncestor('.shapeGroup')
    const shapeWrap = shapeGroup.findAncestor('.shapeWrap')
    const mainShape = shapeGroup.findOne('.mainShape')
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    textShape.hide()
    shapeWrap.draw()
    shapeWrap.setAttr('activable', false)
    shapeGroup.setDraggable(false)

    var konvajsContent = document.querySelector('.konvajs-content')
    var textareaMask = document.createElement('div')
    var textareaInput = document.createElement('textarea')

    konvajsContent.style.pointerEvents = 'none'

    textareaMask.appendChild(textareaInput)
    konvajsContent.appendChild(textareaMask)

    textareaMask.style.position = 'absolute'
    textareaMask.style.top = '0px'
    textareaMask.style.right = '0px'
    textareaMask.style.bottom = '0px'
    textareaMask.style.left = '0px'
    textareaMask.style.backgroundColor = 'rgba(255,255,255,0.6)'

    textareaInput.value = textShape.text()
    textareaInput.style.position = 'absolute'
    // debugger
    textareaInput.style.top = textShape.getAbsolutePosition().y + 'px'
    textareaInput.style.left = textShape.getAbsolutePosition().x + 'px'
    textareaInput.style.width = textShape.getWidth() + 'px'
    textareaInput.style.height = textShape.getHeight() + 'px'
    textareaInput.style.border = 'none'
    textareaInput.style.backgroundColor = 'rgba(0,0,0,0)'
    textareaInput.style.padding = shapeCfg.style.textShape.padding + 'px'
    textareaInput.style.fontSize = shapeCfg.style.textShape.fontSize + 'px'
    textareaInput.style.lineHeight = shapeCfg.style.textShape.fontSize + 'px'
    textareaInput.style.color = shapeCfg.style.textShape.fill
    textareaInput.style.overflow = 'hidden'
    textareaInput.style.transform = 'rotate(' + getRotation360(shapeGroup.getRotation()) + 'deg)'
    textareaInput.style.transformOrigin = '0 0'
    textareaInput.style.pointerEvents = 'all'

    textareaInput.addEventListener('click', () => {
        textareaInput.focus()
    })
    textareaInput.focus()

    textareaInput.addEventListener('blur', () => {
        shapeGroup.setDraggable(false)
        textShape.text(textareaInput.value)
        if ((textShape.getHeight()) > (mainShape.getHeight() * Math.sqrt(2))) {
            mainShape.setAttrs({
                width: mainShape.getWidth(),
                height: textShape.getHeight() / Math.sqrt(2)
            })
            setTextOffset(shapeGroup)
        }

        textareaMask.remove()
        textShape.show()
        konvajsContent.style.pointerEvents = 'all'
        shapeWrap.setAttr('activable', true)
        shapeWrap.draw()
    })
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

function initActive (ellipse) {
    // const shapeCfg = ellipse.getAttr('_shapeCfg')
    const layer = ellipse.getLayer()
    const stage = ellipse.getStage()
    const shapeWrap = ellipse.findAncestor('.shapeWrap')
    const shapeGroup = ellipse.findAncestor('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    if (!shapeWrap.getAttr('activable') || shapeWrap.getAttr('actived')) {
        return
    }

    hideAllInteractiveTools(stage)
    const mainShape = shapeGroup.findOne('.mainShape')
    // debugger
    let transformer = new Konva.Transformer({
        rotateHandlerOffset: 20,
        enabledHandlers: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
    })
    transformer.on('dragend', function (e) {
        shapetransform(transformer, shapeGroup)
        mainShape.setFillPriority('pattern')
        mainShape.setOpacity(1)
        layer.draw()
    })
    transformer.on('dragmove', function (e) {
        shapetransform(transformer, shapeGroup)
        mainShape.setFillPriority('color')
        mainShape.setOpacity(0.3)
        layer.draw()
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
    // e.cancelBubble = true
}

function reloadShape (shapeWrap) {
    // debugger
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    // const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')

    mainShape.on('evt-active', initActive)
    if (textShape) {
        textShape.on('evt-active', initActive)
        textShape.on('dblclick', activeTextEditor)
    }
    if (shapeCfg.style.mainShape.backgroundImage) {
        let imageObj = new Image()
        imageObj.onload = function () {
            mainShape.setAttr('fillPatternImage', imageObj)
            if (shapeCfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
                setFillImageOffset(shapeGroup)
            }
            shapeGroup.draw()
        }
        imageObj.src = shapeCfg.style.mainShape.backgroundImage.src
    }
}

function shapetransform (transformer, shapeGroup) {
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')
    const back = transformer.find('.back')[0]
    const radius = {
        x: Math.abs(back.getWidth() - (mainShape.getStrokeWidth() * 2)) / 2,
        y: Math.abs(back.getHeight() - (mainShape.getStrokeWidth() * 2)) / 2
    }

    mainShape.setRadius(radius)

    if (mainShape.getFillPatternRepeat() === 'no-repeat') {
        setFillImageOffset(shapeGroup)
    }

    if (textShape) {
        setTextOffset(shapeGroup)
    }
}

function setFillImageOffset (shapeGroup) {
    const mainShape = shapeGroup.findOne('.mainShape')
    // debugger
    const image = mainShape.getFillPatternImage()
    // debugger
    mainShape.setFillPatternX((mainShape.getWidth() / 2) - (image.width / 2))
    mainShape.setFillPatternY((mainShape.getHeight() / 2) - (image.height / 2))
}

function setTextOffset (shapeGroup) {
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')
    const textWidth = mainShape.getRadius().x * Math.sqrt(2)

    textShape.setWidth(textWidth)

    const mainShapeTopLeft = {
        x: mainShape.getX() - mainShape.getRadius().x,
        y: mainShape.getY() - mainShape.getRadius().y
    }

    textShape.setAttrs({
        x: mainShapeTopLeft.x + mainShape.getRadius().x - (textWidth / 2),
        y: mainShapeTopLeft.y + mainShape.getRadius().y - (textShape.getHeight() / 2)
    })
}

export default {
    init,
    applyFeature,
    reloadShape
}
