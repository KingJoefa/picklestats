import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, delete all existing relationships
  await prisma.commonPartner.deleteMany()
  await prisma.topOpponent.deleteMany()
  await prisma.playerStats.deleteMany()
  await prisma.match.deleteMany()
  await prisma.player.deleteMany()

  // Create initial players
  const players = [
    {
      name: 'Larry',
      profilePicture: 'https://ui-avatars.com/api/?name=Larry&background=random&size=200',
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
      name: 'Zach',
      profilePicture: 'https://ui-avatars.com/api/?name=Zach&background=random&size=200',
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
      name: 'Dustin',
      profilePicture: 'https://ui-avatars.com/api/?name=Dustin&background=random&size=200',
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
      name: 'Phil',
      profilePicture: 'https://ui-avatars.com/api/?name=Phil&background=random&size=200',
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
      name: 'Ron',
      profilePicture: 'https://ui-avatars.com/api/?name=Ron&background=random&size=200',
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
      name: 'Paul',
      profilePicture: 'https://ui-avatars.com/api/?name=Paul&background=random&size=200',
      stats: {
        totalMatches: 25,
        wins: 14,
        losses: 11,
        winRate: 0.56,
        pointsScored: 750,
        pointsConceded: 780
      }
    }
  ]

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
  }

  // Add common partners and top opponents for each player
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 