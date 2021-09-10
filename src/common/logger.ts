import { QueryCommandOutput } from '@aws-sdk/lib-dynamodb/dist/types/commands/QueryCommand'
import { TransactWriteCommandOutput } from '@aws-sdk/lib-dynamodb/dist/types/commands/TransactWriteCommand'

/**
 * Simplest logger possible
 */
class AppLogger {

  /**
   * Output logs on PROD to stdout to be searchable by AWS services like Athena.
   * console.log* functions don't output by default to std out. However in dev mode it is convenient to have
   * output formatted, that is why IS_LOCAL check is performed.
   * @param obj
   */
  stdout (obj: any) {
    if (process.env.IS_LOCAL) {
      console.info(obj)
    } else {
      process.stdout.write(JSON.stringify(obj) + '\n')
    }
  }

  info (obj: any) {
    this.stdout(obj)
  }

  debug (obj: any) {
    if (process.env.IS_LOCAL) {
      this.stdout(obj)
    }
  }

  error (obj: any) {
    this.stdout(obj)
  }

  debugDynamo (action: string, result: QueryCommandOutput) {
    this.debug({
      Action: action,
      ScannedCount: result.ScannedCount,
      ConsumedCapacity: {
        CapacityUnits: result.ConsumedCapacity?.CapacityUnits
      }
    })
  }

  debugDynamoTransact (action: string, result: TransactWriteCommandOutput) {
    this.debug({
      Action: action,
      ConsumedCapacity: result.ConsumedCapacity
    })
  }
}

export const logger = new AppLogger()
