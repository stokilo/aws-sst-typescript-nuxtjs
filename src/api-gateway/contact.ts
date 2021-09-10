import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { logger } from 'common/logger'
import { ContactSchema } from 'backend-frontend/contact'
import { ContactService } from 'service/contact-service'
import { http200WithJSONBody } from 'api-gateway/common'
import { toRequestContext } from 'common/request-context'

const contactService = new ContactService()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {
    const requestContext = toRequestContext(event)
    if (event.requestContext.http.method === 'GET') {
      const response = await contactService.fetchContracts(requestContext)
      return http200WithJSONBody(JSON.stringify(response))
    } else if (event.body) {
      const receivedContact = ContactSchema.parse(JSON.parse(event.body))
      const response = await contactService.onContactSave(receivedContact, requestContext)
      return http200WithJSONBody(JSON.stringify(response))
    }
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify({}))
}
