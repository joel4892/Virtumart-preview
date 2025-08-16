import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get('/', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const user = (req as any).user as { userId: string };
	const me = await prisma.user.findUnique({ where: { id: user.userId }, include: { organization: true } });
	if (!me) return res.status(404).json({ error: 'User not found' });
	const projects = await prisma.project.findMany({ where: { organizationId: me.organizationId } });
	res.json({ projects });
});

const createSchema = z.object({ name: z.string().min(1) });

projectsRouter.post('/', requireRole(['ADMIN']), async (req, res, next) => {
	try {
		const body = createSchema.parse(req.body);
		const user = (req as any).user as { userId: string };
		const me = await prisma.user.findUnique({ where: { id: user.userId } });
		if (!me) return res.status(404).json({ error: 'User not found' });
		const project = await prisma.project.create({ data: { name: body.name, organizationId: me.organizationId } });
		res.json({ project });
	} catch (err) {
		next(err);
	}
});