import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export const s3Client = new S3Client({
	region: env.s3.region || 'us-east-1',
	credentials: env.s3.accessKeyId && env.s3.secretAccessKey ? {
		accessKeyId: env.s3.accessKeyId,
		secretAccessKey: env.s3.secretAccessKey
	} : undefined
});