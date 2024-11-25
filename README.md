# AWS_CloudFormation_EKS_GPU-Lambda_set

### CloudFormation Temlpate + CDK 
    -CF로 VPC및 subnet을 yml로 간단히 재사용할 수 있게 구성.
    -동시에, CDK로 GPU inference / flask + Cuda Setting + Lambda(bedrock caller) Role까지 구축

### Add
    -mongodb atlas - pairing
    -Lambda, API endPoint, Bedlock - later (이거하려고 함)
    -ASG 권한주기
    -Peering 병합

## 분리안하고 혼자 이해하기 위한 쓰레기 atlas Peering , Regional API Gateway to Lambda


![sssc drawio](https://github.com/user-attachments/assets/09031b17-c41f-4869-850b-d5fa5152b2c2)

    - VPC2--AtlasVPC 피어링으로 인해, 람다를 VPC2에 종속 시킴
    - EKS에서 Region단위로 호출 할 수있게 APIGateway-Lambda 종속 (BOTO3)
    - Lambda는 DB와 Peering 되어있기 떄문에, Boto로 그냥 Python 코드로 바로 Json, Vector 저장 Schema 적용

### Next
    - EKS VPC -- ECS VPC Peering 전략 


### 임시 (no privateLink : spec - vpcEndpoint)

![12 drawio (1)](https://github.com/user-attachments/assets/d093e962-2ede-4760-9a72-837fd57bdfc4)



    - target Group이 ASG (2-AZ)임. 그래서 ALB는 AZ 부하분산, ASG check를 함.
    - target Group을 2 - Diff-pvs-ASG로 나누었고, 리스너 경로 기반 라우팅을 함.
    - VPC peering을 하지만, EKS나 ECS 설계나 둘다 요청은 alb를 통해 받는 구조

### eks 메모장 (이제안씀)



### ALB OIDC Provider
    - 기존 ALB 과정에서 생성한 OIDC에서 ,Cognito를 적용하거나 (더 직관적 UI)
        -- https://aws.amazon.com/ko/blogs/aws/built-in-authentication-in-alb/
    - OR LB DNS나 따로 매핑된 DNS로, AWS cognito에서 ALB를 연동하여 LoadBalancer에서 인증,인가를 간단히 처리

### API gateway + ALB
    1. ALB를 Private API Gateway 앞에 배치
    
    -리스너 설정: ALB에 리스너를 추가하고, private API Gateway의 엔드포인트를 타겟 그룹으로 설정
    -보안 그룹 설정: ALB와 API Gateway의 보안 그룹을 설정
    
    api_gateway_url = "https://{api-id}.execute-api.{region}.amazonaws.com/{stage-name}/bedrock/Query/Selector"  


### Strimzi in EKS
    -Spring Kafka Image(yml로 Deploy 작성)와, Strimzi Helm 설치 + Kafka.yml로 Provision 가능한 Kafka Cluster 자동 인식 및 구축.


