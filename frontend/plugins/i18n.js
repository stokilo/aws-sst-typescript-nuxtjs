import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { configure } from 'vee-validate'
import { initializeI18n } from '~/utils/api'
import validationMessagesEn from '~/node_modules/vee-validate/dist/locale/en'
import validationMessagesPl from '~/node_modules/vee-validate/dist/locale/pl'

Vue.use(VueI18n)

const en = require('~/locales/en.json')
en.validations = validationMessagesEn

const pl = require('~/locales/pl.json')
pl.validations = validationMessagesPl

export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en
    }
  })

  // conversion filter for date values received from python backend
  Vue.filter('formatPDate', function (value) {
    if (value) {
      const vDate = new Date(value * 1000)
      return `${vDate.toLocaleDateString('en-us')} ${vDate.toLocaleTimeString('en-us')}`
    }
  })

  configure({
  })

  initializeI18n(app.i18n)
}
