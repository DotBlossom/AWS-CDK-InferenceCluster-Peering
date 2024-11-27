def mongo_handler(event, context):
  """
  MongoDB Atlas 연결 테스트 함수

  Args:
    event: AWS Lambda 함수에 전달되는 이벤트 객체
    context: AWS Lambda 함수의 실행 컨텍스트 정보

  Returns:
    dict: MongoDB 연결 테스트 결과를 포함하는 딕셔너리
  """

  # 환경 변수에서 MongoDB URI 가져오기
  mongodb_uri = os.environ['MONGODB_URI']

  try:
    # MongoDB 클라이언트 생성 및 연결 테스트
    client = MongoClient(mongodb_uri,  server_api=ServerApi('1'))
    client.admin.command('ping')  # 연결 확인을 위한 ping 명령어 실행
    client.close()

    return {
      'statusCode': 200,
      'body': 'MongoDB Atlas 연결 테스트 성공!'
    }

  except Exception as e:
    return {
      'statusCode': 500,
      'body': f'MongoDB Atlas 연결 테스트 실패: {str(e)}'
    }
