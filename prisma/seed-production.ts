import { PrismaClient } from '@prisma/client'

// Use a direct connection to the production database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.itlokdparthxnbfatnmm:Caqnuv-marpar-zepke5@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    },
  },
})

async function main() {
  console.log('Starting production database seeding...')
  
  // First, check if there are any players already
  const existingPlayerCount = await prisma.player.count()
  console.log(`Found ${existingPlayerCount} existing players in the database.`)
  
  if (existingPlayerCount > 0) {
    console.log('Database already has players, clearing existing data first...')
    // Delete all existing relationships
    await prisma.commonPartner.deleteMany()
    await prisma.topOpponent.deleteMany()
    await prisma.playerStats.deleteMany()
    await prisma.match.deleteMany()
    await prisma.player.deleteMany()
    console.log('Existing data cleared successfully.')
  }

  // Create players
  const players = [
    {
      name: 'Zach',
      profilePicture: 'https://ui-avatars.com/api/?name=Zach&background=random&size=200',
      stats: {
        totalMatches: 42,
        wins: 28,
        losses: 14,
        winRate: 0.67,
        pointsScored: 1260,
        pointsConceded: 980
      }
    },
    {
      name: 'Larry',
      profilePicture: 'https://ui-avatars.com/api/?name=Larry&background=random&size=200',
      stats: {
        totalMatches: 38,
        wins: 25,
        losses: 13,
        winRate: 0.66,
        pointsScored: 1140,
        pointsConceded: 920
      }
    },
    {
      name: 'Phil',
      profilePicture: 'https://ui-avatars.com/api/?name=Phil&background=random&size=200',
      stats: {
        totalMatches: 35,
        wins: 22,
        losses: 13,
        winRate: 0.63,
        pointsScored: 1050,
        pointsConceded: 890
      }
    },
    {
      name: 'Ron',
      profilePicture: 'https://ui-avatars.com/api/?name=Ron&background=random&size=200',
      stats: {
        totalMatches: 30,
        wins: 18,
        losses: 12,
        winRate: 0.60,
        pointsScored: 900,
        pointsConceded: 840
      }
    },
    {
      name: 'Dustin',
      profilePicture: 'https://ui-avatars.com/api/?name=Dustin&background=random&size=200',
      stats: {
        totalMatches: 28,
        wins: 16,
        losses: 12,
        winRate: 0.57,
        pointsScored: 840,
        pointsConceded: 820
      }
    },
    {
      name: 'Ashley',
      profilePicture: 'https://ui-avatars.com/api/?name=Ashley&background=random&size=200',
      stats: {
        totalMatches: 25,
        wins: 14,
        losses: 11,
        winRate: 0.56,
        pointsScored: 750,
        pointsConceded: 780
      }
    },
    {
      name: 'Paul',
      profilePicture: 'https://ui-avatars.com/api/?name=Paul&background=random&size=200',
      stats: {
        totalMatches: 24,
        wins: 13,
        losses: 11,
        winRate: 0.54,
        pointsScored: 720,
        pointsConceded: 750
      }
    },
    {
      name: 'Cheryl',
      profilePicture: 'https://ui-avatars.com/api/?name=Cheryl&background=random&size=200',
      stats: {
        totalMatches: 22,
        wins: 12,
        losses: 10,
        winRate: 0.55,
        pointsScored: 660,
        pointsConceded: 700
      }
    },
    {
      name: 'Kevin',
      profilePicture: 'https://ui-avatars.com/api/?name=Kevin&background=random&size=200',
      stats: {
        totalMatches: 20,
        wins: 11,
        losses: 9,
        winRate: 0.55,
        pointsScored: 600,
        pointsConceded: 660
      }
    },
    {
      name: 'Josh',
      profilePicture: 'https://ui-avatars.com/api/?name=Josh&background=random&size=200',
      stats: {
        totalMatches: 18,
        wins: 9,
        losses: 9,
        winRate: 0.50,
        pointsScored: 540,
        pointsConceded: 630
      }
    },
    {
      name: 'Dan',
      profilePicture: 'https://ui-avatars.com/api/?name=Dan&background=random&size=200',
      stats: {
        totalMatches: 16,
        wins: 8,
        losses: 8,
        winRate: 0.50,
        pointsScored: 480,
        pointsConceded: 510
      }
    },
    {
      name: 'Matt',
      profilePicture: 'https://ui-avatars.com/api/?name=Matt&background=random&size=200',
      stats: {
        totalMatches: 15,
        wins: 7,
        losses: 8,
        winRate: 0.47,
        pointsScored: 450,
        pointsConceded: 480
      }
    }
  ]

  console.log('Creating players...')
  for (const player of players) {
    await prisma.player.create({
      data: {
        name: player.name,
        profilePicture: player.profilePicture,
        stats: {
          create: player.stats
        }
      }
    })
    console.log(`Created player: ${player.name}`)
  }

  console.log('All players created successfully!')

  // Add common partners and top opponents for each player
  console.log('Setting up player relationships...')
  const allPlayers = await prisma.player.findMany()
  
  for (const player of allPlayers) {
    // Add common partners
    const partners = allPlayers.filter((p: { id: string }) => p.id !== player.id).slice(0, 2)
    for (const partner of partners) {
      await prisma.commonPartner.create({
        data: {
          playerId: player.id,
          partnerId: partner.id,
          partnerName: partner.name,
          partnerPicture: partner.profilePicture,
          matches: Math.floor(Math.random() * 10) + 5,
          wins: Math.floor(Math.random() * 5) + 3
        }
      })
    }

    // Add top opponents
    const opponents = allPlayers.filter((p: { id: string }) => p.id !== player.id).slice(2, 4)
    for (const opponent of opponents) {
      await prisma.topOpponent.create({
        data: {
          playerId: player.id,
          opponentId: opponent.id,
          opponentName: opponent.name,
          opponentPicture: opponent.profilePicture,
          matches: Math.floor(Math.random() * 8) + 3,
          wins: Math.floor(Math.random() * 4) + 2
        }
      })
    }
  }
  
  console.log('Player relationships created successfully!')
  console.log('Production database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding production database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 