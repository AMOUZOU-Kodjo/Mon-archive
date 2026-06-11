import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let client = null;

function getClient() {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.B2_ENDPOINT,
      region: process.env.B2_REGION || 'us-west-002',
      credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export function getBucket() {
  return process.env.B2_BUCKET || 'mon-archive';
}

export function getBaseUrl() {
  // e.g. https://f000.backblazeb2.com/file/mon-archive/
  const endpoint = process.env.B2_ENDPOINT || 'https://s3.us-west-002.backblazeb2.com';
  return `${endpoint}/${getBucket()}/`;
}

export async function uploadToB2(buffer, key, mimeType = 'application/octet-stream') {
  const cmd = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });
  await getClient().send(cmd);
  return `${getBaseUrl()}${key}`;
}

export async function deleteFromB2(key) {
  const cmd = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getClient().send(cmd);
}

export const isProduction = () => process.env.NODE_ENV === 'production';
