const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const S3_BUCKET = process.env.S3_BUCKET;
const AZURE_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
const mode = S3_BUCKET ? 's3' : AZURE_CONN ? 'azure' : 'local';

const uniqueName = (file) =>
  `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`;

let s3;
const getS3 = () => {
  if (!s3) {
    const { S3Client } = require('@aws-sdk/client-s3');
    s3 = new S3Client({ region: process.env.AWS_REGION });
  }
  return s3;
};

let container;
const getContainer = () => {
  if (!container) {
    const { BlobServiceClient } = require('@azure/storage-blob');
    container = BlobServiceClient.fromConnectionString(AZURE_CONN)
      .getContainerClient(process.env.AZURE_STORAGE_CONTAINER || 'uploads');
  }
  return container;
};

async function save(file, folder) {
  const name = uniqueName(file);
  const key = `${folder}/${name}`;
  if (mode === 's3') {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    await getS3().send(new PutObjectCommand({
      Bucket: S3_BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype,
    }));
    return `files/${key}`;
  }
  if (mode === 'azure') {
    const c = getContainer();
    await c.createIfNotExists();
    await c.getBlockBlobClient(key).uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return `files/${key}`;
  }
  fs.mkdirSync('uploads', { recursive: true });
  fs.writeFileSync(path.join('uploads', name), file.buffer);
  return `uploads/${name}`;
}

async function signedUrl(storedPath, seconds = 300) {
  const key = storedPath.replace(/^files\//, '');
  if (mode === 's3') {
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    return getSignedUrl(getS3(), new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: seconds });
  }
  if (mode === 'azure') {
    const { BlobSASPermissions } = require('@azure/storage-blob');
    return getContainer().getBlobClient(key).generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(Date.now() + seconds * 1000),
    });
  }
  throw new Error('No cloud storage configured');
}

module.exports = { save, signedUrl, useS3: mode !== 'local' };