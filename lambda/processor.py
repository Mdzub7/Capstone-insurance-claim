import json
import urllib.parse
import boto3
import os

# Initialize clients outside the handler (Best Practice: Connection Reuse)
sqs = boto3.client('sqs')

def lambda_handler(event, context):
    """
    Triggered by S3 when a file is uploaded.
    """
    print("Received event: " + json.dumps(event, indent=2))

    # Get the SQS URL from Environment Variables (We will set this in Terraform)
    queue_url = os.environ['SQS_QUEUE_URL']

    # Loop through records (S3 can send multiple file events at once)
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        # Decode the filename (S3 URL encodes spaces as + or %20)
        key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')

        print(f"Processing file: {key} from bucket: {bucket}")

        # Construct the message for the Worker
        # We are telling the worker: "Hey, go look at this file."
        message_body = {
            "bucket": bucket,
            "key": key,
            "action": "ANALYZE_CLAIM",
            "timestamp": record['eventTime']
        }

        try:
            # Push to SQS
            response = sqs.send_message(
                QueueUrl=queue_url,
                MessageBody=json.dumps(message_body)
            )
            print(f"Message sent to SQS! MessageId: {response['MessageId']}")
            
        except Exception as e:
            print(f"Error sending to SQS: {str(e)}")
            raise e

    return {
        'statusCode': 200,
        'body': json.dumps('File processed successfully')
    }
