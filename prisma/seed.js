// This is a JavaScript version of the seed file for better Vercel compatibility
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?sslmode=require'
    }
  }
});

// Initial player data to seed
const initialPlayers = [
  { name: 'John Doe', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Jane Smith', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Mike Johnson', profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { name: 'Sarah Williams', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { name: 'Chris Brown', profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { name: 'Emily Davis', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

async function main() {
  console.log(`Seeding database with initial players (NODE_ENV: ${process.env.NODE_ENV})...`);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Defined' : 'Not defined');

  try {
    // Check if we already have players
    const existingPlayerCount = await prisma.player.count();
    
    if (existingPlayerCount > 0) {
      console.log(`Database already has ${existingPlayerCount} players. Skipping seed.`);
      return;
    }
    
    console.log('No existing players found. Creating initial players...');
    
    // Create players
    for (const playerData of initialPlayers) {
      const player = await prisma.player.create({
        data: playerData
      });
      console.log(`Created player: ${player.name}`);
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error in seeding process:', error);
    throw error; // Re-throw to trigger the catch block below
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  }); 