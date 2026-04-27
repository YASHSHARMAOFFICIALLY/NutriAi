import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const PRESETS = [
  // 7-day challenges
  {
    slug: '7d-no-sugar',
    title: '7-Day No Added Sugar',
    description: 'Cut out added sugar for a full week. Fruit is fine — sodas, candy, and syrups are off limits.',
    category: 'SUGAR' as const,
    durationDays: 7,
    icon: '🚫🍬',
  },
  {
    slug: '7d-protein-push',
    title: '7-Day Protein Push',
    description: 'Hit your protein target every single day for a week. Great for muscle building and satiety.',
    category: 'PROTEIN' as const,
    durationDays: 7,
    icon: '💪',
  },
  {
    slug: '7d-hydration',
    title: '7-Day Hydration Habit',
    description: 'Drink at least 2 litres of water per day for 7 days straight.',
    category: 'HYDRATION' as const,
    durationDays: 7,
    icon: '💧',
  },
  {
    slug: '7d-calorie-deficit',
    title: '7-Day Calorie Deficit',
    description: 'Stay in a 300–500 kcal deficit every day for a week without feeling deprived.',
    category: 'CALORIES' as const,
    durationDays: 7,
    icon: '📉',
  },
  // 30-day challenges
  {
    slug: '30d-no-sugar',
    title: '30-Day No Added Sugar',
    description: 'The big one. Thirty days of zero added sugars. Transforms how you taste food.',
    category: 'SUGAR' as const,
    durationDays: 30,
    icon: '🏆',
  },
  {
    slug: '30d-protein-goal',
    title: '30-Day Protein Goal',
    description: 'Hit your daily protein target every single day for a month.',
    category: 'PROTEIN' as const,
    durationDays: 30,
    icon: '🥩',
  },
  {
    slug: '30d-clean-eating',
    title: '30-Day Clean Eating',
    description: 'Log every meal and keep processed food below 20% of your daily calories.',
    category: 'HABIT' as const,
    durationDays: 30,
    icon: '🥗',
  },
  {
    slug: '30d-daily-log',
    title: '30-Day Logging Streak',
    description: 'Log at least one meal every single day for 30 days. Awareness is the first step.',
    category: 'HABIT' as const,
    durationDays: 30,
    icon: '📓',
  },
  {
    slug: '30d-under-calories',
    title: '30-Day Calorie Control',
    description: 'Stay within your calorie target for 30 consecutive days.',
    category: 'CALORIES' as const,
    durationDays: 30,
    icon: '🎯',
  },
  {
    slug: '30d-hydration',
    title: '30-Day Hydration',
    description: '2+ litres of water every day for a month.',
    category: 'HYDRATION' as const,
    durationDays: 30,
    icon: '🌊',
  },
];

async function main() {
  for (const preset of PRESETS) {
    await prisma.challenge.upsert({
      where: { slug: preset.slug },
      update: { title: preset.title, description: preset.description, icon: preset.icon },
      create: preset,
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${PRESETS.length} challenge presets`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
