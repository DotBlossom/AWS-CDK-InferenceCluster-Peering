import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC get
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      tags: {
        'Name': 'your-vpc-name' // VPC 태그 이름
      }
    });

    const subnetIds = vpc.privateSubnets.map(subnet => subnet.subnetId);

    // Lambda 함수에 대한 IAM 역할
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess') // Bedrock 접근 권한 추가
      ]
    });

    // Lambda 함수 생성
    const myLambda = new lambda.Function(this, 'myLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda-code'),
      role: lambdaRole,
      vpc: vpc,
    });

    // API Gateway 생성
    const api = new apigw.RestApi(this, 'lambdaApi', {
      restApiName: 'Lambda API',
      defaultCorsPreflightOptions: { 
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
      } // CORS 설정 추가
    });
   
    
    // Lambda 함수와 API Gateway 통합
    const integration = new apigw.LambdaIntegration(myLambda, {
      proxy: false,
      requestTemplates: {
        'application/json': '{ "statusCode": "200" }'
      }
    });

    
  // GET 메소드를 경로에 추가
    api.root
    .addResource('api')
    .addResource('lambda')
    .addMethod('GET', integration);
  }
}





export class CdkClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda 스택 생성
    new LambdaStack(this, 'LambdaStack'); 
  }
}




