import * as apigateway from '@aws-cdk/aws-apigateway';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as core from '@aws-cdk/core';
import * as path from 'path';

export class ShortenerStack extends core.Stack {
  readonly domain = 'fdr.one';
  readonly stage = 'prod';
  readonly origin = 'https://' + this.domain;

  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'shortenerAPI', {
      // these will limit burst of requests that might increase our billing too much
      deployOptions: {
        stageName: this.stage,
        throttlingRateLimit: 5,
        throttlingBurstLimit: 10,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [this.origin],
        allowMethods: ['GET'],
      },
    });

    const certificate = certmgr.Certificate.fromCertificateArn(
      this,
      'shortenerCert',
      // TODO inject this as a parameter
      `arn:aws:acm:${this.region}:${this.account}:certificate/c3b5dab4-ba98-4422-a34a-7ccca2bf1c5d`,
    );

    const customDomain = new apigateway.DomainName(this, 'shortenerCustomDomain', {
      domainName: this.domain,
      certificate: certificate,
      endpointType: apigateway.EndpointType.EDGE,
    });

    customDomain.addBasePathMapping(api);

    const table = new dynamodb.Table(this, 'shortenerTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 1,
    });

    const getFnc = new lambda.Function(this, 'shortenerBackend', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-get')),
      environment: {
        DYNAMODB_TABLE: table.tableName,
      },
    });

    // assign the 'lambda-get' function to the GET method
    const integration = new apigateway.LambdaIntegration(getFnc, {
      proxy: true,
    });

    // add greedy proxy
    const proxy = api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: false,
    });

    proxy.addMethod('GET', integration);

    // allow the lambda function to r/w date into the dynamodb table
    table.grantReadData(getFnc);

    // the favicon will be redirected through cloudflare, if required
    const bucket = new s3.Bucket(this, 'shortenerBucket', {
      publicReadAccess: true,
    });

    new s3deploy.BucketDeployment(this, 'shortenerFaviconDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, 'static'))],
      destinationBucket: bucket,
    });

    new core.CfnOutput(this, 'shortenerCustomOrigin', { value: this.origin });
    new core.CfnOutput(this, 'shortenerFaviconURL', {
      value: bucket.urlForObject('static/favicon.ico'),
    });

    core.Tag.add(this, 'project', 'shortener');
  }
}
