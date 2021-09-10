import { App, Stack, StackProps, StaticSite, StaticSiteErrorOptions } from '@serverless-stack/resources'
import { RemovalPolicy } from '@aws-cdk/core'
import SharedReferences from './SharedReferences'

export default class StaticSiteStack extends Stack {
  constructor (scope: App, id: string, sharedReferences: SharedReferences, props?: StackProps) {
    super(scope, id, props)

    new StaticSite(this, 'StaticWebsite', {
      path: 'frontend/',
      buildOutput: 'dist/',
      buildCommand: 'yarn run generate',
      errorPage: StaticSiteErrorOptions.REDIRECT_TO_INDEX_PAGE,
      s3Bucket: {
        removalPolicy: RemovalPolicy.DESTROY
      },
      customDomain: {
        domainName: 'awss.ws',
        domainAlias: 'www.awss.ws',
        hostedZone: 'awss.ws'
      },
      cfDistribution: {
        enabled: true
      }
    })
  }
}
