import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { PutCommandInput } from '@aws-sdk/lib-dynamodb/dist/types/commands/PutCommand'
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb/dist/types/commands/QueryCommand'
import { throwExpression } from 'common/utils'
import { ZodType } from 'zod/lib/types'
import KSUID from 'ksuid'
import { logger } from 'common/logger'
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb'

/**
 * Single table design with PK and SK columns. Data stored as 'data' object under single column.
 */
const DYNAMO_DB_MY_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ??
  throwExpression('DYNAMODB_TABLE_NAME not defined')

/**
 * Unique prefixes for table records
 */
export enum RecordPrefix {
  USER = 'USER#',
  CONTACT = 'CONTACT#',
  OAUTH_ENTITY = 'OAUTH_ENTITY#'
}

/**
 * Defines dynamodb clients and parameters shared across all dao layers
 */
export interface DynamoDb {
  tableName: string
  fullClient: DynamoDBClient
  documentClient: DynamoDBDocument
}

export function getDynamoDb (): DynamoDb {
  const fullClient = new DynamoDBClient({})
  const documentClient = DynamoDBDocument.from(fullClient)

  return {
    tableName: DYNAMO_DB_MY_TABLE_NAME,
    fullClient,
    documentClient
  }
}

/**
 * Wrapper interfaces for records returned from dynamodb queries.
 * Queries may return no matching results. Each record type have @found field that indicate if data
 * was returned in the response.
 */
export interface MaybeRecord<T> {
  found: boolean,
  data: T
}

export class DataRecord<T> implements MaybeRecord<T> {
  found: boolean = true
  data: T

  constructor (data: T) {
    this.found = true
    this.data = data
  }
}

export class RecordNotFound<T> implements MaybeRecord<T> {
  found: boolean = true
  data: T

  constructor () {
    this.found = false
    this.data = {} as T
  }
}

/**
 * Generic dao layer for the app.
 */
export default class GenericDao {
  readonly dynamoDb
  readonly documentClient

  constructor () {
    this.dynamoDb = getDynamoDb()
    this.documentClient = this.dynamoDb.documentClient
  }

  /**
   * Executes multiple put commands in a single transaction (2x cost for an each item)
   */
  async transactBatchSave (action: string, putCommands: PutCommandInput[]) {
    const result = await this.documentClient.transactWrite(
      {
        TransactItems: putCommands.map((c) => {
          return { Put: { ...c } }
        }),
        ReturnConsumedCapacity: 'TOTAL'
      }
    )
    logger.debugDynamoTransact(`GenericDao.transactBatchSave ${action}`, result)
  }

  /**
   * Generic save for entities with PK=SK
   */
  async save<T> (prefix: RecordPrefix, id: string, data: T) {
    const result = await this.documentClient.put(this.getPutCommandPkEqSk(prefix, id, data))
    logger.debugDynamo(`GenericDao.save ${prefix}`, result)
  }

  /**
   * Update a given record with the data provided in the @toUpdate argument.
   * Name of the keys in the @toUpdate must match names of the updated col1 value.
   * Nesting is not supported.
   */
  async update (prefix: RecordPrefix, id: string, toUpdate: { [key: string]: NativeAttributeValue }) {
    const result = await this.documentClient.update(this.getUpdateCommandPkEqSk(prefix, id, toUpdate))
    logger.debugDynamo(`GenericDao.update ${prefix}`, result)
  }

  /**
   * Generic save for entities where PK != SK and SK=KSUID
   * @param prefix
   * @param id
   * @param data
   */
  async saveWithSkKSUID<T> (prefix: RecordPrefix, id: string, data: T) {
    const skSuffix = (await KSUID.random()).string
    const result = await this.documentClient.put(this.getPutCommandPkNeqSk(prefix, id, skSuffix, data))
    logger.debugDynamo(`GenericDao.saveWithSkKSUID ${prefix}`, result)
  }

  /**
   * Generic fetch for entities with PK=SK, issue query and fetch single record.
   */
  async fetch<T, E extends ZodType<T>> (prefix: RecordPrefix, uniqueId: string, schema: E): Promise<MaybeRecord<T>> {
    const queryCommand = this.getQueryCommandInputPkEqualSk(prefix, uniqueId)
    const result = await this.documentClient.query(queryCommand)

    if (result.Items && result.Items.length) {
      logger.debugDynamo(`GenericDao fetch ${prefix}`, result)
      return new DataRecord(schema.parse(result.Items[0].col1))
    }

    return new RecordNotFound()
  }

