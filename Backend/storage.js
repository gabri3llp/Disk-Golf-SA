const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');

const CONNECTION = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'uploads';
const enabled = Boolean(CONNECTION);

const container = enabled
  ? BlobServiceClient.fromConnectionString(CONNECTION).getContainerClient(CONTAINER)
  : null;

let ready = false;
async function ensureContainer() {
  if (ready) return;
  await container.createIfNotExists();
  ready = true;
}

const uniqueName = (file) =>
  `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`;

// Saves an uploaded file and returns the path stored in the database.
async function save(file, folder) {
  const name = uniqueName(file);
  if (enabled) {
    await ensureContainer();
    await container.getBlockBlobClient(`${folder}/${name}`).uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return `files/${folder}/${name}`;
  }
  fs.mkdirSync('uploads', { recursive: true });
  fs.writeFileSync(path.join('uploads', name), file.buffer);
  return `uploads/${name}`;
}

// A short-lived read link for a private file.
async function signedUrl(storedPath, seconds = 300) {
  const blobName = storedPath.replace(/^files\//, '');
  return container.getBlobClient(blobName).generateSasUrl({
    permissions: BlobSASPermissions.parse('r'),
    expiresOn: new Date(Date.now() + seconds * 1000),
  });
}

module.exports = { save, signedUrl, useS3: enabled };