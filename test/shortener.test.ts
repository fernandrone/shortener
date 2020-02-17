import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Shortener = require('../lib/shortener-stack');

test('Lambda Function Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Shortener.ShortenerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResource("AWS::Lamda::Function",{
      VisibilityTimeout: 300
    }));
});
