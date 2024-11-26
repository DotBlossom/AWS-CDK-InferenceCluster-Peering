export class LambdaRelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    
    // construct MetaData in AWS
    const certificateArn = this.node.tryGetContext('certificateArn');
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
    
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: 'dotblossom.today', // Route 53에 등록된 도메인 이름
      });

    // Creation Obj contained importd props of VPC 
    const vpc = props?.
    
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
        },
        domainName: {
            domainName: 'lambda.dotblossom.today',
            certificate: certificate,
            securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
            endpointType:apigateway.EndpointType.REGIONAL,
        }
    });


   // Lambda 함수의 리소스 정책 추가
    myLambdaFunction.addPermission('AllowAPIGatewayInvoke', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    sourceArn: lambdaApi.arnForExecuteApi('GET','/api/lambda', 'prod') // API Gateway 실행 ARN
  });
  
    const lambdaResource = lambdaApi.root
                                  .addResource('api')
                                  .addResource('lambda')
                                  .addMethod('GET');


    new route53.ARecord(this, 'lambdaRecord', {
        recordName: 'lambda', 
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new targets.ApiGateway(lambdaApi)),
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName' , {
      value: myLambdaFunction.functionName,
      description: 'runnerLambda'
    });
  }
}
