import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	const org = await prisma.organization.upsert({
		where: { id: 'seed-org' },
		update: {},
		create: { id: 'seed-org', name: 'Seed Org' }
	});
	const passwordHash = await bcrypt.hash('admin123', 10);
	const admin = await prisma.user.upsert({
		where: { email: 'admin@seed.local' },
		update: {},
		create: {
			email: 'admin@seed.local',
			passwordHash,
			role: Role.ADMIN,
			organizationId: org.id
		}
	});
	await prisma.project.upsert({
		where: { id: 'seed-project' },
		update: {},
		create: {
			id: 'seed-project',
			name: 'Seed Project',
			organizationId: org.id
		}
	});
	// eslint-disable-next-line no-console
	console.log('Seeded org and admin:', { org: org.name, admin: admin.email });
}

main().then(() => prisma.$disconnect());