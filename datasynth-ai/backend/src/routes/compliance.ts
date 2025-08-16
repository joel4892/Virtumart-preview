import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';
import { detectPii, maskPii } from '../services/pii';
import { generateComplianceCertificate } from '../services/pdf';

export const complianceRouter = Router();

complianceRouter.use(authenticate);

const runSchema = z.object({ datasetId: z.string(), content: z.string() });

complianceRouter.post('/run', requireRole(['ADMIN', 'ANNOTATOR']), async (req, res, next) => {
	try {
		const body = runSchema.parse(req.body);
		const findings = detectPii(body.content);
		const masked = maskPii(body.content, findings);
		const report = await prisma.complianceReport.create({
			data: {
				datasetId: body.datasetId,
				findings: findings as any,
				summary: `Detected ${findings.length} potential PII item(s).`
			}
		});
		const dataset = await prisma.dataset.findUnique({ where: { id: body.datasetId } });
		let certificatePath: string | null = null;
		if (dataset) {
			certificatePath = await generateComplianceCertificate({
				datasetName: dataset.name,
				datasetId: dataset.id,
				reportId: report.id,
				summary: report.summary
			});
			await prisma.complianceReport.update({ where: { id: report.id }, data: { certificatePath } });
		}
		await prisma.dataset.update({ where: { id: body.datasetId }, data: { status: 'compliance' } });
		res.json({ report: { ...report, certificatePath }, masked });
	} catch (err) {
		next(err);
	}
});

complianceRouter.get('/dataset/:datasetId', requireRole(['ADMIN', 'ANNOTATOR', 'VIEWER']), async (req, res) => {
	const reports = await prisma.complianceReport.findMany({ where: { datasetId: req.params.datasetId }, orderBy: { createdAt: 'desc' } });
	res.json({ reports });
});