import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha'
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Alarm, ComparisonOperator, type Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { LambdaDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy'
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { CfnServiceLinkedRole } from 'aws-cdk-lib/aws-iam'
import { Alias } from 'aws-cdk-lib/aws-lambda'
import { type Construct } from 'constructs'
import path = require('path')

type MainStackProps = StackProps & {
  canaryFailureMetric?: Metric
}

export class MainStack extends Stack {
  constructor (scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props)

    const vpc = new Vpc(this, 'Vpc')

    const lambda = new GoFunction(this, 'Lambda', {
      vpc,
      entry: path.join(__dirname, '..', '..', 'cmd', 'handler'),
    })

    const alias = new Alias(this, 'LambdaAlias', {
      aliasName: 'latest',
      version: lambda.currentVersion,
    })
    const lambdaErrorsAlarm = new Alarm(this, 'LambdaErrors', {
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric: alias.metricErrors(),
      treatMissingData: TreatMissingData.NOT_BREACHING,
    })

    const alarms = [lambdaErrorsAlarm]
    if (props.canaryFailureMetric !== undefined) {
      // SLR required to read cross account metrics
      const slr = new CfnServiceLinkedRole(this, 'CloudWatchCrossAccountSLR', {
        awsServiceName: 'cloudwatch-crossaccount.amazonaws.com',
      })
      // Alarm must be in service account to work with CodeDeploy
      const canaryFailureAlarm = new Alarm(this, 'CanaryFailureAlarm', {
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        evaluationPeriods: 1,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        metric: props.canaryFailureMetric,
      })
      canaryFailureAlarm.node.addDependency(slr)
      alarms.push(canaryFailureAlarm)
    }

    new LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      alarms,
    })

    const api = new LambdaRestApi(this, 'RestApi', {
      handler: lambda,
      proxy: false,
    })

    const hello = api.root.addResource('hello')
    hello.addMethod('GET')

    new CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
    })
  }
}
