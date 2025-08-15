import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';
import { getAiSuggestions } from '../services/aiAssist';

export const annotationsRouter = Router();

annotationsRouter.use(authenticate);

const createSchema = z.object({
	datasetId: z.string(),
	type: z.enum(['ENTITY', 'CLASSIFICATION', 'SENTIMENT', 'BBOX', 'POLYGON']),
	label: z.string(),
	payload: z.any()
});

annotationsRouter.post('/', requireRole(['ADMIN', 'ANNOTATOR']), async (req, res, next) => {
	try {
		const body = createSchema.parse(req.body);
		const user = (req as any).user as { userId: string };
		const ann = await prisma.annotation.create({
			data: {
				datasetId: body.datasetId,
				type: body.type as any,
				label: body.label,
				payload: body.payload,
				authorId: user.userId
			}
		});
		await prisma.dataset.update({ where: { id: body.datasetId }, data: { status: 'annotation' } });
		res.json({ annotation: ann });
	} catch (err) {
		next(err);
	}
});

annotationsRouter.get('/dataset/:datasetId', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const anns = await prisma.annotation.findMany({ where: { datasetId: req.params.datasetId }, orderBy: { createdAt: 'asc' } });
	res.json({ annotations: anns });
});

annotationsRouter.post('/assist', requireRole(['ADMIN', 'ANNOTATOR']), async (req, res, next) => {
	try {
		const schema = z.object({ kind: z.enum(['TEXT', 'IMAGE']), content: z.string() });
		const body = schema.parse(req.body);
		const suggestions = await getAiSuggestions({ kind: body.kind, content: body.content });
		res.json({ suggestions });
	} catch (err) {
		next(err);
	}
});