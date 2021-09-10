import Vue from 'vue'
import VueLogger from 'vuejs-logger'
import { initializeLog } from '~/utils/api'
import constants from '~/constants'

// @ts-ignore
const accessor: Plugin = () => {
  const options = {
    isEnabled: true,
    logLevel: constants.isDevMode ? 'debug' : 'info',
    stringifyArguments: false,
    showLogLevel: true,
    showMethodName: false,
    separator: '|',
    showConsoleColors: true
  }

  // @ts-ignore
  Vue.use(VueLogger, options)
  // @ts-ignore
  initializeLog(Vue.$log)
}

export default accessor
