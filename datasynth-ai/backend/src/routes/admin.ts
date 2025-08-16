import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';
import crypto from 'crypto';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

adminRouter.get('/users', async (_req, res) => {
	const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, organizationId: true, createdAt: true } });
	res.json({ users });
});

const roleSchema = z.object({ role: z.enum(['ADMIN', 'ANNOTATOR', 'VIEWER']) });

adminRouter.patch('/users/:id/role', async (req, res, next) => {
	try {
		const body = roleSchema.parse(req.body);
		const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: body.role as any } });
		res.json({ user });
	} catch (err) {
		next(err);
	}
});

const projectSchema = z.object({ name: z.string().min(1) });

adminRouter.get('/projects', async (req, res) => {
	const me = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
	if (!me) return res.status(404).json({ error: 'User not found' });
	const projects = await prisma.project.findMany({ where: { organizationId: me.organizationId } });
	res.json({ projects });
});

adminRouter.post('/projects', async (req, res, next) => {
	try {
		const body = projectSchema.parse(req.body);
		const me = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
		if (!me) return res.status(404).json({ error: 'User not found' });
		const project = await prisma.project.create({ data: { name: body.name, organizationId: me.organizationId } });
		res.json({ project });
	} catch (err) {
		next(err);
	}
});

adminRouter.get('/apikeys', async (req, res) => {
	const me = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
	if (!me) return res.status(404).json({ error: 'User not found' });
	const keys = await prisma.apiKey.findMany({ where: { organizationId: me.organizationId }, orderBy: { createdAt: 'desc' } });
	res.json({ keys });
});

const createKeySchema = z.object({ label: z.string().min(1) });
adminRouter.post('/apikeys', async (req, res, next) => {
	try {
		const me = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
		if (!me) return res.status(404).json({ error: 'User not found' });
		const { label } = createKeySchema.parse(req.body);
		const key = `ds_${crypto.randomBytes(24).toString('hex')}`;
		const created = await prisma.apiKey.create({ data: { key, label, organizationId: me.organizationId } });
		res.json({ key: created });
	} catch (err) {
		next(err);
	}
});

adminRouter.post('/apikeys/:id/revoke', async (req, res) => {
	const me = await prisma.user.findUnique({ where: { id: (req as any).user.userId } });
	if (!me) return res.status(404).json({ error: 'User not found' });
	const updated = await prisma.apiKey.update({ where: { id: req.params.id }, data: { revoked: true } });
	res.json({ key: updated });
});