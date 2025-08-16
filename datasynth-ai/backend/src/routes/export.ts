import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { exportAsCsv, exportAsJson } from '../services/export';
import archiver from 'archiver';

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

exportRouter.get('/dataset/:datasetId.zip', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId }, orderBy: { createdAt: 'asc' } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}.zip"`);
	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.on('error', (err) => res.status(500).send({ error: err.message }));
	archive.pipe(res);
	// JSON
	archive.append(exportAsJson(anns), { name: `${datasetId}.json` });
	// CSV
	archive.append(exportAsCsv(anns), { name: `${datasetId}.csv` });
	// Placeholders for COCO/YOLO/VOC
	archive.append(JSON.stringify({ info: {}, annotations: anns }, null, 2), { name: `${datasetId}-coco.json` });
	archive.append('# YOLO txt placeholder', { name: `${datasetId}-yolo.txt` });
	archive.append('<annotations></annotations>', { name: `${datasetId}-voc.xml` });
	archive.finalize();
});