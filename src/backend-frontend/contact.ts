import * as zod from 'zod'

/**
 * Contact form data.
 */
export const ContactSchema = zod.object({
  name: zod.string().min(5).max(255),
  email: zod.string().email().min(5).max(255),
  details: zod.string().min(5).max(255)
})
export type Contact = zod.TypeOf<typeof ContactSchema>
export const newContact = () : Contact => { return { name: '', email: '', details: '' } }
export const newTestContact = () : Contact => { return { name: 'Johnny', email: 'test@test.com', details: 'Some details' } }
