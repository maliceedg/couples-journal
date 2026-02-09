import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_PASSWORD_HASH = bcrypt.hashSync('test', 10);

async function main() {
  // First functional user: test@test.com / test
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: { passwordHash: TEST_PASSWORD_HASH, firstName: 'Test', lastName: 'User', phone: null },
    create: {
      email: 'test@test.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      passwordHash: TEST_PASSWORD_HASH,
    },
  });

  const journal = await prisma.journal.upsert({
    where: { userId: user.id },
    update: { accentColor: '#A56CB9', dateFormat: 'MDY' },
    create: {
      userId: user.id,
      name: 'Carla & Edgardo',
      startDate: new Date('2021-06-15T00:00:00'),
      accentColor: '#A56CB9',
      dateFormat: 'MDY',
    },
  });

  // Reset demo data so re-running seed doesn’t duplicate
  await prisma.chatStat.deleteMany({ where: { journalId: journal.id } });
  await prisma.cuteText.deleteMany({ where: { journalId: journal.id } });
  await prisma.milestone.deleteMany({ where: { journalId: journal.id } });
  await prisma.memory.deleteMany({ where: { journalId: journal.id } });

  await prisma.chatStat.createMany({
    data: [
      { journalId: journal.id, icon: 'chat_bubble_outline', value: '170,254', label: 'Total Messages', subLabel: '(257.3/day)' },
      { journalId: journal.id, icon: 'person_outline', value: 'Carla', label: 'Top Sender', subLabel: '86,021 messages' },
      { journalId: journal.id, icon: 'schedule', value: '12 AM', label: 'Most Active Time', subLabel: '19,319 messages' },
    ],
  });

  await prisma.cuteText.createMany({
    data: [
      { journalId: journal.id, text: "You are the best thing that ever happened to me. I'm so lucky to have you by my side.", sender: 'CARLA', date: '2023-09-12', isFavorite: true, color: 'white' },
      { journalId: journal.id, text: "Every day I wake up and realize how much more I love you than the day before.", sender: 'ME', date: '2023-10-05', isFavorite: true, color: 'primary' },
      { journalId: journal.id, text: "Don't forget to eat lunch! I'm thinking about you constantly today. ❤️", sender: 'CARLA', date: '2023-11-22', isFavorite: true, color: 'white' },
      { journalId: journal.id, text: "Just saw a dog that looked like the one we want. It's a sign!", sender: 'CARLA', date: '2023-12-01', isFavorite: false, color: 'white' },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      { journalId: journal.id, date: '2021-06-15', title: 'First Hello', description: 'That awkward coffee shop meeting that changed everything.' },
      { journalId: journal.id, date: '2021-08-12', title: 'Officially Us', description: 'When we finally decided to make it official under the stars.' },
      { journalId: journal.id, date: '2022-12-24', title: 'First Christmas', description: 'Opening presents and realizing you were the best gift of all.' },
    ],
  });

  await prisma.memory.createMany({
    data: [
      { journalId: journal.id, title: 'Our first sunset at the beach 🌅', date: '2023-07-10', imageUrl: 'https://picsum.photos/400/400?random=1', type: 'daily', description: '' },
      { journalId: journal.id, title: 'The day you said "Yes" ✨', date: '2024-02-14', imageUrl: 'https://picsum.photos/400/400?random=2', type: 'milestone', description: '' },
      { journalId: journal.id, title: 'Sunday morning coffee rituals ☕', date: '2023-11-20', imageUrl: 'https://picsum.photos/400/400?random=3', type: 'daily', description: '' },
    ],
  });

  console.log('Seed done. Journal id:', journal.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
