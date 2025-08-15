import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { s3Client } from '../services/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const localStoragePath = path.join(process.cwd(), env.localStoragePath);
if (env.storageProvider === 'LOCAL') {
	if (!fs.existsSync(localStoragePath)) {
		fs.mkdirSync(localStoragePath, { recursive: true });
	}
}

const storage = multer.memoryStorage();

export const upload = multer({ storage });

export async function persistUploadedFile(buffer: Buffer, originalname: string): Promise<{ provider: 'LOCAL' | 'S3'; pathOrKey: string }> {
	const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${originalname}`;
	if (env.storageProvider === 'S3') {
		const key = `uploads/${uniqueName}`;
		await s3Client.send(new PutObjectCommand({
			Bucket: env.s3.bucket,
			Key: key,
			Body: buffer
		}));
		return { provider: 'S3', pathOrKey: key };
	}
	const filePath = path.join(localStoragePath, uniqueName);
	await fs.promises.writeFile(filePath, buffer);
	return { provider: 'LOCAL', pathOrKey: filePath };
}