import { Annotation } from '@prisma/client';

export function toCOCO(datasetId: string, annotations: Annotation[]) {
	const categoriesMap = new Map<string, number>();
	let nextCategoryId = 1;
	const images = [{ id: datasetId, file_name: datasetId }];
	const anns = annotations
		.filter((a) => a.type === 'BBOX' || a.type === 'POLYGON')
		.map((a, idx) => {
			if (!categoriesMap.has(a.label)) categoriesMap.set(a.label, nextCategoryId++);
			const category_id = categoriesMap.get(a.label)!;
			const payload: any = a.payload || {};
			const bbox = payload && payload.x != null ? [payload.x, payload.y, payload.width, payload.height] : [0, 0, 0, 0];
			const segmentation = payload.points ? [payload.points] : [];
			return {
				id: idx + 1,
				image_id: datasetId,
				category_id,
				bbox,
				segmentation,
				iscrowd: 0,
				area: bbox[2] * bbox[3]
			};
		});
	const categories = [...categoriesMap.entries()].map(([name, id]) => ({ id, name }));
	return { images, annotations: anns, categories };
}

export function toYOLO(datasetId: string, annotations: Annotation[]) {
	const labels = [...new Set(annotations.filter(a => a.type === 'BBOX').map(a => a.label))];
	const labelToId = new Map(labels.map((l, i) => [l, i] as const));
	const lines: string[] = [];
	for (const a of annotations) {
		if (a.type !== 'BBOX') continue;
		const payload: any = a.payload || {};
		const x = payload.x ?? 0, y = payload.y ?? 0, w = payload.width ?? 0, h = payload.height ?? 0;
		const cx = x + w / 2; const cy = y + h / 2;
		const classId = labelToId.get(a.label) ?? 0;
		lines.push(`${classId} ${cx.toFixed(6)} ${cy.toFixed(6)} ${w.toFixed(6)} ${h.toFixed(6)}`);
	}
	const classesTxt = labels.join('\n');
	return { yoloTxt: lines.join('\n'), classesTxt };
}

export function toPascalVOC(datasetId: string, annotations: Annotation[]) {
	const bboxes = annotations.filter(a => a.type === 'BBOX');
	const objectsXml = bboxes.map((a) => {
		const payload: any = a.payload || {};
		const x = payload.x ?? 0, y = payload.y ?? 0, w = payload.width ?? 0, h = payload.height ?? 0;
		const xmin = Math.round(x * 1000), ymin = Math.round(y * 1000), xmax = Math.round((x + w) * 1000), ymax = Math.round((y + h) * 1000);
		return `\n    <object>\n      <name>${a.label}</name>\n      <bndbox>\n        <xmin>${xmin}</xmin>\n        <ymin>${ymin}</ymin>\n        <xmax>${xmax}</xmax>\n        <ymax>${ymax}</ymax>\n      </bndbox>\n    </object>`;
	}).join('');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<annotation>\n  <folder>datasets</folder>\n  <filename>${datasetId}</filename>${objectsXml}\n</annotation>`;
	return xml;
}