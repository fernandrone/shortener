import { ShortenerStack } from "../lib/shortener-stack";
import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import "@aws-cdk/assert/jest";

test("Lambda Function Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ShortenerStack(app, "MyTestStack");
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test("Lambda Function matches Runtime", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ShortenerStack(app, "MyTestStack");
  // THEN
  expect(stack).toHaveResource("AWS::Lambda::Function", {
    Runtime: "nodejs12.x"
  });
});
