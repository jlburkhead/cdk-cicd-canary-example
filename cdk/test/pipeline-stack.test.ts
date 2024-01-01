import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { CodePipelineStack } from '../lib/pipeline-stack'

const app = new cdk.App()
// Test account and region must match https://github.com/aws/aws-cdk/blob/f4c1d1253ee34c2837a57a93faa47c9da97ef6d8/packages/aws-cdk-lib/cx-api/lib/environment.ts#L6
const stack = new CodePipelineStack(app, 'CodePipeline', {
  env: {
    account: 'test-account',
    region: 'test-region',
  },
})
const template = Template.fromStack(stack)

test('Pipeline has been created', () => {
  template.hasResource('AWS::CodePipeline::Pipeline', '')
})

test('Pipeline restarts on update', () => {
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    RestartExecutionOnUpdate: true,
  })
})

test('Repository has been created', () => {
  template.hasResource('AWS::CodeCommit::Repository', '')
})

test('Stack outputs repository name', () => {
  template.hasOutput('RepositoryName', '')
})
