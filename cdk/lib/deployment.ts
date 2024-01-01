import { type Environment, Stage, type StageProps } from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import { MainStack } from './main-stack'
import { CanaryStack } from './canary-stack'

type DeploymentStageProps = StageProps & {
  env: Environment
  canaryStackEnv: Environment
  apiUrl: string
}

export class Deployment extends Stage {
  constructor (scope: Construct, id: string, props: DeploymentStageProps) {
    super(scope, id, props)

    let canaryStack: CanaryStack | undefined
    if (props.apiUrl !== '') {
      canaryStack = new CanaryStack(this, `CanaryStack${id}`, {
        env: props.canaryStackEnv,
        serviceAccountId: props.env.account!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        apiUrl: props.apiUrl,
      })
    }

    const mainStack = new MainStack(this, `MainStack${id}`, {
      canaryFailureMetric: canaryStack?.failureMetric,
    })
    if (canaryStack !== undefined) {
      mainStack.addDependency(canaryStack)
    }
  }
}
