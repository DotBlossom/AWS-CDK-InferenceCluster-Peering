import json
import boto3
from pymongo import MongoClient

def handler(event, context):
    try:
        # Secrets Manager에서 MongoDB Atlas 연결 정보 가져오기
        secrets_client = boto3.client('secretsmanager')
        secret_value = secrets_client.get_secret_value(SecretId='your-secret-id')
        secret_string = json.loads(secret_value['SecretString'])
        MONGODB_URI = secret_string['MONGODB_URI']

        # Bedrock 클라이언트 생성
        bedrock_client = boto3.client('bedrock-runtime')

        # Bedrock Claude Opus 호출
        body = json.dumps({
            "prompt": "\n\nHuman: 안녕하세요.\n\nAssistant:",
            "max_tokens_to_sample": 1024,
            "temperature": 0.7,
            "top_k": 250,
            "top_p": 0.999,
            "stop_sequences": ["\n\nHuman:"]
        })
        response = bedrock_client.invoke_model(body=body, modelId="anthropic.claude-v2")
        response_body = json.loads(response.get('body').read().decode('utf-8'))

        # MongoDB Atlas 클라이언트 생성
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client['your-database-name']
        collection = db['your-collection-name']

        # Bedrock API 호출 결과 JSON 데이터 저장
        collection.insert_one(response_body)

        return {
            'statusCode': 200,
            'body': json.dumps('Data saved to MongoDB Atlas!')
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error saving data to MongoDB Atlas!')
        }
