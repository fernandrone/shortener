#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ShortenerStack } from '../lib/shortener-stack';

const app = new cdk.App();
new ShortenerStack(app, 'ShortenerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
