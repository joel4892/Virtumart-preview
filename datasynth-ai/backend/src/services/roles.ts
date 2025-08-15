export const ROLES = ['ADMIN', 'ANNOTATOR', 'VIEWER'] as const;
export type Role = typeof ROLES[number];