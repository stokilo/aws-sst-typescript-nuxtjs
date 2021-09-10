<template>
  <section class="section is-medium">
    <h1 class="title">
      Sample serverless app
    </h1>
    <h2 class="subtitle">
      An example of <strong>SST</strong> and <strong>NuxtJs</strong> integration.
    </h2>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { proxy } from '~/store/store'
import { AuthStore } from '~/store/modules/auth/auth-store'
import ContactForm from '~/components/ContactForm.vue'
import { $loader, $token } from '~/utils/api'

@Component({ components: { ContactForm } })
export default class AuthPage extends Vue {
  authStore: AuthStore = proxy.authStore

  async mounted () {
    await $token.reset()

    if (this.$route.query.accessCode) {
      const accessCode = this.$route.query.accessCode
      const loader = $loader.show()
      const accessCodeOk = await this.authStore.onAccessCodeReceived(accessCode as string)
      loader.hide()
      if (accessCodeOk) {
        this.$router.push('/contact')
      }
    }
  }
}

</script>
