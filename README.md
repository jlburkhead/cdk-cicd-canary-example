## CI/CD CDK Canary Pipeline Example

### Installation

#### MacOS or Linux

If you are using MacOS, you can install the prerequisites by running the following command in your preferred terminal or also on Linux using [homebrew for Linux](https://docs.brew.sh/Homebrew-on-Linux):

```bash
brew install node
brew install git-remote-codecommit
brew install ruby brew-gem
brew-gem install cfn-nag
```

#### Deploy the CodePipeline stack

Add your accounts to the `cdk/lib/stages.ts` file. Run `cdk bootstrap` for each account if they haven't been bootstrapped yet. Then run `cdk deploy` to deploy the CodePipeline stack. This creates the repository and pipeline. The Lambdas, API GW and canary resources won't be deployed until changes are pushed to the repository.

#### Set up remote CodeCommit Repository and branch

After successful deployment of CodePipeline stack, you should see the newly created CodeCommit repository and CodePipeline.

You can set up remote origin by running the following commands:

First remove `.git` and recreate.
```
rm -rf .git
git init
```

Then setup git to track the CodeCommit Repository created by CDK.
```
RepoName=$(aws --profile alpha_us-west-2 cloudformation describe-stacks --stack-name CodePipelineStack --query "Stacks[0].Outputs[?OutputKey=='RepositoryName'].OutputValue" --output text)
echo "${RepoName}"

git remote add origin codecommit://alpha_us-west-2@${RepoName}
git checkout -b main
```

Create an initial commit and push the change to get the pipeline going.
```
git add .
git commit -m "Initial commit"
git push origin main
```

This will trigger the pipeline to build and deploy changes. The canaries won't be deployed yet since there are no API GW urls. After the Lambda and API GW is deployed, you can add the API GW urls to `cdk/lib/stages.ts` and push the change to create the canaries. Note that I saw issues creating the canary alarm in the service account in the initial deployment. Even though the SLR is a dependency of the alarm, the alarm couldn't be created right after creating the SLR. So you might have to comment out the alarm and deploy the SLR first.