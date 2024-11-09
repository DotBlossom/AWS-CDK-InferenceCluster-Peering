import json
import boto3

bedrock = boto3.client('bedrock-runtime')

def lambda_handler(event, context):
    # API Gateway에서 전달된 요청 데이터 추출
    request_data = json.loads(event['body'])
    prompt = request_data.get('prompt')

    # Bedrock API 호출 (Claude 3.5)
    response = bedrock.invoke_model(
        modelId="anthropic.claude-v2",
        accept="application/json",
        contentType="application/json",
        body=json.dumps({"prompt": prompt})
    )

    # Bedrock API 응답 처리
    response_body = json.loads(response.get('body').read().decode())

    # 결과 반환
    return {
        'statusCode': 200,
        'body': json.dumps(response_body)
    }
