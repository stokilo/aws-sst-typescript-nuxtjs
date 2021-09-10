/* eslint-disable no-new */
import { App, Stack, StackProps } from '@serverless-stack/resources'
import { BucketDeployment, Source, StorageClass } from '@aws-cdk/aws-s3-deployment'
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3'
import SharedReferences from './SharedReferences'

export default class S3Stack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    const configurationBucket = new Bucket(this, 'ApplicationConfiguration', {
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    })

    new BucketDeployment(this, 'ApplicationConfigurationDeployment', {
      sources: [Source.asset('./src/config')],
      destinationBucket: configurationBucket,
      retainOnDelete: false,
      prune: true,
      storageClass: StorageClass.STANDARD
    })

    this.addOutputs({
      bucketName: configurationBucket.bucketName,
      bucketArn: configurationBucket.bucketArn
    })

    sharedReferences.applicationConfigBucketName = configurationBucket.bucketName
    sharedReferences.applicationConfigBucket = configurationBucket
  }
}
