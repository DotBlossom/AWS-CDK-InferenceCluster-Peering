import autoscaling = require("aws-cdk-lib/aws-autoscaling");
import ec2 = require("aws-cdk-lib/aws-ec2");
import ecs = require("aws-cdk-lib/aws-ecs");
import cdk = require("aws-cdk-lib");

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';


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

    // Sample CUDA RUN -test용
    /*
    const gpuTaskDefinition = new ecs.Ec2TaskDefinition(this, "gpu-task");
    gpuTaskDefinition.addContainer("gpu", {
      essential: true,
      image: ecs.ContainerImage.fromRegistry("nvidia/cuda:12.3.1-base-centos7"),
      memoryLimitMiB: 80,
      cpu: 100,
      gpuCount: 1,
      command: ["sh", "-c", "nvidia-smi && sleep 3600"],
      logging: new ecs.AwsLogDriver({
        streamPrefix: "gpu-service",
        logRetention: 1,
      }),
    });
    */
    
    // ECS Task Role 정의 for invokeLambda
    const ecsTaskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    
    // ECS Task Definition에 Task Role 연결
    const gpuTaskDefinitionInReal = new ecs.Ec2TaskDefinition(this, "gpu-task-real", { // task definition 이름 변경
      taskRole: ecsTaskRole,
    });

    // realRunner
    gpuTaskDefinitionInReal.addContainer("gpu", {
      essential: true,
      image: ecs.ContainerImage.fromRegistry("claudeluxpair/flask-inference-cluster:latest"), // 이미지 이름 변경
      memoryLimitMiB: 80,
      cpu: 100,
      gpuCount: 1,
      command: ["sh", "-c", "nvidia-smi && sleep 3600"], // 필요에 따라 command 수정
      logging: new ecs.AwsLogDriver({
        streamPrefix: "gpu-service",
        logRetention: 1,
      }),
    });

    // Request ECS to launch the task onto the fleet
    new ecs.Ec2Service(this, "gpu-service", {
      cluster,
      desiredCount: 2,
      // Service will automatically request capacity from the
      // capacity provider
      capacityProviderStrategies: [
        {
          capacityProvider: capacityProvider.capacityProviderName,
          base: 0,
          weight: 1,
        },
      ],
      taskDefinition: gpuTaskDefinitionInReal, // real task definition 사용
    });


    // Lambda 함수에 대한 IAM 역할 생성
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      });
      
      lambdaRole.addToPolicy(new iam.PolicyStatement({
        actions: ['ssm:SendCommand', 'ssm:StartSession'],
        resources: ['*'], // 모든 EC2 인스턴스에 대한 권한 허용
      }));
      
      // Bedrock API 호출 권한 추가
      lambdaRole.addToPolicy(new iam.PolicyStatement({
        actions: ['bedrock:*'], // Bedrock API에 대한 모든 권한 허용
        resources: ['*'], // 모든 리소스에 대한 권한 허용
      }));

    // Lambda 함수 생성
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda-code'),
        vpc: vpc,
        role: lambdaRole, // IAM 역할 연결
        // allowPublicSubnet: true, // public subnet에 배포 (VPC 엔드포인트를 사용하는 경우 필요하지 않음)
      });

    // 람다 함수 호출 권한 추가
    ecsTaskRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [lambdaFunction.functionArn], // 람다 함수 ARN으로 제한
    }));
    
      
      
    // *********보안 그룹*********
    const ec2SecurityGroup = asg.connections.securityGroups[0];
    const lambdaSecurityGroup = lambdaFunction.connections.securityGroups[0]; // lambda security group 가져오기
      
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
  }
}
