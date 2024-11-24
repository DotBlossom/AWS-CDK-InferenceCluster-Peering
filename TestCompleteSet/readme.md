## 로그
    CdkClusterStack | 54/69 | 오전 6:13:51 | CREATE_COMPLETE      | AWS::IAM::InstanceProfile                     | embedFleet/InstanceProfile (embedFleetInstanceProfile79CBD6F4)
    CdkClusterStack | 55/69 | 오전 6:13:52 | CREATE_COMPLETE      | AWS::IAM::InstanceProfile                     | inferFleet/InstanceProfile (inferFleetInstanceProfileDA3609B4)
    CdkClusterStack | 55/69 | 오전 6:13:53 | CREATE_IN_PROGRESS   | AWS::EC2::LaunchTemplate                      | embedFleet/LaunchTemplate (embedFleetLaunchTemplate938DBFB2)
    CdkClusterStack | 55/69 | 오전 6:13:53 | CREATE_IN_PROGRESS   | AWS::EC2::LaunchTemplate                      | inferFleet/LaunchTemplate (inferFleetLaunchTemplate523E6BF8)
    CdkClusterStack | 55/69 | 오전 6:13:54 | CREATE_IN_PROGRESS   | AWS::EC2::LaunchTemplate                      | inferFleet/LaunchTemplate (inferFleetLaunchTemplate523E6BF8) Resource creation Initiated
    CdkClusterStack | 56/69 | 오전 6:13:54 | CREATE_COMPLETE      | AWS::EC2::LaunchTemplate                      | inferFleet/LaunchTemplate (inferFleetLaunchTemplate523E6BF8)
    CdkClusterStack | 56/69 | 오전 6:13:55 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | inferFleet/ASG (inferFleetASGA2E3CF23)
    CdkClusterStack | 56/69 | 오전 6:13:55 | CREATE_IN_PROGRESS   | AWS::EC2::LaunchTemplate                      | embedFleet/LaunchTemplate (embedFleetLaunchTemplate938DBFB2) Resource creation Initiated
    CdkClusterStack | 57/69 | 오전 6:13:56 | CREATE_COMPLETE      | AWS::EC2::LaunchTemplate                      | embedFleet/LaunchTemplate (embedFleetLaunchTemplate938DBFB2)
    CdkClusterStack | 57/69 | 오전 6:13:56 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | inferFleet/ASG (inferFleetASGA2E3CF23) Resource creation Initiated
    CdkClusterStack | 57/69 | 오전 6:13:56 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | embedFleet/ASG (embedFleetASG1ACDC453)
    CdkClusterStack | 57/69 | 오전 6:13:58 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | embedFleet/ASG (embedFleetASG1ACDC453) Resource creation Initiated
    CdkClusterStack | 57/69 | 오전 6:14:05 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | inferFleet/ASG (inferFleetASGA2E3CF23) Eventual consistency check initiated
    CdkClusterStack | 57/69 | 오전 6:14:06 | CREATE_IN_PROGRESS   | AWS::ECS::CapacityProvider                    | inferAsgCapacityProvider/inferAsgCapacityProvider (inferAsgCapacityProvider5E5E5664)
    CdkClusterStack | 57/69 | 오전 6:14:07 | CREATE_IN_PROGRESS   | AWS::ECS::CapacityProvider                    | inferAsgCapacityProvider/inferAsgCapacityProvider (inferAsgCapacityProvider5E5E5664) Resource creation Initiated
    CdkClusterStack | 57/69 | 오전 6:14:07 | CREATE_IN_PROGRESS   | AWS::AutoScaling::AutoScalingGroup            | embedFleet/ASG (embedFleetASG1ACDC453) Eventual consistency check initiated
    CdkClusterStack | 58/69 | 오전 6:14:07 | CREATE_COMPLETE      | AWS::ECS::CapacityProvider                    | inferAsgCapacityProvider/inferAsgCapacityProvider (inferAsgCapacityProvider5E5E5664)
    CdkClusterStack | 58/69 | 오전 6:14:07 | CREATE_IN_PROGRESS   | AWS::ECS::CapacityProvider                    | embedAsgCapacityProvider/embedAsgCapacityProvider (embedAsgCapacityProvider5B0E824E)
    CdkClusterStack | 58/69 | 오전 6:14:08 | CREATE_IN_PROGRESS   | AWS::ECS::CapacityProvider                    | embedAsgCapacityProvider/embedAsgCapacityProvider (embedAsgCapacityProvider5B0E824E) Resource creation Initiated
    CdkClusterStack | 59/69 | 오전 6:14:08 | CREATE_COMPLETE      | AWS::ECS::CapacityProvider                    | embedAsgCapacityProvider/embedAsgCapacityProvider (embedAsgCapacityProvider5B0E824E)
    CdkClusterStack | 60/69 | 오전 6:14:20 | CREATE_COMPLETE      | AWS::AutoScaling::AutoScalingGroup            | inferFleet/ASG (inferFleetASGA2E3CF23)
    CdkClusterStack | 61/69 | 오전 6:14:22 | CREATE_COMPLETE      | AWS::AutoScaling::AutoScalingGroup            | embedFleet/ASG (embedFleetASG1ACDC453)
    CdkClusterStack | 61/69 | 오전 6:14:22 | CREATE_IN_PROGRESS   | AWS::ECS::ClusterCapacityProviderAssociations | ECS-gpu-based/ECS-gpu-based (ECSgpubased10A64F91)
    CdkClusterStack | 61/69 | 오전 6:14:23 | CREATE_IN_PROGRESS   | AWS::ECS::ClusterCapacityProviderAssociations | ECS-gpu-based/ECS-gpu-based (ECSgpubased10A64F91) Resource creation Initiated
    CdkClusterStack | 62/69 | 오전 6:14:25 | CREATE_COMPLETE      | AWS::ElasticLoadBalancingV2::LoadBalancer     | ALB (ALBAEE750D2)
    CdkClusterStack | 62/69 | 오전 6:14:25 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::Listener         | ALB/Listener (ALBListener3B99FF85)
    CdkClusterStack | 62/69 | 오전 6:14:26 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::Listener         | ALB/Listener (ALBListener3B99FF85) Resource creation Initiated
    CdkClusterStack | 63/69 | 오전 6:14:26 | CREATE_COMPLETE      | AWS::ElasticLoadBalancingV2::Listener         | ALB/Listener (ALBListener3B99FF85)
    CdkClusterStack | 63/69 | 오전 6:14:27 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/InferTargetRule (ALBListenerInferTargetRule2D9A5443)
    CdkClusterStack | 63/69 | 오전 6:14:27 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/EmbedTargetRule (ALBListenerEmbedTargetRule6F0F5FA4)
    CdkClusterStack | 63/69 | 오전 6:14:28 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/InferTargetRule (ALBListenerInferTargetRule2D9A5443) Resource creation Initiated
    CdkClusterStack | 63/69 | 오전 6:14:28 | CREATE_IN_PROGRESS   | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/EmbedTargetRule (ALBListenerEmbedTargetRule6F0F5FA4) Resource creation Initiated
    CdkClusterStack | 64/69 | 오전 6:14:28 | CREATE_COMPLETE      | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/InferTargetRule (ALBListenerInferTargetRule2D9A5443)
    CdkClusterStack | 65/69 | 오전 6:14:28 | CREATE_COMPLETE      | AWS::ElasticLoadBalancingV2::ListenerRule     | ALB/Listener/EmbedTargetRule (ALBListenerEmbedTargetRule6F0F5FA4)
    CdkClusterStack | 65/69 | 오전 6:14:29 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | inferService/Service (inferServiceA77FA861)
    CdkClusterStack | 65/69 | 오전 6:14:29 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | embedService/Service (embedService5CDE4C29)
    CdkClusterStack | 65/69 | 오전 6:14:30 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | inferService/Service (inferServiceA77FA861) Resource creation Initiated
    CdkClusterStack | 65/69 | 오전 6:14:30 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | embedService/Service (embedService5CDE4C29) Resource creation Initiated
    CdkClusterStack | 65/69 | 오전 6:14:31 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | inferService/Service (inferServiceA77FA861) Eventual consistency check initiated
    CdkClusterStack | 65/69 | 오전 6:14:31 | CREATE_IN_PROGRESS   | AWS::ECS::Service                             | embedService/Service (embedService5CDE4C29) Eventual consistency check initiated
    CdkClusterStack | 66/69 | 오전 6:14:38 | CREATE_COMPLETE      | AWS::ECS::ClusterCapacityProviderAssociations | ECS-gpu-based/ECS-gpu-based (ECSgpubased10A64F91)
    66/69 Currently in progress: CdkClusterStack, inferServiceA77FA861, embedService5CDE4C29
    CdkClusterStack | 67/69 | 오전 6:15:31 | CREATE_COMPLETE      | AWS::ECS::Service                             | embedService/Service (embedService5CDE4C29)
    CdkClusterStack | 68/69 | 오전 6:16:01 | CREATE_COMPLETE      | AWS::ECS::Service                             | inferService/Service (inferServiceA77FA861)
    CdkClusterStack | 69/69 | 오전 6:16:03 | CREATE_COMPLETE      | AWS::CloudFormation::Stack                    | CdkClusterStack
    
     ✅  CdkClusterStack
    
    ✨  Deployment time: 300.06s
    
    Outputs:
    CdkClusterStack.MyWebServerServiceURL = tt
    Stack ARN: tt


## VPC-Peering-based , ECS Cluster (ALB Routing)

![aafff](https://github.com/user-attachments/assets/02f8a29e-42d7-433b-9376-8984477a3a8e)


## infraposer

![dja](https://github.com/user-attachments/assets/dec6687d-04a7-4ade-b91b-17b47a499544)

