import boto3

# Lambda 클라이언트 생성
lambda_client = boto3.client('lambda')

def invoke_lambda(event):
    """
    Lambda 함수를 호출하는 함수

    Args:
        event (dict): Lambda 함수에 전달할 이벤트 데이터

    Returns:
        dict: Lambda 함수의 응답
    """
    response = lambda_client.invoke(
        FunctionName='your-lambda-function-name',  # Lambda 함수 이름 또는 ARN
        InvocationType='RequestResponse',  # 동기 호출
        Payload=json.dumps(event)  # 이벤트 데이터 (JSON 형식)
    )

    # Lambda 함수의 응답 처리
    response_payload = response['Payload'].read().decode('utf-8')
    return json.loads(response_payload)

# Flask 웹 서버 예시
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/invoke', methods=['POST'])
def invoke_lambda_route():
    event = request.get_json()
    response = invoke_lambda(event)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
