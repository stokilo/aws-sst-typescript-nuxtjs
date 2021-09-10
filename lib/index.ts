/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import AuthorizerStack from '../lib/AuthorizerStack'
import ApiAndAuthStack from './ApiAndAuthStack'
import SharedReferences from './SharedReferences'
import S3Stack from './S3Stack'
import DynamoDbStack from './DynamoDbStack'
import StaticSiteStack from '../lib/StaticSiteStack'

export default function main (app: sst.App): void {
  app.setDefaultFunctionProps({
    runtime: 'nodejs14.x'
  })

  const sharedReferences = new SharedReferences()

  app.setDefaultFunctionProps({
    memorySize: 128,
    environment: {
      REGION: sharedReferences.region
    }
  })

  const s3Stack = new S3Stack(app, 'S3Stack', sharedReferences)
  const dynamoDbStack = new DynamoDbStack(app, 'DynamoDbStack', sharedReferences)
  const authorizerStack = new AuthorizerStack(app, 'AuthorizerStack', sharedReferences)
  const apiAuthStack = new ApiAndAuthStack(app, 'ApiAndAuthStack', sharedReferences)
  if (!process.env.IS_LOCAL) {
    const staticSiteStack = new StaticSiteStack(app, 'StaticSiteApp', sharedReferences)
  }
}
