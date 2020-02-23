import * as apigateway from "@aws-cdk/aws-apigateway";
import * as core from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import { Period } from "@aws-cdk/aws-apigateway";

export class ShortenerStack extends core.Stack {
  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const backend = new lambda.Function(this, "shortenerBackend", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda"))
    });

    const api = new apigateway.RestApi(this, "shortenerAPI", {});
    const integration = new apigateway.LambdaIntegration(backend);
    const key = api.addApiKey("apiKey");

    api.root.addMethod("GET", integration, {
      apiKeyRequired: true
    });

    // will keep us under 1M requests/month
    api.addUsagePlan("Free", {
      name: "Free",
      description: "Plan to guarantee that we won't go over AWS Free Tier",
      apiKey: key,
      quota: {
        limit: 30000,
        period: Period.DAY
      },
      throttle: {
        rateLimit: 50,
        burstLimit: 100
      }
    });

    core.Tag.add(this, "project", "shortener");
  }
}
