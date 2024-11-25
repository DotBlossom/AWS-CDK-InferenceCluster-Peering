
// IAM Roles
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
