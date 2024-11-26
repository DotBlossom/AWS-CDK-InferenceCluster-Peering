import boto3
import json

def handler(event, context):


    # 간단한 메시지 출력
    print("Lambda 함수가 호출되었습니다!")

    lambda_client = boto3.client("lambda")

    # Use the paginator to list the functions
    paginator = lambda_client.get_paginator("list_functions")

    # 결과 반환
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Lambda 함수가 성공적으로 실행되었습니다!'
        })
    }
