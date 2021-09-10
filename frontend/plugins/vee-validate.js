import Vue from 'vue'
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required, max, min, email, confirmed } from 'vee-validate/dist/rules'
import { $i18n, $log } from '~/utils/api'

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

extend('required', {
  ...required
})

extend('email', {
  ...email
})

extend('confirmed', {
  ...confirmed
})

extend('min', {
  ...min
})

extend('max', {
  ...max
})

Vue.mixin({
  methods: {
    formError (isValid, failedRules) {
      if (isValid) {
        return ''
      }
      const firstErrorKey = Object.keys(failedRules)[0]

      if (firstErrorKey) {
        const errorMessage = $i18n.t(`validation.form.${firstErrorKey}`)
        if (errorMessage && errorMessage.length) {
          return errorMessage
        } else {
          throw new Error(`Missing error message for key: ${k}`)
        }
      }

      return ''
    }
  }
})