  /**
   * Generic query for entities with PK!=SK
   */
  async query<T, E extends ZodType<T>> (prefix: RecordPrefix, pkSuffix: string, schema: E, params: any = {}): Promise<MaybeRecord<T[]>> {
    const queryCommand = { ...this.getQueryCommandInputPkNeqSk(prefix, pkSuffix), ...params }
    const result = await this.documentClient.query(queryCommand)

    if (result.Items && result.Items.length) {
      logger.debugDynamo(`GenericDao.query ${prefix}`, result)
      const resultFiltered = result.Items.map(e => schema.parse(e.col1))
      return new DataRecord(resultFiltered)
    }

    return new RecordNotFound()
  }

  /**
   * Put command for records with PK=SK i.e. PK=USER#1 SK=USER#1
   */
  getPutCommandPkEqSk (prefix: RecordPrefix, uniqueValue: string, data: any | {}): PutCommandInput {
    const key = `${prefix}${uniqueValue}`
    return {
      TableName: DYNAMO_DB_MY_TABLE_NAME,
      Item: {
        pk: key,
        sk: key,
        col1: data
      },
      ReturnConsumedCapacity: 'TOTAL'
    }
  }

  /**
   * Perform an update of the object stored under col1.
   * Names of keys inside toUpdate must match real key in the updated object!
   * Nesting not supported
   */
  getUpdateCommandPkEqSk (prefix: RecordPrefix, uniqueValue: string,
    toUpdate: { [key: string]: NativeAttributeValue }): UpdateCommandInput {
    const key = `${prefix}${uniqueValue}`
    // what is generates:
    // updateExpression: 'SET col1.settings = :newSettings, col1.rights = :newRights',
    // expressionAttributeValues: {
    //   ':newSettings': data,
    //   ':newRights': data
    // },
    let updateExpression = 'SET '
    for (const key in toUpdate) {
      const comma = updateExpression.length > 4 ? ',' : ''
      updateExpression = `${updateExpression} ${comma}col1.${key} = :P${key}`
    }
    const expressionAttributeValues = Object.fromEntries(Object.entries(toUpdate).map(([key, val]) => [`:P${key}`, val]))

    return {
      TableName: DYNAMO_DB_MY_TABLE_NAME,
      Key: {
        pk: key,
        sk: key
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,

      ReturnConsumedCapacity: 'TOTAL'
    }
  }

  /**
   * Put command for records with PK != SK. PK=CONTACT#1 SK=KSUID
   */
  getPutCommandPkNeqSk (prefix: RecordPrefix, pkSuffix: string, skSuffix: string, data: any | {}): PutCommandInput {
    return {
      TableName: DYNAMO_DB_MY_TABLE_NAME,
      Item: {
        pk: `${prefix}${pkSuffix}`,
        sk: `${prefix}${skSuffix}`,
        col1: data
      },
      ReturnConsumedCapacity: 'TOTAL'
    }
  }

  /**
   * Query command for records with PK=SK i.e. PK=USER#1 SK=USER#1
   */
  getQueryCommandInputPkEqualSk (prefix: RecordPrefix, uniqueValue: string): QueryCommandInput {
    const key = `${prefix}${uniqueValue}`
    return {
      TableName: DYNAMO_DB_MY_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk_val AND #sk = :sk_val',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk'
      },
      ExpressionAttributeValues: {
        ':pk_val': key,
        ':sk_val': key
      },
      ReturnConsumedCapacity: 'TOTAL'
    }
  }

  /**
   * Query command for records with PK!=SK i.e. PK=CONTACT#1 SK=CONTACT#KSUID
   */
  getQueryCommandInputPkNeqSk (prefix: RecordPrefix, pkSuffix: string): QueryCommandInput {
    return {
      TableName: DYNAMO_DB_MY_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk_val',
      ExpressionAttributeNames: {
        '#pk': 'pk'
      },
      ExpressionAttributeValues: {
        ':pk_val': `${prefix}${pkSuffix}`
      },
      ReturnConsumedCapacity: 'TOTAL',
      Limit: 10
    }
  }
}
