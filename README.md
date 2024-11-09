# AWS_CloudFormation_EKS_GPU-Lambda_set

### Add
    -mongodb atlas - pairing
    -Lambda, API endPoint, Bedlock - later

### ALB OIDC Provider
    - 기존 ALB 과정에서 생성한 OIDC에서 ,Cognito를 적용하거나 (더 직관적 UI)
        -- https://aws.amazon.com/ko/blogs/aws/built-in-authentication-in-alb/
    - OR LB DNS나 따로 매핑된 DNS로, AWS cognito에서 ALB를 연동하여 LoadBalancer에서 인증,인가를 간단히 처리
