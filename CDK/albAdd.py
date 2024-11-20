import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

class ECSCluster extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CloudFormation yaml로 만든 VPCID 에서 가져옴. 추가 필요
    const vpc = new ec2.Vpc(this, "MyVpc", { maxAzs: 2 });

    // Autoscaling group that will launch a fleet of instances that have GPU's
    const asg = new autoscaling.AutoScalingGroup(this, "MyFleet", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.G3,
        ec2.InstanceSize.XLARGE4
      ),
      machineImage: ec2.MachineImage.fromSsmParameter(
        "/aws/service/ecs/optimized-ami/amazon-linux-2/gpu/recommended/image_id"
      ),
      vpc,
      maxCapacity: 10,
    });

    const cluster = new ecs.Cluster(this, "EcsCluster", { vpc });
    const capacityProvider = new ecs.AsgCapacityProvider(
      this,
      "AsgCapacityProvider",
      { autoScalingGroup: asg }
    );
    cluster.addAsgCapacityProvider(capacityProvider);

    // ECS Task Role 정의 for invokeLambda
    const ecsTaskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // ECS Task Definition에 Task Role 연결
    const gpuTaskDefinitionInReal = new ecs.Ec2TaskDefinition(this, "gpu-task-real", {
      taskRole: ecsTaskRole,
    });

    // realRunner
    const gpuContainer = gpuTaskDefinitionInReal.addContainer("gpu", {
      essential: true,
      image: ecs.ContainerImage.fromRegistry("claudeluxpair/flask-inference-cluster:latest"),
      memoryLimitMiB: 80,
      cpu: 100,
      gpuCount: 1,
      command: ["sh", "-c", "nvidia-smi && sleep 3600"],
      logging: new ecs.AwsLogDriver({
        streamPrefix: "gpu-service",
        logRetention: 1,
      }),
    });

    // 컨테이너 포트 매핑
    gpuContainer.addPortMappings({
      containerPort: 5000, 
      hostPort: 5000, 
    });

    // ECS 서비스 생성
    const ecsService = new ecs.Ec2Service(this, "gpu-service", {
      cluster,
      desiredCount: 2,
      capacityProviderStrategies: [
        {
          capacityProvider: capacityProvider.capacityProviderName,
          base: 0,
          weight: 1,
        },
      ],
      taskDefinition: gpuTaskDefinitionInReal,
    });

    // *** Application Load Balancer 생성 ***
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true, 
    });

    // 리스너 생성
    const listener = alb.addListener('Listener', {
      port: 80, 
    });

    // 타겟 그룹 생성
    const targetGroup = listener.addTargets('TargetGroup', {
      port: 5000,
      targets: [ecsService],
      healthCheck: {
        path: '/',
      },
    });

    // Lambda 함수에 대한 IAM 역할 생성
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['ssm:SendCommand', 'ssm:StartSession'],
      resources: ['*'], 
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:*'], 
      resources: ['*'],
    }));

    // Lambda 함수 생성
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda-code'),
      vpc: vpc,
      role: lambdaRole,
    });

    // 람다 함수 호출 권한 추가
    ecsTaskRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [lambdaFunction.functionArn],
    }));

    // *********보안 그룹*********
    const ec2SecurityGroup = asg.connections.securityGroups[0];
    const lambdaSecurityGroup = lambdaFunction.connections.securityGroups[0]; 

    ec2SecurityGroup.addIngressRule(lambdaSecurityGroup, ec2.Port.tcp(443), 'Allow HTTPS traffic from Lambda function');

    // ********* EOL *********

    // VPC 엔드포인트 생성 (Bedrock API의 경우 필요)
    const bedrockEndpoint = vpc.addInterfaceEndpoint('BedrockEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.BEDROCK,
    });

    // VPC Endpoint Policy 설정
    bedrockEndpoint.addToPolicy(new iam.PolicyStatement({
      principals: [new iam.AnyPrincipal()],
      actions: ['bedrock:*'],
      resources: ['*'],
      conditions: {
        ArnEquals: {
          'aws:SourceVpcEndpoint': bedrockEndpoint.vpcEndpointId,
        },
      },
    }));

    // Lambda 함수에 VPC 엔드포인트 연결
    lambdaFunction.connections.allowToInterfaceEndpoint(bedrockEndpoint, ec2.Port.tcp(443));

    // 출력
    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: alb.loadBalancerDnsName });
  }
}
