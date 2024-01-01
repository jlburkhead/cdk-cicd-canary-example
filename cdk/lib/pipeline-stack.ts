import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import { Repository } from 'aws-cdk-lib/aws-codecommit'
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines'
import { type Construct } from 'constructs'
import { Deployment } from './deployment'
import { Stages } from './stages'
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

export class CodePipelineStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const repo = new Repository(this, 'Repository', {
      repositoryName: 'CdkCiCdExample',
    })

    const pipeline = new CodePipeline(this, 'Pipeline', {
      crossAccountKeys: true,
      enableKeyRotation: true,
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.codeCommit(repo, 'main'),
        installCommands: [
          'make install',
        ],
        commands: [
          'make build',
        ],
        rolePolicyStatements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['ec2:DescribeAvailabilityZones'],
            resources: ['*'],
          }),
        ],
      }),

    })

    const alpha = new Deployment(this, 'Alpha', {
      stageName: Stages.Alpha.name,
      env: Stages.Alpha.serviceAccount,
      canaryStackEnv: Stages.Alpha.canaryAccount,
      apiUrl: Stages.Alpha.apiUrl,
    })
    pipeline.addStage(alpha, {
      pre: [
        new CodeBuildStep('Linting', {
          installCommands: [
            'make install',
          ],
          commands: [
            'make lint',
          ],
        }),
        new CodeBuildStep('UnitTest', {
          installCommands: [
            'make install',
          ],
          commands: [
            'make unittest',
          ],
        }),
        new CodeBuildStep('Security', {
          installCommands: [
            'make install',
            'gem install cfn-nag',
          ],
          commands: [
            'make build',
            'make security',
          ],
          partialBuildSpec: BuildSpec.fromObject({
            phases: {
              install: {
                'runtime-versions': {
                  ruby: '3.2',
                },
              },
            },
          }),
        }),
      ],
    })

    const prod = new Deployment(this, 'Prod', {
      stageName: Stages.Prod.name,
      env: Stages.Prod.serviceAccount,
      canaryStackEnv: Stages.Prod.canaryAccount,
      apiUrl: Stages.Prod.apiUrl,
    })
    pipeline.addStage(prod)

    new CfnOutput(this, 'RepositoryName', {
      value: repo.repositoryName,
    })
  }
}
