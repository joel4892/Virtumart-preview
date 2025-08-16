import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken, authenticate } from '../middleware/auth';
import { z } from 'zod';

export const authRouter = Router();

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	organizationId: z.string().optional(),
	role: z.enum(['ADMIN', 'ANNOTATOR', 'VIEWER']).optional()
});

authRouter.post('/signup', async (req, res, next) => {
	try {
		const body = signUpSchema.parse(req.body);
		const existing = await prisma.user.findUnique({ where: { email: body.email } });
		if (existing) return res.status(409).json({ error: 'Email already in use' });
		const hash = await bcrypt.hash(body.password, 10);
		let orgId = body.organizationId;
		if (!orgId) {
			const org = await prisma.organization.create({ data: { name: `${body.email.split('@')[0]}'s Org` } });
			orgId = org.id;
		}
		const user = await prisma.user.create({
			data: {
				email: body.email,
				passwordHash: hash,
				role: (body.role || 'ADMIN') as any,
				organizationId: orgId
			}
		});
		const token = signToken({ userId: user.id, email: user.email, role: user.role as any });
		res.json({ token, user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId } });
	} catch (err) {
		next(err);
	}
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

authRouter.post('/login', async (req, res, next) => {
	try {
		const body = loginSchema.parse(req.body);
		const user = await prisma.user.findUnique({ where: { email: body.email } });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(body.password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = signToken({ userId: user.id, email: user.email, role: user.role as any });
		res.json({ token, user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId } });
	} catch (err) {
		next(err);
	}
});

authRouter.get('/me', authenticate, async (req, res, next) => {
	try {
		const userJwt = (req as any).user as { userId: string };
		const user = await prisma.user.findUnique({ where: { id: userJwt.userId } });
		if (!user) return res.status(404).json({ error: 'Not found' });
		res.json({ user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId } });
	} catch (err) {
		next(err);
	}
});