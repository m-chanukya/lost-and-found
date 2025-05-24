import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTestUsers() {
    try {
        console.log('🚀 Setting up test users...');

        // Create first test user
        const user1 = await prisma.user.upsert({
            where: { email: 'test1@example.com' },
            update: {},
            create: {
                id: 'test-user-1',
                email: 'test1@example.com',
                name: 'Test User 1',
                notifications: {
                    create: {
                        email: true,
                        sms: false
                    }
                }
            }
        });

        // Create second test user
        const user2 = await prisma.user.upsert({
            where: { email: 'test2@example.com' },
            update: {},
            create: {
                id: 'test-user-2',
                email: 'test2@example.com',
                name: 'Test User 2',
                notifications: {
                    create: {
                        email: true,
                        sms: false
                    }
                }
            }
        });

        console.log('✅ Test users created successfully:');
        console.log('User 1:', { id: user1.id, email: user1.email });
        console.log('User 2:', { id: user2.id, email: user2.email });

    } catch (error) {
        console.error('❌ Error setting up test users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

console.log('🔧 Starting test user setup...');
setupTestUsers().catch(console.error); 