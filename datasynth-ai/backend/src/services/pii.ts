export type PiiFinding = {
	type: 'EMAIL' | 'PHONE' | 'NAME';
	value: string;
	start: number;
	end: number;
};

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(?:(?:\+\d{1,3}[ -]?)?(?:\(\d{3}\)|\d{3})[ -]?\d{3}[ -]?\d{4})/g;
const nameRegex = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g;

export function detectPii(text: string): PiiFinding[] {
	const findings: PiiFinding[] = [];
	let match: RegExpExecArray | null;
	while ((match = emailRegex.exec(text)) !== null) {
		findings.push({ type: 'EMAIL', value: match[0], start: match.index, end: match.index + match[0].length });
	}
	while ((match = phoneRegex.exec(text)) !== null) {
		findings.push({ type: 'PHONE', value: match[0], start: match.index, end: match.index + match[0].length });
	}
	while ((match = nameRegex.exec(text)) !== null) {
		findings.push({ type: 'NAME', value: match[0], start: match.index, end: match.index + match[0].length });
	}
	return findings.sort((a, b) => a.start - b.start);
}

export function maskPii(text: string, findings: PiiFinding[]): string {
	let result = '';
	let currentIndex = 0;
	for (const f of findings) {
		result += text.slice(currentIndex, f.start);
		const mask = f.type === 'EMAIL' ? '[EMAIL]' : f.type === 'PHONE' ? '[PHONE]' : '[NAME]';
		result += mask;
		currentIndex = f.end;
	}
	result += text.slice(currentIndex);
	return result;
}