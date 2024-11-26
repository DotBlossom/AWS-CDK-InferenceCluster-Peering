import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';

import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { LambdaRelStack } from './lambda-rel-stack';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';


export class CdkTestStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const certificateArn = this.node.tryGetContext('certificateArn');
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);


    //---------------------------------------------------------------------------
    // VPC
    const vpc = new ec2.Vpc(this, 'cdk-cluster-VPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.4.0.0/16'),
      enableDnsHostnames: true,
      enableDnsSupport: true,

      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'application-2',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      ],
    });

    //---------------------------------------------------------------------------
    // ECS

    // ECS Cluster
    const ecsCluster = new ecs.Cluster(this, 'ECS-gpu-based', {
      vpc: vpc
    });

    // IAM for ASG Config this CDK Executor

    const asgRole = new iam.Role(this, 'asgRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonEc2FullAccess'),
        ]
    });


    const inferAsg = new AutoScalingGroup(this, "inferFleet", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
      vpc,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      maxCapacity: 2,
      role: asgRole,

    })
    inferAsg.connections.securityGroups[0].addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.allTraffic(), 
      'Allow all inbound traffic'
    );

    const embedAsg = new AutoScalingGroup(this, "embedFleet", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
      vpc,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      maxCapacity: 2,
    })
    
    embedAsg.connections.securityGroups[0].addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.allTraffic(), 
      'Allow all inbound traffic'
    );

    const inferCapacityProvider = new ecs.AsgCapacityProvider(
      this,
      "inferAsgCapacityProvider",
      { autoScalingGroup: inferAsg }
    );

    const embedCapacityProvider = new ecs.AsgCapacityProvider(
      this,
      "embedAsgCapacityProvider",
      { autoScalingGroup: embedAsg }
    );

    ecsCluster.addAsgCapacityProvider(inferCapacityProvider);
    ecsCluster.addAsgCapacityProvider(embedCapacityProvider);


    //---------------------------------------------------------------------------
    // Task Definitions

    const createTaskDefinition = (name: string, containerPort: number, subnet: ec2.SubnetSelection, capacityProvider: ecs.AsgCapacityProvider, ver: number) => {
      const taskDefinition = new ecs.Ec2TaskDefinition(this, `${name}TaskDef` ,{

      });

      const container = taskDefinition.addContainer(`${name}Container`, {
        image: ecs.ContainerImage.fromRegistry(`clauderuxpair/my-flask-app-${ver}`),
        logging: ecs.LogDrivers.awsLogs({
                streamPrefix: `${name}Server`,
                logGroup: new logs.LogGroup(this, `${name}LogGroup`, {
                  retention: logs.RetentionDays.INFINITE,
                  removalPolicy: cdk.RemovalPolicy.RETAIN,
                }),
              }),
        memoryLimitMiB: 256,
      });

      container.addPortMappings({
        containerPort: containerPort,
        hostPort: containerPort, 
        protocol: ecs.Protocol.TCP
      });

      const service = new ecs.Ec2Service(this, `${name}Service`, {
        cluster: ecsCluster,
        taskDefinition: taskDefinition,
        healthCheckGracePeriod: cdk.Duration.seconds(600),
        capacityProviderStrategies: [
          {
            capacityProvider: capacityProvider.capacityProviderName,
            base: 1,
            weight: 1,
          },
        ],
        
      });

      return service;
    };

    const inferService = createTaskDefinition('infer', 5000, { 
      subnetGroupName: 'application-1', onePerAz: true, 
      
    }, inferCapacityProvider,1);
    
    const embedService = createTaskDefinition('embed', 5001, { 
      subnetGroupName: 'application-2', onePerAz: true, 
    }, embedCapacityProvider,2);

    // 계층 형성

    //(inferCapacityProvider.node.defaultChild as ecs.CfnCapacityProvider).overrideLogicalId('inferAsgCapacityProvider');
    //(embedCapacityProvider.node.defaultChild as ecs.CfnCapacityProvider).overrideLogicalId('embedAsgCapacityProvider');
    
    // Capacity Provider가 서비스에 의존하도록 설정

    //---------------------------------------------------------------------------

    // ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    const albSecurityGroup = alb.connections.securityGroups[0];
    albSecurityGroup.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.allTraffic(), 'Allow outbound traffic to internal services')

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'dotblossom.today', // Route 53에 등록된 도메인 이름
    });
  
    const aliasRecord = new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
    });

    aliasRecord.node.addDependency(alb);

    // InferTarget 그룹 생성
    const inferTargetGroup = new elbv2.ApplicationTargetGroup(this, 'InferTargetGroup', {
      vpc,
      port: 5000,
      targets: [inferService],
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE, 
      healthCheck: {
        interval: cdk.Duration.seconds(60), // 60초 간격
        path: "/",
        timeout: cdk.Duration.seconds(50),
        unhealthyThresholdCount: 5, // 5번 실패 시 비정상
        healthyThresholdCount: 2, // 2번 성공 시 정상
      }
    
    });

    // EmbedTarget 그룹 생성
    const embedTargetGroup = new elbv2.ApplicationTargetGroup(this, 'EmbedTargetGroup', {
      vpc,
      port: 5001,
      targets: [embedService],
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE, 
      healthCheck: {
        interval: cdk.Duration.seconds(60), // 60초 간격
        path: "/",
        timeout: cdk.Duration.seconds(50),
        unhealthyThresholdCount: 5, // 5번 실패 시 비정상
        healthyThresholdCount: 2, // 2번 성공 시 정상
      }
    });
    /*
    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });
    */

    const listener = alb.addListener('Listener', {
      port : 443,
      certificates: [certificate],
    })

    // **HTTP 리스너를 HTTPS로 리디렉션**
    alb.addListener('HttpListener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        permanent: true,
      }),
    });

    // InferTarget 규칙 추가
    listener.addTargetGroups('InferTarget', {
      targetGroups: [inferTargetGroup],
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/infer', '/infer/*'])],
      
    });

    // EmbedTarget 규칙 추가
    listener.addTargetGroups('EmbedTarget', {
      targetGroups: [embedTargetGroup],
      priority: 2,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/embed', '/embed/*'])]
    });

    listener.addAction('defaultAction', {
      action: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'URL Not Found'
      })
    });
    

    // child Stack Caller
    new LambdaRelStack(this, 'LambdaRelStack');

    new cdk.CfnOutput(this, 'MyWebServerServiceURL', {
        value: `http://${alb.loadBalancerDnsName}`,
      });
  }
}
