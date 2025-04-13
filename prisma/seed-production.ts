import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting production seeding...')
  
  // Create test players
  const players = [
    { name: 'Test Player 1', profilePicture: 'https://example.com/player1.jpg' },
    { name: 'Test Player 2', profilePicture: 'https://example.com/player2.jpg' },
    { name: 'Test Player 3', profilePicture: 'https://example.com/player3.jpg' },
    { name: 'Test Player 4', profilePicture: 'https://example.com/player4.jpg' }
  ]

  console.log('Creating test players...')
  const createdPlayers = await Promise.all(
    players.map(player => 
      prisma.player.create({
        data: {
          ...player,
          stats: {
            create: {
              totalMatches: 0,
              wins: 0,
              losses: 0,
              winRate: 0,
              pointsScored: 0,
              pointsConceded: 0
            }
          }
        }
      })
    )
  )

  console.log('Created players:', createdPlayers.map(p => p.name))

  // Create a test match
  console.log('Creating test match...')
  const match = await prisma.match.create({
    data: {
      team1ScoreA: 11,
      team1ScoreB: 9,
      team2ScoreA: 8,
      team2ScoreB: 11,
      winningTeam: 1,
      team1PlayerA: { connect: { id: createdPlayers[0].id } },
      team1PlayerB: { connect: { id: createdPlayers[1].id } },
      team2PlayerA: { connect: { id: createdPlayers[2].id } },
      team2PlayerB: { connect: { id: createdPlayers[3].id } }
    }
  })

  console.log('Created test match:', match.id)

  // Update player stats
  console.log('Updating player stats...')
  await Promise.all([
    prisma.playerStats.update({
      where: { playerId: createdPlayers[0].id },
      data: {
        totalMatches: 1,
        wins: 1,
        winRate: 100
      }
    }),
    prisma.playerStats.update({
      where: { playerId: createdPlayers[1].id },
      data: {
        totalMatches: 1,
        wins: 1,
        winRate: 100
      }
    }),
    prisma.playerStats.update({
      where: { playerId: createdPlayers[2].id },
      data: {
        totalMatches: 1,
        losses: 1,
        winRate: 0
      }
    }),
    prisma.playerStats.update({
      where: { playerId: createdPlayers[3].id },
      data: {
        totalMatches: 1,
        losses: 1,
        winRate: 0
      }
    })
  ])

  console.log('Seeding completed successfully!')
}

main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 