import ContactDao from 'dao/contact-dao'
import { Contact, ContactSchema } from 'backend-frontend/contact'
import { logger } from 'common/logger'
import { ContactsFormResponse, FormValidationOK, StatusOK } from 'backend-frontend/common'
import { RecordPrefix } from 'dao/dynamo-db'
import { RequestContext } from 'common/request-context'

export class ContactService {
  readonly contactDao: ContactDao

  constructor () {
    this.contactDao = new ContactDao()
  }

  async fetchContracts (requestContext: RequestContext): Promise<ContactsFormResponse> {
    const response: ContactsFormResponse = {
      status: StatusOK(),
      formValidation: FormValidationOK(),
      contacts: []
    }

    try {
      const lastContacts = await this.contactDao.query(RecordPrefix.CONTACT, requestContext.userId, ContactSchema,
        { Limit: 5, ScanIndexForward: false })
      response.contacts = lastContacts.found ? lastContacts.data as Contact[] : []
    } catch (err) {
      logger.error(err)
      response.status.success = false
    }
    return response
  }

  async onContactSave (contact: Contact, requestContext: RequestContext): Promise<ContactsFormResponse> {
    const response: ContactsFormResponse = {
      status: StatusOK(),
      formValidation: FormValidationOK(),
      contacts: []
    }

    try {
      await this.contactDao.saveWithSkKSUID(RecordPrefix.CONTACT, requestContext.userId, contact)
      const contacts = await this.contactDao.query(RecordPrefix.CONTACT, requestContext.userId, ContactSchema,
        { Limit: 5, ScanIndexForward: false })
      response.contacts = contacts.found ? contacts.data as Contact[] : []
    } catch (err) {
      logger.error(err)
      response.status.success = false
    }
    return response
  }
}
