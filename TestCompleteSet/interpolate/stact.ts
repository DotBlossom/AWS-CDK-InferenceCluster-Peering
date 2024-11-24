const role = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::<계정 ID>:role/<역할 이름>'); 

role.addToPolicy(new iam.PolicyStatement({
  actions: [
    'autoscaling:DeleteAutoScalingGroup',
    'autoscaling:UpdateAutoScalingGroup',
    'autoscaling:DeleteLaunchConfiguration',
    'ec2:TerminateInstances',
  ],
  resources: ['*'], 
}));

const inferAsg = new AutoScalingGroup(this, "inferFleet", {
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
  vpc,
  machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
  maxCapacity: 2,
  role: role, 
});
