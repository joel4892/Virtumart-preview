import { stringify } from 'csv-stringify/sync';

export function exportAsJson(records: any[]): string {
	return JSON.stringify(records, null, 2);
}

export function exportAsCsv(records: any[]): string {
	return stringify(records, { header: true });
}