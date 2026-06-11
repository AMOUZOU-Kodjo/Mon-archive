import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let client = null;

function getClient() {
  if (!client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export function getBucket() {
  return process.env.R2_BUCKET || 'mon-archive';
}

export function getPublicUrl(key) {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  return `${process.env.R2_ACCOUNT_ID}.r2.dev/${getBucket()}/${key}`;
}

export async function uploadToR2(buffer, key, mimeType = 'application/octet-stream') {
  const cmd = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });
  await getClient().send(cmd);
  return getPublicUrl(key);
}

export async function deleteFromR2(key) {
  const cmd = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getClient().send(cmd);
}

export const isProduction = () => process.env.NODE_ENV === 'production';
