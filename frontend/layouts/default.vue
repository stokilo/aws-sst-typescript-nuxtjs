<template>
  <div class="pl-3 pt-3 pr-3 pb-1">
    <b-modal
      v-model="isComponentModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="Example Modal"
      aria-modal
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Log in
          </p>
          <button
            type="button"
            class="delete"
            @click="isComponentModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          <AuthForm />
        </section>
      </div>
    </b-modal>

    <b-navbar>
      <template #brand>
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img
            src="~/assets/img/spade.svg"
            width="80"
            height="80"
            alt=""
          >
        </b-navbar-item>
      </template>
      <template #start>
        <b-navbar-item href="#">
          Home
        </b-navbar-item>
        <b-navbar-item href="https://github.com/">
          Github
        </b-navbar-item>
        <b-navbar-dropdown label="Info">
          <b-navbar-item href="https://buefy.org/">
            Buefy
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template #end>
        <b-navbar-item tag="div">
          <div class="buttons">

            <b-button
              label="Log in"
              type="is-primary"
              size="is-medium"
              @click="isComponentModalActive = true"
              v-if="!authStore.isLogin"
            />
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <div class="container">
      <Nuxt />
    </div>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>AWSS.WS</strong> by <a href="https://slawomirstec.com">Slawomir Stec</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>

import AuthForm from '~/components/auth/AuthForm'
import { proxy } from '@/store/store'

export default {
  name: 'Default',
  components: {
    AuthForm
  },
  data () {
    return {
      isComponentModalActive: false,
      authStore: proxy.authStore
    }
  }
}
</script>
