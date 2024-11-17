import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BedrockLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC 및 서브넷 정의 (기존 VPC 및 서브넷 불러와야함)
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    const subnet = vpc.privateSubnets[0];

    // 람다 실행 역할 정의
    const lambdaRole = new iam.Role(this, 'BedrockLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // Bedrock 접근 권한 부여
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'));

    // 람다 함수 정의
    const bedrockLambda = new lambda.Function(this, 'BedrockLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler', // 람다 핸들러 함수 이름
      code: lambda.Code.fromAsset('lambda_code'), // 람다 코드 위치
      vpc,
      vpcSubnets: { subnets: [subnet] },
      role: lambdaRole,
    });

    // VPC 엔드포인트 정의 (Bedrock용)
    const vpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'BedrockVpcEndpoint', {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.BEDROCK,
      privateDnsEnabled: true,
      subnets: { subnets: [subnet] },
    });

    // 람다 함수에서 VPC 엔드포인트 사용 설정, BEDROCK은 내 VPC엔 없잖아 ㅎㅎ 
    bedrockLambda.addEnvironment('BEDROCK_ENDPOINT', vpcEndpoint.vpcEndpointId);
  }
}
