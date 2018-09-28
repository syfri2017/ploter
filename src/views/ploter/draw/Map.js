import {
    exitPlotTool
} from './utils'

function init (toolCfg, stage) {
    exitPlotTool(stage)
    draw(toolCfg, stage)
}

function draw (cfg, stage) {
    let centerP = {
        Lng: 121.532911,
        Lat: 38.865521
    }
    let zoom = 10
    let centerMP = LatLng2Mercator(centerP)
    let col = Math.ceil(centerMP.X / Math.pow(2, 18 - zoom) / 256)
    let row = Math.ceil(centerMP.Y / Math.pow(2, 18 - zoom) / 256)

    let imgSize = 256

    const stageWidth = stage.getWidth()
    const stageHeight = stage.getHeight()

    let targetLayer = stage.findOne('.backgroundLayer')
    let shapeGroup = new Konva.Group({
        name: 'shapeWrap',
        draggable: false
    })
    targetLayer.add(shapeGroup)

    let x = Math.round((stageWidth - imgSize) / 2)
    let y = Math.round((stageHeight - imgSize) / 2)

    let conCol = Math.ceil(((stageWidth - imgSize) / 2) / imgSize)
    let conRow = Math.ceil(((stageHeight - imgSize) / 2) / imgSize)
    let totalCol = conCol * 2 + 1
    let totalRow = conRow * 2 + 1
    let x0 = x - conCol * 256
    let y0 = y - conRow * 256
    let col0 = col - conCol
    let row0 = row + conRow

    for (let ir = 0; ir < totalRow; ir++) {
        for (let ic = 0; ic < totalCol; ic++) {
            let curRow = row0 - ir
            let curCol = col0 + ic
            let curX = x0 + ic * imgSize
            let curY = y0 + ir * imgSize
            let url = getUrlImg(zoom, curRow, curCol, 'bd_img')
            let imageObj = new Image()
            imageObj.onload = function () {
                let image = new Konva.Image({
                    image: imageObj,
                    x: curX,
                    y: curY,
                    width: imgSize,
                    height: imgSize,
                    draggable: false
                })
                shapeGroup.add(image)
                shapeGroup.draw()
            }
            imageObj.src = url
        }
    }
}

function getUrlImg (level, row, col, layertype) {
    let numX = col
    let numY = row
    var num = (col + row) % 8 + 1
    let url = ''
    switch (layertype) {
    case 'bd_vec': // 矢量
        url = 'http://online' + num + '.map.bdimg.com/tile/?qt=tile&x=' + numX + '&y=' + numY + '&z=' + level + '&styles=pl&scaler=1&udt=20141103'
        break
    case 'bd_img': // 影像
        url = 'http://shangetu' + num + '.map.bdimg.com/it/u=x=' + numX + '&y=' + numY + ';z=' + level + ';v=009;type=sate&fm=46&udt=20141015'
        break
    case 'bd_cva': // 影像标注
        url = 'http://online' + num + '.map.bdimg.com/tile/?qt=tile&x=' + numX + '&y=' + numY + '&z=' + level + '&styles=sl&udt=20141015'
        break
    default:
        url = 'http://online' + num + '.map.bdimg.com/tile/?qt=tile&x=' + numX + '&y=' + numY + '&z=' + level + '&styles=pl&scaler=1&udt=20141103'
        break
    }
    return url
}

// 以下是根据百度地图JavaScript API破解得到 百度坐标<->墨卡托坐标 转换算法
let array1 = [75, 60, 45, 30, 15, 0]
let array2 = [[-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
    [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5],
    [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5],
    [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
    [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
    [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]]
// let array3 = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0]
// let array4 = [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
// [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
// [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
// [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
// [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
// [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]]
// 百度坐标转墨卡托
function LatLng2Mercator (p) {
    let arr = null
    for (let i = 0; i < array1.length; i++) {
        if (p.Lat >= array1[i]) {
            arr = array2[i]
            break
        }
    }
    if (arr == null) {
        for (let i = array1.length - 1; i >= 0; i--) {
            if (p.Lat <= -array1[i]) {
                arr = array2[i]
                break
            }
        }
    }
    let res = convertNew(p.Lng, p.Lat, arr)
    let pf = {}
    pf.X = res[0]
    pf.Y = res[1]
    return pf
}
//
// function getLoop (value, min, max) {
//     while (value > max) {
//         value -= max - min
//     }
//     while (value < min) {
//         value += max - min
//     }
//     return value
// }

// // 墨卡托坐标转百度
// function Mercator2LatLng (p) {
//     let arr = null
//     let np = {}
//     np.X = Math.Abs(p.X)
//     np.Y = Math.Abs(p.Y)
//     for (var i = 0; i < array3.Length; i++) {
//         if (np.Y >= array3[i]) {
//             arr = array4[i]
//             break
//         }
//     }
//     let res = Convertor(np.X, np.Y, arr)
//     let llp = {}
//     llp.Lat = res[0]
//     llp.Lng = res[1]
//     return llp
// }

function convertNew (x, y, param) {
    var T = param[0] + param[1] * Math.abs(x)
    var cC = Math.abs(y) / param[9]
    var cF = param[2] + param[3] * cC + param[4] * cC * cC + param[5] * cC * cC * cC + param[6] * cC * cC * cC * cC + param[7] * cC * cC * cC * cC * cC + param[8] * cC * cC * cC * cC * cC * cC
    T *= (x < 0 ? -1 : 1)
    cF *= (y < 0 ? -1 : 1)

    let res = []
    res[0] = T
    res[1] = cF
    return res
}

export default {
    init
}
