import { prisma } from '../config/prisma';

export async function writeAuditLog(params: {
	userId?: string;
	action: string;
	entity: string;
	entityId: string;
	before?: any;
	after?: any;
}) {
	await prisma.auditLog.create({
		data: {
			userId: params.userId,
			action: params.action,
			entity: params.entity,
			entityId: params.entityId,
			before: params.before as any,
			after: params.after as any
		}
	});
}