// import _utils from '../common/utils'

// export const UPDATE_EXTRA_MESSAGE = 'updateExtraMessage'
export const UPDATE_EXTEND_TOOLS = 'updateExtendTools'
export const UPDATE_STAGE_DATA = 'updateStageData'
export const UPDATE_STAGE_ZOOM = 'updateStageZoom'

export default {
    // [UPDATE_EXTRA_MESSAGE]: (state, payload) => {
    //     state.extraMessage = payload
    // },
    [UPDATE_EXTEND_TOOLS]: (state, payload) => {
        state.extendTools = payload
    },
    [UPDATE_STAGE_DATA]: (state, payload) => {
        state.stageData = payload
    },
    [UPDATE_STAGE_ZOOM]: (state, payload) => {
        state.stageZoom = payload
    }
}
