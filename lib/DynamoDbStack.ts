import * as sst from '@serverless-stack/resources'
import { RemovalPolicy } from '@aws-cdk/core'
import { Table, TableFieldType } from '@serverless-stack/resources'
import SharedReferences from './SharedReferences'

export default class DynamoDbStack extends sst.Stack {
  constructor (scope: sst.App, id: string, sharedReferences: SharedReferences, props?: sst.StackProps) {
    super(scope, id, props)

    sharedReferences.dynamoDbTable = new Table(this, 'MainTable', {
      fields: {
        pk: TableFieldType.STRING,
        sk: TableFieldType.STRING
      },
      primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
      dynamodbTable: {
        removalPolicy: RemovalPolicy.DESTROY
      }
    })
  }
}
