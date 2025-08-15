"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const org = await prisma.organization.upsert({
        where: { id: 'seed-org' },
        update: {},
        create: { id: 'seed-org', name: 'Seed Org' }
    });
    const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@seed.local' },
        update: {},
        create: {
            email: 'admin@seed.local',
            passwordHash,
            role: client_1.Role.ADMIN,
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
