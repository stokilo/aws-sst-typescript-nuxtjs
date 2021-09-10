import { createModule, mutation, action, getter } from 'vuex-class-component'
import { Contact, newContact, newTestContact } from '@backend/contact'
import {
  ContactsFormResponse,
  ContactsFormResponseSchema
} from '@backend/common'
import { SERVER_API_ROUTES } from '~/store/api/routes'
import AxiosService from '~/store/api/axios-service'

export const VuexModule = createModule({
  namespaced: 'contact',
  strict: false,
  target: 'nuxt'
})

export class ContactStore extends VuexModule {

  tableColumns: Array<any> = [
    {
      field: 'name',
      label: 'Name'
    },
    {
      field: 'email',
      label: 'Email'
    },
    {
      field: 'details',
      label: 'Details'
    }
  ]

  contacts: Contact[] = []
  contact: Contact = process.env.isDevMode ? newTestContact() : newContact()

  axiosService: AxiosService = new AxiosService()

  @getter
  areFieldsFilled (): boolean {
    return true
  }

  @mutation mutateContact (mutatedContact: Contact) {
    this.contact = mutatedContact
  }

  @mutation mutateContacts (newContacts: Contact[]) {
    this.contacts = newContacts
  }

  @action
  async onMounted () {
    const response = await this.axiosService.$get<ContactsFormResponse, typeof ContactsFormResponseSchema>(
      SERVER_API_ROUTES.ROUTE_CONTACT, ContactsFormResponseSchema)

    if (response && response.contacts) {
      const indexed = response.contacts.map((e, i) => { e.email = e.email + i; return e })
      this.mutateContacts(indexed)
    }
  }

  @action
  async onSaveContact (): Promise<ContactsFormResponse | undefined> {
    const response = await this.axiosService.$post<Contact, ContactsFormResponse, typeof ContactsFormResponseSchema>(
      SERVER_API_ROUTES.ROUTE_CONTACT, this.contact, ContactsFormResponseSchema)

    if (response && response.contacts) {
      const indexed = response.contacts.map((e, i) => { e.email = e.email + i; return e })
      this.mutateContacts(indexed)
    }

    return response
  }
}
