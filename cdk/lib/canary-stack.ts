import { Duration, Stack, type StackProps } from 'aws-cdk-lib'
import { type Metric } from 'aws-cdk-lib/aws-cloudwatch'
import { AccountPrincipal, ManagedPolicy, Role } from 'aws-cdk-lib/aws-iam'
import { Canary, Code, Runtime, Schedule, Test } from 'aws-cdk-lib/aws-synthetics'
import { type Construct } from 'constructs'
import path = require('path')

export type CanaryStackProps = StackProps & {
  apiUrl: string
  serviceAccountId: string
}

export class CanaryStack extends Stack {
  readonly failureMetric: Metric
  constructor (scope: Construct, id: string, props: CanaryStackProps) {
    super(scope, id, props)

    const canary = new Canary(this, 'Canary', {
      schedule: Schedule.rate(Duration.minutes(1)),
      runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_6_0,
      test: Test.custom({
        code: Code.fromAsset(path.join(__dirname, '..', '..', 'canary')),
        handler: 'index.handler',
      }),
      environmentVariables: {
        API_URL: props.apiUrl,
      },
      canaryName: 'cicd-example-canary', // auto generated name is > 21 characters and breaks name validation
    })
    this.failureMetric = canary.metricFailed()

    // Enable service account to read canary metrics
    new Role(this, 'CrossAccountSharingRole', {
      assumedBy: new AccountPrincipal(props.serviceAccountId),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchReadOnlyAccess'),
      ],
      roleName: 'CloudWatch-CrossAccountSharingRole',
    })
  }
}
