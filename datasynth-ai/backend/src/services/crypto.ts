import crypto from 'crypto';
import { env } from '../config/env';

const ALGO = 'aes-256-gcm';

export function encryptBuffer(buffer: Buffer): { iv: Buffer; authTag: Buffer; ciphertext: Buffer } {
	if (!env.encryption.dataKey) return { iv: Buffer.alloc(0), authTag: Buffer.alloc(0), ciphertext: buffer };
	const key = Buffer.from(env.encryption.dataKey.padEnd(32, '0').slice(0, 32));
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGO, key, iv);
	const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return { iv, authTag, ciphertext };
}

export function decryptBuffer(iv: Buffer, authTag: Buffer, ciphertext: Buffer): Buffer {
	if (!env.encryption.dataKey) return ciphertext;
	const key = Buffer.from(env.encryption.dataKey.padEnd(32, '0').slice(0, 32));
	const decipher = crypto.createDecipheriv(ALGO, key, iv);
	decipher.setAuthTag(authTag);
	return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}