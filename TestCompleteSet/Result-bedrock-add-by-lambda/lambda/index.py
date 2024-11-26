import boto3
import json
from botocore.exceptions import ClientError


client = boto3.client("bedrock-runtime", region_name="ap-northeast-2")
# Set the model ID, e.g., Claude 3 Haiku.
model_id = "anthropic.claude-3-haiku-20240307-v1:0"

def handler(event, context):

    user_message = "do you know wooseok jung?"
    conversation = [
        {
            "role": "user",
            "content": [{"text": user_message}],
        }
    ]

    try:
        # Send the message to the model, using a basic inference configuration.
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
        )

        # Extract and print the response text.
        response_text = response["output"]["message"]["content"][0]["text"]
        print(response_text)

    except (ClientError, Exception) as e:
        print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
        exit(1)



    # 결과 반환
    return {
        'statusCode': 200,
        'body': json.dumps({
            'user_msg' : user_message,
            'response_text': response_text
        })
    }
    
    
    
    
    
