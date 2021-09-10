<template>
  <section>
    <div>
      <b-notification aria-close-label="Close notification" type="is-success is-light">
        Hello {{ authStore.userData.firstName }}, settings:dark mode = {{ authStore.settings.darkMode }}
      </b-notification>

      <b-table
        class="pt-2 pl-2 pr-2 pb-2"
        :data="contactStore.contacts"
        :columns="contactStore.tableColumns"
        :narrowed="true"
        :focusable="true"
        :striped="true"
      >
        <template #footer>
          <div class="has-text-right">
            All contacts
          </div>
        </template>
      </b-table>

      <b-notification v-model="isGlobalFormError" aria-close-label="Close error" type="is-danger is-light">
        {{ contactSendErrorMessage }}
      </b-notification>

      <section class="box">
        <ValidationObserver ref="form" v-slot="{ invalid }">
          <fieldset :disabled="isFormDisabled">
            <ValidationProvider v-slot="{ valid, failedRules }" rules="required|min:5|max:250" vid="name">
              <b-field
                :label="$t('contact-form.name')"
                :type="{ 'is-danger': !valid, 'is-success': valid }"
                :message="formError(valid, failedRules)"
              >
                <b-input v-model="contactStore.contact.name" maxlength="249" name="name"/>
              </b-field>
            </ValidationProvider>

            <ValidationProvider v-slot="{ valid, failedRules }" rules="required|email|min:3|max:250" vid="email">
              <b-field
                :label="$t('contact-form.email')"
                :type="{ 'is-danger': !valid, 'is-success': valid }"
                :message="formError(valid, failedRules)"
              >
                <b-input v-model="contactStore.contact.email" maxlength="249" name="email"/>
              </b-field>
            </ValidationProvider>

            <ValidationProvider v-slot="{ valid, failedRules }" rules="required|min:5|max:250" vid="details">
              <b-field
                :label="$t('contact-form.details')"
                :type="{ 'is-danger': !valid, 'is-success': valid }"
                :message="formError(valid, failedRules)"
              >
                <b-input v-model="contactStore.contact.details" maxlength="249" name="details"/>
              </b-field>
            </ValidationProvider>
          </fieldset>
          <br>
          <b-button type="is-primary" class="pb-2" :disabled="invalid" @click="onSend">
            Send
          </b-button>
        </ValidationObserver>

        <div class="pt-2">
          <b-notification v-model="isContactSend" aria-close-label="Close error" type="is-success is-light">
            {{ $t('contact-form.success') }}
          </b-notification>
        </div>

      </section>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { proxy } from '~/store/store'
import { $i18n, $loader, $log, $notify, $token } from '~/utils/api'
import { ContactStore } from '~/store/modules/contact-store'
import { AuthStore } from '~/store/modules/auth/auth-store'

@Component
export default class ContactForm extends Vue {
  contactStore: ContactStore = proxy.contactStore
  authStore: AuthStore = proxy.authStore
  isFormDisabled: boolean = false
  isContactSend: boolean = false
  contactSendErrorMessage: string = ''

  get isFormFilled () {
    return this.contactStore.areFieldsFilled
  }

  get token () {
    return $token.getJwt()
  }

  get isGlobalFormError (): boolean {
    return !!this.contactSendErrorMessage.length
  }

  async mounted () {
    $log.debug('contact mounted')
    const loader = $loader.show()
    await this.contactStore.onMounted()
    loader.hide()
  }

  async onSend () {
    this.isFormDisabled = true
    const loader = $loader.show()

    try {
      const formSaveResponse = await this.contactStore.onSaveContact()
      if (formSaveResponse) {
        if (formSaveResponse.formValidation.passed && formSaveResponse.status.success) {
          this.isContactSend = true
        }

        // specific form field errors
        if (!formSaveResponse.formValidation.passed) {
          // @ts-ignore
          this.$refs.form.setErrors(
            formSaveResponse.formValidation.errors
          )
        }

        // general error message for form processing
        if (!formSaveResponse.status.success) {
          this.contactSendErrorMessage = formSaveResponse.status.errorMessage as string
        }
      }
    } catch (err) {
      console.dir(err)
      $notify('error', $i18n.t('api.error-msg-title'), $i18n.t('api.error-msg-content'))
    }

    this.isFormDisabled = false
    setTimeout(() => {
      loader.hide()
    }, 400)
  }
}
</script>
