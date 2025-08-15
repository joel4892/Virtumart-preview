import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { exportAsCsv, exportAsJson } from '../services/export';

export const exportRouter = Router();

exportRouter.use(authenticate);

exportRouter.get('/dataset/:datasetId.json', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId }, orderBy: { createdAt: 'asc' } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}.json"`);
	res.send(exportAsJson(anns.map(a => ({ id: a.id, type: a.type, label: a.label, payload: a.payload, createdAt: a.createdAt }))));
});

exportRouter.get('/dataset/:datasetId.csv', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId }, orderBy: { createdAt: 'asc' } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}.csv"`);
	res.send(exportAsCsv(anns.map(a => ({ id: a.id, type: a.type, label: a.label, createdAt: a.createdAt }))));
});