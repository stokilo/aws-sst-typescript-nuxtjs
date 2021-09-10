import { ZodType } from 'zod/lib/types'
import { $axios, $i18n, $log } from '~/utils/api'

interface AxiosConfig {
  headers: Record<string, string>
  timeout: number
}

/**
 * Generic base service to make API calls using axios lib. It provides high level function
 * to invoke WS and process result.
 */
export default class AxiosService {
  AXIOS_JSON_POST_CONFIG: AxiosConfig = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000
  }

  getRequestConfig (): Object {
    const config = { ...this.AXIOS_JSON_POST_CONFIG }
    config.headers['X-Language'] = $i18n.locale
    return config
  }

  async $get<T, E extends ZodType<T>> (routePath: string, schema: E, params: object = {}): Promise<T | undefined> {
    return await $axios.get(routePath, { ...this.getRequestConfig(), params })
      .then(function (r) {
        return schema.parse(r.data)
      })
      .catch(function (error) {
        $log.error(error)
        return undefined
      })
  }

  async $post<T1, T2, E extends ZodType<T2>> (routePath: string, model: T1, responseSchema: E): Promise<T2 | undefined> {
    return await $axios.post<T1>(routePath, JSON.stringify(model), this.getRequestConfig())
      .then(function (r) {
        return responseSchema.parse(r.data)
      })
      .catch(function (error) {
        $log.error(error)
        return undefined
      })
  }
}
