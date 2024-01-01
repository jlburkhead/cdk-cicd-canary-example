import * as cdk from 'aws-cdk-lib'
import { Capture, Template } from 'aws-cdk-lib/assertions'
import { MainStack } from '../lib/main-stack'

const app = new cdk.App()
const stack = new MainStack(app, 'Test-MainStack', {})
const template = Template.fromStack(stack)

test('Function has been created', () => {
  template.hasResource('AWS::Lambda::Function', '')
})

test('Alias has been created', () => {
  template.hasResource('AWS::Lambda::Alias', '')
})

test('Lambda Errors Alarm has been created', () => {
  template.hasResource('AWS::CloudWatch::Alarm', {
    Properties: {
      ComparisonOperator: 'GreaterThanOrEqualToThreshold',
      EvaluationPeriods: 1,
      Threshold: 1,
      TreatMissingData: 'notBreaching',
      MetricName: 'Errors',
      Namespace: 'AWS/Lambda',
    },
  })
})

test('RestApi has been created', () => {
  template.hasResource('AWS::ApiGateway::RestApi', '')
})

test('Deployment Group has been created', () => {
  template.hasResource('AWS::CodeDeploy::DeploymentGroup', '')
})

test('Deployment Group has auto rollback', () => {
  template.hasResourceProperties('AWS::CodeDeploy::DeploymentGroup', {
    AutoRollbackConfiguration: {
      Enabled: true,
    },
  })
})

test('Deployment Group has alarms', () => {
  const alarms = new Capture()
  template.hasResourceProperties('AWS::CodeDeploy::DeploymentGroup', {
    AlarmConfiguration: {
      Alarms: alarms,
      Enabled: true,
    },
  })
  expect(alarms.asArray().length).toBeGreaterThanOrEqual(1)
})
