#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ShortenerStack } from '../lib/shortener-stack';

const app = new cdk.App();
new ShortenerStack(app, 'ShortenerStack');
