import { NextFunction, Request, Response } from 'express';

export function requireRole(allowed: Array<'ADMIN' | 'ANNOTATOR' | 'VIEWER'>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user as { role?: string };
		if (!user || !user.role) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		if (!allowed.includes(user.role as any)) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		next();
	};
}