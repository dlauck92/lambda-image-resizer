# Lambda Image Resizer

This project is an AWS Lambda function that automatically resizes images uploaded to an S3 bucket. When an image is uploaded to the `images/` folder in the bucket, the function resizes it into multiple sizes and uploads the resized images to corresponding prefixes (`thumbnails/`, `medium/`, and `large/`).

## Features
- Automatically resizes images to predefined dimensions.
- Uses the `sharp` library for image processing.
- Uploads resized images to S3 with organized prefixes.

---

## Setup Instructions

### 1. Install Dependencies
To ensure compatibility with the AWS Lambda runtime (`linux-x64`), install `sharp` with the following command:
```bash
npm install --os=linux --cpu=x64 sharp
```

### 2. Configure IAM Role Permissions
Ensure the Lambda function's IAM role has the necessary permissions to access and modify objects in the S3 bucket. Attach the following policy to the IAM role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::<bucket-name>/*"
    }
  ]
}
```
Replace `<bucket-name>` with the name of your S3 bucket.

### 3. Deploy the Lambda Function
1. Package the Lambda function:
   ```bash
   zip -r lambda-img-resizer.zip index.js node_modules
   ```
2. Upload the `lambda-img-resizer.zip` file to your Lambda function in the AWS Management Console.

### 4. Configure S3 Trigger
Set up an S3 event notification to trigger the Lambda function when objects are uploaded to the `images/` prefix.

---

## How It Works
1. The Lambda function is triggered when an image is uploaded to the `images/` prefix in the S3 bucket.
2. The function:
   - Fetches the original image from S3.
   - Resizes the image into three sizes:
     - **Thumbnails**: 150px width.
     - **Medium**: 600px width.
     - **Large**: 1200px width.
   - Uploads the resized images to the corresponding prefixes (`thumbnails/`, `medium/`, `large/`).

---

## Troubleshooting

### Issue: `sharp` Not Working in Lambda
- **Error**: `Input file is missing` or `sharp module not found`.
- **Solution**: Ensure `sharp` is installed with the correct platform flags:
  ```bash
  npm install --os=linux --cpu=x64 sharp
  ```

### Issue: Permissions Error
- **Cause**: The Lambda function lacks the necessary permissions to access or upload to S3.
- **Solution**: Ensure the Lambda function's IAM role has the correct permissions (see the IAM policy above).

---

## Code Overview

### Main Function
The function processes the image and uploads resized versions:
```javascript
exports.handler = async (event) => {
  // Fetch image, resize, and upload logic
};
```

### Helper Function
Converts S3 object streams to buffers for compatibility with `sharp`:
```javascript
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};
```

---

## Additional Notes
- The project uses the AWS SDK v3 (`@aws-sdk/client-s3`) for S3 operations.
- Ensure the Lambda runtime is compatible with Node.js 18 or later.

