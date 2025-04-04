# Lambda Image Resizer

A serverless AWS Lambda function that automatically resizes images uploaded to an S3 bucket using the [sharp](https://github.com/lovell/sharp) image processing library.

## Features

- ✅ Resizes images to specified dimensions
- ☁️ Triggered by S3 upload events
- 🧠 Uses the `sharp` library for fast processing
- 🪶 Stores the resized image in a target S3 bucket

---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/dlauck92/lambda-image-resizer.git
cd lambda-image-resizer
```

### 2. Install Dependencies

```bash
npm install
```

---

## ☁️ AWS Configuration

### Step 1: Create IAM Policy

Create a policy that allows access to the source and destination S3 buckets.

#### Example Policy (resize-image-s3-policy.json)

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
      "Resource": [
        "arn:aws:s3:::YOUR_SOURCE_BUCKET_NAME/*",
        "arn:aws:s3:::YOUR_DEST_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Create the Policy

```bash
aws iam create-policy \
  --policy-name ResizeImageS3Policy \
  --policy-document file://resize-image-s3-policy.json
```

---

### Step 2: Create IAM Role for Lambda

Create a trust policy for Lambda:

#### Trust Policy (trust-policy.json)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Create the Role

```bash
aws iam create-role \
  --role-name LambdaImageResizerRole \
  --assume-role-policy-document file://trust-policy.json
```

---

### Step 3: Attach Policy to Role

```bash
aws iam attach-role-policy \
  --role-name LambdaImageResizerRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/ResizeImageS3Policy
```

Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID.

---

### Step 4: Create the Lambda Function

#### Package the Function

```bash
zip -r function.zip .
```

#### Create the Lambda Function

```bash
aws lambda create-function \
  --function-name image-resizer \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/LambdaImageResizerRole \
  --handler index.handler \
  --timeout 10 \
  --memory-size 512 \
  --zip-file fileb://function.zip \
  --environment Variables="{DEST_BUCKET=your-destination-bucket,MAX_WIDTH=800,MAX_HEIGHT=800}"
```

---

### Step 5: Set Up S3 Trigger

1. Go to the **S3 Console**, select your **source bucket**.
2. Go to **Properties** > **Event Notifications**.
3. Create a new event:
   - Event Name: `image-upload`
   - Event Type: `PUT`
   - Prefix: (optional, e.g., `uploads/`)
   - Destination: Lambda Function → `image-resizer`

Make sure Lambda has permission to be invoked by S3. AWS usually prompts for this automatically.

---

## 🧪 Testing

Upload an image to your source S3 bucket:

```bash
aws s3 cp ./example.jpg s3://your-source-bucket/uploads/
```

The resized image will appear in your destination bucket.

---

## 🧾 License

MIT License © [Drew Lauck](https://github.com/dlauck92)
```

---

Let me know if you’d like to automate this with a deployment script or IaC (like Terraform or CloudFormation)!