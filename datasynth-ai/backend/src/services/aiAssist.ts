export type AiAnnotationSuggestion = {
	type: 'ENTITY' | 'CLASSIFICATION' | 'SENTIMENT' | 'BBOX' | 'POLYGON';
	label: string;
	confidence: number;
	payload: any;
};

export async function getAiSuggestions(input: { kind: 'TEXT' | 'IMAGE'; content: string }): Promise<AiAnnotationSuggestion[]> {
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