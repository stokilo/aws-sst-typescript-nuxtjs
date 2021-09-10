import * as zod from 'zod'
import { ContactSchema } from './contact'

/**
 * Form validation type for save data requests.
 */
export const FormValidationSchema = zod.object({
  passed: zod.boolean(),
  errors: zod.record(zod.string())
})

export type FormValidation = zod.TypeOf<typeof FormValidationSchema>
export const FormValidationOK = () : FormValidation => {
  return {
    passed: true,
    errors: {}
  }
}

/**
 * Status of HTTP request.
 */
export const StatusSchema = zod.object({
  success: zod.boolean(),
  errorMessage: zod.string().optional()
})
export type Status = zod.TypeOf<typeof StatusSchema>
export const StatusOK = () : Status => {
  return {
    success: true
  }
}

/**
 * Base response format for form submits.
 */
export const FormSaveResponseSchema = zod.object({
  status: StatusSchema,
  formValidation: FormValidationSchema
})
export type FormSaveResponse = zod.TypeOf<typeof FormSaveResponseSchema>

export const ContactsFormResponseSchema = FormSaveResponseSchema.extend({
  contacts: zod.optional(zod.array(ContactSchema))
})
export type ContactsFormResponse = zod.TypeOf<typeof ContactsFormResponseSchema>
