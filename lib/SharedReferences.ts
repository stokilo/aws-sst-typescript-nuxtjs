import * as ec2 from '@aws-cdk/aws-ec2'
import { Bucket } from '@aws-cdk/aws-s3'
import { Table } from '@serverless-stack/resources'
import { HttpLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers'

export default class SharedReferences {
    public region = 'me-south-1';
    public vpc: ec2.Vpc;

    public dynamoDbTable: Table
    public authorizer: HttpLambdaAuthorizer

    public applicationConfigBucketName: string
    public applicationConfigBucket: Bucket
}
