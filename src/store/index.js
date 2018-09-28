import Vue from 'vue'
import Vuex from 'vuex'
import Actions from './actions.js'
import Mutations from './mutations.js'
import Getters from './getters.js'

Vue.use(Vuex)

const state = {
    // extraMessage: null,
    extendTools: null,
    stageData: null,
    stageZoom: 100
}

export default new Vuex.Store({
    state,
    mutations: Mutations,
    actions: Actions,
    getters: Getters
})
