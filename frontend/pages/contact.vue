<template>
  <div>
    <ContactForm />
  </div>
</template>

<script>

import ContactForm from '~/components/ContactForm'
import { $token } from '@/utils/api'

export default {
  components: {
    ContactForm
  },
  created () {
    if (process.browser) {
      window.onbeforeunload = function () {
        sessionStorage.setItem('authToken', $token.getJwt())
        sessionStorage.setItem('refreshToken', $token.getRefreshToken())
      }
    }
  }
}

</script>
