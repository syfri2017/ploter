import {
    isEmpty
} from '@/common/utils'
import {
    initShapeWrap,
    // getTargetLayer,
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
        // debugger
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
    let rect = shapeGroup.findOne('.mainShape')
    if (!rect) {
        rect = new Konva.Rect({
            name: 'mainShape',
            x: point.x,
            y: point.y,
            width: 0,
            height: 0,
            opacity: 0.3,
            dashEnabled: false,
            draggable: false,
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
            if (rect.getWidth() < 8 || rect.getHeight() < 8) {
                shapeWrap.destroy()
                console.log('图形尺寸过小，取消绘制')
            } else {
                if (cfg.style.mainShape.backgroundImage) {
                    if (cfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
                        const xz = rect.x() + (rect.getWidth() - cfg.style.mainShape.backgroundImage.width) / 2
                        const yz = rect.y() + (rect.getHeight() - cfg.style.mainShape.backgroundImage.height) / 2
                        let imageObj = new Image()
                        imageObj.onload = function () {
                            let icon = new Konva.Image({
                                name: 'fillicon',
                                x: xz,
                                y: yz,
                                width: cfg.style.mainShape.backgroundImage.width,
                                height: cfg.style.mainShape.backgroundImage.height,
                                image: imageObj,
                                draggable: false
                            })
                            shapeGroup.add(icon)
                            shapeGroup.draw()
                        }
                        let svgSrc = cfg.style.mainShape.backgroundImage.src
                        // svgSrc = svgSrc.replace(/fill:.*?;/g,
                        //     'fill:' + cfg.style.mainShape.backgroundImage.fill + ';')
                        // svgSrc = svgSrc.replace(/stroke:.*?;/g,
                        //     'stroke:' + cfg.style.mainShape.backgroundImage.stroke + ';')
                        imageObj.src = svgSrc
                    } else {
                        let imageObj = new Image(cfg.style.mainShape.backgroundImage.width,
                            cfg.style.mainShape.backgroundImage.height)
                        imageObj.onload = function () {
                            rect.setAttr('fillPatternImage', imageObj)
                            shapeGroup.draw()
                        }
                        imageObj.src = cfg.style.mainShape.backgroundImage.src
                    }
                }
                if (cfg.style.textShape) {
                    initTextShape(shapeWrap, cfg)
                }
                rect.setOpacity(1)
                rect.setFillPriority('pattern')
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
    const textShape = shapeGroup.findOne('.textShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    shapeGroup.opacity(option.opacity)

    if (mainShape) {
        if (mainShape.getWidth() !== option.mainShape.width) {
            const xtn = mainShape.getPosition().x - (option.mainShape.width - mainShape.getWidth()) / 2
            option.mainShape.x = Math.round(xtn)
        }

        if (mainShape.getHeight() !== option.mainShape.height) {
            const ytn = mainShape.getPosition().y - (option.mainShape.height - mainShape.getHeight()) / 2
            option.mainShape.y = Math.round(ytn)
        }
        mainShape.setAttrs(option.mainShape)

        const fillicon = shapeGroup.findOne('.fillicon')
        if (fillicon) {
            if (fillicon.getWidth() !== option.mainShape.backgroundImage.width ||
                fillicon.getHeight() !== option.mainShape.backgroundImage.height) {
                option.mainShape.backgroundImage.x =
                    Math.round(mainShape.x() + (mainShape.getWidth() - option.mainShape.backgroundImage.width) / 2)
                option.mainShape.backgroundImage.y =
                    Math.round(mainShape.y() + (mainShape.getHeight() - option.mainShape.backgroundImage.height) / 2)
            }
            fillicon.setAttrs({
                x: option.mainShape.backgroundImage.x,
                y: option.mainShape.backgroundImage.y,
                width: option.mainShape.backgroundImage.width,
                height: option.mainShape.backgroundImage.height
            })
        }
    }
    if (textShape) {
        if (textShape.getWidth() !== option.textShape.width) {
            const xtn = textShape.getPosition().x - (option.textShape.width - textShape.getWidth()) / 2
            option.textShape.x = Math.round(xtn)
        }

        if (textShape.getHeight() !== option.textShape.height) {
            const ytn = textShape.getPosition().y - (option.textShape.height - textShape.getHeight()) / 2
            option.textShape.y = Math.round(ytn)
        }

        textShape.setAttrs(option.textShape)
    }
    let targetLayer = stage.findOne('.shapesLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (rect) {
    // const shapeCfg = rect.getAttr('_shapeCfg')
    const layer = rect.getLayer()
    const stage = rect.getStage()
    const shapeWrap = rect.findAncestor('.shapeWrap')
    const shapeGroup = rect.findAncestor('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    if (!shapeWrap.getAttr('activable') || shapeWrap.getAttr('actived')) {
        return
    }
    hideAllInteractiveTools(stage)
    const mainShape = shapeGroup.findOne('.mainShape')
    let transformer = new Konva.Transformer({
        rotateHandlerOffset: 20,
        enabledHandlers: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
    })
    transformer.on('dragmove', function (e) {
        shapetransform(transformer, shapeGroup)
        mainShape.setFillPriority('color')
        mainShape.setOpacity(0.3)
        layer.draw()
    })
    transformer.on('dragend', function (e) {
        shapetransform(transformer, shapeGroup)
        mainShape.setFillPriority('pattern')
        mainShape.setOpacity(1)
        layer.draw()
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
}

function reloadShape (shapeWrap) {
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')

    mainShape.on('evt-active', initActive)
    if (textShape) {
        textShape.on('evt-active', initActive)
        textShape.on('dblclick', activeTextEditor)
    }
    if (shapeCfg.style.mainShape.backgroundImage) {
        if (shapeCfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
            const fillicon = shapeGroup.findOne('.fillicon')
            if (fillicon) {
                let imageObj = new Image()
                imageObj.onload = function () {
                    fillicon.image(imageObj)
                    shapeGroup.draw()
                }
                let svgSrc = shapeCfg.style.mainShape.backgroundImage.src
                // svgSrc = svgSrc.replace(/fill:.*?;/g,
                //     'fill:' + shapeCfg.style.mainShape.backgroundImage.fill + ';')
                // svgSrc = svgSrc.replace(/stroke:.*?;/g,
                //     'stroke:' + shapeCfg.style.mainShape.backgroundImage.stroke + ';')
                imageObj.src = svgSrc
            }
        } else {
            let imageObj = new Image()
            imageObj.onload = function () {
                mainShape.setAttr('fillPatternImage', imageObj)
                shapeGroup.draw()
            }
            imageObj.src = shapeCfg.style.mainShape.backgroundImage.src
        }
    }
}

function shapetransform (transformer, shapeGroup) {
}

function setTextOffset (shapeGroup) {
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')
    const textWidth = mainShape.getWidth() * 0.8

    textShape.setWidth(textWidth)
    // debugger

    const mainShapeTopLeft = {
        x: mainShape.getX(),
        y: mainShape.getY()
    }

    textShape.setAttrs({
        x: mainShapeTopLeft.x + (mainShape.getWidth() / 2) - (textWidth / 2),
        y: mainShapeTopLeft.y + (mainShape.getHeight() / 2) - (textShape.getHeight() / 2)
    })
}

export default {
    init,
    applyFeature,
    reloadShape
}
