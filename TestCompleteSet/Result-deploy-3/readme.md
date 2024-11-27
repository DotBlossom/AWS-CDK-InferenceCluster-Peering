    "certificateArn": 
    "hostedZoneId": 
context



const parent_cdk = new CdkTestStack(app, 'CdkTestStack', {
  env: {account: 'a', region: 'ap-northeast-2'}
});

new LambdaRelStack(app, 'LambdaRelStack', {
  env: {account: 'a', region: 'ap-northeast-2'},
  vpc: parent_cdk.vpc,
});
