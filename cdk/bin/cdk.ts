#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CodePipelineStack } from '../lib/pipeline-stack'
import { Stages } from '../lib/stages'

const app = new cdk.App()
new CodePipelineStack(app, 'CodePipelineStack', {
  env: Stages.Alpha.serviceAccount,
})
