import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export async function generateComplianceCertificate(options: {
	datasetName: string;
	datasetId: string;
	reportId: string;
	summary: string;
}): Promise<string> {
	const dir = path.join(process.cwd(), env.localStoragePath, 'certificates');
	await fs.promises.mkdir(dir, { recursive: true });
	const filename = `${options.datasetId}-${options.reportId}.pdf`;
	const filePath = path.join(dir, filename);
	const doc = new PDFDocument({ size: 'A4' });
	const writeStream = fs.createWriteStream(filePath);
	doc.pipe(writeStream);
	doc.fontSize(20).text('Datasynth AI — Compliance Certificate', { align: 'center' });
	doc.moveDown();
	doc.fontSize(12).text(`Dataset: ${options.datasetName}`);
	doc.text(`Dataset ID: ${options.datasetId}`);
	doc.text(`Report ID: ${options.reportId}`);
	doc.moveDown();
	doc.text('Summary:');
	doc.text(options.summary);
	doc.end();
	await new Promise<void>((resolve) => { writeStream.on('finish', () => resolve()); });
	return filePath;
}