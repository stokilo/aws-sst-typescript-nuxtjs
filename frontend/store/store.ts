import { extractVuexModule, createProxy } from 'vuex-class-component'
import Vuex from 'vuex'
import Vue from 'vue'
import { MenuStore } from '~/store/modules/common/menu-store'
import { AuthStore } from '~/store/modules/auth/auth-store'
import { ContactStore } from '~/store/modules/contact-store'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(AuthStore),
    ...extractVuexModule(MenuStore),
    ...extractVuexModule(ContactStore)
  }
})

export const proxy = {
  authStore: createProxy(store, AuthStore),
  menuStore: createProxy(store, MenuStore),
  contactStore: createProxy(store, ContactStore)
}
