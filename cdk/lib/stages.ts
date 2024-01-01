import { type Environment } from 'aws-cdk-lib'

interface Stage {
  name: string
  serviceAccount: Environment
  canaryAccount: Environment
  apiUrl: string
}

export const Stages: Record<string, Stage> = {
  Alpha: {
    name: 'Alpha',
    serviceAccount: {
      account: '',
      region: 'us-west-2',
    },
    canaryAccount: {
      account: '',
      region: 'us-west-2',
    },
    apiUrl: '',
  },
  Prod: {
    name: 'Prod',
    serviceAccount: {
      account: '',
      region: 'us-west-2',
    },
    canaryAccount: {
      account: '',
      region: 'us-west-2',
    },
    apiUrl: '',
  },
}
