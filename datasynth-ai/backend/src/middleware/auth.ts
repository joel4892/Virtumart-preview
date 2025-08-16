import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AuthTokenPayload = {
	userId: string;
	email: string;
	role: 'ADMIN' | 'ANNOTATOR' | 'VIEWER';
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.substring('Bearer '.length);
	try {
		const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
		(req as any).user = decoded;
		return next();
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

export function signToken(payload: AuthTokenPayload) {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}