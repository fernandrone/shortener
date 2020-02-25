import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as core from '@aws-cdk/core';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

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
      },
    });

    const hostedZone = route53.HostedZone.fromLookup(this, 'shortenerHostedZone', {
      domainName: this.domain,
      privateZone: false,
    });

    const certificate = new certmgr.DnsValidatedCertificate(this, 'shortenerCert', {
      domainName: this.domain,
      hostedZone,
    });

    const customDomain = new apigateway.DomainName(this, 'shortenerCustomDomain', {
      domainName: this.domain,
      certificate: certificate,
      endpointType: apigateway.EndpointType.EDGE,
    });

    customDomain.addBasePathMapping(api);

    new route53.ARecord(this, 'shortenerAliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayDomain(customDomain),
      ),
    });

    const table = new dynamodb.Table(this, 'shortenerTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'url', type: dynamodb.AttributeType.STRING },
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

    new core.CfnOutput(this, 'shortenerOrigin', {
      value: this.origin,
      description: 'The value of the custom shortener origin',
      exportName: 'ShortenerCustomOrigin',
    });

    core.Tag.add(this, 'project', 'shortener');
  }
}
