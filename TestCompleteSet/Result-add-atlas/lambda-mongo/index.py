from pymongo import MongoClient
import os
import json

client = MongoClient(host=os.environ["MONGODB_URI"])

def handler(event, context):
    ping_result = client.db.command("ping")
    
    # ping_result에서 Timestamp 객체를 찾아 문자열로 변환합니다.
    if 'ok' in ping_result and ping_result['ok'] == 1.0:
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'MongoDB connection successful'})
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'MongoDB connection failed'})
        }
