import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CdkTestStack} from './cdk-test-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'node:path';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

interface CdkTestStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
}
  
export class LambdaRelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: CdkTestStackProps) {
    super(scope, id, props);
    
    
    // construct MetaData in AWS
    const certificateArn = this.node.tryGetContext('certificateArn');
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
    const hostedZoneId = this.node.tryGetContext('hostedZoneId');

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId, // Hosted Zone ID로 변경
      zoneName: 'dotblossom.today',
    });

      
    // Creation Obj contained importd props of VPC 
    const vpc = props?.vpc;
    
    // Lambda 함수에 대한 IAM 역할
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),// Bedrock 접근 권한 추가
      ]
    });

    // Lambda 함수 생성
    const myLambdaFunction = new lambda.Function(this, 'myLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      vpc: vpc
    });

    const lambdaApi =new apigateway.LambdaRestApi(this, 'LambdaApi', {
        handler: myLambdaFunction,
        proxy: false,
        defaultCorsPreflightOptions : {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        },
    });
    // 도메인 이름 설정
    // Lambda 함수와 API Gateway 통합
    const lambdaIntegration = new apigateway.LambdaIntegration(myLambdaFunction);
    const lambdaResource = lambdaApi.root
      .addResource('api')
      .addResource('lambda');

    lambdaResource.addMethod('GET', lambdaIntegration); // GET 메서드 추가

    // 도메인 이름 설정
    const domainName = new apigateway.DomainName(this, 'DomainName', {
      domainName: 'lambda.dotblossom.today',
      certificate: certificate,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
      endpointType: apigateway.EndpointType.REGIONAL,
    });

    // API 매핑 생성
    new apigateway.BasePathMapping(this, 'BasePathMapping', {
      domainName: domainName,
      restApi: lambdaApi,
    });

    // ... (Lambda 함수의 리소스 정책 추가 - 필요에 따라 수정)

    // Route 53 A 레코드 생성
    new route53.ARecord(this, 'lambdaRecord', {
      recordName: 'lambda',
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(domainName)),
    });


   // Lambda 함수의 리소스 정책 추가
    myLambdaFunction.addPermission('AllowAPIGatewayInvoke', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    sourceArn: lambdaApi.arnForExecuteApi('GET','/api/lambda', 'prod') // API Gateway 실행 ARN
  });



    new cdk.CfnOutput(this, 'LambdaFunctionName' , {
      value: myLambdaFunction.functionName,
      description: 'runnerLambda'
    });

    new cdk.CfnOutput(this, 'vpcConfig' , {
        value: vpc?.vpcId || 'none'

    });
  }
}
