import { env } from '../config/env';
export type AiAnnotationSuggestion = {
	type: 'ENTITY' | 'CLASSIFICATION' | 'SENTIMENT' | 'BBOX' | 'POLYGON';
	label: string;
	confidence: number;
	payload: any;
};

async function callOpenAiVision(_input: { kind: 'TEXT' | 'IMAGE'; content: string }): Promise<AiAnnotationSuggestion[] | null> {
	if (!env.ai.openaiApiKey) return null;
	// Placeholder: integrate OpenAI responses here.
	return null;
}

async function callHuggingFace(_input: { kind: 'TEXT' | 'IMAGE'; content: string }): Promise<AiAnnotationSuggestion[] | null> {
	if (!env.ai.hfApiToken) return null;
	// Placeholder: integrate HF inference here.
	return null;
}

export async function getAiSuggestions(input: { kind: 'TEXT' | 'IMAGE'; content: string }): Promise<AiAnnotationSuggestion[]> {
	const providers = [callOpenAiVision, callHuggingFace];
	for (const p of providers) {
		try {
			const res = await p(input);
			if (res && res.length) return res;
		} catch {}
	}
	if (input.kind === 'TEXT') {
		return [
			{ type: 'SENTIMENT', label: 'positive', confidence: 0.72, payload: { score: 0.72 } },
			{ type: 'CLASSIFICATION', label: 'support_ticket', confidence: 0.61, payload: {} }
		];
	}
	return [
		{ type: 'BBOX', label: 'object', confidence: 0.65, payload: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 } }
	];
}