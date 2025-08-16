import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
	const key = (req.headers['x-api-key'] as string) || '';
	if (!key) return res.status(401).json({ error: 'API key required' });
	const ak = await prisma.apiKey.findUnique({ where: { key } });
	if (!ak || ak.revoked) return res.status(401).json({ error: 'Invalid API key' });
	(req as any).organizationId = ak.organizationId;
	next();
}