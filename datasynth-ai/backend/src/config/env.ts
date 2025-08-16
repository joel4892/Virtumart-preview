export type StorageProvider = 'LOCAL' | 'S3';

export const env = {
	port: Number(process.env.PORT || 4000),
	jwtSecret: process.env.JWT_SECRET || 'change_me',
	bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
	databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/datasynth',
	storageProvider: (process.env.STORAGE_PROVIDER || 'LOCAL') as StorageProvider,
	localStoragePath: process.env.LOCAL_STORAGE_PATH || 'storage',
	s3: {
		region: process.env.S3_REGION || '',
		bucket: process.env.S3_BUCKET || '',
		accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
	},
	ai: {
		openaiApiKey: process.env.OPENAI_API_KEY || '',
		hfApiToken: process.env.HUGGINGFACE_API_TOKEN || ''
	},
	encryption: {
		dataKey: process.env.DATA_ENCRYPTION_KEY || ''
	},
	stripe: {
		secretKey: process.env.STRIPE_SECRET_KEY || ''
	},
	metrics: {
		enabled: (process.env.METRICS_ENABLED || 'true') === 'true'
	}
};