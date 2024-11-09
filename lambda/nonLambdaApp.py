from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

@app.route('/datacontroller/query/selector', methods=['POST'])
def call_bedrock():
  try:
    # API Gateway 엔드포인트 URL 예시
    api_gateway_url = "https://{api-id}.execute-api.{region}.amazonaws.com/{stage-name}/bedrock/Query/Selector"  

    request_data = request.get_json() 

    # API Gateway 엔드포인트 호출
    response = requests.post(
        api_gateway_url, 
        headers={'Content-Type': 'application/json'}, 
        data=json.dumps(request_data)
    )

    # 응답 처리
    response.raise_for_status()  
    response_data = response.json() 
    return jsonify(response_data)

  
  except requests.exceptions.RequestException as e:
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5006)
