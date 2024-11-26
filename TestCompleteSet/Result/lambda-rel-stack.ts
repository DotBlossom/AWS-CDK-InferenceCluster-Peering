import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CdkClusterStack } from './cdk-cluster-stack';
import * as path from 'node:path';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface LambdaRelStackProps extends cdk.StackProps {
  vpcStack: CdkClusterStack,
}


export class LambdaRelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: LambdaRelStackProps) {
    super(scope, id, props);
    
    
    // construct MetaData in AWS
    const certificateArn = this.node.tryGetContext('certificateArn');
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
    
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z01387753FNW1ZQQXCSNU', // Hosted Zone ID로 변경
      zoneName: 'dotblossom.today',
    });

    const domainName = new apigateway.DomainName(this, 'DomainName', {
      domainName: 'dotblossom.today',
      certificate: certificate,
      endpointType: apigateway.EndpointType.REGIONAL, 
    });
    
    
    // Creation Obj contained importd props of VPC 
    const vpc = props?.vpcStack.vpc;
    
    // Lambda 함수에 대한 IAM 역할
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess') // Bedrock 접근 권한 추가
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
        }
    });


   // Lambda 함수의 리소스 정책 추가
    myLambdaFunction.addPermission('AllowAPIGatewayInvoke', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    sourceArn: lambdaApi.arnForExecuteApi('GET','/*', 'prod') // API Gateway 실행 ARN
  });
  
    const lambdaResource = lambdaApi.root
                                  .addResource('api')
                                  .addResource('lambda')
                                  .addMethod('GET');
        // 4. API Gateway에 기본 경로 매핑
    new apigateway.BasePathMapping(this, 'BasePathMapping', {
      domainName: domainName, // 이전에 생성한 apigateway.DomainName 객체
      restApi: lambdaApi, 
    });
    

        // 5. Route 53에 CNAME 레코드 생성
    new route53.CnameRecord(this, 'CnameRecord', {
      zone: hostedZone, // 이전에 가져온 route53.HostedZone 객체
      recordName: 'lambda', // 필요에 따라 변경 가능 (예: 'www', 'api')
      domainName: domainName.domainNameAliasDomainName, // apigateway.DomainName 객체의 Alias Domain Name
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName' , {
      value: myLambdaFunction.functionName,
      description: 'runnerLambda'
    });
  }
}

    /*
    // API Gateway 생성
    const api = new apigw.RestApi(this, 'lambdaApi', {
      restApiName: 'Lambda API',
      defaultCorsPreflightOptions: { 
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
      } // CORS 설정 추가
    });
    */

    /*
    // Lambda 함수와 API Gateway 통합
    const integration = new apigw.LambdaIntegration(myLambda, {
      proxy: false,
      requestTemplates: {
        'application/json': '{ "statusCode": "200" }'
      }
    });

    */


/*

import { LambdaStack } from './lambda-rel-stack';

export class CdkClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Lambda 스택 생성
    const lambdaStack = new LambdaStack(this, 'LambdaStack');
    
    
    
    // test
    new cdk.CfnOutput(this, 'LambdaApiUrl', {
      value: lambdaStack.api.url,
    });
  }
}

*/
