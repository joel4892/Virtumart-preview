import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { exportAsCsv, exportAsJson } from '../services/export';
import archiver from 'archiver';
import { toCOCO, toYOLO, toPascalVOC } from '../services/exportFormats';

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

exportRouter.get('/dataset/:datasetId.coco.json', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	const coco = toCOCO(datasetId, anns);
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}-coco.json"`);
	res.send(JSON.stringify(coco, null, 2));
});

exportRouter.get('/dataset/:datasetId.csv', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId }, orderBy: { createdAt: 'asc' } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}.csv"`);
	res.send(exportAsCsv(anns.map(a => ({ id: a.id, type: a.type, label: a.label, createdAt: a.createdAt }))));
});

exportRouter.get('/dataset/:datasetId.yolo.zip', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	const yolo = toYOLO(datasetId, anns);
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}-yolo.zip"`);
	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.on('error', (err) => res.status(500).send({ error: err.message }));
	archive.pipe(res);
	archive.append(yolo.yoloTxt, { name: `${datasetId}.txt` });
	archive.append(yolo.classesTxt, { name: `classes.txt` });
	archive.finalize();
});

exportRouter.get('/dataset/:datasetId.voc.zip', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const datasetId = req.params.datasetId;
	const anns = await prisma.annotation.findMany({ where: { datasetId } });
	await prisma.dataset.update({ where: { id: datasetId }, data: { status: 'export' } }).catch(() => {});
	const voc = toPascalVOC(datasetId, anns);
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', `attachment; filename="${datasetId}-voc.zip"`);
	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.on('error', (err) => res.status(500).send({ error: err.message }));
	archive.pipe(res);
	archive.append(voc, { name: `${datasetId}.xml` });
	archive.finalize();
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
	// COCO
	archive.append(JSON.stringify(toCOCO(datasetId, anns), null, 2), { name: `${datasetId}-coco.json` });
	// YOLO
	const yolo = toYOLO(datasetId, anns);
	archive.append(yolo.yoloTxt, { name: `${datasetId}-yolo.txt` });
	archive.append(yolo.classesTxt, { name: `classes.txt` });
	// VOC
	archive.append(toPascalVOC(datasetId, anns), { name: `${datasetId}-voc.xml` });
	archive.finalize();
});