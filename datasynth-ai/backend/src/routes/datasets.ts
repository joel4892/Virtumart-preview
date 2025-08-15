import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { upload, persistUploadedFile } from '../middleware/upload';
import { z } from 'zod';

export const datasetsRouter = Router();

datasetsRouter.use(authenticate);

const createSchema = z.object({ name: z.string().min(1), projectId: z.string(), type: z.enum(['TEXT', 'IMAGE']) });

datasetsRouter.post('/', requireRole(['ADMIN', 'ANNOTATOR']), upload.single('file'), async (req, res, next) => {
	try {
		const body = createSchema.parse({ ...req.body, type: req.body.type });
		if (!req.file) return res.status(400).json({ error: 'File is required' });
		const user = (req as any).user as { userId: string };
		const { provider, pathOrKey } = await persistUploadedFile(req.file.buffer, req.file.originalname);
		const dataset = await prisma.dataset.create({
			data: {
				name: body.name,
				type: body.type as any,
				fileKey: pathOrKey,
				storageProvider: provider,
				ownerId: user.userId,
				projectId: body.projectId,
				status: 'ingestion'
			}
		});
		res.json({ dataset });
	} catch (err) {
		next(err);
	}
});

datasetsRouter.get('/', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const user = (req as any).user as { userId: string };
	const me = await prisma.user.findUnique({ where: { id: user.userId } });
	if (!me) return res.status(404).json({ error: 'User not found' });
	const datasets = await prisma.dataset.findMany({
		where: { project: { organizationId: me.organizationId } },
		orderBy: { createdAt: 'desc' }
	});
	res.json({ datasets });
});

const statusSchema = z.object({ status: z.enum(['ingestion', 'annotation', 'compliance', 'export']) });

datasetsRouter.patch('/:id/status', requireRole(['ADMIN', 'ANNOTATOR']), async (req, res, next) => {
	try {
		const body = statusSchema.parse(req.body);
		const dataset = await prisma.dataset.update({ where: { id: req.params.id }, data: { status: body.status } });
		res.json({ dataset });
	} catch (err) {
		next(err);
	}
});

datasetsRouter.get('/:id', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res, next) => {
	try {
		const dataset = await prisma.dataset.findUnique({ where: { id: req.params.id }, include: { reports: true, annotations: true } as any });
		if (!dataset) return res.status(404).json({ error: 'Not found' });
		res.json({ dataset });
	} catch (err) {
		next(err);
	}
});