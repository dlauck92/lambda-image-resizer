const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client();

exports.handler = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    if (!key.startsWith('images/')) {
      console.log('Not an original image, skipping...');
      return;
    }

    // Fetch the original image from S3
    const originalImage = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const imageBuffer = await streamToBuffer(originalImage.Body); // Convert stream to buffer

    // Define sizes for resizing
    const sizes = [
      { width: 150, folder: 'thumbnails/' },
      { width: 600, folder: 'medium/' },
      { width: 1200, folder: 'large/' },
    ];

    // Resize and upload images
    await Promise.all(
      sizes.map(async (size) => {
        const resizedImage = await sharp(imageBuffer) // Use the buffer here
          .resize(size.width)
          .toBuffer();

        const newKey = key.replace('images/', size.folder);

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: newKey,
            Body: resizedImage,
            ContentType: 'image/jpeg',
          })
        );

        console.log(`Resized image uploaded to ${newKey}`);
      })
    );

    console.log('Image resizing completed.');
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

// Helper function to convert stream to buffer
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};