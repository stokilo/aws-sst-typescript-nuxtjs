import Vue from 'vue'
// @ts-ignore
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { initializeLoader } from '~/utils/api'

// @ts-ignore
const accessor: Plugin = () => {
  Vue.use(Loading)
  // @ts-ignore
  initializeLoader(Vue.$loading)
}

export default accessor
