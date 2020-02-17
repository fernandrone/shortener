import * as api from "@aws-cdk/aws-apigateway";
import * as core from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";

export class ShortenerStack extends core.Stack {
  readonly backend: lambda.Function;
  readonly api: api.LambdaRestApi;

  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    this.backend = new lambda.Function(this, "shortenerBackend", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda"))
    });

    // TODO add a custom domain with certs
    // TODO add usage plan
    this.api = new api.LambdaRestApi(this, "shortenerAPI", {
      handler: this.backend,
      proxy: false
    });
    
    this.api.root.addMethod("GET");

    core.Tag.add(this, "project", "shortener");
  }
}
