
// IAM Roles Provider
const asgRole = new iam.Role(this, 'asgRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('   
        AmazonEC2FullAccess'),
      ]
    });
const inferAsg = new AutoScalingGroup(this, "inferFleet", {
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
  vpc,
  machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
  maxCapacity: 2,
  role: asgRole, 
});



// 공통 도메인 ACM 

const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:region:account-id:certificate/certificate-id'); 

    // ALB 생성
const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
vpc: vpc, 
internetFacing: true, 
    });

    // HTTPS 리스너 생성
const listener = alb.addListener('Listener', {
port: 443,
certificates: [certificate], });
