// lib/pipeline-stack.ts

//import * as cdk from '@aws-cdk/core';
//import s3 = require('@aws-cdk/aws-s3');
//import codepipeline = require('@aws-cdk/aws-codepipeline');
//import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
//import codebuild = require('@aws-cdk/aws-codebuild');

import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { aws_s3 as s3} from 'aws-cdk-lib';
import { aws_codepipeline as codepipeline} from 'aws-cdk-lib';
import { aws_codepipeline_actions as codepipeline_actions} from 'aws-cdk-lib';
import { aws_codebuild as codebuild } from 'aws-cdk-lib';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket");

    // Pipeline creation starts
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket
    });
    //Declare source code as an artifact
    const sourceOutput = new codepipeline.Artifact();
    //Add source stage to pipeline
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub_Source',
          owner: 'Chris-Bergeron',
          repo: 'find-discounts-app',
          branch: 'main',
          output: sourceOutput,
          connectionArn: 'arn:aws:codestar-connections:us-east-1:748870887425:connection/1b2db247-8607-482a-a073-8b537781d5d7'
        })
      ]
    });

    //Declare build output as artifacts
    const buildOutput = new codepipeline.Artifact();
    //Declare a new CodeBuild project
    const buildProject = new codebuild.PipelineProject(this, 'Build', {
      // buildSpec?:
      concurrentBuildLimit: 1,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: artifactsBucket.bucketName
        }
      }
    });
    // Add the build stage to our pipeline
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        })
      ]
    });

    // Deploy stage
    pipeline.addStage({
      stageName: 'Dev',
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'CreateChangeSet',
          templatePath: buildOutput.atPath("packaged.yaml"),
          stackName: 'find-discounts-app',
          adminPermissions: true,
          changeSetName: 'find-discounts-app-dev-changeset',
          runOrder: 1
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: 'Deploy',
          stackName: 'find-discounts-app',
          changeSetName: 'find-discounts-app-dev-changeset',
          runOrder: 2
        })
      ]
    });
  }
}
