import { randomUUID } from 'node:crypto';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { getS3Client, requireBucket } from '../config/s3';
import { BadRequestError, NotFoundError } from '../utils/errors';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const extensionFor = (contentType: string): string => {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'bin';
  }
};

interface PresignArgs {
  userId: string;
  contentType: string;
  size: number;
}

export const presignUpload = async ({ userId, contentType, size }: PresignArgs) => {
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new BadRequestError('Unsupported contentType');
  }
  if (size != null && size > env.UPLOAD_MAX_SIZE_BYTES) {
    throw new BadRequestError('File exceeds maximum size');
  }

  const bucket = requireBucket();
  const s3 = getS3Client();
  const ext = extensionFor(contentType);
  const key = `uploads/${userId}/${Date.now()}-${randomUUID()}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });
  const uploadUrl = await getSignedUrl(s3, cmd, {
    expiresIn: env.UPLOAD_PRESIGN_TTL_SECONDS,
  });

  const asset = await prisma.asset.create({
    data: {
      userId,
      bucket,
      key,
      contentType,
      size,
      status: 'PENDING',
    },
  });

  return {
    assetId: asset.id,
    uploadUrl,
    key,
    bucket,
    expiresIn: env.UPLOAD_PRESIGN_TTL_SECONDS,
    requiredHeaders: { 'Content-Type': contentType },
  };
};

interface ConfirmArgs {
  userId: string;
  assetId: string;
}

export const confirmUpload = async ({ userId, assetId }: ConfirmArgs) => {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.userId !== userId) {
    throw new NotFoundError('Asset not found');
  }

  const s3 = getS3Client();
  let size: number | undefined;
  let contentType: string | undefined;
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: asset.bucket, Key: asset.key }));
    size = head.ContentLength;
    contentType = head.ContentType;
  } catch {
    throw new BadRequestError('Upload not found in storage');
  }

  if (size != null && size > env.UPLOAD_MAX_SIZE_BYTES) {
    throw new BadRequestError('Uploaded file exceeds maximum size');
  }
  if (contentType && contentType !== asset.contentType) {
    throw new BadRequestError('Uploaded file content type does not match the presigned request');
  }

  const updated = await prisma.asset.update({
    where: { id: asset.id },
    data: {
      status: 'UPLOADED',
      uploadedAt: new Date(),
      size: size ?? asset.size,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    size: updated.size,
    contentType: updated.contentType,
    uploadedAt: updated.uploadedAt,
  };
};

// Called by the food analysis path; must return null when disabled so the
// existing imageUrl path keeps working unchanged.
export const getAssetForUser = async (userId: string, assetId: string) => {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.userId !== userId) {
    throw new NotFoundError('Asset not found');
  }
  if (asset.status !== 'UPLOADED') {
    throw new BadRequestError('Asset upload is not yet confirmed');
  }
  return asset;
};

// Short-lived signed URL so the AI provider can fetch the object.
export const getAssetReadUrl = async (asset: { bucket: string; key: string }): Promise<string> => {
  const s3 = getS3Client();
  const cmd = new GetObjectCommand({ Bucket: asset.bucket, Key: asset.key });
  return getSignedUrl(s3, cmd, { expiresIn: env.UPLOAD_PRESIGN_TTL_SECONDS });
};
