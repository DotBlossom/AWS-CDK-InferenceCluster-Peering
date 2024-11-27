"certificateArn": 
    "hostedZoneId":
    "mongoUrl": ",


### 람다에 패키지 배포하려면 그냥 -t로 다운받아서 같이 올려주자 test완
    
![fafafafaf](https://github.com/user-attachments/assets/62c1acf8-2010-40e7-a6c6-b300d7d44cf2)





    #!/usr/bin/env node
    import * as cdk from 'aws-cdk-lib';
    import { CdkTestStack } from '../lib/cdk-test-stack';
    import { LambdaRelStack } from '../lib/lambda-rel-stack';
    
    const app = new cdk.App();
    const parent_cdk = new CdkTestStack(app, 'CdkTestStack', {
      env: {account: '', region: 'ap-northeast-2'} 
    });
    
    new LambdaRelStack(app, 'LambdaRelStack', { 
      env: {account: '', region: 'ap-northeast-2'}, 
      vpc: parent_cdk.vpc, 
    });
